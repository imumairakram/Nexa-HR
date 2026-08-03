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

// Admin / HR Dashboard Portal
router.get('/admin', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), getAdminDashboard);

// Employee Self-Service Dashboard Portal
router.get('/employee', getEmployeeDashboard);

module.exports = router;
