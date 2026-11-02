const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePasswordStrength } = require('../utils/password');
const { blockDemo } = require('../middlewares/auth.middleware');
const { initDemoGuard, isGuestDemoActive, setGuestDemoActiveForTesting } = require('../services/demoGuard.service');

test('Enterprise Password Strength Policy Validation', async (t) => {
  await t.test('rejects passwords shorter than 10 characters', () => {
    const res = validatePasswordStrength('Ab1!cde', { email: 'test@example.com' });
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((e) => e.includes('at least 10 characters')));
  });

  await t.test('rejects passwords missing uppercase letters', () => {
    const res = validatePasswordStrength('lowercase123!@#', { email: 'test@example.com' });
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((e) => e.includes('uppercase letter')));
  });

  await t.test('rejects passwords missing lowercase letters', () => {
    const res = validatePasswordStrength('UPPERCASE123!@#', { email: 'test@example.com' });
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((e) => e.includes('lowercase letter')));
  });

  await t.test('rejects passwords missing digits', () => {
    const res = validatePasswordStrength('NoDigitsHere!@#', { email: 'test@example.com' });
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((e) => e.includes('digit')));
  });

  await t.test('rejects passwords missing special symbols', () => {
    const res = validatePasswordStrength('NoSymbols12345', { email: 'test@example.com' });
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((e) => e.includes('special symbol')));
  });

  await t.test('rejects password matching user email', () => {
    const res = validatePasswordStrength('test@example.com', { email: 'test@example.com' });
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((e) => e.includes('identical to your email')));
  });

  await t.test('rejects password matching current password', () => {
    const res = validatePasswordStrength('SecureP@ssw0rd!', {
      email: 'user@corp.com',
      currentPassword: 'SecureP@ssw0rd!',
    });
    assert.equal(res.isValid, false);
    assert.ok(res.errors.some((e) => e.includes('identical to your current password')));
  });

  await t.test('accepts strong compliant password', () => {
    const res = validatePasswordStrength('V3ry$ecureP@ssw0rd2026', {
      email: 'user@corp.com',
      currentPassword: 'OldP@ssw0rd123!',
    });
    assert.equal(res.isValid, true);
    assert.equal(res.errors.length, 0);
  });
});

test('Defense-in-Depth blockDemo Middleware', async (t) => {
  await t.test('blocks requests when req.user.isDemo is true with 403 DEMO_MODE', () => {
    let statusSent = null;
    let jsonSent = null;
    let nextCalled = false;

    const req = { user: { userId: 'demo-user-1', isDemo: true } };
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json(data) {
        jsonSent = data;
        return this;
      },
    };
    const next = () => {
      nextCalled = true;
    };

    blockDemo(req, res, next);
    assert.equal(nextCalled, false);
    assert.equal(statusSent, 403);
    assert.equal(jsonSent?.code, 'DEMO_MODE');
    assert.equal(jsonSent?.success, false);
  });

  await t.test('allows requests through when req.user.isDemo is false', () => {
    let statusSent = null;
    let nextCalled = false;

    const req = { user: { userId: 'real-user-1', isDemo: false } };
    const res = {
      status(code) {
        statusSent = code;
        return this;
      },
      json() {
        return this;
      },
    };
    const next = () => {
      nextCalled = true;
    };

    blockDemo(req, res, next);
    assert.equal(nextCalled, true);
    assert.equal(statusSent, null);
  });

  await t.test('allows requests through when req.user is undefined or non-demo', () => {
    let nextCalled = false;
    const req = {};
    const res = {};
    const next = () => {
      nextCalled = true;
    };

    blockDemo(req, res, next);
    assert.equal(nextCalled, true);
  });
});

test('Startup Guard initDemoGuard Safety Verification', async (t) => {
  const originalEnv = process.env.ENABLE_GUEST_DEMO;

  t.after(() => {
    if (originalEnv !== undefined) {
      process.env.ENABLE_GUEST_DEMO = originalEnv;
    } else {
      delete process.env.ENABLE_GUEST_DEMO;
    }
  });

  await t.test('remains inactive when ENABLE_GUEST_DEMO is unset', async () => {
    delete process.env.ENABLE_GUEST_DEMO;
    const mockPrisma = {
      user: {
        count: async () => 0,
      },
    };

    const active = await initDemoGuard(mockPrisma);
    assert.equal(active, false);
    assert.equal(isGuestDemoActive(), false);
  });

  await t.test('refuses to activate when target database contains real/non-demo users', async () => {
    process.env.ENABLE_GUEST_DEMO = 'true';
    const mockPrisma = {
      user: {
        count: async ({ where }) => {
          if (where.isDemo === false) return 5; // 5 real users found!
          return 0;
        },
      },
    };

    const active = await initDemoGuard(mockPrisma);
    assert.equal(active, false);
    assert.equal(isGuestDemoActive(), false);
  });

  await t.test('activates safely when target database contains 0 real users', async () => {
    process.env.ENABLE_GUEST_DEMO = 'true';
    const mockPrisma = {
      user: {
        count: async ({ where }) => {
          if (where.isDemo === false) return 0; // Pure demo DB
          return 2;
        },
      },
    };

    const active = await initDemoGuard(mockPrisma);
    assert.equal(active, true);
    assert.equal(isGuestDemoActive(), true);
  });
});

