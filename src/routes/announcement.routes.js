const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcement.controller');

router.use(verifyToken);

// All authenticated users can view announcements
router.get('/', getAnnouncements);

// HR and Admins can create, update, and delete announcements
router.post('/', checkRole('ADMIN', 'HR_MANAGER'), createAnnouncement);
router.put('/:id', checkRole('ADMIN', 'HR_MANAGER'), updateAnnouncement);
router.delete('/:id', checkRole('ADMIN', 'HR_MANAGER'), deleteAnnouncement);

module.exports = router;
