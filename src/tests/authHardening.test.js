const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const fs = require('fs');
const path = require('path');
// Enforce zero external network calls
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

const { getDbTestEligibility } = require('./helpers/dbGuard');
const cacheService = require('../services/cache.service');
const prisma = require('../config/prisma');
const authRoutes = require('../routes/auth.routes');
const {
  sendPasswordResetEmail,
  sendEmailOTP,
  sendWhatsAppOTP,
  maskEmail,
  maskPhone,
  getTestMailOutbox,
  getTestWhatsAppOutbox,
  clearTestOutboxes,
} = require('../services/notification.service');
const { generateToken, verifyJwtToken } = require('../utils/jwt');
const { setGuestDemoActiveForTesting } = require('../services/demoGuard.service');

test('Security Batch 1 - Fix 1B: Backdoor Removal & Database-Only Authentication', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/auth`;
      resolve();
    });
  });

  t.after(() => {
    if (server) server.close();
  });

  await t.test('Login with non-existent credentials returns 401 and does not auto-create accounts', async (sub) => {
    const dbEligibility = getDbTestEligibility();
    if (!dbEligibility.canRun) {
      sub.skip(dbEligibility.reason);
      return;
    }
    const res = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent-admin-test@nexahr.com',
        password: 'RandomPassword123!',
      }),
    });

    const data = await res.json();
    assert.equal(res.status, 401);
    assert.equal(data.success, false);
    assert.equal(data.message, 'Invalid credentials.');
  });

  await t.test('Hardcoded System Admin credentials no longer bypass authentication', async () => {
    const authControllerSrc = fs.readFileSync(
      path.join(__dirname, '../controllers/auth.controller.js'),
      'utf8'
    );

    // Verify HARDCODED_SYSTEM_ADMIN constant is completely deleted
    assert.equal(
      authControllerSrc.includes('HARDCODED_SYSTEM_ADMIN'),
      false,
      'HARDCODED_SYSTEM_ADMIN must be completely removed from auth.controller.js'
    );

    // Verify hardcoded bypass password string is completely removed
    assert.equal(
      authControllerSrc.includes('AdminPassword123!'),
      false,
      'Hardcoded bypass password must not exist in auth.controller.js'
    );
  });
});

test('Security Batch 1 - Fix 4: No OTP or Password Reset URLs in Console Logs', async (t) => {
  clearTestOutboxes();
  await t.test('sendPasswordResetEmail masks email and does NOT log reset URL', async () => {
    const originalLog = console.log;
    const capturedLogs = [];
    console.log = (...args) => capturedLogs.push(args.join(' '));

    try {
      const sensitiveToken = 'sensitive-reset-token-xyz-12345';
      const sensitiveUrl = `https://nexahr.com/reset-password?token=${sensitiveToken}`;
      await sendPasswordResetEmail({
        email: 'audit-user@company.com',
        name: 'Audit User',
        resetUrl: sensitiveUrl,
        expiresInHours: 1,
      });

      const fullLogOutput = capturedLogs.join('\n');
      assert.equal(
        fullLogOutput.includes(sensitiveToken),
        false,
        'Reset token must never appear in console logs'
      );
      assert.equal(
        fullLogOutput.includes(sensitiveUrl),
        false,
        'Full reset URL must never appear in console logs'
      );
      assert.equal(
        fullLogOutput.includes('a***r@company.com'),
        true,
        'Email must be masked in log output'
      );

      const mailOutbox = getTestMailOutbox();
      assert.equal(mailOutbox.length, 1);
      assert.equal(mailOutbox[0].to, 'audit-user@company.com');
      assert.match(mailOutbox[0].subject, /Password Reset/i);
      clearTestOutboxes();
    } finally {
      console.log = originalLog;
    }
  });

  await t.test('sendEmailOTP masks email and does NOT log 6-digit OTP code', async () => {
    const originalLog = console.log;
    const capturedLogs = [];
    console.log = (...args) => capturedLogs.push(args.join(' '));

    try {
      const secretOtp = '791823';
      await sendEmailOTP('employee@testcorp.com', secretOtp, 'Test Employee', 10);

      const fullLogOutput = capturedLogs.join('\n');
      assert.equal(
        fullLogOutput.includes(secretOtp),
        false,
        'Plain text OTP code must never appear in console logs'
      );
      assert.equal(
        fullLogOutput.includes('e***e@testcorp.com'),
        true,
        'Email must be masked in log output'
      );

      const mailOutbox = getTestMailOutbox();
      assert.equal(mailOutbox.length, 1);
      assert.equal(mailOutbox[0].to, 'employee@testcorp.com');
      assert.match(mailOutbox[0].subject, /Verification Code/i);
      clearTestOutboxes();
    } finally {
      console.log = originalLog;
    }
  });

  await t.test('sendWhatsAppOTP masks phone and does NOT log 6-digit OTP code', async () => {
    const originalLog = console.log;
    const capturedLogs = [];
    console.log = (...args) => capturedLogs.push(args.join(' '));

    try {
      const secretOtp = '849201';
      await sendWhatsAppOTP('+923001234567', secretOtp, 'Test Employee', 10);

      const fullLogOutput = capturedLogs.join('\n');
      assert.equal(
        fullLogOutput.includes(secretOtp),
        false,
        'Plain text WhatsApp OTP code must never appear in console logs'
      );
      assert.equal(
        fullLogOutput.includes('4567'),
        true,
        'Masked phone must retain only non-sensitive suffix'
      );
      assert.equal(
        fullLogOutput.includes('+923001234567'),
        false,
        'Raw phone number must not appear in console logs'
      );

      const waOutbox = getTestWhatsAppOutbox();
      assert.equal(waOutbox.length, 1);
      assert.equal(waOutbox[0].otp, secretOtp);
      clearTestOutboxes();
    } finally {
      console.log = originalLog;
    }
  });

  await t.test('Prisma logging suppresses query logs in production', () => {
    const prismaConfigSource = fs.readFileSync(
      path.join(__dirname, '../config/prisma.js'),
      'utf8'
    );
    assert.equal(
      prismaConfigSource.includes("isProduction ? ['warn', 'error']"),
      true,
      'Prisma client must restrict logs to warn and error in production'
    );
  });
});

test('Security Batch 1 - Fix 6: JWT Secret Enforcement & Removal of Fallback Strings', async (t) => {
  await t.test('Hardcoded fallback secret string is removed from all code files', () => {
    const fallbackString = 'nexahr_saas_super_secret_jwt_key_2026';
    const jwtSrc = fs.readFileSync(path.join(__dirname, '../utils/jwt.js'), 'utf8');
    const authControllerSrc = fs.readFileSync(
      path.join(__dirname, '../controllers/auth.controller.js'),
      'utf8'
    );

    assert.equal(
      jwtSrc.includes(fallbackString),
      false,
      'Fallback secret must not exist in jwt.js'
    );
    assert.equal(
      authControllerSrc.includes(fallbackString),
      false,
      'Fallback secret must not exist in auth.controller.js'
    );
  });

  await t.test('Startup fails fast if JWT_SECRET is missing or shorter than 32 characters', () => {
    // Test logic isolation
    const validateSecret = (secret) => {
      if (!secret || secret.trim().length < 32) {
        throw new Error('FATAL SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing or shorter than 32 characters.');
      }
    };

    assert.throws(() => validateSecret(null), /missing or shorter than 32 characters/);
    assert.throws(() => validateSecret(''), /missing or shorter than 32 characters/);
    assert.throws(() => validateSecret('too-short-key-1234'), /missing or shorter than 32 characters/);
    assert.doesNotThrow(() => validateSecret('a'.repeat(32)));
  });

  await t.test('generateToken produces valid HS256 JWT using environment secret', () => {
    const token = generateToken({ userId: 'usr-security-test', role: 'ADMIN' });
    assert.ok(token);
    const decoded = verifyJwtToken(token);
    assert.equal(decoded.userId, 'usr-security-test');
    assert.equal(decoded.role, 'ADMIN');
  });
});

test('Security Batch 1 - Fix 7: Reverse Proxy Trust & Real Client IP Resolution', async (t) => {
  const indexSrc = fs.readFileSync(path.join(__dirname, '../index.js'), 'utf8');
  assert.equal(
    indexSrc.includes("app.set('trust proxy', 1)"),
    true,
    "app.set('trust proxy', 1) must be set in src/index.js"
  );

  const testApp = express();
  testApp.set('trust proxy', 1);

  let detectedIp = null;
  testApp.get('/test-ip', (req, res) => {
    detectedIp = req.ip;
    res.json({ ip: req.ip });
  });

  let server;
  let testUrl;
  await new Promise((resolve) => {
    server = testApp.listen(0, () => {
      testUrl = `http://127.0.0.1:${server.address().port}/test-ip`;
      resolve();
    });
  });

  t.after(() => {
    if (server) server.close();
  });

  const clientPublicIp = '198.51.100.42';

  await fetch(testUrl, {
    headers: {
      'X-Forwarded-For': clientPublicIp,
    },
  });

  assert.equal(
    detectedIp,
    clientPublicIp,
    'Express behind trust proxy (1 hop) must resolve client IP from X-Forwarded-For'
  );
});

test('Security Batch 1 - Fix 2: CORS Allow-List & Bearer-Only Authentication', async (t) => {
  const mainApp = require('../index');
  const cacheService = require('../services/cache.service');

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = mainApp.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  t.after(() => {
    if (server) server.close();
  });

  const activeAdmin = {
    id: 'mock-admin-token-id',
    email: 'admin@test.invalid',
    role: 'ADMIN',
    isActive: true,
    isDemo: false,
  };
  cacheService.setCachedUser(activeAdmin.id, activeAdmin);
  const validToken = generateToken({ userId: activeAdmin.id, role: 'ADMIN', isDemo: false });

  await t.test('Request from a non-whitelisted Origin is rejected with 403', async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: {
        Origin: 'https://malicious-site.com',
      },
    });

    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /CORS policy/i);
  });

  await t.test('Preflight OPTIONS from an allowed origin succeeds', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, Authorization',
      },
    });

    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.match(res.headers.get('access-control-allow-headers'), /Authorization/i);
  });

  await t.test('Request with only a cookie (no Bearer) returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        Origin: 'http://localhost:5173',
        Cookie: `token=${validToken}`,
      },
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.equal(data.message, 'Access denied. No authentication session or token provided.');
  });

  await t.test('Valid Bearer token from an allowed origin succeeds', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        Origin: 'http://localhost:5173',
        Authorization: `Bearer ${validToken}`,
      },
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.data.user.email, activeAdmin.email);
  });

  await t.test('Request with NO Origin header (server-to-server / curl) is allowed through CORS', async () => {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.status, 'UP');
  });
});

test('Security Batch 1 - Fix 3: Biometric Hardware Secret & Admin Simulate Punch', async (t) => {
  const mainApp = require('../index');
  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = mainApp.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  t.after(async () => {
    if (server) server.close();
    await prisma.$disconnect().catch(() => {});
  });

  const activeAdmin = {
    id: 'c3616fb3-dfa5-4266-8c47-f44fd82ef04f',
    email: 'admin-test@test.invalid',
    employeeCode: 'EMP-ADMIN-001',
    role: 'ADMIN',
    isActive: true,
  };
  const activeEmployee = {
    id: '47b52b1d-582e-4b5e-a4ad-6ac039866fa3',
    email: 'employee-test@test.invalid',
    employeeCode: 'EMP-01',
    role: 'EMPLOYEE',
    isActive: true,
  };
  cacheService.setCachedUser(activeAdmin.id, activeAdmin);
  cacheService.setCachedUser(activeEmployee.id, activeEmployee);

  const adminToken = generateToken({ userId: activeAdmin.id, role: 'ADMIN' });
  const empToken = generateToken({ userId: activeEmployee.id, role: 'EMPLOYEE' });

  await t.test('Hardware endpoint with no key returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/attendance/hardware-sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeCode: activeAdmin.employeeCode,
        timestamp: new Date().toISOString(),
        type: 'IN',
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /invalid hardware secret key/i);
  });

  await t.test('Hardware endpoint with wrong key returns 401', async () => {
    const res = await fetch(`${baseUrl}/api/attendance/hardware-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hardware-key': 'wrong_key_12345678901234567890123456789012',
      },
      body: JSON.stringify({
        employeeCode: activeAdmin.employeeCode,
        timestamp: new Date().toISOString(),
        type: 'IN',
      }),
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /invalid hardware secret key/i);
  });

  await t.test('Hardware endpoint with unset or short env returns 500 (fail closed)', async () => {
    const originalKey = process.env.HARDWARE_SECRET_KEY;
    try {
      process.env.HARDWARE_SECRET_KEY = 'too-short';
      const res = await fetch(`${baseUrl}/api/attendance/hardware-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hardware-key': 'any-key',
        },
        body: JSON.stringify({
          employeeCode: activeAdmin.employeeCode,
          timestamp: new Date().toISOString(),
          type: 'IN',
        }),
      });

      assert.equal(res.status, 500);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.message, 'Hardware sync misconfigured.');
    } finally {
      process.env.HARDWARE_SECRET_KEY = originalKey;
    }
  });

  await t.test('Simulate punch is 403 for non-admin user', async () => {
    const res = await fetch(`${baseUrl}/api/attendance/simulate-punch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        employeeCode: activeEmployee.employeeCode,
        timestamp: new Date().toISOString(),
        type: 'IN',
      }),
    });

    assert.equal(res.status, 403);
  });

  await t.test('Simulate punch is 404 in production without ALLOW_SIMULATE_PUNCH=true', async () => {
    const origEnv = process.env.NODE_ENV;
    const origFlag = process.env.ALLOW_SIMULATE_PUNCH;
    try {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_SIMULATE_PUNCH;

      const res = await fetch(`${baseUrl}/api/attendance/simulate-punch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          employeeCode: activeAdmin.employeeCode,
          timestamp: new Date().toISOString(),
          type: 'IN',
        }),
      });

      assert.equal(res.status, 404);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.match(data.message, /disabled in production/i);
    } finally {
      process.env.NODE_ENV = origEnv;
      if (origFlag !== undefined) process.env.ALLOW_SIMULATE_PUNCH = origFlag;
    }
  });
});

test('Security Batch 1 - Fix 5: Password Recovery Anti-Enumeration & Cooldown Enforcement', async (t) => {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/auth`;
      resolve();
    });
  });

  t.after(async () => {
    if (server) server.close();
    await prisma.$disconnect().catch(() => {});
  });

  const dbEligibility = getDbTestEligibility();

  await t.test('Check with existing user returns generic response without PII', async (sub) => {
    if (!dbEligibility.canRun) {
      sub.skip(dbEligibility.reason);
      return;
    }
    const activeUser = await prisma.user.findFirst({ where: { isActive: true } });
    if (!activeUser) {
      sub.skip('No active user in test database');
      return;
    }

    const res = await fetch(`${baseUrl}/forgot-password/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.195' },
      body: JSON.stringify({ email: activeUser.email }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.message, 'If an active account exists, recovery instructions can be delivered.');
    assert.ok(data.data.allowedChannels);
    assert.ok(data.data.maskedEmail);
    assert.equal(typeof data.data.hasPhone, 'boolean');
    // Ensure absolutely NO raw PII is returned
    assert.equal(data.data.fullName, undefined);
    assert.equal(data.data.role, undefined);
    assert.equal(data.data.employeeCode, undefined);
    assert.equal(data.data.phone, undefined);
    assert.equal(data.data.email, undefined);
  });

  await t.test('Check with non-existing user returns identical structure with 200', async (sub) => {
    if (!dbEligibility.canRun) {
      sub.skip(dbEligibility.reason);
      return;
    }
    const res = await fetch(`${baseUrl}/forgot-password/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.196' },
      body: JSON.stringify({ email: 'ghost-nonexistent-user-xyz@nexahr.com' }),
    });

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.equal(data.message, 'If an active account exists, recovery instructions can be delivered.');
    assert.deepEqual(Object.keys(data.data).sort(), ['allowedChannels', 'hasPhone', 'maskedEmail', 'maskedPhone']);
    assert.equal(data.data.fullName, undefined);
    assert.equal(data.data.role, undefined);
    assert.equal(data.data.employeeCode, undefined);
  });

  await t.test('OTP send cooldown rejects second request within 60s with 429', async (sub) => {
    if (!dbEligibility.canRun) {
      sub.skip(dbEligibility.reason);
      return;
    }
    const targetEmail = `cooldown-test-${Date.now()}@example.com`;
    // First request should succeed (uniform 200)
    const res1 = await fetch(`${baseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.197' },
      body: JSON.stringify({ email: targetEmail, channel: 'EMAIL' }),
    });
    assert.equal(res1.status, 200);

    // Second request immediately within 60s must be throttled with 429
    const res2 = await fetch(`${baseUrl}/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': '203.0.113.197' },
      body: JSON.stringify({ email: targetEmail, channel: 'EMAIL' }),
    });
    assert.equal(res2.status, 429);
    const data2 = await res2.json();
    assert.equal(data2.success, false);
    assert.match(data2.message, /wait before requesting another code/i);
  });

  await t.test('Recovery check endpoint rate limit triggers after 10 requests', async () => {
    const ip = '203.0.113.198';
    let hitRateLimit = false;

    // Send 11 requests from the same IP
    for (let i = 1; i <= 11; i++) {
      const res = await fetch(`${baseUrl}/forgot-password/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': ip },
        body: JSON.stringify({ email: `rate-limit-check-${i}@example.com` }),
      });

      if (res.status === 429) {
        hitRateLimit = true;
        const body = await res.json();
        assert.equal(body.code, 'RATE_LIMIT_EXCEEDED');
        break;
      }
    }

    assert.equal(hitRateLimit, true, 'Rate limiter must reject subsequent requests with 429 after 10 calls');
  });
});

test('Security Batch 1 - Fix 8: Database Seed Production Safeguard', async (t) => {
  await t.test('Executing seed in production without ALLOW_SEED=true exits with non-zero status', async () => {
    const { execFile } = require('child_process');
    const seedScriptPath = path.join(__dirname, '../../prisma/seed.js');

    const exitResult = await new Promise((resolve) => {
      execFile(
        process.execPath,
        [seedScriptPath],
        {
          env: {
            ...process.env,
            NODE_ENV: 'production',
            ALLOW_SEED: 'false',
          },
        },
        (error, stdout, stderr) => {
          resolve({
            code: error ? error.code : 0,
            stdout,
            stderr,
          });
        }
      );
    });

    assert.notEqual(exitResult.code, 0, 'Seed must exit with non-zero in production');
    assert.match(
      exitResult.stderr + exitResult.stdout,
      /Refusing to seed in production/i,
      'Must log clear refusal message'
    );
  });
});



test('Security Batch 1 - 1-Click Demo Login Endpoint & Auth Config', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/auth`;
      resolve();
    });
  });

  const origGuestDemo = process.env.ENABLE_GUEST_DEMO;
  const origNodeEnv = process.env.NODE_ENV;
  const origBootstrap = process.env.BOOTSTRAP_TOKEN;

  t.after(() => {
    if (server) server.close();
    setGuestDemoActiveForTesting(false);
    if (origGuestDemo !== undefined) process.env.ENABLE_GUEST_DEMO = origGuestDemo;
    else delete process.env.ENABLE_GUEST_DEMO;
    if (origNodeEnv !== undefined) process.env.NODE_ENV = origNodeEnv;
    else delete process.env.NODE_ENV;
    if (origBootstrap !== undefined) process.env.BOOTSTRAP_TOKEN = origBootstrap;
    else delete process.env.BOOTSTRAP_TOKEN;
  });

  await t.test('GET /api/auth/config reflects isGuestDemoActive state', async () => {
    setGuestDemoActiveForTesting(false);
    delete process.env.ENABLE_GUEST_DEMO;
    const resInactive = await fetch(`${baseUrl}/config`);
    const dataInactive = await resInactive.json();
    assert.equal(dataInactive.data.guestDemoEnabled, false);

    process.env.ENABLE_GUEST_DEMO = 'true';
    setGuestDemoActiveForTesting(true);
    const resActive = await fetch(`${baseUrl}/config`);
    const dataActive = await resActive.json();
    assert.equal(dataActive.data.guestDemoEnabled, true);
  });

  await t.test('POST /api/auth/demo-login returns 404 when demo guard is inactive', async () => {
    setGuestDemoActiveForTesting(false);
    delete process.env.ENABLE_GUEST_DEMO;

    const res = await fetch(`${baseUrl}/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'hr' }),
    });

    assert.equal(res.status, 404);
  });

  await t.test('POST /api/auth/demo-login returns 404 if no demo user exists in DB', async (sub) => {
    const dbEligibility = getDbTestEligibility();
    if (!dbEligibility.canRun) {
      sub.skip(dbEligibility.reason);
      return;
    }
    process.env.ENABLE_GUEST_DEMO = 'true';
    setGuestDemoActiveForTesting(true);

    const res = await fetch(`${baseUrl}/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'hr' }),
    });

    assert.equal(res.status, 404);
    const data = await res.json();
    assert.equal(data.success, false);
  });

  await t.test('POST /api/auth/register-admin is blocked in production without valid BOOTSTRAP_TOKEN', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.BOOTSTRAP_TOKEN;

    const res = await fetch(`${baseUrl}/register-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'New',
        lastName: 'Admin',
        email: 'newadmin@corp.test',
        password: 'Password123!',
      }),
    });

    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /disabled in production/i);
  });

  await t.test('POST /api/auth/register-admin enforces password strength validation', async () => {
    process.env.NODE_ENV = 'development';

    const res = await fetch(`${baseUrl}/register-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'New',
        lastName: 'Admin',
        email: 'newadmin@corp.test',
        password: 'weak',
      }),
    });

    assert.equal(res.status, 400);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /Password does not meet security requirements/i);
  });

  await t.test('verifyToken: rejects token carrying isDemo: true when demo guard is inactive (401)', async () => {
    setGuestDemoActiveForTesting(false);
    delete process.env.ENABLE_GUEST_DEMO;

    const demoUserId = 'demo-test-user-id';
    cacheService.setCachedUser(demoUserId, {
      id: demoUserId,
      email: 'demo@corp.test',
      role: 'ADMIN',
      isActive: true,
      isDemo: true,
    });

    const demoToken = generateToken({ userId: demoUserId, role: 'ADMIN', isDemo: true });

    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${demoToken}` },
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.code, 'DEMO_TOKEN_INVALID');
  });

  await t.test('verifyToken: rejects token where isDemo claim mismatches user profile (401)', async () => {
    process.env.ENABLE_GUEST_DEMO = 'true';
    setGuestDemoActiveForTesting(true);

    // Real user account (isDemo: false)
    const realUserId = 'real-user-test-id';
    cacheService.setCachedUser(realUserId, {
      id: realUserId,
      email: 'real@corp.test',
      role: 'ADMIN',
      isActive: true,
      isDemo: false,
    });

    // Token forged or old token minted with isDemo: true
    const forgedToken = generateToken({ userId: realUserId, role: 'ADMIN', isDemo: true });

    const res = await fetch(`${baseUrl}/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${forgedToken}` },
    });

    assert.equal(res.status, 401);
    const data = await res.json();
    assert.equal(data.code, 'TOKEN_CLAIM_MISMATCH');
  });
});
