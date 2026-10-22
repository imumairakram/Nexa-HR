const prisma = require('../config/prisma');
const cacheService = require('../services/cache.service');
const {
  createInAppNotification,
  broadcastInAppNotification,
  sendLeaveStatusEmail,
  sendLeaveRequestSubmittedEmail,
} = require('../services/notification.service');

const createLeaveType = async (req, res) => {
  try {
    const { name, code, daysAllowed = 12, isPaid = true, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Leave type name and code are required.',
      });
    }

    const formattedCode = code.toUpperCase().trim();

    const existing = await prisma.leaveType.findUnique({
      where: { code: formattedCode },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Leave type code '${formattedCode}' already exists.`,
      });
    }

    const leaveType = await prisma.leaveType.create({
      data: {
        name: name.trim(),
        code: formattedCode,
        daysAllowed: parseInt(daysAllowed),
        isPaid: Boolean(isPaid),
        description: description ? description.trim() : null,
      },
    });

    cacheService.invalidateTags(['leaves', 'dashboard']);

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

const getLeaveTypes = async (req, res) => {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
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

const applyLeave = async (req, res) => {
  try {
    let targetUserId = req.user.userId;
    const { userId: bodyUserId, employeeId, leaveTypeId, startDate, endDate, reason } = req.body;

    const isElevatedRole = ['ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN'].includes(req.user?.role);
    const requestedTargetId = bodyUserId || employeeId;

    if (isElevatedRole && requestedTargetId) {
      targetUserId = requestedTargetId;
    }

    if (!leaveTypeId || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: leaveTypeId, startDate, endDate, reason.',
      });
    }

    // Resolve target employee record
    let targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        employeeCode: true,
        isActive: true,
      },
    });

    if (!targetUser) {
      targetUser = await prisma.user.findFirst({
        where: {
          OR: [
            { employeeCode: targetUserId },
            { profile: { id: targetUserId } },
          ],
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          employeeCode: true,
          isActive: true,
        },
      });
    }

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: 'Specified employee not found.',
      });
    }

    if (!targetUser.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Cannot record leave for an inactive employee account.',
      });
    }

    targetUserId = targetUser.id;

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

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const leaveType = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
    });

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: 'Specified leave type not found.',
      });
    }

    const overlapping = await prisma.leaveRequest.findFirst({
      where: {
        userId: targetUserId,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
      },
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: targetUserId === req.user.userId
          ? 'You already have an active leave request overlapping with these dates.'
          : `${targetUser.firstName} ${targetUser.lastName} already has an active leave request overlapping with these dates.`,
      });
    }

    const leaveRequest = await prisma.leaveRequest.create({
      data: {
        userId: targetUserId,
        leaveTypeId,
        startDate: start,
        endDate: end,
        totalDays,
        reason: reason.trim(),
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        leaveType: { select: { id: true, name: true, code: true, isPaid: true } },
      },
    });

    // Invalidate caches so the updated requests reflect immediately across the app
    cacheService.invalidateTags(['leaves', 'dashboard']);

    const isSelf = targetUserId === req.user.userId;
    const applicantName = `${targetUser.firstName} ${targetUser.lastName}`;
    const creatorName = req.user?.fullName || 'HR Management';

    if (isSelf) {
      // 1. Notify HR / Admins in-app about new leave request
      await broadcastInAppNotification({
        title: `Leave Request: ${applicantName}`,
        message: `${leaveType.name} application for ${totalDays} day(s) (${startDate} to ${endDate}) submitted for review.`,
        type: 'warning',
        category: 'LEAVE',
        link: '/app/leaves',
        targetRoles: ['ADMIN', 'HR_MANAGER'],
      });

      // 2. Notify Employee in-app that application is recorded
      await createInAppNotification({
        userId: targetUserId,
        title: `Leave Application Submitted`,
        message: `Your ${leaveType.name} request for ${totalDays} day(s) has been submitted for management review.`,
        type: 'info',
        category: 'LEAVE',
        link: '/employee/leaves',
      });

      // 3. Dispatch Email to HR administrators
      const hrAdmins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'HR_MANAGER'] }, isActive: true },
        select: { email: true },
      });
      const adminEmails = hrAdmins.map((a) => a.email);

      await sendLeaveRequestSubmittedEmail({
        adminEmails,
        employeeName: applicantName,
        employeeCode: targetUser.email || targetUser.employeeCode,
        leaveType: leaveType.name,
        startDate: start,
        endDate: end,
        totalDays,
        reason: reason.trim(),
      });
    } else {
      // HR/Admin applied on behalf of employee
      await broadcastInAppNotification({
        title: `Leave Entry: ${applicantName}`,
        message: `${creatorName} recorded a ${leaveType.name} request (${totalDays} day(s)) on behalf of ${applicantName}.`,
        type: 'info',
        category: 'LEAVE',
        link: '/app/leaves',
        targetRoles: ['ADMIN', 'HR_MANAGER'],
      });

      await createInAppNotification({
        userId: targetUserId,
        title: `Leave Application Submitted by HR`,
        message: `A ${leaveType.name} request for ${totalDays} day(s) was entered on your behalf by ${creatorName}.`,
        type: 'info',
        category: 'LEAVE',
        link: '/employee/leaves',
      });
    }

    return res.status(201).json({
      success: true,
      message: `Leave application submitted for ${applicantName} (${totalDays} day(s)).`,
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

const getMyLeaveRequests = async (req, res) => {
  try {
    const userId = req.user.userId;

    const requests = await prisma.leaveRequest.findMany({
      where: { userId },
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
      message: 'Failed to fetch leave history.',
      error: error.message,
    });
  }
};

const getCompanyLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const whereClause = {};
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

const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const approverId = req.user.userId;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'APPROVED' or 'REJECTED'.",
      });
    }

    const leaveRequest = await prisma.leaveRequest.findUnique({ where: { id } });
    if (!leaveRequest) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
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

    // 1. Trigger In-App Notification for the employee
    const isApproved = status === 'APPROVED';
    const notifTitle = isApproved ? 'Leave Request Approved' : 'Leave Request Declined';
    const notifMsg = isApproved
      ? `Your ${updated.leaveType.name} request for ${leaveRequest.totalDays} day(s) has been approved by HR.`
      : `Your ${updated.leaveType.name} request was rejected.${rejectionReason ? ` Reason: ${rejectionReason.trim()}` : ''}`;

    await createInAppNotification({
      userId: leaveRequest.userId,
      title: notifTitle,
      message: notifMsg,
      type: isApproved ? 'success' : 'warning',
      category: 'LEAVE',
      link: '/employee/leaves',
    });

    // 2. Dispatch Corporate Email Notification to employee
    if (updated.user?.email) {
      await sendLeaveStatusEmail({
        email: updated.user.email,
        name: `${updated.user.firstName} ${updated.user.lastName}`,
        leaveType: updated.leaveType.name,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        totalDays: leaveRequest.totalDays,
        status,
        rejectionReason,
      });
    }

    cacheService.invalidateTags(['leaves', 'dashboard']);

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
