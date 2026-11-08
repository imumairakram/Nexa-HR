const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

const authRoutes = require('../routes/auth.routes');
const employeeRoutes = require('../routes/employee.routes');
const cacheService = require('../services/cache.service');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');
const { hashPassword } = require('../utils/password');

test('Fix 9: Server-Enforced mustChangePassword Policy', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRoutes);
  app.use('/api/employees', employeeRoutes);

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  const initialPassword = 'InitialTempSecret123!';
  const initialHash = await hashPassword(initialPassword);

  const realUser = {
    id: 'user-must-change-test-1',
    email: 'newhire.temp@example.com',
    role: 'ADMIN',
    isActive: true,
    isDemo: false,
    mustChangePassword: true,
    password: initialHash,
    firstName: 'Alice',
    lastName: 'Admin',
    employeeCode: 'EMP-TEMP-001',
  };

  const demoUser = {
    id: 'user-demo-guest-1',
    email: 'guest.hr@nexahr.com',
    role: 'ADMIN',
    isActive: true,
    isDemo: true,
    mustChangePassword: false,
  };

  cacheService.setCachedUser(realUser.id, realUser);
  cacheService.setCachedUser(demoUser.id, demoUser);

  let realToken = generateToken({ userId: realUser.id, role: realUser.role, isDemo: false });
  const demoToken = generateToken({ userId: demoUser.id, role: demoUser.role, isDemo: true });

  const origFindUnique = prisma.user.findUnique;
  const origFindFirst = prisma.user.findFirst;
  const origUpdate = prisma.user.update;
  const origFindMany = prisma.user.findMany;
  const origCount = prisma.user.count;

  prisma.user.findFirst = async () => null;

  t.after(() => {
    if (server) server.close();
    prisma.user.findUnique = origFindUnique;
    prisma.user.findFirst = origFindFirst;
    prisma.user.update = origUpdate;
    prisma.user.findMany = origFindMany;
    prisma.user.count = origCount;
  });

  await t.test('Non-allowlisted route (GET /api/employees) is rejected with 403 PASSWORD_CHANGE_REQUIRED', async () => {
    const res = await fetch(`${baseUrl}/employees`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${realToken}` },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'PASSWORD_CHANGE_REQUIRED');
  });

  await t.test('Allowlisted route: GET /api/auth/me is permitted (200)', async () => {
    prisma.user.findUnique = async () => realUser;

    const res = await fetch(`${baseUrl}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${realToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.mustChangePassword, true);
  });

  await t.test('Allowlisted route: GET /api/auth/config is permitted (200)', async () => {
    const res = await fetch(`${baseUrl}/auth/config`, {
      method: 'GET',
    });

    assert.equal(res.status, 200);
  });

  await t.test('Allowlisted route: POST /api/auth/logout is permitted (200)', async () => {
    const res = await fetch(`${baseUrl}/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${realToken}` },
    });

    assert.equal(res.status, 200);
  });

  await t.test('Reusing the existing password on change-password is rejected (400)', async () => {
    prisma.user.findUnique = async () => realUser;

    const res = await fetch(`${baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${realToken}`,
      },
      body: JSON.stringify({
        currentPassword: initialPassword,
        newPassword: initialPassword,
        confirmPassword: initialPassword,
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /cannot be identical to your current password/i);
  });

  await t.test('Valid password change clears mustChangePassword and invalidates cache', async () => {
    let updatedDbUser = null;
    prisma.user.findUnique = async () => realUser;
    prisma.user.update = async ({ data }) => {
      updatedDbUser = {
        ...realUser,
        password: data.password,
        mustChangePassword: data.mustChangePassword,
      };
      return updatedDbUser;
    };

    const newPassword = 'BrandNewSecurePassword2026!';
    const res = await fetch(`${baseUrl}/auth/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${realToken}`,
      },
      body: JSON.stringify({
        currentPassword: initialPassword,
        newPassword: newPassword,
        confirmPassword: newPassword,
      }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(updatedDbUser.mustChangePassword, false);

    // Update realUser state and re-cache
    Object.assign(realUser, updatedDbUser);
    cacheService.setCachedUser(realUser.id, realUser);
  });

  await t.test('After password change, protected route (GET /api/employees) succeeds and is no longer blocked', async () => {
    prisma.user.findMany = async () => [realUser];
    prisma.user.count = async () => 1;

    const res = await fetch(`${baseUrl}/employees`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${realToken}` },
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
  });

  await t.test('Demo user is unaffected by password change enforcement', async () => {
    const { isGuestDemoActive, setGuestDemoActiveForTesting } = require('../services/demoGuard.service');
    setGuestDemoActiveForTesting(true);

    try {
      prisma.user.findMany = async () => [];
      prisma.user.count = async () => 0;

      const res = await fetch(`${baseUrl}/employees`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${demoToken}` },
      });

      // Demo users get through verifyToken without PASSWORD_CHANGE_REQUIRED
      assert.notEqual(res.status, 403);
    } finally {
      setGuestDemoActiveForTesting(false);
    }
  });
});
