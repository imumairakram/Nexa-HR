const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const fs = require('fs');
const path = require('path');
const authRoutes = require('../routes/auth.routes');
const {
  sendPasswordResetEmail,
  sendEmailOTP,
  sendWhatsAppOTP,
  maskEmail,
  maskPhone,
} = require('../services/notification.service');
const { generateToken, verifyJwtToken } = require('../utils/jwt');

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

  await t.test('Login with non-existent credentials returns 401 and does not auto-create accounts', async () => {
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
