const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getMyLogs,
  getCompanyAttendance,
} = require('../controllers/attendance.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

router.use(verifyToken, requireTenant);

// Employee Self-Service Attendance Routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-logs', getMyLogs);

// Admin/HR Attendance Overview
router.get('/', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), getCompanyAttendance);

module.exports = router;
