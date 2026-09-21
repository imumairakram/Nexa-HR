const prisma = require('../config/prisma');
const { createInAppNotification } = require('../services/notification.service');

const CATEGORY_LABELS = {
  IT_HARDWARE: 'IT & Equipment',
  PAYROLL: 'Payroll & Tax',
  BENEFITS: 'Benefits & Insurance',
  WORKPLACE: 'Workplace & Admin',
  GENERAL_HR: 'General HR',
};

/**
 * Helper to generate a unique ticket number like TICK-8021
 */
async function generateUniqueTicketNumber() {
  for (let i = 0; i < 10; i++) {
    const num = Math.floor(1000 + Math.random() * 9000);
    const candidate = `TICK-${num}`;
    const exists = await prisma.ticket.findUnique({
      where: { ticketNumber: candidate },
    });
    if (!exists) return candidate;
  }
  return `TICK-${Date.now().toString().slice(-6)}`;
}

/**
 * Format ticket object for client consumption
 */
function formatTicket(ticket, currentUserId) {
  const isOwner = ticket.userId === currentUserId;
  const userFullName = ticket.user
    ? `${ticket.user.firstName} ${ticket.user.lastName}`
    : 'Unknown User';

  const formattedReplies = (ticket.replies || []).map((rep) => {
    const isMe = rep.userId === currentUserId;
    const senderName = rep.user
      ? isMe
        ? `${rep.user.firstName} ${rep.user.lastName} (You)`
        : `${rep.user.firstName} ${rep.user.lastName} (${rep.user.role === 'ADMIN' || rep.user.role === 'HR_MANAGER' ? 'Support Lead' : 'Staff'})`
      : isMe
      ? 'You'
      : 'Support Specialist';

    return {
      id: rep.id,
      userId: rep.userId,
      sender: senderName,
      time: rep.createdAt,
      message: rep.message,
      user: rep.user
        ? {
            id: rep.user.id,
            firstName: rep.user.firstName,
            lastName: rep.user.lastName,
            role: rep.user.role,
            avatarUrl: rep.user.profile?.avatarUrl,
          }
        : null,
    };
  });

  return {
    id: ticket.ticketNumber,
    dbId: ticket.id,
    userId: ticket.userId,
    userName: userFullName,
    userEmail: ticket.user?.email,
    userAvatar: ticket.user?.profile?.avatarUrl,
    subject: ticket.subject,
    category: ticket.category,
    categoryLabel: CATEGORY_LABELS[ticket.category] || ticket.category,
    priority: ticket.priority,
    status: ticket.status,
    assignedTo: ticket.assignedTo || 'NexaHR Support Team',
    description: ticket.description,
    createdDate: ticket.createdAt,
    lastUpdated: ticket.updatedAt,
    replies: formattedReplies,
  };
}

/**
 * Get all tickets for the authenticated employee
 */
const getMyTickets = async (req, res) => {
  try {
    const { userId } = req.user;
    const { category, status, search } = req.query;

    const where = { userId };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                profile: {
                  select: { avatarUrl: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = tickets.map((t) => formatTicket(t, userId));

    return res.status(200).json({
      success: true,
      data: {
        tickets: formatted,
        total: formatted.length,
      },
    });
  } catch (error) {
    console.error('Error fetching employee tickets:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch support tickets.',
      error: error.message,
    });
  }
};

/**
 * Get all tickets across company (for HR / Admin management)
 */
const getAllTickets = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const { category, status, search } = req.query;

    const where = {};

    // If regular employee somehow called this, limit to their own tickets
    if (role === 'EMPLOYEE') {
      where.userId = userId;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { assignedTo: { contains: search, mode: 'insensitive' } },
      ];
    }

    const tickets = await prisma.ticket.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                profile: {
                  select: { avatarUrl: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const formatted = tickets.map((t) => formatTicket(t, userId));

    return res.status(200).json({
      success: true,
      data: {
        tickets: formatted,
        total: formatted.length,
      },
    });
  } catch (error) {
    console.error('Error fetching all tickets:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch tickets.',
      error: error.message,
    });
  }
};

/**
 * Get ticket details by ID or ticketNumber
 */
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                profile: {
                  select: { avatarUrl: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Permission check
    if (role === 'EMPLOYEE' && ticket.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this ticket.',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatTicket(ticket, userId),
    });
  } catch (error) {
    console.error('Error fetching ticket details:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch ticket details.',
      error: error.message,
    });
  }
};

/**
 * Create a new support ticket
 */
const createTicket = async (req, res) => {
  try {
    const { userId } = req.user;
    const { subject, category, priority, description } = req.body;

    if (!subject || !subject.trim() || !description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject and description are required.',
      });
    }

    const ticketNumber = await generateUniqueTicketNumber();

    const newTicket = await prisma.ticket.create({
      data: {
        ticketNumber,
        userId,
        subject: subject.trim(),
        category: category || 'IT_HARDWARE',
        priority: priority || 'MEDIUM',
        status: 'IN_PROGRESS',
        assignedTo: 'NexaHR Support Team',
        description: description.trim(),
        replies: {
          create: {
            userId,
            message: description.trim(),
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                profile: {
                  select: { avatarUrl: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Send confirmation in-app notification to the employee
    try {
      await createInAppNotification({
        userId,
        title: `Support Ticket #${ticketNumber} Created`,
        message: `Your ticket regarding "${subject.trim()}" has been routed to the Operations team.`,
        type: 'info',
        category: 'GENERAL',
        link: '/employee/helpdesk',
      });
    } catch (notifErr) {
      console.warn('Could not dispatch ticket notification:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: `Support Ticket #${ticketNumber} created successfully.`,
      data: formatTicket(newTicket, userId),
    });
  } catch (error) {
    console.error('Error creating ticket:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create support ticket.',
      error: error.message,
    });
  }
};

/**
 * Add a reply message to a ticket conversation thread
 */
const addTicketReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, fullName, role } = req.user;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Reply message cannot be empty.',
      });
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }],
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Permission check
    if (role === 'EMPLOYEE' && ticket.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to reply to this ticket.',
      });
    }

    // Create reply and bump ticket updatedAt
    const reply = await prisma.ticketReply.create({
      data: {
        ticketId: ticket.id,
        userId,
        message: message.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
      },
    });

    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { updatedAt: new Date() },
    });

    // If admin/support replies, notify the ticket owner
    if (ticket.userId !== userId) {
      try {
        await createInAppNotification({
          userId: ticket.userId,
          title: `New Reply on Ticket #${ticket.ticketNumber}`,
          message: `${fullName} posted a reply on: "${ticket.subject}"`,
          type: 'info',
          category: 'GENERAL',
          link: '/employee/helpdesk',
        });
      } catch (notifErr) {
        console.warn('Could not dispatch reply notification:', notifErr.message);
      }
    }

    const isMe = reply.userId === userId;
    const senderName = isMe
      ? `${reply.user.firstName} ${reply.user.lastName} (You)`
      : `${reply.user.firstName} ${reply.user.lastName}`;

    return res.status(201).json({
      success: true,
      message: 'Reply posted successfully.',
      data: {
        id: reply.id,
        userId: reply.userId,
        sender: senderName,
        time: reply.createdAt,
        message: reply.message,
        user: {
          id: reply.user.id,
          firstName: reply.user.firstName,
          lastName: reply.user.lastName,
          role: reply.user.role,
          avatarUrl: reply.user.profile?.avatarUrl,
        },
      },
    });
  } catch (error) {
    console.error('Error adding ticket reply:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to post reply.',
      error: error.message,
    });
  }
};

/**
 * Update ticket status (e.g. RESOLVED / IN_PROGRESS / OPEN / CLOSED)
 */
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required.',
      });
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        OR: [{ id }, { ticketNumber: id }],
      },
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.',
      });
    }

    // Regular employee can only toggle their own ticket between RESOLVED and IN_PROGRESS
    if (role === 'EMPLOYEE' && ticket.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this ticket status.',
      });
    }

    const updated = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            profile: {
              select: { avatarUrl: true },
            },
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                role: true,
                profile: {
                  select: { avatarUrl: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    // Notify ticket owner if updated by someone else
    if (ticket.userId !== userId) {
      try {
        await createInAppNotification({
          userId: ticket.userId,
          title: `Ticket #${ticket.ticketNumber} Status: ${status}`,
          message: `Your ticket status has been changed to ${status}.`,
          type: status === 'RESOLVED' ? 'success' : 'info',
          category: 'GENERAL',
          link: '/employee/helpdesk',
        });
      } catch (notifErr) {
        console.warn('Could not dispatch status change notification:', notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Ticket status updated to ${status}.`,
      data: formatTicket(updated, userId),
    });
  } catch (error) {
    console.error('Error updating ticket status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update ticket status.',
      error: error.message,
    });
  }
};

module.exports = {
  getMyTickets,
  getAllTickets,
  getTicketById,
  createTicket,
  addTicketReply,
  updateTicketStatus,
};
