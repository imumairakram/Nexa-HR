const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  acknowledgeAnnouncement,
} = require('../controllers/announcement.controller');

router.use(verifyToken);

// All authenticated users can view announcements
router.get('/', cacheService.middleware({ ttlSeconds: 120, tags: ['announcements'] }), getAnnouncements);

// All authenticated employees can acknowledge an announcement
router.post('/:id/acknowledge', acknowledgeAnnouncement);

// HR and Admins can create, update, and delete announcements
router.post('/', checkRole('ADMIN', 'HR_MANAGER'), createAnnouncement);
router.put('/:id', checkRole('ADMIN', 'HR_MANAGER'), updateAnnouncement);
router.delete('/:id', checkRole('ADMIN', 'HR_MANAGER'), deleteAnnouncement);

module.exports = router;
