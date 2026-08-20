const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function resetCleanDatabase() {
  console.log('🧹 Starting Complete Database Wipe & Dynamic Reset...');

  try {
    // 1. Delete all existing records across all tables in order
    await prisma.passwordResetOtp.deleteMany({});
    await prisma.payslip.deleteMany({});
    await prisma.salaryStructure.deleteMany({});
    await prisma.leaveRequest.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.employeeProfile.deleteMany({});
    await prisma.rolePermission.deleteMany({});
    await prisma.permission.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.designation.deleteMany({});
    await prisma.department.deleteMany({});
    await prisma.leaveType.deleteMany({});

    console.log('✅ All existing records completely purged from PostgreSQL database.');

    // 2. Create baseline standard Leave Types
    await prisma.leaveType.createMany({
      data: [
        { name: 'Annual Paid Leave', code: 'ANNUAL', daysAllowed: 18, isPaid: true },
        { name: 'Medical / Sick Leave', code: 'SICK', daysAllowed: 12, isPaid: true },
        { name: 'Casual Leave', code: 'CASUAL', daysAllowed: 8, isPaid: true },
      ],
    });
    console.log('✅ Baseline Leave Types registered (Annual, Sick, Casual).');

    console.log('\n🎉 Database is now 100% clean and dynamic!');
  } catch (error) {
    console.error('❌ Error during clean reset:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetCleanDatabase();
