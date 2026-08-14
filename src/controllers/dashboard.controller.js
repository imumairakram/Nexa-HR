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
      departments,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.department.count(),
      prisma.attendance.findMany({
        where: { date: today },
        include: {
          user: {
            select: {
              employeeCode: true,
              firstName: true,
              lastName: true,
              profile: {
                select: {
                  department: { select: { name: true } },
                },
              },
            },
          },
        },
        orderBy: { checkInTime: 'desc' },
      }),
      prisma.leaveRequest.count({ where: { status: 'PENDING' } }),
      prisma.payslip.aggregate({
        _sum: { grossSalary: true, netSalary: true, taxDeductions: true },
        _count: { id: true },
      }),
      prisma.department.findMany({
        select: { id: true, name: true, code: true },
      }),
    ]);

    // Metrics calculation
    let presentTodayCount = 0;
    let onTimeCount = 0;

    todayAttendances.forEach((record) => {
      if (['PRESENT', 'LATE', 'HALF_DAY'].includes(record.status)) {
        presentTodayCount++;
        const checkIn = new Date(record.checkInTime);
        const checkInHour = checkIn.getHours();
        const checkInMinute = checkIn.getMinutes();
        if (checkInHour < 9 || (checkInHour === 9 && checkInMinute === 0)) {
          onTimeCount++;
        }
      }
    });

    const workforcePresence = activeEmployeesCount > 0
      ? Math.round((presentTodayCount / activeEmployeesCount) * 100)
      : 0;

    const onTimeArrival = presentTodayCount > 0
      ? Number(((onTimeCount / presentTodayCount) * 100).toFixed(1))
      : 0;

    const absentToday = Math.max(0, activeEmployeesCount - presentTodayCount);

    // Weekly Trend (Last 7 Days)
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const weeklyAttendances = await prisma.attendance.findMany({
      where: {
        date: { gte: sevenDaysAgo, lte: today },
      },
      select: { date: true, status: true },
    });

    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];

      const dayRecords = weeklyAttendances.filter((att) => {
        const attDateStr = new Date(att.date).toISOString().split('T')[0];
        return attDateStr === dateStr;
      });

      const dayCount = dayRecords.filter((r) => ['PRESENT', 'LATE', 'HALF_DAY'].includes(r.status)).length;
      const formattedDate = d.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
      
      weeklyTrend.push({
        date: formattedDate,
        attendance: dayCount,
        peak: Math.max(dayCount, activeEmployeesCount),
      });
    }

    // Department Attendance Breakdown
    const deptAttendanceMap = {};
    departments.forEach((dept) => {
      deptAttendanceMap[dept.name] = { name: dept.name, onTime: 0, late: 0 };
    });

    todayAttendances.forEach((record) => {
      const deptName = record.user?.profile?.department?.name || 'General';
      if (!deptAttendanceMap[deptName]) {
        deptAttendanceMap[deptName] = { name: deptName, onTime: 0, late: 0 };
      }
      if (record.status === 'PRESENT') {
        deptAttendanceMap[deptName].onTime++;
      } else if (record.status === 'LATE') {
        deptAttendanceMap[deptName].late++;
      }
    });

    const departmentAttendance = Object.values(deptAttendanceMap);

    // Department Performance (Radar)
    const departmentPerformance = [
      { subject: 'Punctuality', scoreA: Math.round(onTimeArrival), scoreB: 100 },
      { subject: 'Presence%', scoreA: Math.round(workforcePresence), scoreB: 100 },
      { subject: 'Pending Leaves', scoreA: pendingLeavesCount, scoreB: Math.max(pendingLeavesCount, 5) },
      { subject: 'Active Staff', scoreA: activeEmployeesCount, scoreB: Math.max(activeEmployeesCount, 10) },
      { subject: 'Departments', scoreA: departmentsCount, scoreB: Math.max(departmentsCount, 5) },
    ];

    // Recent Biometric Logs
    const recentLogs = todayAttendances.slice(0, 10).map((log) => {
      const checkInDate = new Date(log.checkInTime);
      const timeFormatted = checkInDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const dateFormatted = new Date(log.date).toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
      return {
        date: dateFormatted,
        empCode: log.user.employeeCode || 'EMP-100',
        employeeName: `${log.user.firstName} ${log.user.lastName}`,
        department: log.user.profile?.department?.name || 'General',
        time: timeFormatted,
        status: log.status,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalActiveEmployees: activeEmployeesCount,
          totalDepartments: departmentsCount,
          pendingLeaveRequests: pendingLeavesCount,
        },
        metrics: {
          totalActiveEmployees: activeEmployeesCount,
          pendingLeaveRequests: pendingLeavesCount,
          workforcePresence,
          onTimeArrival,
          absentToday,
        },
        charts: {
          weeklyTrend,
          departmentAttendance,
          departmentPerformance,
        },
        recentLogs,
        todayAttendance: {
          date: today.toISOString().split('T')[0],
          totalRecords: todayAttendances.length,
          stats: {
            present: presentTodayCount,
            onTime: onTimeCount,
            absent: absentToday,
          },
        },
        latestPayroll: {
          totalPayslipsGenerated: latestPayrollSummary._count.id || 0,
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
      currentUser,
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
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: {
            include: { department: true, designation: true },
          },
          salaryStructure: true,
        },
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
        user: {
          id: currentUser?.id,
          employeeCode: currentUser?.employeeCode,
          firstName: currentUser?.firstName,
          lastName: currentUser?.lastName,
          email: currentUser?.email,
          role: currentUser?.role,
          department: currentUser?.profile?.department?.name,
          designation: currentUser?.profile?.designation?.title,
          joiningDate: currentUser?.profile?.joiningDate,
          salaryStructure: currentUser?.salaryStructure,
        },
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

