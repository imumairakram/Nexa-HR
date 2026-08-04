const express = require('express');
const router = express.Router();
const {
  hardwareSync,
  getMyLogs,
  getCompanyAttendance,
} = require('../controllers/attendance.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

// Public Biometric Hardware Sync Endpoint (Secured by x-hardware-key)
router.post('/hardware-sync', hardwareSync);

// Employee Self-Service Logs
router.get('/my-logs', verifyToken, getMyLogs);

// Admin/HR Attendance Overview
router.get('/', verifyToken, checkRole('ADMIN', 'HR_MANAGER'), getCompanyAttendance);

module.exports = router;
