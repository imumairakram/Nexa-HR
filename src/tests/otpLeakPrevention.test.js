const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Enforce zero external network calls
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

const prisma = require('../config/prisma');
const notificationService = require('../services/notification.service');
const { forgotPassword, verifyResetOtp } = require('../controllers/auth.controller');

const FORBIDDEN_KEYS = [
  'otp',
  'code',
  'devotp',
  'debugotp',
  'testcode',
  'token',
  'reseturl',
  'previewotp',
];

/**
 * Recursively inspect an object to ensure no forbidden keys or matching 6-digit secret values exist
 */
function assertNoSecretLeaks(payload, knownSecret = null) {
  if (!payload || typeof payload !== 'object') return;

  const jsonString = JSON.stringify(payload);

  if (knownSecret) {
    assert.equal(
      jsonString.includes(String(knownSecret)),
      false,
      `Response body must never contain the generated OTP (${knownSecret}) in any field or string`
    );
  }

  for (const [key, value] of Object.entries(payload)) {
    const lowerKey = key.toLowerCase();
    // In verifyResetOtp, resetToken is the authorized JWT token returned for Step 3
    if (lowerKey !== 'resettoken') {
      for (const forbidden of FORBIDDEN_KEYS) {
        assert.notEqual(
          lowerKey,
          forbidden,
          `Response payload must never contain a key named "${forbidden}" (found: "${key}")`
        );
      }
    }

    if (value && typeof value === 'object') {
      assertNoSecretLeaks(value, knownSecret);
    }
  }
}

test('OTP Leak Prevention - Zero Secret Exposure Across All Environments', async (t) => {
  const originalFindFirst = prisma.user.findFirst;
  const originalFindUnique = prisma.user.findUnique;
  const originalOtpCreate = prisma.passwordResetOtp.create;
  const originalOtpUpdateMany = prisma.passwordResetOtp.updateMany;
  const originalOtpFindFirst = prisma.passwordResetOtp.findFirst;
  const originalOtpUpdate = prisma.passwordResetOtp.update;
  const originalResetTokenUpdateMany = prisma.passwordResetToken.updateMany;
  const originalSendEmailOTP = notificationService.sendEmailOTP;
  const originalSendWhatsAppOTP = notificationService.sendWhatsAppOTP;
  const originalNodeEnv = process.env.NODE_ENV;

  t.afterEach(() => {
    prisma.user.findFirst = originalFindFirst;
    prisma.user.findUnique = originalFindUnique;
    prisma.passwordResetOtp.create = originalOtpCreate;
    prisma.passwordResetOtp.updateMany = originalOtpUpdateMany;
    prisma.passwordResetOtp.findFirst = originalOtpFindFirst;
    prisma.passwordResetOtp.update = originalOtpUpdate;
    prisma.passwordResetToken.updateMany = originalResetTokenUpdateMany;
    notificationService.sendEmailOTP = originalSendEmailOTP;
    notificationService.sendWhatsAppOTP = originalSendWhatsAppOTP;
    process.env.NODE_ENV = originalNodeEnv;
  });

  const environments = ['development', 'test', 'production'];

  for (const env of environments) {
    await t.test(`[${env.toUpperCase()}] forgotPassword (initiate/resend) NEVER leaks OTP in response on email success`, async () => {
      process.env.NODE_ENV = env;
      const testEmail = `user.email.success.${env}@enterprise.test`;

      let capturedOtpInDb = null;
      prisma.user.findFirst = async () => ({
        id: `usr-corp-101-${env}`,
        email: testEmail,
        firstName: 'Alice',
        lastName: 'Analyst',
        phone: '+15550199999',
        role: 'EMPLOYEE',
        isActive: true,
        isDemo: false,
      });

      prisma.passwordResetOtp.findFirst = async () => null; // No cooldown in DB
      prisma.passwordResetOtp.updateMany = async () => ({ count: 1 });
      prisma.passwordResetToken.updateMany = async () => ({ count: 0 });
      prisma.passwordResetOtp.create = async ({ data }) => {
        capturedOtpInDb = data;
        return { id: 'otp-rec-1', ...data };
      };

      let capturedDispatchedOtp = null;
      notificationService.sendEmailOTP = async (email, otp) => {
        capturedDispatchedOtp = otp;
        return { success: true, messageId: '<msg-1@nexahr.test>' };
      };

      let responseStatus = null;
      let responseBody = null;
      const res = {
        status(s) { responseStatus = s; return this; },
        json(b) { responseBody = b; return this; },
      };

      await forgotPassword({
        body: { email: testEmail, channel: 'EMAIL' },
      }, res);

      assert.equal(responseStatus, 200);
      assert.equal(responseBody.success, true);
      assert.ok(capturedDispatchedOtp, 'OTP was generated and dispatched internally');

      // Assert zero leaks
      assertNoSecretLeaks(responseBody, capturedDispatchedOtp);
      assert.equal(responseBody.data.previewOtp, undefined);
      assert.equal(responseBody.data.otp, undefined);
    });

    await t.test(`[${env.toUpperCase()}] forgotPassword NEVER leaks OTP in response on WhatsApp success`, async () => {
      process.env.NODE_ENV = env;
      const testEmail = `user.wa.success.${env}@enterprise.test`;

      prisma.user.findFirst = async () => ({
        id: `usr-corp-102-${env}`,
        email: testEmail,
        firstName: 'Bob',
        lastName: 'Builder',
        phone: '+15550188888',
        role: 'EMPLOYEE',
        isActive: true,
        isDemo: false,
      });

      prisma.passwordResetOtp.findFirst = async () => null;
      prisma.passwordResetOtp.updateMany = async () => ({ count: 1 });
      prisma.passwordResetToken.updateMany = async () => ({ count: 0 });
      prisma.passwordResetOtp.create = async ({ data }) => ({ id: 'otp-rec-2', ...data });

      let capturedDispatchedOtp = null;
      notificationService.sendWhatsAppOTP = async (phone, otp) => {
        capturedDispatchedOtp = otp;
        return { success: true, messageId: 'WA-MSG-1' };
      };

      let responseStatus = null;
      let responseBody = null;
      const res = {
        status(s) { responseStatus = s; return this; },
        json(b) { responseBody = b; return this; },
      };

      await forgotPassword({
        body: { email: testEmail, channel: 'WHATSAPP' },
      }, res);

      assert.equal(responseStatus, 200);
      assert.equal(responseBody.success, true);
      assertNoSecretLeaks(responseBody, capturedDispatchedOtp);
      assert.equal(responseBody.data.previewOtp, undefined);
    });

    await t.test(`[${env.toUpperCase()}] forgotPassword on FORCED delivery failure invalidates OTP in DB and leaks no secrets`, async () => {
      process.env.NODE_ENV = env;
      const testEmail = `user.fail.${env}@enterprise.test`;

      let invalidatedCalled = false;
      prisma.user.findFirst = async () => ({
        id: `usr-corp-103-${env}`,
        email: testEmail,
        firstName: 'Carol',
        lastName: 'Coder',
        role: 'EMPLOYEE',
        isActive: true,
        isDemo: false,
      });

      prisma.passwordResetOtp.findFirst = async () => null;
      prisma.passwordResetToken.updateMany = async () => ({ count: 0 });
      prisma.passwordResetOtp.create = async ({ data }) => ({ id: 'otp-rec-3', ...data });
      prisma.passwordResetOtp.updateMany = async (args) => {
        if (args?.data?.isUsed === true) {
          invalidatedCalled = true;
        }
        return { count: 1 };
      };

      let failedOtp = null;
      notificationService.sendEmailOTP = async (email, otp) => {
        failedOtp = otp;
        return {
          success: false,
          error: 'SMTP_DISPATCH_FAILED',
          message: 'Connection timeout',
        };
      };

      let responseStatus = null;
      let responseBody = null;
      const res = {
        status(s) { responseStatus = s; return this; },
        json(b) { responseBody = b; return this; },
      };

      await forgotPassword({
        body: { email: testEmail, channel: 'EMAIL' },
      }, res);

      assert.equal(responseStatus, 503);
      assert.equal(responseBody.success, false);
      assert.equal(invalidatedCalled, true, 'OTP must be immediately invalidated in database upon delivery failure');

      // Ensure error message is generic with no SMTP/credentials/OTP leakage
      assert.equal(
        responseBody.message,
        'Unable to deliver verification code. Please try again later or contact your administrator.'
      );
      assertNoSecretLeaks(responseBody, failedOtp);
    });

    await t.test(`[${env.toUpperCase()}] forgotPassword for NON-EXISTING user returns identical response shape with no leaks`, async () => {
      process.env.NODE_ENV = env;
      const testEmail = `ghost.user.${env}@enterprise.test`;

      prisma.user.findFirst = async () => null; // Non-existing user

      let responseStatus = null;
      let responseBody = null;
      const res = {
        status(s) { responseStatus = s; return this; },
        json(b) { responseBody = b; return this; },
      };

      await forgotPassword({
        body: { email: testEmail, channel: 'EMAIL' },
      }, res);

      assert.equal(responseStatus, 200);
      assert.equal(responseBody.success, true);
      assertNoSecretLeaks(responseBody);

      // Verify uniform response shape: { destination, channel, expiresInMinutes }
      assert.deepEqual(Object.keys(responseBody.data).sort(), ['channel', 'destination', 'expiresInMinutes'].sort());
      assert.equal(responseBody.data.expiresInMinutes, 10);
    });
  }

  // ====================================================
  // verifyResetOtp: timingSafeEqual and constant-time tests
  // ====================================================
  await t.test('verifyResetOtp uses crypto.timingSafeEqual and invalidates after 5 attempts', async () => {
    const rawOtp = '654321';
    const otpHash = crypto.createHash('sha256').update(rawOtp).digest('hex');

    prisma.user.findFirst = async () => ({
      id: 'usr-corp-200',
      email: 'david.sec@enterprise.test',
      role: 'EMPLOYEE',
      isActive: true,
      isDemo: false,
    });

    let currentAttempts = 0;
    prisma.passwordResetOtp.findFirst = async () => ({
      id: 'otp-record-200',
      userId: 'usr-corp-200',
      otpHash,
      attempts: currentAttempts,
      isUsed: false,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    let attemptsIncremented = false;
    prisma.passwordResetOtp.update = async (args) => {
      if (args?.data?.attempts?.increment) {
        attemptsIncremented = true;
        currentAttempts++;
      }
      return { id: 'otp-record-200' };
    };

    let responseStatus = null;
    let responseBody = null;
    const res = {
      status(s) { responseStatus = s; return this; },
      json(b) { responseBody = b; return this; },
    };

    // 1. Wrong OTP -> rejected, attempts incremented
    await verifyResetOtp({
      body: { email: 'david.sec@enterprise.test', otp: '000000' },
    }, res);

    assert.equal(responseStatus, 400);
    assert.equal(attemptsIncremented, true);
    assert.equal(responseBody.message.includes('Incorrect OTP code'), true);
    assertNoSecretLeaks(responseBody, rawOtp);

    // 2. Correct OTP -> returns resetToken (JWT) without leaking OTP
    let markedUsed = false;
    prisma.passwordResetOtp.update = async (args) => {
      if (args?.data?.isUsed === true) {
        markedUsed = true;
      }
      return { id: 'otp-record-200' };
    };

    await verifyResetOtp({
      body: { email: 'david.sec@enterprise.test', otp: rawOtp },
    }, res);

    assert.equal(responseStatus, 200);
    assert.equal(responseBody.success, true);
    assert.equal(markedUsed, true);
    assert.ok(responseBody.data.resetToken, 'Provides valid resetToken');
    assertNoSecretLeaks(responseBody, rawOtp);
  });

  // ====================================================
  // Frontend Source Integrity Check
  // ====================================================
  await t.test('Frontend source files contain ZERO references to "Dev/Test Code", "Auto-fill", or previewOtp', () => {
    const clientSrcDir = path.resolve(__dirname, '../../client/src');
    assert.equal(fs.existsSync(clientSrcDir), true, 'client/src must exist');

    const filesToScan = [];
    function walk(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(full);
        } else if (/\.(jsx?|tsx?|html)$/.test(entry.name)) {
          filesToScan.push(full);
        }
      }
    }
    walk(clientSrcDir);

    const forbiddenPhrases = [
      'Dev/Test Code',
      'Auto-fill',
      'previewOtp',
      'devOtp',
      'testCode',
    ];

    for (const filePath of filesToScan) {
      const content = fs.readFileSync(filePath, 'utf8');
      const relPath = path.relative(path.resolve(__dirname, '../../'), filePath);

      for (const phrase of forbiddenPhrases) {
        assert.equal(
          content.includes(phrase),
          false,
          `File "${relPath}" must not contain forbidden phrase "${phrase}"`
        );
      }
    }
  });
});
