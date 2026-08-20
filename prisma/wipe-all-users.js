const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function wipeAllUsers() {
  console.log('🧹 Starting complete wipe of all database users & associated user records...');

  try {
    // Delete in sequence to respect potential foreign key dependencies
    const deletedResetOtps = await prisma.passwordResetOtp.deleteMany({});
    console.log(`Deleted ${deletedResetOtps.count} password reset OTPs.`);

    const deletedPayslips = await prisma.payslip.deleteMany({});
    console.log(`Deleted ${deletedPayslips.count} payslips.`);

    const deletedSalaries = await prisma.salaryStructure.deleteMany({});
    console.log(`Deleted ${deletedSalaries.count} salary structures.`);

    const deletedLeaves = await prisma.leaveRequest.deleteMany({});
    console.log(`Deleted ${deletedLeaves.count} leave requests.`);

    const deletedAttendances = await prisma.attendance.deleteMany({});
    console.log(`Deleted ${deletedAttendances.count} attendance records.`);

    const deletedProfiles = await prisma.employeeProfile.deleteMany({});
    console.log(`Deleted ${deletedProfiles.count} employee profiles.`);

    const deletedNotifications = await prisma.notification.deleteMany({});
    console.log(`Deleted ${deletedNotifications.count} notifications.`);

    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✅ Deleted ALL ${deletedUsers.count} users from PostgreSQL database.`);

    console.log('🎉 Database user wipe completed successfully!');
  } catch (error) {
    console.error('❌ Error wiping users from database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

wipeAllUsers();
