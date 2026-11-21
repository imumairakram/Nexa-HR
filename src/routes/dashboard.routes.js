const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getEmployeeDashboard,
} = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');

router.use(verifyToken);

const canAccessAdminDashboard = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN');

// Admin / HR Dashboard Portal (Fast 60s cache, auto-invalidated on any mutation)
router.get('/admin', canAccessAdminDashboard, cacheService.middleware({ ttlSeconds: 60, tags: ['dashboard'] }), getAdminDashboard);

// Employee Self-Service Dashboard Portal
router.get('/employee', cacheService.middleware({ ttlSeconds: 60, tags: ['dashboard'] }), getEmployeeDashboard);

module.exports = router;

