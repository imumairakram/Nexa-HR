const express = require('express');
const router = express.Router();
const {
  hardwareSync,
  getMyLogs,
  getCompanyAttendance,
  punchAllUsersToday,
} = require('../controllers/attendance.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');

// Public Biometric Hardware Sync Endpoint (Secured by x-hardware-key)
router.post('/hardware-sync', hardwareSync);

// Employee Self-Service Logs
router.get('/my-logs', verifyToken, cacheService.middleware({ ttlSeconds: 60, tags: ['attendance'] }), getMyLogs);

// Admin/HR Attendance Overview
router.get('/', verifyToken, checkRole('ADMIN', 'HR_MANAGER'), cacheService.middleware({ ttlSeconds: 60, tags: ['attendance'] }), getCompanyAttendance);

// Admin/HR Batch Punch-In All Active Users for Today
router.post('/punch-all-today', verifyToken, checkRole('ADMIN', 'HR_MANAGER'), punchAllUsersToday);

module.exports = router;

