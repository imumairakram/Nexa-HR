const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Enforce zero external network calls
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

const { parseDbTarget, findRecentBackup, runReset } = require('../../scripts/db-reset');
const { validateEmails, validatePasswords, bootstrapDatabase } = require('../../scripts/db-bootstrap');
const { nonDemoUsersWhere, nonDemoRelationWhere } = require('../utils/userFilters');
const prisma = require('../config/prisma');

test('Database Target Parsing & Masking', async (t) => {
  await t.test('masks postgres host correctly', () => {
    const parsed = parseDbTarget('postgresql://postgres.user:pass@db.myprojectref.supabase.co:5432/postgres');
    assert.equal(parsed.database, 'postgres');
    assert.equal(parsed.host, 'db.myprojectref.supabase.co');
    assert.ok(parsed.maskedHost.includes('****'));
    assert.equal(parsed.maskedHost.startsWith('db.'), true);
  });

  await t.test('handles fallback when invalid dbUrl provided', () => {
    const parsed = parseDbTarget('');
    assert.equal(parsed.database, 'unknown');
    assert.equal(parsed.maskedHost, '****');
  });
});

test('Database Wipe Guards', async (t) => {
  const currentDb = parseDbTarget(process.env.DIRECT_URL || process.env.DATABASE_URL).database;

  await t.test('refuses to wipe if ALLOW_DB_WIPE is not "true"', async () => {
    const savedAllow = process.env.ALLOW_DB_WIPE;
    delete process.env.ALLOW_DB_WIPE;

    const mockPrisma = {
      $queryRaw: async () => [{ table_name: 'users' }],
      $queryRawUnsafe: async () => [{ count: 1 }],
      $disconnect: async () => {},
    };

    try {
      await assert.rejects(
        runReset({
          isExecuteRequested: true,
          confirmFlag: currentDb,
          prismaOverride: mockPrisma,
          backupsDir: path.join(__dirname, 'fixtures/nonexistent'),
        }),
        /ALLOW_DB_WIPE environment variable is not set to "true"/
      );
    } finally {
      if (savedAllow !== undefined) process.env.ALLOW_DB_WIPE = savedAllow;
      else delete process.env.ALLOW_DB_WIPE;
    }
  });

  await t.test('refuses to wipe if --confirm flag is missing or mismatches DB name', async () => {
    const savedAllow = process.env.ALLOW_DB_WIPE;
    process.env.ALLOW_DB_WIPE = 'true';

    const mockPrisma = {
      $queryRaw: async () => [{ table_name: 'users' }],
      $queryRawUnsafe: async () => [{ count: 1 }],
      $disconnect: async () => {},
    };

    try {
      // Wrong DB name
      await assert.rejects(
        runReset({
          isExecuteRequested: true,
          confirmFlag: 'wrong_db_name',
          prismaOverride: mockPrisma,
        }),
        /--confirm flag 'wrong_db_name' does not match target database/
      );

      // Missing confirm flag
      await assert.rejects(
        runReset({
          isExecuteRequested: true,
          confirmFlag: null,
          prismaOverride: mockPrisma,
        }),
        /--confirm flag 'null' does not match target database/
      );
    } finally {
      if (savedAllow !== undefined) process.env.ALLOW_DB_WIPE = savedAllow;
      else delete process.env.ALLOW_DB_WIPE;
    }
  });

  await t.test('refuses to wipe if no fresh backup exists within 30 minutes', async () => {
    const savedAllow = process.env.ALLOW_DB_WIPE;
    process.env.ALLOW_DB_WIPE = 'true';

    const tempBackupsDir = path.join(__dirname, 'temp_backups_test');
    fs.mkdirSync(tempBackupsDir, { recursive: true });

    // Create an expired backup (45 minutes old)
    const oldBackupDir = path.join(tempBackupsDir, 'old-backup');
    fs.mkdirSync(oldBackupDir, { recursive: true });
    const oldTimestamp = new Date(Date.now() - 45 * 60 * 1000).toISOString();
    fs.writeFileSync(
      path.join(oldBackupDir, 'manifest.json'),
      JSON.stringify({ createdAt: oldTimestamp, tables: [] })
    );

    const mockPrisma = {
      $queryRaw: async () => [{ table_name: 'users' }],
      $queryRawUnsafe: async () => [{ count: 1 }],
      $disconnect: async () => {},
    };

    try {
      await assert.rejects(
        runReset({
          isExecuteRequested: true,
          confirmFlag: currentDb,
          backupsDir: tempBackupsDir,
          prismaOverride: mockPrisma,
        }),
        /Fresh backup check failed: Newest backup/
      );
    } finally {
      if (savedAllow !== undefined) process.env.ALLOW_DB_WIPE = savedAllow;
      else delete process.env.ALLOW_DB_WIPE;
      fs.rmSync(tempBackupsDir, { recursive: true, force: true });
    }
  });

  await t.test('refuses to wipe if typed confirmation mismatches "WIPE <database>"', async () => {
    const savedAllow = process.env.ALLOW_DB_WIPE;
    process.env.ALLOW_DB_WIPE = 'true';

    const tempBackupsDir = path.join(__dirname, 'temp_backups_fresh_test');
    fs.mkdirSync(tempBackupsDir, { recursive: true });

    // Fresh backup (5 minutes old)
    const freshBackupDir = path.join(tempBackupsDir, 'fresh-backup');
    fs.mkdirSync(freshBackupDir, { recursive: true });
    const freshTimestamp = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    fs.writeFileSync(
      path.join(freshBackupDir, 'manifest.json'),
      JSON.stringify({ createdAt: freshTimestamp, tables: [] })
    );

    const mockPrisma = {
      $queryRaw: async () => [{ table_name: 'users' }],
      $queryRawUnsafe: async () => [{ count: 1 }],
      $disconnect: async () => {},
    };

    try {
      await assert.rejects(
        runReset({
          isExecuteRequested: true,
          confirmFlag: currentDb,
          backupsDir: tempBackupsDir,
          typedInputOverride: 'WRONG_CONFIRMATION',
          prismaOverride: mockPrisma,
        }),
        /Confirmation mismatch. Expected 'WIPE/
      );
    } finally {
      if (savedAllow !== undefined) process.env.ALLOW_DB_WIPE = savedAllow;
      else delete process.env.ALLOW_DB_WIPE;
      fs.rmSync(tempBackupsDir, { recursive: true, force: true });
    }
  });
});

test('Bootstrap Email & Password Validation Rules', async (t) => {
  await t.test('refuses when any required email is missing or malformed', () => {
    assert.throws(
      () =>
        validateEmails({
          hrEmail: '',
          employeeEmail: 'emp@corp.com',
          guestHrEmail: 'g-hr@corp.com',
          guestEmployeeEmail: 'g-emp@corp.com',
        }),
      /Missing required environment variable: HR_EMAIL/
    );

    assert.throws(
      () =>
        validateEmails({
          hrEmail: 'not-an-email',
          employeeEmail: 'emp@corp.com',
          guestHrEmail: 'g-hr@corp.com',
          guestEmployeeEmail: 'g-emp@corp.com',
        }),
      /Invalid email address format for HR_EMAIL/
    );
  });

  await t.test('refuses when emails are not all distinct', () => {
    assert.throws(
      () =>
        validateEmails({
          hrEmail: 'admin@corp.com',
          employeeEmail: 'admin@corp.com',
          guestHrEmail: 'g-hr@corp.com',
          guestEmployeeEmail: 'g-emp@corp.com',
        }),
      /must be distinct/
    );
  });

  await t.test('refuses when HR and Employee passwords are identical', () => {
    const emails = {
      hrEmail: 'hr@corp.com',
      employeeEmail: 'emp@corp.com',
    };
    assert.throws(
      () =>
        validatePasswords(
          {
            hrPassword: 'IdenticalPassword123!',
            employeePassword: 'IdenticalPassword123!',
          },
          emails
        ),
      /HR_PASSWORD and EMPLOYEE_PASSWORD cannot be identical/
    );
  });

  await t.test('refuses passwords containing leaked pattern NexaHR@2026', () => {
    const emails = {
      hrEmail: 'hr@corp.com',
      employeeEmail: 'emp@corp.com',
    };
    assert.throws(
      () =>
        validatePasswords(
          {
            hrPassword: 'NexaHR@2026!Bonus',
            employeePassword: 'DifferentSecurePass99$',
          },
          emails
        ),
      /Password contains leaked credential pattern "NexaHR@2026"/
    );
  });

  await t.test('refuses passwords failing complexity policy', () => {
    const emails = {
      hrEmail: 'hr@corp.com',
      employeeEmail: 'emp@corp.com',
    };
    assert.throws(
      () =>
        validatePasswords(
          {
            hrPassword: 'weak',
            employeePassword: 'DifferentSecurePass99$',
          },
          emails
        ),
      /HR_PASSWORD policy validation failed/
    );
  });

  await t.test('accepts compliant, distinct emails and passwords', () => {
    const emails = validateEmails({
      hrEmail: 'HR.Lead@Corp.com',
      employeeEmail: 'Staff.Engineer@Corp.com',
      guestHrEmail: 'Guest.HR@Corp.com',
      guestEmployeeEmail: 'Guest.Emp@Corp.com',
    });

    assert.equal(emails.hrEmail, 'hr.lead@corp.com');
    assert.equal(emails.employeeEmail, 'staff.engineer@corp.com');

    const valid = validatePasswords(
      {
        hrPassword: 'Distinct#HrPass2026!',
        employeePassword: 'Distinct#EmpPass2026$',
      },
      emails
    );
    assert.equal(valid, true);
  });
});

test('Bootstrap Safety Guards on Non-Empty Database', async (t) => {
  await t.test('refuses bootstrap if users table is not empty', async () => {
    const savedEnv = {
      HR_EMAIL: 'hr@corp.com',
      EMPLOYEE_EMAIL: 'emp@corp.com',
      GUEST_HR_EMAIL: 'guest-hr@corp.com',
      GUEST_EMPLOYEE_EMAIL: 'guest-emp@corp.com',
      HR_PASSWORD: 'Valid#Password1!',
      EMPLOYEE_PASSWORD: 'Valid#Password2$',
    };
    Object.assign(process.env, savedEnv);

    const mockPrisma = {
      user: {
        count: async () => 2, // Non-empty table!
      },
      $disconnect: async () => {},
    };

    try {
      await assert.rejects(
        bootstrapDatabase({ prismaOverride: mockPrisma }),
        /Users table is not empty \(found 2 existing user\(s\)\)\. Bootstrap requires an empty database\./
      );
    } finally {
      delete process.env.HR_EMAIL;
      delete process.env.EMPLOYEE_EMAIL;
      delete process.env.GUEST_HR_EMAIL;
      delete process.env.GUEST_EMPLOYEE_EMAIL;
      delete process.env.HR_PASSWORD;
      delete process.env.EMPLOYEE_PASSWORD;
    }
  });
});

test('Shared Demo Filter & Operational View Exclusion', async (t) => {
  await t.test('nonDemoUsersWhere excludes demo accounts', () => {
    assert.deepEqual(nonDemoUsersWhere, { isDemo: false });
  });

  await t.test('nonDemoRelationWhere excludes related demo users', () => {
    assert.deepEqual(nonDemoRelationWhere, { user: { isDemo: false } });
  });

  await t.test('filter successfully screens simulated mixed dataset', () => {
    const mixedUsers = [
      { id: '1', email: 'real.admin@corp.com', isDemo: false, isActive: true },
      { id: '2', email: 'real.emp@corp.com', isDemo: false, isActive: true },
      { id: '3', email: 'guest.hr@corp.com', isDemo: true, isActive: false },
      { id: '4', email: 'guest.emp@corp.com', isDemo: true, isActive: false },
    ];

    const visibleUsers = mixedUsers.filter((u) => u.isDemo === nonDemoUsersWhere.isDemo);
    assert.equal(visibleUsers.length, 2);
    assert.ok(visibleUsers.every((u) => u.isDemo === false));
  });
});

test('Password Recovery & OTP Block for Demo Accounts', async (t) => {
  const { forgotPassword, verifyResetOtp, resetPassword } = require('../controllers/auth.controller');
  const originalFindFirst = prisma.user.findFirst;
  const originalFindUnique = prisma.user.findUnique;

  t.afterEach(() => {
    prisma.user.findFirst = originalFindFirst;
    prisma.user.findUnique = originalFindUnique;
  });

  await t.test('forgotPassword immediately rejects demo users with 403 DEMO_MODE', async () => {
    prisma.user.findFirst = async () => ({
      id: 'demo-user-id',
      email: 'guest-hr@corp.com',
      role: 'ADMIN',
      isDemo: true,
      isActive: false,
    });

    const req = {
      body: { email: 'guest-hr@corp.com', channel: 'EMAIL' },
    };

    let responseStatus = null;
    let responseBody = null;

    const res = {
      status(s) {
        responseStatus = s;
        return this;
      },
      json(b) {
        responseBody = b;
        return this;
      },
    };

    await forgotPassword(req, res);
    assert.equal(responseStatus, 403);
    assert.equal(responseBody.code, 'DEMO_MODE');
    assert.equal(responseBody.message, 'Password recovery is disabled for demo accounts.');
  });

  await t.test('verifyResetOtp immediately rejects demo users with 403 DEMO_MODE', async () => {
    prisma.user.findFirst = async () => ({
      id: 'demo-user-id',
      email: 'guest-hr@corp.com',
      role: 'ADMIN',
      isDemo: true,
      isActive: false,
    });

    const req = {
      body: { email: 'guest-hr@corp.com', otp: '123456' },
    };

    let responseStatus = null;
    let responseBody = null;

    const res = {
      status(s) {
        responseStatus = s;
        return this;
      },
      json(b) {
        responseBody = b;
        return this;
      },
    };

    await verifyResetOtp(req, res);
    assert.equal(responseStatus, 403);
    assert.equal(responseBody.code, 'DEMO_MODE');
  });

  await t.test('resetPassword immediately rejects demo users with 403 DEMO_MODE', async () => {
    const jwt = require('jsonwebtoken');
    const resetToken = jwt.sign(
      { userId: 'demo-user-id', purpose: 'PASSWORD_RESET' },
      process.env.JWT_SECRET || 'test_secret'
    );

    prisma.user.findUnique = async () => ({
      id: 'demo-user-id',
      email: 'guest-hr@corp.com',
      role: 'ADMIN',
      isDemo: true,
      isActive: true,
    });

    const req = {
      body: {
        token: resetToken,
        newPassword: 'BrandNewSecure#Password2026!',
        confirmPassword: 'BrandNewSecure#Password2026!',
      },
      headers: {},
    };

    let responseStatus = null;
    let responseBody = null;

    const res = {
      status(s) {
        responseStatus = s;
        return this;
      },
      json(b) {
        responseBody = b;
        return this;
      },
    };

    await resetPassword(req, res);
    assert.equal(responseStatus, 403);
    assert.equal(responseBody.code, 'DEMO_MODE');
  });
});
