/**
 * src/tests/helpers/networkGuard.js
 *
 * Strict Test Environment Network Blocker
 * Prevents any test from making real external network requests (SMTP, Gmail, Twilio, OpenAI, Gemini, etc.)
 * Only allows local connections to loopback (127.0.0.1, localhost, ::1) for in-memory / local test servers.
 */

const net = require('net');
const http = require('http');
const https = require('https');

let isGuardInstalled = false;

function isLocalHost(host) {
  if (!host) return true;
  const h = String(host).toLowerCase().trim();
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '::1' ||
    h === '0.0.0.0' ||
    h.endsWith('.localhost')
  );
}

function installNetworkGuard() {
  if (isGuardInstalled) return;
  isGuardInstalled = true;

  // Enforce test environment
  process.env.NODE_ENV = 'test';

  // 1. Intercept TCP / TLS Net Sockets (e.g. SMTP connections to port 587/465/25)
  const originalNetConnect = net.Socket.prototype.connect;
  net.Socket.prototype.connect = function (...args) {
    let host = 'localhost';
    if (typeof args[0] === 'object' && args[0] !== null) {
      host = args[0].host || args[0].hostname || 'localhost';
    } else if (typeof args[1] === 'string') {
      host = args[1];
    }

    if (!isLocalHost(host)) {
      const err = new Error(
        `[TEST SECURITY BLOCKED] Real outbound TCP connection to "${host}" was attempted and blocked during test execution.`
      );
      err.code = 'ERR_TEST_NETWORK_BLOCKED';
      this.destroy(err);
      throw err;
    }

    return originalNetConnect.apply(this, args);
  };

  // 2. Intercept Node http.request
  const originalHttpRequest = http.request;
  http.request = function (...args) {
    let host = 'localhost';
    if (typeof args[0] === 'string' || args[0] instanceof URL) {
      try {
        const u = new URL(args[0], 'http://localhost');
        host = u.hostname;
      } catch {}
    } else if (typeof args[0] === 'object' && args[0] !== null) {
      host = args[0].hostname || args[0].host || 'localhost';
    }

    if (!isLocalHost(host)) {
      const err = new Error(
        `[TEST SECURITY BLOCKED] Real outbound HTTP request to "${host}" was attempted and blocked during test execution.`
      );
      err.code = 'ERR_TEST_NETWORK_BLOCKED';
      throw err;
    }

    return originalHttpRequest.apply(this, args);
  };

  // 3. Intercept Node https.request
  const originalHttpsRequest = https.request;
  https.request = function (...args) {
    let host = 'localhost';
    if (typeof args[0] === 'string' || args[0] instanceof URL) {
      try {
        const u = new URL(args[0], 'https://localhost');
        host = u.hostname;
      } catch {}
    } else if (typeof args[0] === 'object' && args[0] !== null) {
      host = args[0].hostname || args[0].host || 'localhost';
    }

    if (!isLocalHost(host)) {
      const err = new Error(
        `[TEST SECURITY BLOCKED] Real outbound HTTPS request to "${host}" was attempted and blocked during test execution.`
      );
      err.code = 'ERR_TEST_NETWORK_BLOCKED';
      throw err;
    }

    return originalHttpsRequest.apply(this, args);
  };

  // 4. Intercept global fetch
  if (typeof globalThis.fetch === 'function') {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = function (input, init) {
      let host = 'localhost';
      try {
        if (typeof input === 'string') {
          const u = new URL(input, 'http://localhost');
          host = u.hostname;
        } else if (input && typeof input.url === 'string') {
          const u = new URL(input.url, 'http://localhost');
          host = u.hostname;
        }
      } catch {}

      if (!isLocalHost(host)) {
        const err = new Error(
          `[TEST SECURITY BLOCKED] Real outbound fetch request to "${host}" was attempted and blocked during test execution.`
        );
        err.code = 'ERR_TEST_NETWORK_BLOCKED';
        return Promise.reject(err);
      }

      return originalFetch.apply(this, [input, init]);
    };
  }

  console.log('[SECURITY] Outbound network guard active: all non-localhost network calls are strictly blocked.');
}

module.exports = {
  installNetworkGuard,
  isLocalHost,
};

