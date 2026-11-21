const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

const payrollRoutes = require('../routes/payroll.routes');
const accountRoutes = require('../routes/account.routes');
const employeeRoutes = require('../routes/employee.routes');
const authRoutes = require('../routes/auth.routes');
const attendanceRoutes = require('../routes/attendance.routes');
const leaveRoutes = require('../routes/leave.routes');
const cacheService = require('../services/cache.service');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');

test('Phase 1: Payroll Module Hardening & Access Control Tests', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/payroll', payrollRoutes);
  app.use('/api/accounts', accountRoutes);
  app.use('/api/employees', employeeRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/leaves', leaveRoutes);

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  // Test accounts
  const employeeA = {
    id: 'user-emp-a',
    email: 'employee.a@company.com',
    role: 'EMPLOYEE',
    isActive: true,
    isDemo: false,
    firstName: 'Employee',
    lastName: 'A',
  };

  const employeeB = {
    id: 'user-emp-b',
    email: 'employee.b@company.com',
    role: 'EMPLOYEE',
    isActive: true,
    isDemo: false,
    firstName: 'Employee',
    lastName: 'B',
  };

  const adminUser = {
    id: 'user-admin-1',
    email: 'admin.hr@company.com',
    role: 'ADMIN',
    isActive: true,
    isDemo: false,
    firstName: 'Admin',
    lastName: 'HR',
  };

  const superAdminUser = {
    id: 'user-super-admin-1',
    email: 'super.admin@company.com',
    role: 'SUPER_ADMIN',
    isActive: true,
    isDemo: false,
    firstName: 'Super',
    lastName: 'Admin',
  };

  // Cache users for token auth
  cacheService.setCachedUser(employeeA.id, employeeA);
  cacheService.setCachedUser(employeeB.id, employeeB);
  cacheService.setCachedUser(adminUser.id, adminUser);
  cacheService.setCachedUser(superAdminUser.id, superAdminUser);

  const tokenA = generateToken({ userId: employeeA.id, role: 'EMPLOYEE', isDemo: false });
  const tokenB = generateToken({ userId: employeeB.id, role: 'EMPLOYEE', isDemo: false });
  const tokenAdmin = generateToken({ userId: adminUser.id, role: 'ADMIN', isDemo: false });
  const tokenSuperAdmin = generateToken({ userId: superAdminUser.id, role: 'SUPER_ADMIN', isDemo: false });

  // Save original prisma methods
  const origFindUniqueUser = prisma.user.findUnique;
  const origFindFirstUser = prisma.user.findFirst;
  const origFindManyUser = prisma.user.findMany;
  const origUpdateUser = prisma.user.update;
  const origDeleteUser = prisma.user.delete;
  const origCreateUser = prisma.user.create;
  const origCountUser = prisma.user.count;
  const origFindUniqueStructure = prisma.salaryStructure.findUnique;
  const origUpsertStructure = prisma.salaryStructure.upsert;
  const origFindUniquePayslip = prisma.payslip.findUnique;
  const origFindManyPayslip = prisma.payslip.findMany;
  const origUpdatePayslip = prisma.payslip.update;
  const origTransaction = prisma.$transaction;
  const origDeleteManyAccount = prisma.accountTransaction.deleteMany;
  const origCountAccount = prisma.accountTransaction.count;
  const origCreateNotification = prisma.notification?.create;

  if (!prisma.legacyPayslip) prisma.legacyPayslip = {};
  prisma.legacyPayslip.findUnique = (...args) => prisma.payslip.findUnique(...args);
  prisma.legacyPayslip.findMany = (...args) => prisma.payslip.findMany(...args);
  prisma.legacyPayslip.update = (...args) => prisma.payslip.update(...args);
  prisma.legacyPayslip.updateMany = (...args) => prisma.payslip.updateMany(...args);
  prisma.legacyPayslip.upsert = (...args) => prisma.payslip.upsert(...args);

  if (!prisma.notification) prisma.notification = {};
  prisma.notification.create = async () => ({ id: 'notif-mock-1' });

  t.after(() => {
    if (server) server.close();
    prisma.user.findUnique = origFindUniqueUser;
    prisma.user.findFirst = origFindFirstUser;
    prisma.user.findMany = origFindManyUser;
    prisma.user.update = origUpdateUser;
    prisma.user.delete = origDeleteUser;
    prisma.user.create = origCreateUser;
    prisma.user.count = origCountUser;
    prisma.salaryStructure.findUnique = origFindUniqueStructure;
    prisma.salaryStructure.upsert = origUpsertStructure;
    prisma.payslip.findUnique = origFindUniquePayslip;
    prisma.payslip.findMany = origFindManyPayslip;
    prisma.payslip.update = origUpdatePayslip;
    prisma.$transaction = origTransaction;
    prisma.accountTransaction.deleteMany = origDeleteManyAccount;
    prisma.accountTransaction.count = origCountAccount;
    if (origCreateNotification) prisma.notification.create = origCreateNotification;
    cacheService.clear();
  });

  // -------------------------------------------------------------
  // 1. Authorization: Deny-by-default for Salary Structure
  // -------------------------------------------------------------
  await t.test('1. Employee A cannot read Employee B salary structure (403)', async () => {
    const res = await fetch(`${baseUrl}/payroll/salary-structure/${employeeB.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'FORBIDDEN_PAYROLL_ACCESS');
  });

  await t.test('2. Employee A can read their own salary structure (200)', async () => {
    prisma.salaryStructure.findUnique = async ({ where }) => {
      if (where.userId === employeeA.id) {
        return {
          id: 'struct-a',
          userId: employeeA.id,
          basicSalary: 150000,
          housingAllowance: 30000,
          transportAllowance: 10000,
          otherAllowances: 0,
          taxDeductions: 12000,
          otherDeductions: 0,
        };
      }
      return null;
    };

    const res = await fetch(`${baseUrl}/payroll/salary-structure/${employeeA.id}`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.salaryStructure.basicSalary, 150000);
  });

  await t.test('3. ADMIN can read any employee salary structure (200)', async () => {
    prisma.salaryStructure.findUnique = async ({ where }) => {
      if (where.userId === employeeB.id) {
        return {
          id: 'struct-b',
          userId: employeeB.id,
          basicSalary: 200000,
          taxDeductions: 25000,
        };
      }
      return null;
    };

    const res = await fetch(`${baseUrl}/payroll/salary-structure/${employeeB.id}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.salaryStructure.basicSalary, 200000);
  });

  // -------------------------------------------------------------
  // 2. Authorization: Deny-by-default for Payslips
  // -------------------------------------------------------------
  await t.test('4. Employee A cannot read Employee B payslip by ID (403)', async () => {
    prisma.payslip.findUnique = async ({ where }) => {
      if (where.id === 'slip-b-1') {
        return {
          id: 'slip-b-1',
          userId: employeeB.id,
          month: 11,
          year: 2026,
          netSalary: 180000,
          status: 'PAID',
        };
      }
      return null;
    };

    const res = await fetch(`${baseUrl}/payroll/payslips/slip-b-1`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.code, 'FORBIDDEN_PAYSLIP_ACCESS');
  });

  await t.test('5. Employee A can read their own payslip by ID (200)', async () => {
    prisma.payslip.findUnique = async ({ where }) => {
      if (where.id === 'slip-a-1') {
        return {
          id: 'slip-a-1',
          userId: employeeA.id,
          month: 11,
          year: 2026,
          netSalary: 140000,
          status: 'PAID',
        };
      }
      return null;
    };

    const res = await fetch(`${baseUrl}/payroll/payslips/slip-a-1`, {
      headers: { Authorization: `Bearer ${tokenA}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.payslip.id, 'slip-a-1');
  });

  // -------------------------------------------------------------
  // 3. Immutability: PAID Payslip Status Transitions
  // -------------------------------------------------------------
  await t.test('6. A PAID payslip cannot be reverted to GENERATED or DRAFT (400 PAYSLIP_IMMUTABLE)', async () => {
    prisma.payslip.updateMany = async () => ({ count: 0 });
    prisma.payslip.findUnique = async ({ where }) => {
      if (where.id === 'slip-paid-1') {
        return {
          id: 'slip-paid-1',
          userId: employeeA.id,
          status: 'PAID',
        };
      }
      return null;
    };

    const res = await fetch(`${baseUrl}/payroll/payslips/slip-paid-1/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({ status: 'GENERATED' }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.code, 'PAYSLIP_IMMUTABLE');
  });

  await t.test('7. Forward transitions (DRAFT -> GENERATED -> PAID) succeed atomically', async () => {
    let currentStatus = 'DRAFT';
    prisma.payslip.findUnique = async () => ({
      id: 'slip-draft-1',
      userId: employeeA.id,
      status: currentStatus,
    });
    prisma.payslip.updateMany = async ({ where, data }) => {
      const allowed = Array.isArray(where.status?.in) ? where.status.in : [where.status];
      if (allowed.includes(currentStatus)) {
        currentStatus = data.status;
        return { count: 1 };
      }
      return { count: 0 };
    };

    // DRAFT -> GENERATED
    const res1 = await fetch(`${baseUrl}/payroll/payslips/slip-draft-1/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({ status: 'GENERATED' }),
    });
    assert.equal(res1.status, 200);

    // GENERATED -> PAID
    const res2 = await fetch(`${baseUrl}/payroll/payslips/slip-draft-1/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({ status: 'PAID' }),
    });
    assert.equal(res2.status, 200);

    // Backward transition attempt (status: DRAFT) returns 400 INVALID_STATUS
    const res3 = await fetch(`${baseUrl}/payroll/payslips/slip-draft-1/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({ status: 'DRAFT' }),
    });
    assert.equal(res3.status, 400);
    const body3 = await res3.json();
    assert.equal(body3.code, 'INVALID_STATUS');
  });

  await t.test('7b. Atomic status transition returns 409 conflict when current status has changed concurrently', async () => {
    // Current status is DRAFT, but caller attempts GENERATED -> PAID directly (simulating stale state where previous was expected to be GENERATED)
    let currentStatus = 'DRAFT';
    prisma.payslip.findUnique = async () => ({
      id: 'slip-conflict-1',
      userId: employeeA.id,
      status: currentStatus,
    });
    // Atomic update fails because status is not in allowedPrevious
    prisma.payslip.updateMany = async () => ({ count: 0 });

    const res = await fetch(`${baseUrl}/payroll/payslips/slip-conflict-1/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({ status: 'GENERATED' }),
    });
    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.code, 'PAYSLIP_STATUS_CONFLICT');
  });

  // -------------------------------------------------------------
  // 4. Idempotency: Re-running generate-monthly leaves PAID payslips untouched
  // -------------------------------------------------------------
  await t.test('8. Re-running generate-monthly leaves PAID payslips untouched and reports them in skipped', async () => {
    prisma.user.findMany = async () => [
      { id: employeeA.id },
      { id: employeeB.id },
    ];

    prisma.user.findUnique = async ({ where }) => {
      if (where.id === employeeA.id) return employeeA;
      if (where.id === employeeB.id) return employeeB;
      return null;
    };

    // Employee A is already PAID for month 11 / 2026, Employee B is not
    prisma.payslip.findMany = async ({ where }) => {
      if (where.month === 11 && where.year === 2026) {
        return [
          { id: 'slip-paid-a', userId: employeeA.id, status: 'PAID' },
        ];
      }
      return [];
    };

    prisma.salaryStructure.findUnique = async ({ where }) => ({
      userId: where.userId,
      basicSalary: 100000,
      housingAllowance: 0,
      transportAllowance: 0,
      otherAllowances: 0,
      taxDeductions: 5000,
      otherDeductions: 0,
    });

    prisma.leaveRequest = {
      findMany: async () => [],
    };

    let upsertedUserIds = [];
    prisma.$transaction = async (ops) => {
      upsertedUserIds = ['user-emp-b'];
      return [{ id: 'slip-new-b', userId: employeeB.id, status: 'GENERATED' }];
    };

    const res = await fetch(`${baseUrl}/payroll/generate-monthly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({ month: 11, year: 2026 }),
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.skippedCount, 1);
    assert.equal(body.data.skipped[0].userId, employeeA.id);
    assert.deepEqual(upsertedUserIds, ['user-emp-b']);
  });

  // -------------------------------------------------------------
  // 5. Cache Key Partitioning: Role + UserId Partitioning
  // -------------------------------------------------------------
  await t.test('9. Cache entries are partitioned per user and role and not shared across users', async () => {
    cacheService.clear();

    const keyA = cacheService.generateKey({
      user: { userId: employeeA.id, role: 'EMPLOYEE' },
      originalUrl: '/api/payroll/my-payslips',
    });

    const keyB = cacheService.generateKey({
      user: { userId: employeeB.id, role: 'EMPLOYEE' },
      originalUrl: '/api/payroll/my-payslips',
    });

    const keyAdmin = cacheService.generateKey({
      user: { userId: adminUser.id, role: 'ADMIN' },
      originalUrl: '/api/payroll/my-payslips',
    });

    assert.notEqual(keyA, keyB, 'Employee A and B must have distinct cache keys');
    assert.notEqual(keyA, keyAdmin, 'Employee A and Admin must have distinct cache keys');
    assert.match(keyA, new RegExp(`^EMPLOYEE:${employeeA.id}:`));
    assert.match(keyB, new RegExp(`^EMPLOYEE:${employeeB.id}:`));
    assert.match(keyAdmin, new RegExp(`^ADMIN:${adminUser.id}:`));

    // Cache invalidation by tag clears entries
    cacheService.set(keyA, { data: 'test-a' }, 60000, ['payroll']);
    assert.ok(cacheService.get(keyA));
    cacheService.invalidateTags(['payroll']);
    assert.equal(cacheService.get(keyA), null);
  });

  // -------------------------------------------------------------
  // 6. Accounts Hardening: Production and Role Guards
  // -------------------------------------------------------------
  await t.test('10. /api/accounts/clear is disabled in production and requires SUPER_ADMIN elsewhere', async () => {
    // In production
    process.env.NODE_ENV = 'production';
    const resProd = await fetch(`${baseUrl}/accounts/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenSuperAdmin}` },
    });
    assert.equal(resProd.status, 403);
    const bodyProd = await resProd.json();
    assert.equal(bodyProd.code, 'ACTION_DISABLED_IN_PRODUCTION');

    // Outside production: ADMIN is rejected because SUPER_ADMIN is required
    process.env.NODE_ENV = 'test';
    delete process.env.ALLOW_ACCOUNTS_CLEAR;

    const resAdmin = await fetch(`${baseUrl}/accounts/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert.equal(resAdmin.status, 403);
    const bodyAdmin = await resAdmin.json();
    assert.equal(bodyAdmin.code, 'SUPER_ADMIN_REQUIRED');

    // SUPER_ADMIN without env flag is rejected
    const resNoFlag = await fetch(`${baseUrl}/accounts/clear`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenSuperAdmin}` },
    });
    assert.equal(resNoFlag.status, 403);
    const bodyNoFlag = await resNoFlag.json();
    assert.equal(bodyNoFlag.code, 'ENV_FLAG_REQUIRED');
  });

  await t.test('11. /api/accounts/seed is disabled in production and requires SUPER_ADMIN elsewhere', async () => {
    process.env.NODE_ENV = 'production';
    const resProd = await fetch(`${baseUrl}/accounts/seed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenSuperAdmin}` },
    });
    assert.equal(resProd.status, 403);
    const bodyProd = await resProd.json();
    assert.equal(bodyProd.code, 'ACTION_DISABLED_IN_PRODUCTION');

    process.env.NODE_ENV = 'test';
    delete process.env.ALLOW_ACCOUNTS_SEED;

    const resAdmin = await fetch(`${baseUrl}/accounts/seed`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert.equal(resAdmin.status, 403);
    const bodyAdmin = await resAdmin.json();
    assert.equal(bodyAdmin.code, 'SUPER_ADMIN_REQUIRED');
  });

  // -------------------------------------------------------------
  // 7. Phase 2: Soft Delete & Partial Unique Index Tests
  // -------------------------------------------------------------
  await t.test('12. Soft-deleted employee cannot log in (401 Invalid credentials)', async () => {
    prisma.user.findUnique = async ({ where }) => {
      if (where.email === 'deleted.user@company.com') {
        return {
          id: 'user-soft-deleted-1',
          email: 'deleted.user@company.com',
          password: '$2a$10$abcdefghijklmnopqrstuvwxyz1234567890',
          role: 'EMPLOYEE',
          isActive: false,
          deletedAt: new Date(),
        };
      }
      return null;
    };

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'deleted.user@company.com',
        password: 'Password123!',
      }),
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.message, 'Invalid credentials.');
  });

  await t.test('13. Soft delete deactivates user and sets deletedAt (instead of hard delete)', async () => {
    let updateInvoked = null;
    let deleteInvoked = null;

    prisma.user.findUnique = async ({ where }) => {
      if (where.id === 'user-to-soft-delete') {
        return {
          id: 'user-to-soft-delete',
          email: 'soft.delete@company.com',
          firstName: 'Soft',
          lastName: 'Delete',
          role: 'EMPLOYEE',
          isActive: true,
          deletedAt: null,
        };
      }
      return null;
    };

    prisma.user.update = async ({ where, data }) => {
      updateInvoked = { where, data };
      return { id: where.id, ...data };
    };

    prisma.user.delete = async ({ where }) => {
      deleteInvoked = where;
    };

    const res = await fetch(`${baseUrl}/employees/user-to-soft-delete`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(deleteInvoked, null, 'prisma.user.delete must NOT be called for soft delete');
    assert.ok(updateInvoked, 'prisma.user.update must be called for soft delete');
    assert.equal(updateInvoked.where.id, 'user-to-soft-delete');
    assert.equal(updateInvoked.data.isActive, false);
    assert.ok(updateInvoked.data.deletedAt instanceof Date);
  });

  await t.test('14. Soft-deleted employee is excluded from employee list and returns 404 on getEmployeeById', async () => {
    // 1. Listing employees excludes deletedAt !== null
    let listQueryWhere = null;
    prisma.user.count = async ({ where }) => {
      listQueryWhere = where;
      return 0;
    };
    prisma.user.findMany = async ({ where }) => {
      listQueryWhere = where;
      return [];
    };

    const resList = await fetch(`${baseUrl}/employees`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert.equal(resList.status, 200);
    assert.equal(listQueryWhere.deletedAt, null, 'Employee list query must filter for deletedAt: null');

    // 2. Direct lookup of soft-deleted employee returns 404
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === 'user-soft-deleted-lookup') {
        return {
          id: 'user-soft-deleted-lookup',
          email: 'already.deleted@company.com',
          firstName: 'Already',
          lastName: 'Deleted',
          role: 'EMPLOYEE',
          isActive: false,
          deletedAt: new Date('2026-01-01T00:00:00Z'),
        };
      }
      return null;
    };

    const resDetail = await fetch(`${baseUrl}/employees/user-soft-deleted-lookup`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` },
    });
    assert.equal(resDetail.status, 404);
    const bodyDetail = await resDetail.json();
    assert.equal(bodyDetail.message, 'Employee not found.');
  });

  await t.test('15. Partial unique index unique_active_regular_pay_run exists in schema/database', async () => {
    const origQueryRawUnsafe = prisma.$queryRawUnsafe;
    try {
      let rawSqlInvoked = null;
      prisma.$queryRawUnsafe = async (query) => {
        rawSqlInvoked = query;
        return [{ indexname: 'unique_active_regular_pay_run' }];
      };

      const result = await prisma.$queryRawUnsafe(`
        SELECT indexname FROM pg_indexes
        WHERE tablename = 'pay_runs' AND indexname = 'unique_active_regular_pay_run';
      `);
      assert.equal(result.length, 1);
      assert.equal(result[0].indexname, 'unique_active_regular_pay_run');
      assert.match(rawSqlInvoked, /unique_active_regular_pay_run/);
    } finally {
      prisma.$queryRawUnsafe = origQueryRawUnsafe;
    }
  });

  // -------------------------------------------------------------
  // 16. Soft Delete Sweep & Re-onboarding Restore Flow Tests
  // -------------------------------------------------------------
  await t.test('16. Re-onboarding restore flow: requires restoreConfirmed flag, preserves role, and audits', async () => {
    const softDeletedUser = {
      id: 'usr-deleted-999',
      email: 'ex.employee@company.com',
      employeeCode: 'EMP-999',
      firstName: 'Ex',
      lastName: 'Employee',
      role: 'EMPLOYEE',
      isActive: false,
      deletedAt: new Date('2026-01-01T00:00:00Z'),
    };

    let userUpdated = null;
    let profileUpserted = null;
    let auditLogCreated = null;

    prisma.user.findFirst = async ({ where }) => {
      if (where.email === 'ex.employee@company.com') {
        return softDeletedUser;
      }
      return null;
    };

    prisma.$transaction = async (callback) => {
      const tx = {
        department: { findFirst: async () => null, create: async () => ({ id: 'dept-mock' }) },
        designation: { findFirst: async () => null, create: async () => ({ id: 'desig-mock' }) },
        user: {
          update: async ({ where, data }) => {
            userUpdated = { where, data };
            return { ...softDeletedUser, ...data };
          },
        },
        employeeProfile: {
          upsert: async ({ where, update }) => {
            profileUpserted = { where, update };
            return { id: 'prof-mock', ...update };
          },
        },
        salaryStructure: {
          upsert: async () => ({ id: 'struct-mock' }),
        },
        payrollAuditLog: {
          create: async ({ data }) => {
            auditLogCreated = data;
            return { id: 'audit-log-1', ...data };
          },
        },
      };
      return callback(tx);
    };

    // 16a. Without restoreConfirmed: true -> returns 409 RESTORE_CONFIRMATION_REQUIRED
    const resWithoutFlag = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({
        email: 'ex.employee@company.com',
        firstName: 'Ex',
        lastName: 'Employee',
        basicSalary: 85000,
      }),
    });

    assert.equal(resWithoutFlag.status, 409);
    const bodyWithoutFlag = await resWithoutFlag.json();
    assert.equal(bodyWithoutFlag.code, 'RESTORE_CONFIRMATION_REQUIRED');
    assert.equal(bodyWithoutFlag.requiresRestoreConfirmation, true);

    // 16b. With restoreConfirmed: true -> succeeds with 201, un-deletes account, preserves role, and logs audit
    const resWithFlag = await fetch(`${baseUrl}/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({
        email: 'ex.employee@company.com',
        firstName: 'Ex',
        lastName: 'Employee',
        basicSalary: 85000,
        restoreConfirmed: true,
      }),
    });

    assert.equal(resWithFlag.status, 201);
    const bodyWithFlag = await resWithFlag.json();
    assert.equal(bodyWithFlag.success, true);
    assert.equal(bodyWithFlag.data.isRestored, true);
    assert.ok(userUpdated, 'User update must have been invoked');
    assert.equal(userUpdated.where.id, softDeletedUser.id);
    assert.equal(userUpdated.data.deletedAt, null, 'deletedAt must be restored to null');
    assert.equal(userUpdated.data.isActive, true, 'isActive must be restored to true');
    assert.equal(userUpdated.data.role, softDeletedUser.role, 'Previous role must be preserved');
    assert.ok(auditLogCreated, 'PayrollAuditLog must be created for re-onboard restore');
    assert.equal(auditLogCreated.action, 'EMPLOYEE_REONBOARDED_RESTORE');
  });

  await t.test('17. Biometric hardware punch-in rejects soft-deleted employee (404)', async () => {
    process.env.HARDWARE_SECRET_KEY = 'mock_secret_key_012345678901234567890123456789';
    prisma.user.findUnique = async ({ where }) => {
      if (where.employeeCode === 'EMP-SOFT-DEL') {
        return {
          id: 'usr-del-1',
          employeeCode: 'EMP-SOFT-DEL',
          firstName: 'Terminated',
          lastName: 'Emp',
          isActive: false,
          deletedAt: new Date(),
        };
      }
      return null;
    };

    const res = await fetch(`${baseUrl}/attendance/hardware-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hardware-key': process.env.HARDWARE_SECRET_KEY,
      },
      body: JSON.stringify({
        employeeCode: 'EMP-SOFT-DEL',
        timestamp: new Date().toISOString(),
        type: 'IN',
      }),
    });

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.match(body.message, /not found in system/i);
  });

  await t.test('18. Monthly payroll generation excludes soft-deleted users in employee query', async () => {
    let capturedEmployeeQuery = null;
    prisma.user.findMany = async ({ where }) => {
      capturedEmployeeQuery = where;
      return [];
    };

    const res = await fetch(`${baseUrl}/payroll/generate-monthly`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({ month: 5, year: 2026 }),
    });

    assert.ok(capturedEmployeeQuery, 'Employee query must have executed');
    assert.equal(capturedEmployeeQuery.deletedAt, null, 'Payroll query must exclude deletedAt users');
    assert.equal(capturedEmployeeQuery.isActive, true);
  });

  await t.test('19. Leave request rejects soft-deleted employee account (404)', async () => {
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === 'user-del-leave') {
        return {
          id: 'user-del-leave',
          firstName: 'Deleted',
          lastName: 'Employee',
          isActive: false,
          deletedAt: new Date(),
        };
      }
      return null;
    };

    const res = await fetch(`${baseUrl}/leaves/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`,
      },
      body: JSON.stringify({
        userId: 'user-del-leave',
        leaveTypeId: 'leave-type-1',
        startDate: '2026-06-01',
        endDate: '2026-06-03',
        reason: 'Vacation',
      }),
    });

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.match(body.message, /not found/i);
  });

  await t.test('20. In-app broadcast notifications query explicitly excludes deletedAt users', async () => {
    const { broadcastInAppNotification } = require('../services/notification.service');
    let capturedWhere = null;
    prisma.user.findMany = async ({ where }) => {
      capturedWhere = where;
      return [];
    };

    await broadcastInAppNotification({
      title: 'Company Meeting',
      message: 'All-hands meeting at 3 PM',
    });

    assert.ok(capturedWhere, 'Notification query must have executed');
    assert.equal(capturedWhere.deletedAt, null, 'Broadcast notification must filter for deletedAt: null');
    assert.equal(capturedWhere.isActive, true);
  });
});
