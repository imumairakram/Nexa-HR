const prisma = require('../config/prisma');

/**
 * Get Admin Dashboard Overview Metrics
 * GET /api/dashboard/admin
 */
const getAdminDashboard = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Execute queries in parallel using Promise.all
    const [
      activeEmployeesCount,
      departmentsCount,
      todayAttendances,
      pendingLeavesCount,
      latestPayrollSummary,
    ] = await Promise.all([
      // 1. Total Active Employees
      prisma.user.count({
        where: { tenantId, isActive: true, role: { not: 'SUPER_ADMIN' } },
      }),

      // 2. Total Departments
      prisma.department.count({
        where: { tenantId },
      }),

      // 3. Today's Attendance records
      prisma.attendance.findMany({
        where: { tenantId, date: today },
        select: { status: true },
      }),

      // 4. Pending Leave Applications count
      prisma.leaveRequest.count({
        where: { tenantId, status: 'PENDING' },
      }),

      // 5. Latest Month Payroll Summary
      prisma.payslip.aggregate({
        where: { tenantId },
        _sum: {
          grossSalary: true,
          netSalary: true,
          taxDeductions: true,
        },
        _count: { id: true },
      }),
    ]);

    // Calculate attendance status breakdown
    const attendanceStats = {
      present: 0,
      late: 0,
      halfDay: 0,
      onLeave: 0,
      absent: 0,
    };

    todayAttendances.forEach((record) => {
      if (record.status === 'PRESENT') attendanceStats.present++;
      else if (record.status === 'LATE') attendanceStats.late++;
      else if (record.status === 'HALF_DAY') attendanceStats.halfDay++;
      else if (record.status === 'ON_LEAVE') attendanceStats.onLeave++;
    });

    attendanceStats.absent = Math.max(
      0,
      activeEmployeesCount - (attendanceStats.present + attendanceStats.late + attendanceStats.halfDay + attendanceStats.onLeave)
    );

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalActiveEmployees: activeEmployeesCount,
          totalDepartments: departmentsCount,
          pendingLeaveRequests: pendingLeavesCount,
        },
        todayAttendance: {
          date: today.toISOString().split('T')[0],
          totalRecords: todayAttendances.length,
          stats: attendanceStats,
        },
        latestPayroll: {
          totalPayslipsGenerated: latestPayrollSummary._count.id,
          totalGrossSalaryPayout: latestPayrollSummary._sum.grossSalary || 0,
          totalNetSalaryPayout: latestPayrollSummary._sum.netSalary || 0,
          totalTaxWithheld: latestPayrollSummary._sum.taxDeductions || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error in getAdminDashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin dashboard metrics.',
      error: error.message,
    });
  }
};

/**
 * Get Employee Personal Dashboard Portal Metrics
 * GET /api/dashboard/employee
 */
const getEmployeeDashboard = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      todayAttendance,
      monthlyAttendances,
      leaveRequestsSummary,
      latestPayslip,
    ] = await Promise.all([
      // 1. Today's attendance status
      prisma.attendance.findUnique({
        where: {
          tenantId_userId_date: { tenantId, userId, date: today },
        },
      }),

      // 2. Monthly attendance history
      prisma.attendance.findMany({
        where: {
          tenantId,
          userId,
          date: { gte: monthStart },
        },
        select: { status: true, workHours: true },
      }),

      // 3. Leave applications breakdown
      prisma.leaveRequest.groupBy({
        by: ['status'],
        where: { tenantId, userId },
        _count: { id: true },
      }),

      // 4. Most recent payslip
      prisma.payslip.findFirst({
        where: { tenantId, userId },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
    ]);

    // Calculate monthly attendance stats
    let presentDays = 0;
    let lateDays = 0;
    let totalWorkHours = 0;

    monthlyAttendances.forEach((record) => {
      if (record.status === 'PRESENT') presentDays++;
      else if (record.status === 'LATE') lateDays++;
      if (record.workHours) totalWorkHours += record.workHours;
    });

    const leaveStats = {
      pending: 0,
      approved: 0,
      rejected: 0,
    };

    leaveRequestsSummary.forEach((group) => {
      if (group.status === 'PENDING') leaveStats.pending = group._count.id;
      else if (group.status === 'APPROVED') leaveStats.approved = group._count.id;
      else if (group.status === 'REJECTED') leaveStats.rejected = group._count.id;
    });

    return res.status(200).json({
      success: true,
      data: {
        todayClockStatus: todayAttendance
          ? {
              checkedIn: true,
              checkInTime: todayAttendance.checkIn,
              checkOutTime: todayAttendance.checkOut,
              status: todayAttendance.status,
              workHours: todayAttendance.workHours,
            }
          : {
              checkedIn: false,
              checkInTime: null,
              checkOutTime: null,
              status: 'NOT_CLOCKED_IN',
              workHours: null,
            },
        monthlyAttendance: {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          presentDays,
          lateDays,
          totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
        },
        leavesSummary: leaveStats,
        latestPayslip: latestPayslip || null,
      },
    });
  } catch (error) {
    console.error('Error in getEmployeeDashboard:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch employee dashboard metrics.',
      error: error.message,
    });
  }
};

module.exports = {
  getAdminDashboard,
  getEmployeeDashboard,
};
