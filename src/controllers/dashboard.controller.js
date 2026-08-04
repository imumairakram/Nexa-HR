const prisma = require('../config/prisma');

const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [
      activeEmployeesCount,
      departmentsCount,
      todayAttendances,
      pendingLeavesCount,
      latestPayrollSummary,
    ] = await Promise.all([
      prisma.user.count({
        where: { isActive: true },
      }),
      prisma.department.count(),
      prisma.attendance.findMany({
        where: { date: today },
        select: { status: true },
      }),
      prisma.leaveRequest.count({
        where: { status: 'PENDING' },
      }),
      prisma.payslip.aggregate({
        _sum: {
          grossSalary: true,
          netSalary: true,
          taxDeductions: true,
        },
        _count: { id: true },
      }),
    ]);

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

const getEmployeeDashboard = async (req, res) => {
  try {
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
      prisma.attendance.findUnique({
        where: {
          userId_date: { userId, date: today },
        },
      }),
      prisma.attendance.findMany({
        where: {
          userId,
          date: { gte: monthStart },
        },
        select: { status: true, totalHours: true },
      }),
      prisma.leaveRequest.groupBy({
        by: ['status'],
        where: { userId },
        _count: { id: true },
      }),
      prisma.payslip.findFirst({
        where: { userId },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
    ]);

    let presentDays = 0;
    let lateDays = 0;
    let totalWorkHours = 0;

    monthlyAttendances.forEach((record) => {
      if (record.status === 'PRESENT') presentDays++;
      else if (record.status === 'LATE') lateDays++;
      if (record.totalHours) totalWorkHours += record.totalHours;
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
              synced: true,
              checkInTime: todayAttendance.checkInTime,
              checkOutTime: todayAttendance.checkOutTime,
              status: todayAttendance.status,
              totalHours: todayAttendance.totalHours,
            }
          : {
              synced: false,
              checkInTime: null,
              checkOutTime: null,
              status: 'NOT_RECORDED',
              totalHours: null,
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
