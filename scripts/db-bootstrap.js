/**
 * scripts/db-bootstrap.js
 *
 * Bootstraps NexaHR on an empty database:
 * - Uses direct (non-pooler) connection via DIRECT_URL when available.
 * - Computes ALL password hashes before opening transaction.
 * - Sets extended transaction timeout options ({ maxWait: 30000, timeout: 120000 })
 *   to handle remote round-trips without timeout failure.
 * - Minimizes round-trips: upserts reference data once, creates users with nested profiles.
 * - Provisions exactly 4 users:
 *   1. Real HR/Admin (HR_EMAIL, ADMIN/HR_MANAGER, isDemo: false, isActive: true, mustChangePassword: true, EMP-ADMIN-001)
 *   2. Real Employee (EMPLOYEE_EMAIL, EMPLOYEE, isDemo: false, isActive: true, mustChangePassword: true, EMP-ENG-001)
 *   3. Guest HR (GUEST_HR_EMAIL, ADMIN, isDemo: true, isActive: false, mustChangePassword: false, DEMO-HR-001)
 *   4. Guest Employee (GUEST_EMPLOYEE_EMAIL, EMPLOYEE, isDemo: true, isActive: false, mustChangePassword: false, DEMO-EMP-001)
 * - Verifies post-bootstrap state: exactly 4 users, unique employee codes, guest users inactive with isDemo=true.
 * - Extra password rules: rejects passwords containing 'nexahr', matching email local part, or in denylist.
 *
 * Usage:
 *   node scripts/db-bootstrap.js --dry-run
 *   node scripts/db-bootstrap.js
 */

require('dotenv').config();
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');
const { hashPassword, validatePasswordStrength } = require('../src/utils/password');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_DENYLIST = [
  'NexaHR@123',
  'NexaEmployee@123',
  'NexaHR@2026!',
  'Password@123',
];

const TRANSACTION_OPTIONS = {
  maxWait: 30000,
  timeout: 120000,
};

function parseDbTarget(dbUrl) {
  if (!dbUrl) return { host: 'unknown', maskedHost: '****', database: 'unknown' };
  try {
    const parsed = new URL(dbUrl);
    const host = parsed.hostname;
    const database = (parsed.pathname || '').replace(/^\//, '') || 'postgres';
    const maskedHost = host.length > 8 ? `${host.slice(0, 3)}****${host.slice(-4)}` : '****';
    return { host, maskedHost, database };
  } catch (e) {
    return { host: 'unknown', maskedHost: '****', database: 'unknown' };
  }
}

function validateEmails(emails) {
  const { hrEmail, employeeEmail, guestHrEmail, guestEmployeeEmail } = emails;
  const rawList = [
    { key: 'HR_EMAIL', val: hrEmail },
    { key: 'EMPLOYEE_EMAIL', val: employeeEmail },
    { key: 'GUEST_HR_EMAIL', val: guestHrEmail },
    { key: 'GUEST_EMPLOYEE_EMAIL', val: guestEmployeeEmail },
  ];

  for (const item of rawList) {
    if (!item.val || typeof item.val !== 'string') {
      throw new Error(`Missing required environment variable: ${item.key}`);
    }
    const clean = item.val.trim().toLowerCase();
    if (!EMAIL_REGEX.test(clean)) {
      throw new Error(`Invalid email address format for ${item.key}: '${item.val}'`);
    }
  }

  const cleaned = {
    hrEmail: hrEmail.trim().toLowerCase(),
    employeeEmail: employeeEmail.trim().toLowerCase(),
    guestHrEmail: guestHrEmail.trim().toLowerCase(),
    guestEmployeeEmail: guestEmployeeEmail.trim().toLowerCase(),
  };

  const values = Object.values(cleaned);
  const uniqueValues = new Set(values);
  if (uniqueValues.size !== 4) {
    throw new Error('All four email addresses (HR_EMAIL, EMPLOYEE_EMAIL, GUEST_HR_EMAIL, GUEST_EMPLOYEE_EMAIL) must be distinct.');
  }

  return cleaned;
}

function checkPasswordRules(password, email, roleLabel) {
  if (!password || typeof password !== 'string') {
    throw new Error(`Missing required environment variable for ${roleLabel}.`);
  }

  const cleanPass = password.trim();
  const lowerPass = cleanPass.toLowerCase();

  // 1. Reject denylisted passwords
  if (PASSWORD_DENYLIST.some((d) => d.toLowerCase() === lowerPass)) {
    throw new Error(`${roleLabel} matches a prohibited common password from the security denylist.`);
  }

  // 2. Reject 'nexahr' brand/system identifier (case-insensitive)
  if (lowerPass.includes('nexahr')) {
    throw new Error(`${roleLabel} cannot contain the brand or system identifier "nexahr" to prevent predictable password guessing.`);
  }

  // 3. Reject local part of its own email
  if (email && email.includes('@')) {
    const localPart = email.split('@')[0].toLowerCase().trim();
    if (localPart && lowerPass.includes(localPart)) {
      throw new Error(`${roleLabel} cannot contain the username / local part of the email address.`);
    }
  }

  // 4. Length & Complexity via server policy validator (min 10, upper, lower, digit, symbol)
  const strengthRes = validatePasswordStrength(cleanPass, { email });
  if (!strengthRes.isValid) {
    throw new Error(`${roleLabel} policy validation failed: ${strengthRes.errors.join(' ')}`);
  }

  return true;
}

function validatePasswords(passwords, emails) {
  const { hrPassword, employeePassword } = passwords;
  const { hrEmail, employeeEmail } = emails;

  if (!hrPassword || typeof hrPassword !== 'string') {
    throw new Error('Missing required environment variable: HR_PASSWORD');
  }
  if (!employeePassword || typeof employeePassword !== 'string') {
    throw new Error('Missing required environment variable: EMPLOYEE_PASSWORD');
  }

  // Refuse if identical
  if (hrPassword === employeePassword) {
    throw new Error('HR_PASSWORD and EMPLOYEE_PASSWORD cannot be identical. Both accounts must have distinct credentials.');
  }

  checkPasswordRules(hrPassword, hrEmail, 'HR_PASSWORD');
  checkPasswordRules(employeePassword, employeeEmail, 'EMPLOYEE_PASSWORD');

  return true;
}

async function bootstrapDatabase(options = {}) {
  // Use DIRECT_URL (direct connection, non-pooler) when present
  const targetDbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!targetDbUrl) {
    throw new Error('Neither DIRECT_URL nor DATABASE_URL environment variable is set.');
  }

  const { isDryRun = false, prismaOverride = null } = options;
  const targetMeta = parseDbTarget(targetDbUrl);

  // 1. Validate environment configuration
  const emails = validateEmails({
    hrEmail: process.env.HR_EMAIL,
    employeeEmail: process.env.EMPLOYEE_EMAIL,
    guestHrEmail: process.env.GUEST_HR_EMAIL,
    guestEmployeeEmail: process.env.GUEST_EMPLOYEE_EMAIL,
  });

  validatePasswords(
    {
      hrPassword: process.env.HR_PASSWORD,
      employeePassword: process.env.EMPLOYEE_PASSWORD,
    },
    emails
  );

  const hrRole = process.env.HR_ROLE === 'HR_MANAGER' ? 'HR_MANAGER' : 'ADMIN';

  console.log('========================================================================');
  console.log('[NexaHR DB BOOTSTRAP] Initializing clean database setup...');
  console.log(`[NexaHR DB BOOTSTRAP] Target Host: ${targetMeta.maskedHost} (Direct Connection)`);
  console.log(`[NexaHR DB BOOTSTRAP] Mode: ${isDryRun ? 'DRY-RUN (validation only, no writes)' : 'LIVE BOOTSTRAP'}`);
  console.log('========================================================================');

  const prisma = prismaOverride || new PrismaClient({
    datasources: { db: { url: targetDbUrl } },
    log: ['error'],
  });

  try {
    // 2. Refusal Guard: `users` table must be 0
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      throw new Error(`[SAFETY REFUSAL] Users table is not empty (found ${userCount} existing user(s)). Bootstrap requires an empty database.`);
    }

    if (isDryRun) {
      console.log('[DRY-RUN PASSED] Verified:');
      console.log('  - All 4 emails are valid, normalized, and distinct.');
      console.log('  - Real account passwords satisfy complexity requirements, brand-name exclusions, and denylist policies.');
      console.log('  - Target database has 0 existing users in the `users` table.');
      console.log('  - Extended transaction configuration ready: timeout 120s, maxWait 30s.');
      console.log('\nReference data that will be created:');
      console.log('  - Departments: Human Resources (HR), Engineering (ENG)');
      console.log('  - Designations: HR Lead Manager, Senior Full-Stack Engineer');
      console.log('  - Leave Types: Annual Paid Leave (18d), Medical / Sick Leave (12d), Casual Leave (8d)');
      console.log('\nUsers that will be created:');
      console.log(`  - Real Admin: ${emails.hrEmail} (${hrRole}, EMP-ADMIN-001, isDemo: false, isActive: true, mustChangePassword: true)`);
      console.log(`  - Real Employee: ${emails.employeeEmail} (EMPLOYEE, EMP-ENG-001, isDemo: false, isActive: true, mustChangePassword: true)`);
      console.log(`  - Guest HR: ${emails.guestHrEmail} (ADMIN, DEMO-HR-001, isDemo: true, isActive: false, mustChangePassword: false)`);
      console.log(`  - Guest Employee: ${emails.guestEmployeeEmail} (EMPLOYEE, DEMO-EMP-001, isDemo: true, isActive: false, mustChangePassword: false)`);
      console.log('========================================================================');
      return { isDryRun: true, status: 'VALIDATED' };
    }

    // 3. Compute ALL password hashes BEFORE opening the transaction
    console.log('[SECURITY] Computing password hashes before transaction starts...');
    const hashStartTime = Date.now();
    const guestHrSecret = crypto.randomBytes(32).toString('hex');
    const guestEmpSecret = crypto.randomBytes(32).toString('hex');

    const [hrHashedPassword, empHashedPassword, guestHrHashed, guestEmpHashed] = await Promise.all([
      hashPassword(process.env.HR_PASSWORD),
      hashPassword(process.env.EMPLOYEE_PASSWORD),
      hashPassword(guestHrSecret),
      hashPassword(guestEmpSecret),
    ]);
    console.log(`[SECURITY] All 4 hashes pre-computed in ${Date.now() - hashStartTime}ms.`);

    // 4. Execute atomic transaction with extended timeout (120s timeout, 30s maxWait)
    console.log('[DATABASE] Starting atomic bootstrap transaction (timeout: 120s)...');
    const result = await prisma.$transaction(
      async (tx) => {
        // Upsert Departments
        const deptHR = await tx.department.upsert({
          where: { code: 'HR' },
          update: {},
          create: {
            name: 'Human Resources',
            code: 'HR',
            description: 'Talent Acquisition, Employee Welfare & Corporate HR Operations',
          },
        });

        const deptEng = await tx.department.upsert({
          where: { code: 'ENG' },
          update: {},
          create: {
            name: 'Engineering',
            code: 'ENG',
            description: 'Software Engineering, Cloud Infrastructure & DevOps',
          },
        });

        // Upsert Designations
        const desigHR = await tx.designation.upsert({
          where: { title: 'HR Lead Manager' },
          update: { departmentId: deptHR.id },
          create: {
            title: 'HR Lead Manager',
            departmentId: deptHR.id,
            description: 'Corporate HR Lead & System Administration',
          },
        });

        const desigEng = await tx.designation.upsert({
          where: { title: 'Senior Full-Stack Engineer' },
          update: { departmentId: deptEng.id },
          create: {
            title: 'Senior Full-Stack Engineer',
            departmentId: deptEng.id,
            description: 'Core Systems Architecture & Application Engineering',
          },
        });

        // Create Baseline Leave Types (single query)
        await tx.leaveType.createMany({
          data: [
            { name: 'Annual Paid Leave', code: 'ANNUAL', daysAllowed: 18, isPaid: true },
            { name: 'Medical / Sick Leave', code: 'SICK', daysAllowed: 12, isPaid: true },
            { name: 'Casual Leave', code: 'CASUAL', daysAllowed: 8, isPaid: true },
          ],
          skipDuplicates: true,
        });

        // User 1: Real HR/Admin (nested profile & salary structure)
        const userRealHR = await tx.user.create({
          data: {
            email: emails.hrEmail,
            password: hrHashedPassword,
            role: hrRole,
            firstName: 'System',
            lastName: 'Administrator',
            employeeCode: 'EMP-ADMIN-001',
            isActive: true,
            isDemo: false,
            mustChangePassword: true,
            profile: {
              create: {
                departmentId: deptHR.id,
                designationId: desigHR.id,
                joiningDate: new Date(),
                employmentType: 'FULL_TIME',
              },
            },
            salaryStructure: {
              create: {
                basicSalary: 150000,
                housingAllowance: 30000,
                transportAllowance: 15000,
                otherAllowances: 10000,
                taxDeductions: 15000,
                effectiveDate: new Date(),
              },
            },
          },
        });

        // User 2: Real Employee (nested profile & salary structure)
        const userRealEmp = await tx.user.create({
          data: {
            email: emails.employeeEmail,
            password: empHashedPassword,
            role: 'EMPLOYEE',
            firstName: 'Senior',
            lastName: 'Engineer',
            employeeCode: 'EMP-ENG-001',
            isActive: true,
            isDemo: false,
            mustChangePassword: true,
            profile: {
              create: {
                departmentId: deptEng.id,
                designationId: desigEng.id,
                joiningDate: new Date(),
                employmentType: 'FULL_TIME',
              },
            },
            salaryStructure: {
              create: {
                basicSalary: 120000,
                housingAllowance: 25000,
                transportAllowance: 10000,
                otherAllowances: 5000,
                taxDeductions: 10000,
                effectiveDate: new Date(),
              },
            },
          },
        });

        // User 3: Guest HR (INACTIVE, isDemo: true, nested profile)
        const userGuestHR = await tx.user.create({
          data: {
            email: emails.guestHrEmail,
            password: guestHrHashed,
            role: 'ADMIN',
            firstName: 'Guest',
            lastName: 'HR Admin',
            employeeCode: 'DEMO-HR-001',
            isActive: false,
            isDemo: true,
            mustChangePassword: false,
            profile: {
              create: {
                departmentId: deptHR.id,
                designationId: desigHR.id,
                joiningDate: new Date(),
              },
            },
          },
        });

        // User 4: Guest Employee (INACTIVE, isDemo: true, nested profile)
        const userGuestEmp = await tx.user.create({
          data: {
            email: emails.guestEmployeeEmail,
            password: guestEmpHashed,
            role: 'EMPLOYEE',
            firstName: 'Guest',
            lastName: 'Staff Employee',
            employeeCode: 'DEMO-EMP-001',
            isActive: false,
            isDemo: true,
            mustChangePassword: false,
            profile: {
              create: {
                departmentId: deptEng.id,
                designationId: desigEng.id,
                joiningDate: new Date(),
              },
            },
          },
        });

        return {
          departmentsCreated: 2,
          designationsCreated: 2,
          leaveTypesCreated: 3,
          usersCreated: [
            { email: userRealHR.email, code: userRealHR.employeeCode, role: userRealHR.role, isDemo: false, isActive: true },
            { email: userRealEmp.email, code: userRealEmp.employeeCode, role: userRealEmp.role, isDemo: false, isActive: true },
            { email: userGuestHR.email, code: userGuestHR.employeeCode, role: userGuestHR.role, isDemo: true, isActive: false },
            { email: userGuestEmp.email, code: userGuestEmp.employeeCode, role: userGuestEmp.role, isDemo: true, isActive: false },
          ],
        };
      },
      TRANSACTION_OPTIONS
    );

    // 5. Post-Bootstrap Safety & Integrity Verification
    console.log('[VERIFICATION] Validating committed database state...');
    const [allUsers, allDepts, allDesigs, allLeaveTypes] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          employeeCode: true,
          role: true,
          isActive: true,
          isDemo: true,
          mustChangePassword: true,
        },
      }),
      prisma.department.findMany({ select: { id: true, code: true } }),
      prisma.designation.findMany({ select: { id: true, title: true } }),
      prisma.leaveType.findMany({ select: { id: true, code: true } }),
    ]);

    // Check 1: Exactly 4 users
    if (allUsers.length !== 4) {
      throw new Error(`Verification failed: Expected exactly 4 users in database, but found ${allUsers.length}`);
    }

    // Check 2: Unique employee codes
    const codes = new Set(allUsers.map((u) => u.employeeCode));
    if (codes.size !== 4) {
      throw new Error(`Verification failed: Duplicate employee codes detected! Unique codes: ${codes.size}/4`);
    }

    // Check 3: Unique emails
    const emailsFound = new Set(allUsers.map((u) => u.email.toLowerCase()));
    if (emailsFound.size !== 4) {
      throw new Error(`Verification failed: Duplicate emails detected! Unique emails: ${emailsFound.size}/4`);
    }

    // Check 4: Exactly 2 guest users, both inactive with isDemo = true
    const demoUsers = allUsers.filter((u) => u.isDemo === true);
    if (demoUsers.length !== 2) {
      throw new Error(`Verification failed: Expected exactly 2 demo users, but found ${demoUsers.length}`);
    }
    for (const du of demoUsers) {
      if (du.isActive !== false) {
        throw new Error(`Verification failed: Guest user ${du.email} must be inactive (isActive: false)`);
      }
      if (du.mustChangePassword !== false) {
        throw new Error(`Verification failed: Guest user ${du.email} must have mustChangePassword: false`);
      }
    }

    // Check 5: Exactly 2 real users, both active with isDemo = false, mustChangePassword = true
    const realUsers = allUsers.filter((u) => u.isDemo === false);
    if (realUsers.length !== 2) {
      throw new Error(`Verification failed: Expected exactly 2 real users, but found ${realUsers.length}`);
    }
    for (const ru of realUsers) {
      if (ru.isActive !== true) {
        throw new Error(`Verification failed: Real user ${ru.email} must be active (isActive: true)`);
      }
      if (ru.mustChangePassword !== true) {
        throw new Error(`Verification failed: Real user ${ru.email} must have mustChangePassword: true`);
      }
    }

    // Check 6: Reference data exists without duplicates
    const deptCodes = new Set(allDepts.map((d) => d.code));
    if (deptCodes.size !== allDepts.length) {
      throw new Error('Verification failed: Duplicate department codes found.');
    }
    const desigTitles = new Set(allDesigs.map((d) => d.title));
    if (desigTitles.size !== allDesigs.length) {
      throw new Error('Verification failed: Duplicate designation titles found.');
    }
    const leaveCodes = new Set(allLeaveTypes.map((l) => l.code));
    if (leaveCodes.size !== allLeaveTypes.length) {
      throw new Error('Verification failed: Duplicate leave type codes found.');
    }

    console.log('========================================================================');
    console.log('[SUCCESS] Database bootstrap finished and verified successfully.');
    console.log(`Created ${result.departmentsCreated} Departments & ${result.designationsCreated} Designations.`);
    console.log(`Created ${result.leaveTypesCreated} Baseline Leave Types.`);
    console.log(`Verified exactly ${result.usersCreated.length} users (2 Real active, 2 Guest inactive).`);
    console.log('========================================================================');

    return result;
  } finally {
    if (!prismaOverride) {
      await prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');

  bootstrapDatabase({ isDryRun })
    .catch((err) => {
      console.error('\n[BOOTSTRAP ERROR]:', err.message);
      process.exit(1);
    });
}

module.exports = {
  validateEmails,
  validatePasswords,
  checkPasswordRules,
  bootstrapDatabase,
  parseDbTarget,
  TRANSACTION_OPTIONS,
  PASSWORD_DENYLIST,
};
