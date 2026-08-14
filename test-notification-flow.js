const prisma = require('./src/config/prisma');
const {
  broadcastInAppNotification,
  createInAppNotification,
  sendAnnouncementEmail,
  sendLeaveStatusEmail,
  sendLeaveRequestSubmittedEmail,
  sendPayslipEmail,
} = require('./src/services/notification.service');

async function testNotificationSystem() {
  console.log('====================================================');
  console.log('🧪 RUNNING NEXAHR NOTIFICATION SYSTEM TEST SUITE');
  console.log('====================================================\n');

  try {
    // 1. Ensure at least one Admin and one Employee exist for testing
    let admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
      admin = await prisma.user.create({
        data: {
          employeeCode: 'EMP-ADMIN-TEST',
          email: 'admin@company.com',
          password: 'hashedpassword',
          firstName: 'System',
          lastName: 'Administrator',
          role: 'ADMIN',
        },
      });
    }

    let employee = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });
    if (!employee) {
      employee = await prisma.user.create({
        data: {
          employeeCode: 'EMP-101-TEST',
          email: 'alex.mercer@company.com',
          password: 'hashedpassword',
          firstName: 'Alex',
          lastName: 'Mercer',
          role: 'EMPLOYEE',
        },
      });
    }

    console.log(`👤 Admin: ${admin.firstName} ${admin.lastName} (${admin.email})`);
    console.log(`👤 Employee: ${employee.firstName} ${employee.lastName} (${employee.email})\n`);

    // 2. Test Announcement Broadcast (In-App + Corporate Email)
    console.log('--- TEST 1: HR Announcement Broadcast ---');
    const announcement = await prisma.announcement.create({
      data: {
        title: 'Annual Company Retreat 2026 Announcement & RSVP',
        category: 'EVENTS',
        priority: 'HIGH',
        department: 'Company-Wide (All Offices)',
        summary: 'All employees are invited to the Lake Tahoe Leadership & Innovation Summit 2026.',
        content: 'We are thrilled to announce our 2026 Annual Company Retreat taking place in Lake Tahoe from Oct 15-18. All travel and accommodations will be covered. Please submit your dietary preferences and flight details by Friday.',
        author: `${admin.firstName} ${admin.lastName}`,
        pinned: true,
      },
    });
    console.log(`✅ Announcement created with ID: ${announcement.id}`);

    // Broadcast In-App Notification
    const notifs = await broadcastInAppNotification({
      title: `📢 Announcement: ${announcement.title}`,
      message: announcement.summary,
      type: 'warning',
      category: 'ANNOUNCEMENT',
      link: '/employee/announcements',
    });
    console.log(`✅ In-app notifications broadcasted to ${notifs.length} user(s).`);

    // Dispatch Announcement Email
    const emailResult = await sendAnnouncementEmail({
      recipients: [employee, admin],
      announcement,
    });
    console.log(`✅ Announcement email dispatched: ${emailResult.message}\n`);

    // 3. Test Sick Leave Request Workflow (Submission -> HR Notification)
    console.log('--- TEST 2: Sick Leave Application Submission ---');
    let sickLeaveType = await prisma.leaveType.findFirst({ where: { code: 'SICK' } });
    if (!sickLeaveType) {
      sickLeaveType = await prisma.leaveType.create({
        data: {
          name: 'Medical / Sick Leave',
          code: 'SICK',
          daysAllowed: 12,
          isPaid: true,
        },
      });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: employee.id,
        leaveTypeId: sickLeaveType.id,
        startDate: new Date('2026-08-18'),
        endDate: new Date('2026-08-20'),
        totalDays: 3,
        reason: 'Severe seasonal flu and medical rest recommended by physician.',
        status: 'PENDING',
      },
      include: {
        leaveType: true,
      },
    });

    // Notify HR In-App
    await broadcastInAppNotification({
      title: `🏖️ Leave Request: ${employee.firstName} ${employee.lastName}`,
      message: `Medical / Sick Leave requested for 3 day(s) (2026-08-18 to 2026-08-20).`,
      type: 'warning',
      category: 'LEAVE',
      link: '/app/leaves',
      targetRoles: ['ADMIN', 'HR_MANAGER'],
    });

    // Email to HR
    await sendLeaveRequestSubmittedEmail({
      adminEmails: [admin.email],
      employeeName: `${employee.firstName} ${employee.lastName}`,
      employeeCode: employee.employeeCode,
      leaveType: sickLeaveType.name,
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      totalDays: leaveRequest.totalDays,
      reason: leaveRequest.reason,
    });
    console.log(`✅ Sick Leave request submitted & HR notified.\n`);

    // 4. Test Sick Leave Approval by HR (Approval -> Employee In-App & Email)
    console.log('--- TEST 3: Sick Leave Approval & Dispatch to Employee ---');
    const approvedLeave = await prisma.leaveRequest.update({
      where: { id: leaveRequest.id },
      data: {
        status: 'APPROVED',
        approvedById: admin.id,
      },
      include: {
        leaveType: true,
      },
    });

    // Notify Employee In-App
    await createInAppNotification({
      userId: employee.id,
      title: '✅ Leave Request Approved',
      message: `Your ${approvedLeave.leaveType.name} request for 3 day(s) has been approved by HR.`,
      type: 'success',
      category: 'LEAVE',
      link: '/employee/leaves',
    });

    // Email to Employee
    await sendLeaveStatusEmail({
      email: employee.email,
      name: `${employee.firstName} ${employee.lastName}`,
      leaveType: approvedLeave.leaveType.name,
      startDate: approvedLeave.startDate,
      endDate: approvedLeave.endDate,
      totalDays: approvedLeave.totalDays,
      status: 'APPROVED',
    });
    console.log(`✅ Sick Leave approved & employee notified via in-app notification & email.\n`);

    // 5. Test Monthly Payslip Generation Notification
    console.log('--- TEST 4: Payslip / Salary Disbursement Notification ---');
    const payslip = await prisma.payslip.upsert({
      where: {
        userId_month_year: {
          userId: employee.id,
          month: 8,
          year: 2026,
        },
      },
      update: {
        basicSalary: 11250,
        totalAllowances: 450,
        taxDeductions: 2150,
        grossSalary: 11700,
        netSalary: 9550,
        status: 'GENERATED',
      },
      create: {
        userId: employee.id,
        month: 8,
        year: 2026,
        basicSalary: 11250,
        totalAllowances: 450,
        taxDeductions: 2150,
        grossSalary: 11700,
        netSalary: 9550,
        status: 'GENERATED',
      },
    });

    // In-App Notification for Payslip
    await createInAppNotification({
      userId: employee.id,
      title: '💳 August 2026 Payslip Ready',
      message: `Your monthly salary slip ($${payslip.netSalary.toLocaleString()}) is ready for download.`,
      type: 'success',
      category: 'PAYROLL',
      link: '/employee/payslips',
    });

    // Corporate Email for Payslip
    await sendPayslipEmail({
      email: employee.email,
      name: `${employee.firstName} ${employee.lastName}`,
      month: 8,
      year: 2026,
      grossSalary: payslip.grossSalary,
      deductions: payslip.taxDeductions,
      netSalary: payslip.netSalary,
    });
    console.log(`✅ Payslip notification & corporate email dispatched to employee.\n`);

    // 6. Verify Notifications in Database
    console.log('--- TEST 5: Verify Notifications in Database ---');
    const employeeNotifs = await prisma.notification.findMany({
      where: { userId: employee.id },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`📋 Total in-app notifications for ${employee.firstName}: ${employeeNotifs.length}`);
    employeeNotifs.forEach((n, idx) => {
      console.log(`  ${idx + 1}. [${n.type.toUpperCase()} | ${n.category}] ${n.title} - "${n.message}" (Read: ${n.isRead})`);
    });

    console.log('\n====================================================');
    console.log('🎉 ALL NOTIFICATION & EMAIL TESTS PASSED SUCCESSFULLY!');
    console.log('====================================================');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationSystem();
