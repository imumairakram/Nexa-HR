const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const express = require('express');

// Enforce zero external network calls
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

const { getDbTestEligibility } = require('./helpers/dbGuard');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');
const cacheService = require('../services/cache.service');
const recruitmentRoutes = require('../routes/recruitment.routes');

test('ATS Hardening - Cache Safety & User Isolation', async (t) => {
  await t.test('Cache key includes user role, userId and full original URL with query params', () => {
    const reqAdmin = {
      user: { userId: 'usr-admin-1', id: 'usr-admin-1', role: 'ADMIN' },
      originalUrl: '/api/recruitment/applications?stage=INTERVIEW&page=1',
    };
    const keyAdmin = cacheService.generateKey(reqAdmin);
    assert.equal(keyAdmin, 'ADMIN:usr-admin-1:/api/recruitment/applications?stage=INTERVIEW&page=1');

    const reqHr = {
      user: { userId: 'usr-hr-2', id: 'usr-hr-2', role: 'HR_MANAGER' },
      originalUrl: '/api/recruitment/applications?stage=INTERVIEW&page=1',
    };
    const keyHr = cacheService.generateKey(reqHr);
    assert.equal(keyHr, 'HR_MANAGER:usr-hr-2:/api/recruitment/applications?stage=INTERVIEW&page=1');

    assert.notEqual(keyAdmin, keyHr);
  });

  await t.test('Cache store never serves User A cached response to User B', () => {
    const keyUserA = 'ADMIN:usr-a:/api/recruitment/stats';
    const keyUserB = 'HR_MANAGER:usr-b:/api/recruitment/stats';

    cacheService.set(keyUserA, { secret: 'data-for-a-only' }, 5000);
    assert.deepEqual(cacheService.get(keyUserA), { secret: 'data-for-a-only' });
    assert.equal(cacheService.get(keyUserB), null);
  });

  await t.test('Anonymous request falls back safely without collision', () => {
    const reqAnon = {
      originalUrl: '/api/public/info',
    };
    const keyAnon = cacheService.generateKey(reqAnon);
    assert.equal(keyAnon, 'ALL:anon:/api/public/info');
  });

  await t.test('Fallback to req.user.id if userId is undefined', () => {
    const reqWithId = {
      user: { id: 'usr-id-only', role: 'ADMIN' },
      originalUrl: '/api/recruitment/jobs',
    };
    const key = cacheService.generateKey(reqWithId);
    assert.equal(key, 'ADMIN:usr-id-only:/api/recruitment/jobs');
  });
});

test('ATS Hardening - Authenticated Resume Access & RBAC', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/recruitment', recruitmentRoutes);

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api/recruitment`;
      resolve();
    });
  });

  t.after(async () => {
    if (server) server.close();
    await prisma.$disconnect();
  });

  // Pre-seed mock users in auth cache to avoid remote DB latency in tests
  cacheService.setCachedUser('mock-emp-id', {
    id: 'mock-emp-id',
    email: 'employee@nexahr.com',
    firstName: 'Test',
    lastName: 'Employee',
    role: 'EMPLOYEE',
    isActive: true,
  });

  cacheService.setCachedUser('mock-hr-id', {
    id: 'mock-hr-id',
    email: 'hr@nexahr.com',
    firstName: 'Test',
    lastName: 'HR',
    role: 'HR_MANAGER',
    isActive: true,
  });

  await t.test('401 Unauthorized when requesting resume without token', async () => {
    const res = await fetch(`${baseUrl}/applications/test-target-id/resume`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /Access denied/i);
  });

  await t.test('403 Forbidden when requesting resume with EMPLOYEE role', async () => {
    const employeeToken = generateToken({
      userId: 'mock-emp-id',
      email: 'employee@nexahr.com',
      role: 'EMPLOYEE',
    });

    const res = await fetch(`${baseUrl}/applications/test-target-id/resume`, {
      headers: {
        Authorization: `Bearer ${employeeToken}`,
      },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.match(body.message, /Forbidden.*EMPLOYEE/i);
  });

  await t.test('200 OK with Content-Type and Content-Disposition when requesting resume with HR_MANAGER role', async (sub) => {
    const dbEligibility = getDbTestEligibility();
    if (!dbEligibility.canRun) {
      sub.skip(dbEligibility.reason);
      return;
    }
    const hrToken = generateToken({
      userId: 'mock-hr-id',
      email: 'hr@nexahr.com',
      role: 'HR_MANAGER',
    });

    // Create self-contained temporary test resume file in uploads
    const sampleFilename = `test_sample_resume_${Date.now()}.pdf`;
    const sampleFilePath = path.resolve(process.cwd(), 'uploads', sampleFilename);
    fs.mkdirSync(path.dirname(sampleFilePath), { recursive: true });
    fs.writeFileSync(sampleFilePath, '%PDF-1.4 %dummy mock binary content');

    const app = await prisma.jobApplication.findFirst();
    if (app) {
      await prisma.jobApplication.update({
        where: { id: app.id },
        data: { resumeUrl: `/uploads/${sampleFilename}` },
      });

      const res = await fetch(`${baseUrl}/applications/${app.id}/resume`, {
        headers: {
          Authorization: `Bearer ${hrToken}`,
        },
      });

      assert.equal(res.status, 200);
      assert.match(res.headers.get('content-type'), /application\/pdf/i);
      assert.match(res.headers.get('content-disposition'), /inline; filename=/i);

      // Clean up after test
      await prisma.jobApplication.update({
        where: { id: app.id },
        data: { resumeUrl: null },
      });
      if (fs.existsSync(sampleFilePath)) {
        fs.unlinkSync(sampleFilePath);
      }
    }
  });

  await t.test('404 Not Found when HR requests resume for non-existent candidate', async (sub) => {
    const dbEligibility = getDbTestEligibility();
    if (!dbEligibility.canRun) {
      sub.skip(dbEligibility.reason);
      return;
    }
    const hrToken = generateToken({
      userId: 'mock-hr-id',
      email: 'hr@nexahr.com',
      role: 'HR_MANAGER',
    });

    const res = await fetch(`${baseUrl}/applications/00000000-0000-0000-0000-000000000000/resume`, {
      headers: {
        Authorization: `Bearer ${hrToken}`,
      },
    });

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
  });
});
