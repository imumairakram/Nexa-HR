const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createInitialAdmins() {
  console.log('🚀 Creating initial System Admin and HR Manager accounts...');

  try {
    // 1. Ensure baseline Department and Designation exist
    let deptHR = await prisma.department.findFirst({
      where: { code: 'HR' },
    });

    if (!deptHR) {
      deptHR = await prisma.department.create({
        data: {
          name: 'Human Resources & Operations',
          code: 'HR',
          description: 'Talent Acquisition, Employee Welfare & System Administration',
        },
      });
    }

    let desigSysAdmin = await prisma.designation.findFirst({
      where: { title: 'System Administrator' },
    });
    if (!desigSysAdmin) {
      desigSysAdmin = await prisma.designation.create({
        data: {
          title: 'System Administrator',
          departmentId: deptHR.id,
        },
      });
    }

    let desigHRHead = await prisma.designation.findFirst({
      where: { title: 'HR Manager' },
    });
    if (!desigHRHead) {
      desigHRHead = await prisma.designation.create({
        data: {
          title: 'HR Manager',
          departmentId: deptHR.id,
        },
      });
    }

    // 2. Hash Passwords
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', 10);
    const hrPasswordHash = await bcrypt.hash('HrPassword123!', 10);

    // 3. Create System Admin
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@nexahr.com' },
      update: {
        password: adminPasswordHash,
        role: 'ADMIN',
        isActive: true,
      },
      create: {
        employeeCode: 'EMP-ADMIN-001',
        email: 'admin@nexahr.com',
        password: adminPasswordHash,
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+1 (555) 010-0001',
        role: 'ADMIN',
        isActive: true,
      },
    });

    await prisma.employeeProfile.upsert({
      where: { userId: adminUser.id },
      update: {
        departmentId: deptHR.id,
        designationId: desigSysAdmin.id,
      },
      create: {
        userId: adminUser.id,
        joiningDate: new Date(),
        departmentId: deptHR.id,
        designationId: desigSysAdmin.id,
        address: 'Headquarters, Executive Suite 1',
      },
    });

    console.log(`✅ System Admin Created: admin@nexahr.com (Password: AdminPassword123!)`);

    // 4. Create HR Manager
    const hrUser = await prisma.user.upsert({
      where: { email: 'hr@nexahr.com' },
      update: {
        password: hrPasswordHash,
        role: 'HR_MANAGER',
        isActive: true,
      },
      create: {
        employeeCode: 'EMP-HR-001',
        email: 'hr@nexahr.com',
        password: hrPasswordHash,
        firstName: 'HR',
        lastName: 'Manager',
        phone: '+1 (555) 010-0002',
        role: 'HR_MANAGER',
        isActive: true,
      },
    });

    await prisma.employeeProfile.upsert({
      where: { userId: hrUser.id },
      update: {
        departmentId: deptHR.id,
        designationId: desigHRHead.id,
      },
      create: {
        userId: hrUser.id,
        joiningDate: new Date(),
        departmentId: deptHR.id,
        designationId: desigHRHead.id,
        address: 'Headquarters, HR Suite 2',
      },
    });

    console.log(`✅ HR Manager Created: hr@nexahr.com (Password: HrPassword123!)`);

    console.log('\n🎉 Credentials generated and saved to PostgreSQL successfully!');
  } catch (error) {
    console.error('❌ Error creating initial admin accounts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createInitialAdmins();
