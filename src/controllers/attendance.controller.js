const prisma = require('../config/prisma');

/**
 * Biometric Hardware Device Attendance Sync Endpoint
 * POST /api/attendance/hardware-sync
 * Security: Validates x-hardware-key header
 */
const hardwareSync = async (req, res) => {
  try {
    const hardwareKey = req.headers['x-hardware-key'];
    const expectedKey = process.env.HARDWARE_SECRET_KEY || 'nexahr_biometric_hardware_secret_2026';

    if (!hardwareKey || hardwareKey !== expectedKey) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized hardware device request. Invalid hardware secret key.',
      });
    }

    const { employeeCode, timestamp, type } = req.body;

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
      // Determine status (Late if after 9:30 AM)
      const currentHour = eventTime.getHours();
      const currentMinute = eventTime.getMinutes();
      let status = 'PRESENT';
      if (currentHour > 9 || (currentHour === 9 && currentMinute > 30)) {
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
          notes: 'Biometric Hardware Sync (Check-In)',
        },
        create: {
          userId: user.id,
          date: todayDate,
          checkInTime: eventTime,
          status,
          notes: 'Biometric Hardware Sync (Check-In)',
        },
      });
    } else if (eventType === 'OUT') {
      // Find today's attendance
      const existing = await prisma.attendance.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: todayDate,
          },
        },
      });

      if (!existing) {
        // If check-out received without prior check-in, set checkInTime = checkOutTime
        attendance = await prisma.attendance.create({
          data: {
            userId: user.id,
            date: todayDate,
            checkInTime: eventTime,
            checkOutTime: eventTime,
            status: 'PRESENT',
            totalHours: 0,
            notes: 'Biometric Hardware Sync (Check-Out without prior Check-In)',
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
            notes: `${existing.notes || ''} (Biometric Check-Out)`.trim(),
          },
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Biometric ${eventType} synced successfully for ${user.firstName} ${user.lastName} (${user.employeeCode}).`,
      data: {
        employee: {
          id: user.id,
          employeeCode: user.employeeCode,
          name: `${user.firstName} ${user.lastName}`,
        },
        attendance,
      },
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
 * Get My Attendance Logs (Employee)
 * GET /api/attendance/my-logs
 */
const getMyLogs = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    const whereClause = { userId };

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
    const { date, status, departmentId } = req.query;

    const targetDate = date ? new Date(date) : new Date();
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    const whereClause = {
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
            employeeCode: true,
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
      orderBy: { checkInTime: 'desc' },
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
      message: 'Failed to fetch attendance overview.',
      error: error.message,
    });
  }
};

module.exports = {
  hardwareSync,
  getMyLogs,
  getCompanyAttendance,
};
