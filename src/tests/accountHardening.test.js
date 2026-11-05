const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const accountRoutes = require('../routes/account.routes');
const cacheService = require('../services/cache.service');
const { generateToken } = require('../utils/jwt');
const { setGuestDemoActiveForTesting } = require('../services/demoGuard.service');
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

test('Accounts Routes Hardening & RBAC Tests', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/accounts', accountRoutes);

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://127.0.0.1:${server.address().port}/api/accounts`;
      resolve();
    });
  });

  const origNodeEnv = process.env.NODE_ENV;
  const origClear = process.env.ALLOW_ACCOUNTS_CLEAR;
  const origSeed = process.env.ALLOW_ACCOUNTS_SEED;
  const origDemo = process.env.ENABLE_GUEST_DEMO;

  t.after(() => {
    if (server) server.close();
    setGuestDemoActiveForTesting(false);
    if (origNodeEnv !== undefined) process.env.NODE_ENV = origNodeEnv;
    else delete process.env.NODE_ENV;
    if (origClear !== undefined) process.env.ALLOW_ACCOUNTS_CLEAR = origClear;
    else delete process.env.ALLOW_ACCOUNTS_CLEAR;
    if (origSeed !== undefined) process.env.ALLOW_ACCOUNTS_SEED = origSeed;
    else delete process.env.ALLOW_ACCOUNTS_SEED;
    if (origDemo !== undefined) process.env.ENABLE_GUEST_DEMO = origDemo;
    else delete process.env.ENABLE_GUEST_DEMO;
  });

  // Enable demo guard for demo user tests
  process.env.ENABLE_GUEST_DEMO = 'true';
  setGuestDemoActiveForTesting(true);

  // Setup mock cached users
  const adminUser = {
    id: 'test-admin-account-user',
    email: 'admin@test.invalid',
    role: 'ADMIN',
    isActive: true,
    isDemo: false,
  };
  const empUser = {
    id: 'test-emp-account-user',
    email: 'emp@test.invalid',
    role: 'EMPLOYEE',
    isActive: true,
    isDemo: false,
  };
  const demoAdminUser = {
    id: 'test-demoadmin-account-user',
    email: 'demoadmin@test.invalid',
    role: 'ADMIN',
    isActive: true,
    isDemo: true,
  };

  cacheService.setCachedUser(adminUser.id, adminUser);
  cacheService.setCachedUser(empUser.id, empUser);
  cacheService.setCachedUser(demoAdminUser.id, demoAdminUser);

  const adminToken = generateToken({ userId: adminUser.id, role: 'ADMIN', isDemo: false });
  const empToken = generateToken({ userId: empUser.id, role: 'EMPLOYEE', isDemo: false });
  const demoToken = generateToken({ userId: demoAdminUser.id, role: 'ADMIN', isDemo: true });

  await t.test('POST /api/accounts/clear requires auth and rejects unauthenticated request (401)', async () => {
    const res = await fetch(`${baseUrl}/clear`, { method: 'POST' });
    assert.equal(res.status, 401);
  });

  await t.test('POST /api/accounts/clear rejects EMPLOYEE role (403)', async () => {
    const res = await fetch(`${baseUrl}/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert.equal(res.status, 403);
  });

  await t.test('POST & DELETE /api/accounts/clear rejects demo users (403 DEMO_MODE)', async () => {
    const postRes = await fetch(`${baseUrl}/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    assert.equal(postRes.status, 403);
    const postData = await postRes.json();
    assert.equal(postData.code, 'DEMO_MODE');

    const deleteRes = await fetch(`${baseUrl}/clear`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    assert.equal(deleteRes.status, 403);
    const deleteData = await deleteRes.json();
    assert.equal(deleteData.code, 'DEMO_MODE');
  });

  await t.test('POST /api/accounts/clear refuses in production without ALLOW_ACCOUNTS_CLEAR=true', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_ACCOUNTS_CLEAR;

    const res = await fetch(`${baseUrl}/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /disabled in production/i);
  });

  await t.test('POST /api/accounts/seed requires auth and rejects unauthenticated request (401)', async () => {
    const res = await fetch(`${baseUrl}/seed`, { method: 'POST' });
    assert.equal(res.status, 401);
  });

  await t.test('POST /api/accounts/seed rejects EMPLOYEE role (403)', async () => {
    const res = await fetch(`${baseUrl}/seed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${empToken}` },
    });
    assert.equal(res.status, 403);
  });

  await t.test('POST /api/accounts/seed rejects demo users (403 DEMO_MODE)', async () => {
    const res = await fetch(`${baseUrl}/seed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${demoToken}` },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.code, 'DEMO_MODE');
  });

  await t.test('POST /api/accounts/seed refuses in production without ALLOW_ACCOUNTS_SEED=true', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.ALLOW_ACCOUNTS_SEED;

    const res = await fetch(`${baseUrl}/seed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.success, false);
    assert.match(data.message, /disabled in production/i);
  });

  await t.test('POST /api/accounts/batch-delete rejects EMPLOYEE role (403)', async () => {
    const res = await fetch(`${baseUrl}/batch-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({ ids: ['txn-1'] }),
    });
    assert.equal(res.status, 403);
  });

  await t.test('POST /api/accounts/batch-delete rejects demo users (403 DEMO_MODE)', async () => {
    const res = await fetch(`${baseUrl}/batch-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({ ids: ['txn-1'] }),
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.code, 'DEMO_MODE');
  });

  await t.test('POST /api/accounts/batch-delete validates empty or missing ids (400)', async () => {
    process.env.NODE_ENV = 'development';
    const res = await fetch(`${baseUrl}/batch-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ ids: [] }),
    });
    assert.equal(res.status, 400);
  });

  await t.test('POST /api/accounts/batch-status rejects EMPLOYEE role (403)', async () => {
    const res = await fetch(`${baseUrl}/batch-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({ ids: ['txn-1'], status: 'VERIFIED' }),
    });
    assert.equal(res.status, 403);
  });

  await t.test('POST /api/accounts/batch-status rejects demo users (403 DEMO_MODE)', async () => {
    const res = await fetch(`${baseUrl}/batch-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${demoToken}`,
      },
      body: JSON.stringify({ ids: ['txn-1'], status: 'VERIFIED' }),
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.equal(data.code, 'DEMO_MODE');
  });

  await t.test('POST /api/accounts/batch-status validates missing params (400)', async () => {
    process.env.NODE_ENV = 'development';
    const res = await fetch(`${baseUrl}/batch-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ ids: [] }),
    });
    assert.equal(res.status, 400);
  });
});
