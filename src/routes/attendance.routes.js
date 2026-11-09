const express = require('express');
const router = express.Router();
const {
  hardwareSync,
  simulatePunch,
  getSimulatePunchStatus,
  getMyLogs,
  getCompanyAttendance,
  punchAllUsersToday,
  punchSelf,
} = require('../controllers/attendance.controller');
const { verifyToken, blockDemo } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const { hardwareSyncRateLimiter } = require('../middlewares/rateLimiter.middleware');
const cacheService = require('../services/cache.service');

// Biometric Hardware Device Punch Sync (Protected by hardware secret key + dedicated rate limiter)
router.post('/hardware-sync', hardwareSyncRateLimiter, hardwareSync);

// Admin-Only Simulate Punch (Development & Staging; Disabled in Production unless ALLOW_SIMULATE_PUNCH=true)
router.get('/simulate-punch/status', verifyToken, checkRole('ADMIN'), getSimulatePunchStatus);
router.post('/simulate-punch', verifyToken, checkRole('ADMIN'), blockDemo, simulatePunch);

// Employee Self-Service Logs & Direct Punch
router.get('/my-logs', verifyToken, cacheService.middleware({ ttlSeconds: 60, tags: ['attendance'] }), getMyLogs);
router.post('/punch', verifyToken, punchSelf);

// Admin/HR Attendance Overview
router.get('/', verifyToken, checkRole('ADMIN', 'HR_MANAGER'), cacheService.middleware({ ttlSeconds: 60, tags: ['attendance'] }), getCompanyAttendance);

// Admin/HR Batch Punch-In All Active Users for Today
router.post('/punch-all-today', verifyToken, checkRole('ADMIN', 'HR_MANAGER'), blockDemo, punchAllUsersToday);

module.exports = router;
