const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getEmployeeDashboard,
} = require('../controllers/dashboard.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

router.use(verifyToken, requireTenant);

const canAccessAdminDashboard = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN');

// Admin / HR Dashboard Portal
router.get('/admin', canAccessAdminDashboard, getAdminDashboard);

// Employee Self-Service Dashboard Portal
router.get('/employee', getEmployeeDashboard);

module.exports = router;

