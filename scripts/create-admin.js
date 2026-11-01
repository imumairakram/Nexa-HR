/**
 * scripts/create-admin.js
 *
 * Provision a real administrator account safely via environment variables.
 * Usage:
 *   node scripts/create-admin.js
 *   node scripts/create-admin.js --reset
 *
 * Required environment variables:
 *   ADMIN_EMAIL            - Valid corporate email (cannot be admin@nexahr.com)
 *   ADMIN_INITIAL_PASSWORD - Strong password (>= 12 chars, upper, lower, digit, symbol)
 * Optional environment variables:
 *   ADMIN_NAME             - Full name (defaults to "System Admin")
 */

require('dotenv').config();
const prisma = require('../src/config/prisma');
const { hashPassword } = require('../src/utils/password');

async function getNextAdminEmployeeCode() {
  const adminUsers = await prisma.user.findMany({
    where: {
      employeeCode: { startsWith: 'EMP-ADMIN-' },
    },
    select: { employeeCode: true },
  });

  const existingCodes = new Set(adminUsers.map((u) => u.employeeCode));
  let counter = 2; // Start from 2 to guarantee no collision with EMP-ADMIN-001
  while (true) {
    const pad = counter < 10 ? `00${counter}` : counter < 100 ? `0${counter}` : `${counter}`;
    const candidate = `EMP-ADMIN-${pad}`;
    if (!existingCodes.has(candidate)) {
      const existsInDb = await prisma.user.findUnique({ where: { employeeCode: candidate } });
      if (!existsInDb) {
        return candidate;
      }
    }
    counter++;
  }
}

async function resolveDepartmentAndDesignation(tx) {
  // 1. Resolve Department
  let dept = await tx.department.findFirst({
    where: {
      name: { in: ['Executive Management', 'Human Resources', 'Engineering'] },
    },
  });
  if (!dept) {
    dept = await tx.department.findFirst();
  }
  if (!dept) {
    dept = await tx.department.create({
      data: {
        name: 'Executive Management',
        code: 'EXEC',
        description: 'Executive Administration & Systems Governance',
      },
    });
  }

  // 2. Resolve Designation
  let desig = await tx.designation.findFirst({
    where: {
      title: { in: ['System Administrator', 'HR Lead Manager', 'VP of Software Engineering'] },
    },
  });
  if (!desig) {
    desig = await tx.designation.create({
      data: {
        title: 'System Administrator',
        departmentId: dept.id,
        description: 'Enterprise System Administrator & Security Lead',
      },
    });
  }

  return { dept, desig };
}

async function main() {
  const emailInput = process.env.ADMIN_EMAIL;
  const passwordInput = process.env.ADMIN_INITIAL_PASSWORD;
  const nameInput = process.env.ADMIN_NAME || '';
  const isReset = process.argv.includes('--reset');

  // 1. Validate required environment variables
  if (!emailInput || !passwordInput) {
    console.error('Error: Both ADMIN_EMAIL and ADMIN_INITIAL_PASSWORD environment variables are required.');
    process.exit(1);
  }

  const cleanEmail = emailInput.trim().toLowerCase();

  // 2. Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    console.error('Error: Invalid email format provided in ADMIN_EMAIL.');
    process.exit(1);
  }

  // 3. Refuse reserved hardcoded admin email
  if (cleanEmail === 'admin@nexahr.com') {
    console.error("Error: Refusing to provision 'admin@nexahr.com'. This email is reserved for the legacy administrator account.");
    process.exit(1);
  }

  // 4. Validate password complexity (>= 12 chars, upper, lower, digit, symbol)
  const passwordErrors = [];
  if (passwordInput.length < 12) passwordErrors.push('must be at least 12 characters long');
  if (!/[A-Z]/.test(passwordInput)) passwordErrors.push('must contain at least one uppercase letter (A-Z)');
  if (!/[a-z]/.test(passwordInput)) passwordErrors.push('must contain at least one lowercase letter (a-z)');
  if (!/[0-9]/.test(passwordInput)) passwordErrors.push('must contain at least one digit (0-9)');
  if (!/[^A-Za-z0-9]/.test(passwordInput)) passwordErrors.push('must contain at least one symbol/special character');

  if (passwordErrors.length > 0) {
    console.error('Error: Password validation failed:');
    for (const err of passwordErrors) {
      console.error(`  - ${err}`);
    }
    process.exit(1);
  }

  // 5. Parse Name
  let firstName = 'System';
  let lastName = 'Admin';
  if (nameInput && nameInput.trim()) {
    const parts = nameInput.trim().split(/\s+/);
    if (parts.length === 1) {
      firstName = parts[0];
      lastName = 'Admin';
    } else {
      firstName = parts[0];
      lastName = parts.slice(1).join(' ');
    }
  }

  // 6. Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: cleanEmail },
    include: { profile: true },
  });

  if (existingUser && !isReset) {
    console.log(`Notice: An account with email "${cleanEmail}" already exists.`);
    console.log(`  id: ${existingUser.id}`);
    console.log(`  employeeCode: ${existingUser.employeeCode}`);
    console.log('To update role, password, and mustChangePassword for this account, run with the --reset flag.');
    await prisma.$disconnect();
    process.exit(0);
  }

  // 7. Hash password using the application's bcrypt utility
  const hashedPassword = await hashPassword(passwordInput);

  if (existingUser && isReset) {
    // Update existing user safely
    const updatedUser = await prisma.$transaction(async (tx) => {
      const { dept, desig } = await resolveDepartmentAndDesignation(tx);

      const user = await tx.user.update({
        where: { id: existingUser.id },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
          mustChangePassword: true,
          ...(nameInput && nameInput.trim() ? { firstName, lastName } : {}),
        },
      });

      if (!existingUser.profile) {
        await tx.employeeProfile.create({
          data: {
            userId: user.id,
            departmentId: dept.id,
            designationId: desig.id,
            employmentType: 'FULL_TIME',
            shift: 'General Morning (09:00 - 17:30)',
            workLocation: 'Islamabad HQ & Innovation Lab',
          },
        });
      }

      return user;
    });

    console.log('Admin account credentials updated successfully:');
    console.log(`  email: ${updatedUser.email}`);
    console.log(`  id: ${updatedUser.id}`);
    console.log(`  employeeCode: ${updatedUser.employeeCode}`);
  } else {
    // Create new admin user
    const employeeCode = await getNextAdminEmployeeCode();

    const createdUser = await prisma.$transaction(async (tx) => {
      const { dept, desig } = await resolveDepartmentAndDesignation(tx);

      const user = await tx.user.create({
        data: {
          employeeCode,
          email: cleanEmail,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'ADMIN',
          isActive: true,
          mustChangePassword: true,
        },
      });

      await tx.employeeProfile.create({
        data: {
          userId: user.id,
          departmentId: dept.id,
          designationId: desig.id,
          employmentType: 'FULL_TIME',
          shift: 'General Morning (09:00 - 17:30)',
          workLocation: 'Islamabad HQ & Innovation Lab',
        },
      });

      return user;
    });

    console.log('Admin account created successfully:');
    console.log(`  email: ${createdUser.email}`);
    console.log(`  id: ${createdUser.id}`);
    console.log(`  employeeCode: ${createdUser.employeeCode}`);
  }

  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error('Fatal execution error:', err.message);
  await prisma.$disconnect();
  process.exit(1);
});

