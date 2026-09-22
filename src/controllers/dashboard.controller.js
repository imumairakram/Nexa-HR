const prisma = require('../config/prisma');

const getDepartmentShortName = (name, code) => {
  if (code && code.length <= 5) return code;
  const map = {
    'Human Resources': 'HR',
    'Engineering & DevOps': 'Eng & DevOps',
    'Product & Design': 'Product',
    'Finance & Accounting': 'Finance',
    'Finance & Accounts': 'Finance',
    'Sales & Marketing': 'Sales & Mkt',
    'Customer Support & Operations': 'Support',
    'Engineering': 'Engineering',
  };
  if (map[name]) return map[name];
  if (name.length > 14) return name.split('&')[0].trim();
  return name;
};

const getAdminDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const thirtyDaysAgo = new Date(startOfToday);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

    const [
      activeEmployeesCount,
      departmentsCount,
      todayAttendances,
      pendingLeavesCount,
      latestPayrollSummary,
      departmentsWithProfiles,
      monthAttendances,
    ] = await Promise.all([
      prisma.user.count({ where: { isActive: true } }),
      prisma.department.count(),
      prisma.attendance.findMany({
        where: {
          date: { gte: startOfToday, lte: endOfToday },
        },
        include: {
          user: {
            select: {
              employeeCode: true,
              firstName: true,
              lastName: true,
              profile: {
                select: {
                  departmentId: true,
                  department: { select: { id: true, name: true, code: true } },
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
        include: {
          profiles: {
            where: {
              user: { isActive: true },
            },
            select: {
              id: true,
              userId: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.attendance.findMany({
        where: {
          date: { gte: thirtyDaysAgo, lte: endOfToday },
        },
        include: {
          user: {
            select: {
              profile: {
                select: {
                  departmentId: true,
                  department: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
        orderBy: { date: 'asc' },
      }),
    ]);

    // Live Metrics Calculation
    let presentTodayCount = 0;
    let onTimeCount = 0;

    todayAttendances.forEach((record) => {
      if (['PRESENT', 'LATE', 'HALF_DAY'].includes(record.status)) {
        presentTodayCount++;
        const checkIn = new Date(record.checkInTime);
        const checkInHour = checkIn.getHours();
        const checkInMinute = checkIn.getMinutes();
        if (record.status === 'PRESENT' || (checkInHour < 9 || (checkInHour === 9 && checkInMinute <= 30))) {
          onTimeCount++;
        }
      }
    });

    const workforcePresence = activeEmployeesCount > 0
      ? Math.round((presentTodayCount / activeEmployeesCount) * 100)
      : 0;

    const onTimeArrival = presentTodayCount > 0
      ? Number(((onTimeCount / presentTodayCount) * 100).toFixed(1))
      : (activeEmployeesCount > 0 ? 100 : 0);

    const absentToday = Math.max(0, activeEmployeesCount - presentTodayCount);

    // Multi-Timeframe Biometric Attendance Trends (7D, 14D, 30D)
    const generateTrendSeries = (daysCount) => {
      const series = [];
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(startOfToday);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        const dayRecords = monthAttendances.filter((att) => {
          const attDateStr = new Date(att.date).toISOString().split('T')[0];
          return attDateStr === dateStr;
        });

        const dayPresent = dayRecords.filter((r) => ['PRESENT', 'HALF_DAY'].includes(r.status)).length;
        const dayLate = dayRecords.filter((r) => r.status === 'LATE').length;
        const totalDay = dayPresent + dayLate;
        const formattedDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

        series.push({
          date: formattedDate,
          attendance: totalDay,
          onTime: dayPresent,
          late: dayLate,
          peak: activeEmployeesCount,
        });
      }
      return series;
    };

    const trend7d = generateTrendSeries(7);
    const trend14d = generateTrendSeries(14);
    const trend30d = generateTrendSeries(30);

    // Dynamic Sparkline Time-Series Data Series
    const headcountSparkline = trend7d.map((d) => ({
      value: activeEmployeesCount,
      label: d.date,
      tooltip: `${d.date}: ${activeEmployeesCount} Active Staff`,
    }));

    const onTimeSparkline = trend7d.map((d) => {
      const total = d.onTime + d.late;
      const rate = total > 0 ? Math.round((d.onTime / total) * 100) : 0;
      return {
        value: rate,
        label: d.date,
        tooltip: total > 0 ? `${d.date}: ${rate}% On-Time (${d.onTime}/${total})` : `${d.date}: 0 Check-ins`,
      };
    });

    const absentSparkline = trend7d.map((d) => {
      const absentCount = Math.max(0, activeEmployeesCount - (d.onTime + d.late));
      return {
        value: absentCount,
        label: d.date,
        tooltip: `${d.date}: ${absentCount} Absent / Pending`,
      };
    });

    const leavesSparkline = trend7d.map((d) => ({
      value: pendingLeavesCount,
      label: d.date,
      tooltip: `${d.date}: ${pendingLeavesCount} Pending Leave${pendingLeavesCount !== 1 ? 's' : ''}`,
    }));

    const weeklyAttendances = monthAttendances.filter((att) => new Date(att.date) >= sevenDaysAgo);
    const weeklyTrend = trend7d;

    // Dynamic Multi-Timeframe Department Attendance Breakdown
    const computeDepartmentStats = (logs) => {
      return departmentsWithProfiles.map((dept) => {
        const totalStaff = dept.profiles ? dept.profiles.length : 0;
        const deptLogs = logs.filter((log) => {
          const userDeptId = log.user?.profile?.departmentId;
          const userDeptName = log.user?.profile?.department?.name;
          return userDeptId === dept.id || userDeptName === dept.name;
        });

        let onTime = 0;
        let late = 0;

        deptLogs.forEach((log) => {
          if (log.status === 'PRESENT') {
            onTime++;
          } else if (log.status === 'LATE') {
            late++;
          } else if (log.status === 'HALF_DAY') {
            onTime++;
          }
        });

        const totalActiveInPeriod = onTime + late;
        const absent = Math.max(0, totalStaff - totalActiveInPeriod);
        const punctualityRate = totalActiveInPeriod > 0
          ? Math.round((onTime / totalActiveInPeriod) * 100)
          : (totalStaff > 0 ? 100 : 0);

        return {
          id: dept.id,
          name: dept.name,
          code: dept.code || dept.name.slice(0, 3).toUpperCase(),
          shortName: getDepartmentShortName(dept.name, dept.code),
          totalStaff,
          total: totalActiveInPeriod,
          onTime,
          late,
          absent,
          punctualityRate,
          attendanceRate: totalStaff > 0 ? Math.round((totalActiveInPeriod / totalStaff) * 100) : 0,
        };
      });
    };

    const deptAttendanceToday = computeDepartmentStats(todayAttendances);
    const deptAttendanceWeek = computeDepartmentStats(weeklyAttendances);
    const deptAttendanceMonth = computeDepartmentStats(monthAttendances);

    // Organization Operations Health (Normalized 0-100 Radar Dimensions)
    const totalMonthLogs = monthAttendances.length;
    const totalMonthOnTime = monthAttendances.filter((a) => a.status === 'PRESENT').length;
    const historicalPunctuality = totalMonthLogs > 0
      ? Math.round((totalMonthOnTime / totalMonthLogs) * 100)
      : 95;

    const punctualityScore = presentTodayCount > 0
      ? Math.round(onTimeArrival)
      : historicalPunctuality;

    const presenceScore = activeEmployeesCount > 0
      ? Math.round(workforcePresence)
      : 100;

    const leaveHealthScore = Math.max(0, Math.min(100, 100 - (pendingLeavesCount * 10)));
    const deptsWithStaff = departmentsWithProfiles.filter((d) => d.profiles && d.profiles.length > 0).length;
    const deptCoverageScore = departmentsCount > 0
      ? Math.round((deptsWithStaff / departmentsCount) * 100)
      : 100;
    const staffingScore = activeEmployeesCount > 0
      ? Math.min(100, Math.max(20, Math.round((activeEmployeesCount / Math.max(activeEmployeesCount, 10)) * 100)))
      : 50;

    const departmentPerformance = [
      { subject: 'Punctuality', scoreA: punctualityScore, scoreB: 100, fullMark: 100 },
      { subject: 'Presence%', scoreA: presenceScore, scoreB: 100, fullMark: 100 },
      { subject: 'Leave Health', scoreA: leaveHealthScore, scoreB: 100, fullMark: 100 },
      { subject: 'Staffing Cap', scoreA: staffingScore, scoreB: 100, fullMark: 100 },
      { subject: 'Dept Coverage', scoreA: deptCoverageScore, scoreB: 100, fullMark: 100 },
    ];

    // Recent Biometric Logs (Fetch today or fallback to recent 10 records)
    let logsSource = todayAttendances;
    let isFallbackRecent = false;
    if (logsSource.length === 0) {
      logsSource = await prisma.attendance.findMany({
        take: 8,
        orderBy: { checkInTime: 'desc' },
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
      });
      isFallbackRecent = true;
    }

    const recentLogs = logsSource.slice(0, 10).map((log) => {
      const checkInDate = new Date(log.checkInTime || log.date);
      const timeFormatted = checkInDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      const dateFormatted = new Date(log.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      return {
        id: log.id,
        date: dateFormatted,
        empCode: log.user?.employeeCode || 'EMP-100',
        employeeName: `${log.user?.firstName || 'Staff'} ${log.user?.lastName || 'Member'}`,
        department: log.user?.profile?.department?.name || 'General',
        time: timeFormatted,
        status: log.status || 'PRESENT',
        isToday: !isFallbackRecent,
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
          attendanceTrends: {
            '7d': trend7d,
            '14d': trend14d,
            '30d': trend30d,
          },
          sparklines: {
            headcount: headcountSparkline,
            onTime: onTimeSparkline,
            absent: absentSparkline,
            leaves: leavesSparkline,
          },
          departmentAttendance: deptAttendanceToday,
          departmentAttendanceTimeframes: {
            today: deptAttendanceToday,
            week: deptAttendanceWeek,
            month: deptAttendanceMonth,
          },
          departmentPerformance,
        },
        recentLogs,
        todayAttendance: {
          date: startOfToday.toISOString().split('T')[0],
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

