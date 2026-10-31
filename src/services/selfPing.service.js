const https = require('https');
const http = require('http');

let pingTimer = null;

/**
 * Pings the application's health endpoint to prevent Render free instances from idling out.
 *
 * @param {string} url - Target URL for health check
 */
function sendPing(url) {
  try {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const req = client.get(
      url,
      {
        timeout: 10000, // 10-second timeout
        headers: {
          'User-Agent': 'NexaHR-SelfPing/1.0',
        },
      },
      (res) => {
        // Drains response body to prevent socket leakage and free memory
        res.resume();

        const timestamp = new Date().toISOString();
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[${timestamp}] [SELF-PING] Server ping successful -> Status: ${res.statusCode} ${res.statusMessage || 'OK'}`);
        } else {
          console.warn(`[${timestamp}] [SELF-PING WARNING] Server ping responded with status: ${res.statusCode}`);
        }
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Request timeout after 10000ms'));
    });

    req.on('error', (err) => {
      const timestamp = new Date().toISOString();
      console.error(`[${timestamp}] [SELF-PING ERROR] Ping request failed: ${err.message}`);
    });
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [SELF-PING ERROR] Unexpected error preparing self-ping: ${error.message}`);
  }
}

/**
 * Initializes the background self-ping service.
 * Runs only in production environment when BACKEND_URL is defined.
 *
 * @returns {NodeJS.Timeout|null} Interval timer instance or null if not started
 */
function startSelfPing() {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
  const rawBackendUrl = process.env.BACKEND_URL;

  if (!isProduction) {
    console.log('[SELF-PING] Inactive: NODE_ENV is not set to "production" (or running locally).');
    return null;
  }

  if (!rawBackendUrl || !rawBackendUrl.trim()) {
    console.warn('[SELF-PING] Inactive: BACKEND_URL environment variable is not defined.');
    return null;
  }

  // Sanitize trailing slash and build health endpoint
  const baseUrl = rawBackendUrl.trim().replace(/\/+$/, '');
  const healthEndpoint = `${baseUrl}/health`;

  // 14 minutes = 14 * 60 * 1000 ms (before Render's 15-minute inactivity timeout)
  // 10 minutes (safely below Render's 15-minute inactivity timeout)
  const PING_INTERVAL_MS = 10 * 60 * 1000;

  console.log(`[SELF-PING] Service active. Scheduling self-ping every 10 minutes to: ${healthEndpoint}`);

  // Schedule periodic ping
  pingTimer = setInterval(() => {
    sendPing(healthEndpoint);
  }, PING_INTERVAL_MS);

  // Unref timer so it does not prevent Node process from gracefully exiting
  if (pingTimer && typeof pingTimer.unref === 'function') {
    pingTimer.unref();
  }

  return pingTimer;
}

/**
 * Clears the active ping timer.
 */
function stopSelfPing() {
  if (pingTimer) {
    clearInterval(pingTimer);
    pingTimer = null;
    console.log('[SELF-PING] Service stopped and timer cleared.');
  }
}

// Clean up timer on unexpected termination signals if not caught elsewhere
process.once('SIGINT', stopSelfPing);
process.once('SIGTERM', stopSelfPing);

module.exports = {
  startSelfPing,
  stopSelfPing,
  sendPing,
};
