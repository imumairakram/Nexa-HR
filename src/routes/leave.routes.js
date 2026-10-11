const express = require('express');
const router = express.Router();
const {
  createLeaveType,
  getLeaveTypes,
  applyLeave,
  getMyLeaveRequests,
  getCompanyLeaveRequests,
  updateLeaveStatus,
} = require('../controllers/leave.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');

router.use(verifyToken, requireTenant);

const canManageLeaves = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN');

// Leave Types Configuration (Admin/HR)
router.post('/types', canManageLeaves, createLeaveType);
router.get('/types', cacheService.middleware({ ttlSeconds: 120, tags: ['leaves'] }), getLeaveTypes);

// Employee Leave Application Routes
router.post('/apply', applyLeave);
router.post('/request', applyLeave);
router.get('/my-requests', cacheService.middleware({ ttlSeconds: 60, tags: ['leaves'] }), getMyLeaveRequests);

// Admin/HR Leave Workflows
router.get('/', canManageLeaves, cacheService.middleware({ ttlSeconds: 60, tags: ['leaves'] }), getCompanyLeaveRequests);
router.get('/requests', canManageLeaves, cacheService.middleware({ ttlSeconds: 60, tags: ['leaves'] }), getCompanyLeaveRequests);
router.put('/:id/status', canManageLeaves, updateLeaveStatus);
router.patch('/:id/status', canManageLeaves, updateLeaveStatus);
router.patch('/requests/:id/status', canManageLeaves, updateLeaveStatus);

module.exports = router;

