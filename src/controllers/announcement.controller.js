const prisma = require('../config/prisma');
const cacheService = require('../services/cache.service');
const {
  broadcastInAppNotification,
  sendAnnouncementEmail,
} = require('../services/notification.service');
const { nonDemoUsersWhere } = require('../utils/userFilters');

/**
 * Fetch all announcements (accessible by both HR & Employees)
 */
const getAnnouncements = async (req, res) => {
  try {
    const { category, search } = req.query;

    const where = {};
    if (category && category !== 'ALL') {
      if (category === 'PINNED') {
        where.pinned = true;
      } else {
        where.category = category;
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { summary: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { department: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [totalStaff, announcements] = await Promise.all([
      prisma.user.count({
        where: { isActive: true, ...nonDemoUsersWhere },
      }),
      prisma.announcement.findMany({
        where,
        include: {
          acknowledgments: {
            select: {
              userId: true,
              acknowledgedAt: true,
            },
          },
        },
        orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
      }),
    ]);

    const currentUserId = req.user?.id || req.user?.userId;

    const formattedAnnouncements = announcements.map((item) => {
      const acks = item.acknowledgments || [];
      const acknowledgedCount = acks.length;
      const hasAcknowledged = currentUserId ? acks.some((ack) => ack.userId === currentUserId) : false;

      return {
        id: item.id,
        title: item.title,
        category: item.category,
        priority: item.priority,
        department: item.department,
        summary: item.summary,
        content: item.content,
        author: item.author,
        pinned: item.pinned,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        acknowledgedCount,
        hasAcknowledged,
        acknowledged: hasAcknowledged,
        totalTargetCount: totalStaff,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        announcements: formattedAnnouncements,
        total: formattedAnnouncements.length,
        totalStaff,
      },
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch announcements.',
      error: error.message,
    });
  }
};

/**
 * Create a new announcement and broadcast multi-channel notifications (In-App + Email)
 */
const createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      category = 'EVENTS',
      priority = 'HIGH',
      department = 'Company-Wide (All Offices)',
      summary = '',
      content,
      pinned = false,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Announcement title and content body are required.',
      });
    }

    const author = req.user?.fullName || 'People Operations & HR';

    const announcement = await prisma.announcement.create({
      data: {
        title: title.trim(),
        category,
        priority,
        department: department.trim(),
        summary: summary.trim() || content.trim().slice(0, 140) + '...',
        content: content.trim(),
        author,
        pinned: Boolean(pinned),
      },
    });

    // 1. Trigger In-App Notification Broadcast to all active users
    const notifType = priority === 'HIGH' ? 'warning' : 'info';
    await broadcastInAppNotification({
      title: `Announcement: ${title.trim()}`,
      message: summary.trim() || content.trim().slice(0, 120),
      type: notifType,
      category: 'ANNOUNCEMENT',
      link: '/employee/announcements',
    });

    // 2. Fetch all active employee emails and dispatch Corporate Email Broadcast
    const activeEmployees = await prisma.user.findMany({
      where: { isActive: true, ...nonDemoUsersWhere },
      select: { email: true, firstName: true, lastName: true },
    });

    await sendAnnouncementEmail({
      recipients: activeEmployees,
      announcement,
    });

    cacheService.invalidateTags(['announcements']);

    return res.status(201).json({
      success: true,
      message: 'Announcement published! Notifications and emails broadcasted to all employees.',
      data: {
        announcement,
        broadcastSummary: {
          inAppNotificationsCreated: activeEmployees.length,
          emailsDispatched: activeEmployees.length,
        },
      },
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to publish announcement.',
      error: error.message,
    });
  }
};

/**
 * Update an announcement (e.g. pin/unpin or edit content)
 */
const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category, priority, department, summary, content, pinned } = req.body;

    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (category !== undefined) data.category = category;
    if (priority !== undefined) data.priority = priority;
    if (department !== undefined) data.department = department.trim();
    if (summary !== undefined) data.summary = summary.trim();
    if (content !== undefined) data.content = content.trim();
    if (pinned !== undefined) data.pinned = Boolean(pinned);

    const updated = await prisma.announcement.update({
      where: { id },
      data,
    });

    cacheService.invalidateTags(['announcements']);

    return res.status(200).json({
      success: true,
      message: 'Announcement updated successfully.',
      data: { announcement: updated },
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update announcement.',
      error: error.message,
    });
  }
};

/**
 * Delete an announcement
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    await prisma.announcement.delete({
      where: { id },
    });

    cacheService.invalidateTags(['announcements']);

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted successfully.',
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete announcement.',
      error: error.message,
    });
  }
};

/**
 * Toggle acknowledgment of an announcement by the authenticated employee
 */
const acknowledgeAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required to acknowledge notice.',
      });
    }

    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return res.status(404).json({
        success: false,
        message: 'Announcement not found.',
      });
    }

    const existingAck = await prisma.announcementAcknowledgment.findUnique({
      where: {
        announcementId_userId: {
          announcementId: id,
          userId,
        },
      },
    });

    let acknowledged = false;
    if (existingAck) {
      await prisma.announcementAcknowledgment.delete({
        where: { id: existingAck.id },
      });
      acknowledged = false;
    } else {
      await prisma.announcementAcknowledgment.create({
        data: {
          announcementId: id,
          userId,
        },
      });
      acknowledged = true;
    }

    const [acknowledgedCount, totalStaff] = await Promise.all([
      prisma.announcementAcknowledgment.count({
        where: { announcementId: id },
      }),
      prisma.user.count({
        where: { isActive: true, ...nonDemoUsersWhere },
      }),
    ]);

    // Invalidate cached announcements so fresh acknowledgement counts are returned
    cacheService.invalidateTags(['announcements']);

    return res.status(200).json({
      success: true,
      message: acknowledged
        ? 'Circular officially acknowledged and verified in HR records.'
        : 'Acknowledgment status revoked.',
      data: {
        announcementId: id,
        acknowledged,
        acknowledgedCount,
        totalTargetCount: totalStaff,
      },
    });
  } catch (error) {
    console.error('Error acknowledging announcement:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update acknowledgment status.',
      error: error.message,
    });
  }
};

module.exports = {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  acknowledgeAnnouncement,
};
