/**
 * scripts/db-bootstrap.js
 *
 * Bootstraps NexaHR on an empty database:
 * - Creates minimal reference data (2 Departments, 2 Designations, 3 Leave Types)
 * - Provisions exactly 4 users:
 *   1. Real HR/Admin (HR_EMAIL, ADMIN/HR_MANAGER, isDemo: false, isActive: true, mustChangePassword: true, EMP-ADMIN-001)
 *   2. Real Employee (EMPLOYEE_EMAIL, EMPLOYEE, isDemo: false, isActive: true, mustChangePassword: true, EMP-ENG-001)
 *   3. Guest HR (GUEST_HR_EMAIL, ADMIN, isDemo: true, isActive: false, mustChangePassword: false, DEMO-HR-001)
 *   4. Guest Employee (GUEST_EMPLOYEE_EMAIL, EMPLOYEE, isDemo: true, isActive: false, mustChangePassword: false, DEMO-EMP-001)
 *
 * Safety Guards:
 * - Refuses to run if the `users` table is not completely empty (count !== 0).
 * - Validates all four emails (format, lowercase, all distinct).
 * - Validates passwords against the server password policy.
 * - Refuses if HR and Employee passwords are identical, match their email, or contain 'NexaHR@2026'.
 * - Generates cryptographically random 64-char unprintable secrets for guest accounts.
 * - Never prints, logs, or stores credentials or hashes.
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
    throw new Error('HR_PASSWORD and EMPLOYEE_PASSWORD cannot be identical.');
  }

  // Refuse leaked password pattern
  if (hrPassword.includes('NexaHR@2026') || employeePassword.includes('NexaHR@2026')) {
    throw new Error('Password contains leaked credential pattern "NexaHR@2026". Please choose a fresh, secure password.');
  }

  // Server password policy validation
  const hrValidation = validatePasswordStrength(hrPassword, { email: hrEmail });
  if (!hrValidation.isValid) {
    throw new Error(`HR_PASSWORD policy validation failed: ${hrValidation.errors.join(' ')}`);
  }

  const empValidation = validatePasswordStrength(employeePassword, { email: employeeEmail });
  if (!empValidation.isValid) {
    throw new Error(`EMPLOYEE_PASSWORD policy validation failed: ${empValidation.errors.join(' ')}`);
  }

  return true;
}

async function bootstrapDatabase(options = {}) {
  const targetDbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!targetDbUrl) {
    throw new Error('Neither DIRECT_URL nor DATABASE_URL environment variable is set.');
  }

  const { isDryRun = false, prismaOverride = null } = options;

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
      console.log('  - Real account passwords satisfy complexity requirements and policy checks.');
      console.log('  - Target database has 0 existing users in the `users` table.');
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

    // 3. Hash Passwords
    const hrHashedPassword = await hashPassword(process.env.HR_PASSWORD);
    const empHashedPassword = await hashPassword(process.env.EMPLOYEE_PASSWORD);

    // High-entropy 64-character unprintable random secrets for guest accounts
    const guestHrSecret = crypto.randomBytes(32).toString('hex');
    const guestEmpSecret = crypto.randomBytes(32).toString('hex');
    const guestHrHashed = await hashPassword(guestHrSecret);
    const guestEmpHashed = await hashPassword(guestEmpSecret);

    const result = await prisma.$transaction(async (tx) => {
      // 4. Create Minimal Departments
      const deptHR = await tx.department.create({
        data: {
          name: 'Human Resources',
          code: 'HR',
          description: 'Talent Acquisition, Employee Welfare & Corporate HR Operations',
        },
      });

      const deptEng = await tx.department.create({
        data: {
          name: 'Engineering',
          code: 'ENG',
          description: 'Software Engineering, Cloud Infrastructure & DevOps',
        },
      });

      // 5. Create Minimal Designations
      const desigHR = await tx.designation.create({
        data: {
          title: 'HR Lead Manager',
          departmentId: deptHR.id,
          description: 'Corporate HR Lead & System Administration',
        },
      });

      const desigEng = await tx.designation.create({
        data: {
          title: 'Senior Full-Stack Engineer',
          departmentId: deptEng.id,
          description: 'Core Systems Architecture & Application Engineering',
        },
      });

      // 6. Create Baseline Leave Types
      await tx.leaveType.createMany({
        data: [
          { name: 'Annual Paid Leave', code: 'ANNUAL', daysAllowed: 18, isPaid: true },
          { name: 'Medical / Sick Leave', code: 'SICK', daysAllowed: 12, isPaid: true },
          { name: 'Casual Leave', code: 'CASUAL', daysAllowed: 8, isPaid: true },
        ],
      });

      // 7. Create Exactly 4 Users
      // User 1: Real HR/Admin
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

      // User 2: Real Employee
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

      // User 3: Guest HR (INACTIVE, isDemo: true)
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

      // User 4: Guest Employee (INACTIVE, isDemo: true)
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
    });

    console.log('========================================================================');
    console.log('[SUCCESS] Database bootstrap finished successfully.');
    console.log(`Created ${result.departmentsCreated} Departments & ${result.designationsCreated} Designations.`);
    console.log(`Created ${result.leaveTypesCreated} Baseline Leave Types.`);
    console.log(`Created exactly ${result.usersCreated.length} users (2 Real active, 2 Guest inactive).`);
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
  bootstrapDatabase,
};

