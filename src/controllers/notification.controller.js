const prisma = require('../config/prisma');

/**
 * Get all notifications for the authenticated user
 */
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ userId }, { userId: null }],
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        total: notifications.length,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications.',
      error: error.message,
    });
  }
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    // Ensure the notification belongs to this user or is global
    if (notification.userId && notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this notification.',
      });
    }

    const updated = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: { notification: updated },
    });
  } catch (error) {
    console.error('Error marking notification read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update notification.',
      error: error.message,
    });
  }
};

/**
 * Mark all notifications for the user as read
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    console.error('Error marking all notifications read:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to mark all as read.',
      error: error.message,
    });
  }
};

/**
 * Delete / dismiss a single notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    if (notification.userId && notification.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    await prisma.notification.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: 'Notification dismissed.',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete notification.',
      error: error.message,
    });
  }
};

/**
 * Clear all notifications for the user
 */
const clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;

    await prisma.notification.deleteMany({
      where: { userId },
    });

    return res.status(200).json({
      success: true,
      message: 'All notifications cleared.',
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear notifications.',
      error: error.message,
    });
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
};
