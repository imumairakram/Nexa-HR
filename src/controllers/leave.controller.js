const prisma = require('../config/prisma');

/**
 * Create Leave Type (Admin/HR)
 * POST /api/leaves/types
 */
const createLeaveType = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, code, daysAllowed = 12, isPaid = true } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Leave type name and code are required.',
      });
    }

    const formattedCode = code.toUpperCase().trim();

    const existing = await prisma.leaveType.findUnique({
      where: {
        tenantId_code: {
          tenantId,
          code: formattedCode,
        },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Leave type code '${formattedCode}' already exists in your company.`,
      });
    }

    const leaveType = await prisma.leaveType.create({
      data: {
        tenantId,
        name: name.trim(),
        code: formattedCode,
        daysAllowed: parseInt(daysAllowed),
        isPaid: Boolean(isPaid),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Leave type policy created successfully.',
      data: { leaveType },
    });
  } catch (error) {
    console.error('Error in createLeaveType:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create leave type.',
      error: error.message,
    });
  }
};

/**
 * Get Leave Types for Tenant
 * GET /api/leaves/types
 */
const getLeaveTypes = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const leaveTypes = await prisma.leaveType.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({
      success: true,
      data: { leaveTypes },
    });
  } catch (error) {
    console.error('Error in getLeaveTypes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch leave types.',
      error: error.message,
    });
  }
};

/**
 * Apply for Leave (Employee)
 * POST /api/leaves/apply
 */
const applyLeave = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;
    const { leaveTypeId, startDate, endDate, reason } = req.body;

    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: leaveTypeId, startDate, endDate, reason.',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid startDate or endDate format.',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be prior to start date.',
      });
    }

    // Calculate total days inclusive
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check valid leave type
    const leaveType = await prisma.leaveType.findFirst({
      where: { id: leaveTypeId, tenantId },
    });

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Specified leave type not found.',
      });
    }

    // Check for overlapping pending or approved leave requests
    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        tenantId,
        userId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          { startDate: { lte: end }, endDate: { gte: start } },
        ],
      },
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active leave request overlapping with these dates.',
      });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        tenantId,
        userId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        totalDays,
        reason: reason.trim(),
        status: 'PENDING',
      },
      include: {
        leaveType: { select: { id: true, name: true, code: true, isPaid: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: `Leave application submitted for ${totalDays} day(s).`,
      data: { leaveRequest },
    });
  } catch (error) {
    console.error('Error in applyLeave:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit leave application.',
      error: error.message,
    });
  }
};

/**
 * Get My Leave Requests (Employee)
 * GET /api/leaves/my-requests
 */
const getMyLeaveRequests = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;

    const requests = await prisma.leaveRequest.findMany({
      where: { tenantId, userId },
      include: {
        leaveType: { select: { name: true, code: true, isPaid: true } },
        approvedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { leaveRequests: requests },
    });
  } catch (error) {
    console.error('Error in getMyLeaveRequests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch personal leave history.',
      error: error.message,
    });
  }
};

/**
 * Get Company Leave Requests (Admin/HR)
 * GET /api/leaves
 */
const getCompanyLeaveRequests = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { status } = req.query;

    const whereClause = { tenantId };
    if (status) {
      whereClause.status = status;
    }

    const requests = await prisma.leaveRequest.findMany({
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
                department: { select: { name: true } },
                designation: { select: { title: true } },
              },
            },
          },
        },
        leaveType: { select: { name: true, code: true, isPaid: true } },
        approvedBy: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({
      success: true,
      data: { leaveRequests: requests },
    });
  } catch (error) {
    console.error('Error in getCompanyLeaveRequests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch company leave requests.',
      error: error.message,
    });
  }
};

/**
 * Approve or Reject Leave Request (Admin/HR)
 * PUT /api/leaves/:id/status
 */
const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const tenantId = req.tenantId;
    const approverId = req.user.userId;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'APPROVED' or 'REJECTED'.",
      });
    }

    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: { id, tenantId },
    });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found.',
      });
    }

    if (leaveRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Leave request has already been ${leaveRequest.status.toLowerCase()}.`,
      });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedById: approverId,
        rejectionReason: status === 'REJECTED' && rejectionReason ? rejectionReason.trim() : null,
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        leaveType: { select: { name: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()}.`,
      data: { leaveRequest: updated },
    });
  } catch (error) {
    console.error('Error in updateLeaveStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update leave request status.',
      error: error.message,
    });
  }
};

module.exports = {
  createLeaveType,
  getLeaveTypes,
  applyLeave,
  getMyLeaveRequests,
  getCompanyLeaveRequests,
  updateLeaveStatus,
};
