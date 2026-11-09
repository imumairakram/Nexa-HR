const crypto = require('crypto');
const prisma = require('../config/prisma');
const cacheService = require('../services/cache.service');
const { nonDemoUsersWhere, nonDemoRelationWhere } = require('../utils/userFilters');

/**
 * Constant-time string comparison preventing timing side-channel attacks
 */
function safeCompareKeys(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string') return false;
  const providedBuf = Buffer.from(provided);
  const expectedBuf = Buffer.from(expected);
  if (providedBuf.length !== expectedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

/**
 * Shared Attendance Punch Processing Logic
 */
async function processAttendancePunch({ employeeCode, timestamp, type, sourceNote, res }) {
  if (!employeeCode || !timestamp || !type) {
    return res.status(400).json({
      success: false,
      message: 'Required fields missing: employeeCode, timestamp, and type ("IN" | "OUT").',
    });
  }

  const eventType = type.toUpperCase().trim();
  if (!['IN', 'OUT'].includes(eventType)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid event type. Must be "IN" or "OUT".',
    });
  }

  const eventTime = new Date(timestamp);
  if (isNaN(eventTime.getTime())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid timestamp format. Must be a valid ISO-8601 string.',
    });
  }

  // Find employee by employeeCode
  const user = await prisma.user.findUnique({
    where: { employeeCode: employeeCode.trim() },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: `Employee with code '${employeeCode}' not found in system.`,
    });
  }

  if (!user.isActive) {
    return res.status(403).json({
      success: false,
      message: `Employee '${user.firstName} ${user.lastName}' is inactive. Attendance rejected.`,
    });
  }

  const todayDate = new Date(eventTime.getFullYear(), eventTime.getMonth(), eventTime.getDate());
  let attendance = null;

  if (eventType === 'IN') {
    let currentHour = eventTime.getHours();
    let currentMinute = eventTime.getMinutes();

    try {
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Karachi',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });
      const parts = timeFormatter.formatToParts(eventTime);
      const parsedHour = parseInt(parts.find((p) => p.type === 'hour')?.value, 10);
      const parsedMin = parseInt(parts.find((p) => p.type === 'minute')?.value, 10);
      if (!isNaN(parsedHour) && !isNaN(parsedMin)) {
        currentHour = parsedHour;
        currentMinute = parsedMin;
      }
    } catch (e) {
      // Fallback to server local time
    }

    let status = 'PRESENT';
    if (currentHour > 9 || (currentHour === 9 && currentMinute > 15)) {
      status = 'LATE';
    }

    attendance = await prisma.attendance.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: todayDate,
        },
      },
      update: {
        checkInTime: eventTime,
        status,
        notes: `${sourceNote} (Check-In)`,
      },
      create: {
        userId: user.id,
        date: todayDate,
        checkInTime: eventTime,
        status,
        notes: `${sourceNote} (Check-In)`,
      },
    });
  } else if (eventType === 'OUT') {
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: todayDate,
        },
      },
    });

    if (!existing) {
      attendance = await prisma.attendance.create({
        data: {
          userId: user.id,
          date: todayDate,
          checkInTime: eventTime,
          checkOutTime: eventTime,
          status: 'PRESENT',
          totalHours: 0,
          notes: `${sourceNote} (Check-Out without prior Check-In)`,
        },
      });
    } else {
      const checkIn = new Date(existing.checkInTime);
      const diffMs = Math.max(0, eventTime.getTime() - checkIn.getTime());
      const totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));

      attendance = await prisma.attendance.update({
        where: { id: existing.id },
        data: {
          checkOutTime: eventTime,
          totalHours,
          notes: `${existing.notes || ''} (${sourceNote} Check-Out)`.trim(),
        },
      });
    }
  }

  // Invalidate caches so admin and employee screens update immediately
  cacheService.invalidateTags(['attendance', 'dashboard']);

  return res.status(200).json({
    success: true,
    message: `${eventType} punch recorded successfully for ${user.firstName} ${user.lastName} (${user.employeeCode}).`,
    data: {
      employee: {
        id: user.id,
        employeeCode: user.employeeCode,
        name: `${user.firstName} ${user.lastName}`,
      },
      attendance,
    },
  });
}

/**
 * Biometric Hardware Device Attendance Sync Endpoint
 * POST /api/attendance/hardware-sync
 * Security: Validates x-hardware-key header with timing-safe comparison
 */
const hardwareSync = async (req, res) => {
  try {
    const expectedKey = process.env.HARDWARE_SECRET_KEY;

    // Fail closed if HARDWARE_SECRET_KEY is missing or shorter than 32 characters
    if (!expectedKey || expectedKey.trim().length < 32) {
      console.warn('[SECURITY WARNING] HARDWARE_SECRET_KEY is missing or shorter than 32 characters. Failing closed.');
      return res.status(500).json({
        success: false,
        message: 'Hardware sync misconfigured.',
      });
    }

    const hardwareKey = req.headers['x-hardware-key'];
    if (!hardwareKey || !safeCompareKeys(hardwareKey, expectedKey.trim())) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized hardware device request. Invalid hardware secret key.',
      });
    }

    const { employeeCode, timestamp, type } = req.body;
    return await processAttendancePunch({
      employeeCode,
      timestamp,
      type,
      sourceNote: 'Biometric Hardware Sync',
      res,
    });
  } catch (error) {
    console.error('Error in hardwareSync:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process biometric hardware sync.',
      error: error.message,
    });
  }
};

/**
 * Admin-Only Simulate Punch (Development & Staging)
 * POST /api/attendance/simulate-punch
 * Disabled in production unless ALLOW_SIMULATE_PUNCH=true
 */
const simulatePunch = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const allowSimulate = process.env.ALLOW_SIMULATE_PUNCH === 'true';

    if (isProduction && !allowSimulate) {
      return res.status(404).json({
        success: false,
        message: 'Simulate punch endpoint is disabled in production.',
      });
    }

    const { employeeCode, timestamp, type } = req.body;
    return await processAttendancePunch({
      employeeCode,
      timestamp,
      type,
      sourceNote: 'Simulated Admin Punch',
      res,
    });
  } catch (error) {
    console.error('Error in simulatePunch:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to simulate punch.',
      error: error.message,
    });
  }
};

/**
 * Check Simulate Punch Availability Status
 * GET /api/attendance/simulate-punch/status
 */
const getSimulatePunchStatus = async (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const allowSimulate = process.env.ALLOW_SIMULATE_PUNCH === 'true';
  const enabled = !isProduction || allowSimulate;

  return res.status(200).json({
    success: true,
    enabled,
  });
};

/**
 * Get current employee personal logs
 * GET /api/attendance/my-logs
 */
const getMyLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year, limit } = req.query;

    const where = { userId };

    if (month || year) {
      const now = new Date();
      const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth();
      const targetYear = year ? parseInt(year, 10) : now.getFullYear();

      const startDate = new Date(targetYear, targetMonth, 1);
      const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const take = limit ? parseInt(limit, 10) : 100;

    const logs = await prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' },
      take,
    });

    return res.status(200).json({
      success: true,
      data: {
        attendances: logs,
        logs,
      },
    });
  } catch (error) {
    console.error('Error in getMyLogs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve personal attendance logs.',
      error: error.message,
    });
  }
};

/**
 * Get company-wide attendance logs (Admin & HR)
 * GET /api/attendance
 */
const getCompanyAttendance = async (req, res) => {
  try {
    const { date, departmentId, status, page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const whereClause = {
      ...nonDemoRelationWhere,
    };

    if (date) {
      const queryDate = new Date(date);
      const startOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate());
      const endOfDay = new Date(queryDate.getFullYear(), queryDate.getMonth(), queryDate.getDate(), 23, 59, 59, 999);
      whereClause.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (departmentId) {
      whereClause.user = {
        ...whereClause.user,
        profile: {
          departmentId,
        },
      };
    }

    const [total, attendanceRecords] = await Promise.all([
      prisma.attendance.count({ where: whereClause }),
      prisma.attendance.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              employeeCode: true,
              profile: {
                select: {
                  avatarUrl: true,
                  department: {
                    select: { id: true, name: true, code: true },
                  },
                  designation: {
                    select: { id: true, title: true },
                  },
                },
              },
            },
          },
        },
        orderBy: [{ date: 'desc' }, { checkInTime: 'desc' }],
        skip,
        take,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: attendanceRecords,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    console.error('Error in getCompanyAttendance:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve company attendance.',
      error: error.message,
    });
  }
};

/**
 * Admin Action: Batch Punch In All Active Users for Today
 * POST /api/attendance/punch-all-today
 */
const punchAllUsersToday = async (req, res) => {
  try {
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const activeUsers = await prisma.user.findMany({
      where: { isActive: true, ...nonDemoUsersWhere },
      select: { id: true, firstName: true, lastName: true, employeeCode: true },
    });

    const results = [];

    for (const u of activeUsers) {
      const randomOffsetMinutes = Math.floor(Math.random() * 25);
      const checkInTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 55 + randomOffsetMinutes);
      const status = randomOffsetMinutes > 20 ? 'LATE' : 'PRESENT';

      const record = await prisma.attendance.upsert({
        where: {
          userId_date: {
            userId: u.id,
            date: todayDate,
          },
        },
        update: {},
        create: {
          userId: u.id,
          date: todayDate,
          checkInTime,
          status,
          notes: 'Admin Batch Punch-In Simulation',
        },
      });
      results.push({
        id: u.id,
        name: `${u.firstName} ${u.lastName}`,
        employeeCode: u.employeeCode,
        status: record.status,
      });
    }

    cacheService.invalidateTags(['attendance', 'dashboard']);

    return res.status(200).json({
      success: true,
      message: `Successfully registered today's punch-in for ${results.length} active users.`,
      data: {
        date: todayDate.toISOString().split('T')[0],
        totalPunched: results.length,
        users: results,
      },
    });
  } catch (error) {
    console.error('Error in punchAllUsersToday:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to punch in all users for today.',
      error: error.message,
    });
  }
};

/**
 * Employee Self-Service Attendance Punch (Web Clock-In / Clock-Out)
 * POST /api/attendance/punch
 */
const punchSelf = async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;
    let employeeCode = req.user.employeeCode;

    if (!employeeCode) {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { employeeCode: true, isActive: true },
      });
      if (!dbUser || !dbUser.employeeCode) {
        return res.status(400).json({
          success: false,
          message: 'Employee record or employee code not assigned. Please contact HR.',
        });
      }
      employeeCode = dbUser.employeeCode;
    }

    const { type, notes } = req.body;
    const punchType = (type || 'IN').toUpperCase().trim();
    const timestamp = req.body.timestamp || new Date().toISOString();

    return await processAttendancePunch({
      employeeCode,
      timestamp,
      type: punchType,
      sourceNote: notes || 'Web Portal Punch',
      res,
    });
  } catch (error) {
    console.error('Error in punchSelf:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record attendance punch.',
      error: error.message,
    });
  }
};

module.exports = {
  hardwareSync,
  simulatePunch,
  getSimulatePunchStatus,
  getMyLogs,
  getCompanyAttendance,
  punchAllUsersToday,
  punchSelf,
};
