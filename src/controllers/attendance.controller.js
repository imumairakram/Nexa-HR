const prisma = require('../config/prisma');

/**
 * Web Clock Check-In
 * POST /api/attendance/check-in
 */
const checkIn = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const { notes } = req.body;

    const now = new Date();
    // Get start of today (YYYY-MM-DD) for DB date index
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if already checked in today
    const existing = await prisma.attendance.findUnique({
      where: {
        tenantId_userId_date: {
          tenantId,
          userId,
          date: today,
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked in for today.',
        data: { attendance: existing },
      });
    }

    // Determine status (Late if after 9:30 AM)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    let status = 'PRESENT';
    if (currentHour > 9 || (currentHour === 9 && currentMinute > 30)) {
      status = 'LATE';
    }

    const attendance = await prisma.attendance.create({
      data: {
        tenantId,
        userId,
        date: today,
        checkIn: now,
        status,
        notes: notes ? notes.trim() : null,
      },
    });

    return res.status(201).json({
      success: true,
      message: `Check-in successful at ${now.toLocaleTimeString()} (${status}).`,
      data: { attendance },
    });
  } catch (error) {
    console.error('Error in checkIn:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record check-in.',
      error: error.message,
    });
  }
};

/**
 * Web Clock Check-Out
 * POST /api/attendance/check-out
 */
const checkOut = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const { notes } = req.body;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const attendance = await prisma.attendance.findUnique({
      where: {
        tenantId_userId_date: {
          tenantId,
          userId,
          date: today,
        },
      },
    });

    if (!attendance) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today. Please check in first.',
      });
    }

    if (attendance.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already checked out for today.',
        data: { attendance },
      });
    }

    // Calculate work hours
    const diffMs = now.getTime() - new Date(attendance.checkIn).getTime();
    const hours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

    const updated = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut: now,
        workHours: hours,
        notes: notes ? `${attendance.notes || ''} ${notes.trim()}`.trim() : attendance.notes,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Check-out successful. Total hours worked: ${hours} hrs.`,
      data: { attendance: updated },
    });
  } catch (error) {
    console.error('Error in checkOut:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record check-out.',
      error: error.message,
    });
  }
};

/**
 * Get My Attendance Logs
 * GET /api/attendance/my-logs
 */
const getMyLogs = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const whereClause = {
      tenantId,
      userId,
    };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const logs = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { attendances: logs },
    });
  } catch (error) {
    console.error('Error in getMyLogs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch attendance logs.',
      error: error.message,
    });
  }
};

/**
 * Get Company Attendance Overview (Admin/HR)
 * GET /api/attendance
 */
const getCompanyAttendance = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { date, status, departmentId } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const whereClause = {
      tenantId,
      date: dayStart,
    };

    if (status) {
      whereClause.status = status;
    }

    if (departmentId) {
      whereClause.user = {
        profile: { departmentId },
      };
    }

    const logs = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: {
              include: {
                department: { select: { name: true, code: true } },
                designation: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: { checkIn: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: {
        date: dayStart.toISOString().split('T')[0],
        attendances: logs,
      },
    });
  } catch (error) {
    console.error('Error in getCompanyAttendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch company attendance overview.',
      error: error.message,
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getMyLogs,
  getCompanyAttendance,
};
