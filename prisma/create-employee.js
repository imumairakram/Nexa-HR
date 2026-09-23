const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createEmployee() {
  console.log('🚀 Creating Employee account (user@nexahr.com)...');

  try {
    // 1. Get Engineering department & designation
    let dept = await prisma.department.findFirst({
      where: { code: 'ENG' },
    });

    if (!dept) {
      dept = await prisma.department.findFirst();
    }

    let desig = await prisma.designation.findFirst({
      where: { departmentId: dept?.id },
    });

    if (!desig) {
      desig = await prisma.designation.findFirst();
    }

    // 2. Hash Password
    const passwordHash = await bcrypt.hash('UserPassword123!', 10);

    // 3. Upsert User
    const employeeUser = await prisma.user.upsert({
      where: { email: 'user@nexahr.com' },
      update: {
        password: passwordHash,
        role: 'EMPLOYEE',
        isActive: true,
        mustChangePassword: false,
      },
      create: {
        employeeCode: 'EMP-ENG-001',
        email: 'user@nexahr.com',
        password: passwordHash,
        firstName: 'Alex',
        lastName: 'Rivers',
        phone: '+1 (555) 010-0003',
        role: 'EMPLOYEE',
        isActive: true,
        mustChangePassword: false,
      },
    });

    // 4. Upsert Profile
    await prisma.employeeProfile.upsert({
      where: { userId: employeeUser.id },
      update: {
        departmentId: dept?.id,
        designationId: desig?.id,
      },
      create: {
        userId: employeeUser.id,
        joiningDate: new Date(),
        departmentId: dept?.id,
        designationId: desig?.id,
        address: '42 Silicon Avenue, Tech City',
        employmentType: 'FULL_TIME',
        shift: 'General Morning (09:00 - 17:30)',
      },
    });

    // 5. Setup Salary Structure (Optional but helpful for payroll)
    await prisma.salaryStructure.upsert({
      where: { userId: employeeUser.id },
      update: {},
      create: {
        userId: employeeUser.id,
        basicSalary: 6500,
        housingAllowance: 1200,
        transportAllowance: 500,
        otherAllowances: 300,
        taxDeductions: 800,
        otherDeductions: 100,
      },
    });

    console.log('\n✅ Employee Account Created Successfully in Supabase!');
    console.log('----------------------------------------------------');
    console.log(`Email:       ${employeeUser.email}`);
    console.log(`Password:    UserPassword123!`);
    console.log(`Role:        ${employeeUser.role}`);
    console.log(`Code:        ${employeeUser.employeeCode}`);
    console.log(`Department:  ${dept?.name}`);
    console.log(`Designation: ${desig?.title}`);
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error creating employee account:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createEmployee();
