const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');
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
router.get('/my', cacheService.middleware({ ttlSeconds: 60, tags: ['tickets'] }), getMyTickets);

// General ticket list (role-scoped)
router.get('/', cacheService.middleware({ ttlSeconds: 60, tags: ['tickets'] }), getAllTickets);

// Single ticket details
router.get('/:id', cacheService.middleware({ ttlSeconds: 60, tags: ['tickets'] }), getTicketById);

// Create new support ticket
router.post('/', createTicket);

// Reply to ticket thread
router.post('/:id/replies', addTicketReply);

// Update ticket status
router.patch('/:id/status', updateTicketStatus);

module.exports = router;
