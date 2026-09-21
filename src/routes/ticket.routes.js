const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const {
  getMyTickets,
  getAllTickets,
  getTicketById,
  createTicket,
  addTicketReply,
  updateTicketStatus,
} = require('../controllers/ticket.controller');

router.use(verifyToken);

// Employee Self-Service routes
router.get('/my', getMyTickets);

// General ticket list (role-scoped)
router.get('/', getAllTickets);

// Single ticket details
router.get('/:id', getTicketById);

// Create new support ticket
router.post('/', createTicket);

// Reply to ticket thread
router.post('/:id/replies', addTicketReply);

// Update ticket status
router.patch('/:id/status', updateTicketStatus);

module.exports = router;
