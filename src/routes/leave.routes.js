const express = require('express');
const router = express.Router();
const {
  createLeaveType,
  getLeaveTypes,
  getLeaveTypeById,
  updateLeaveType,
  deleteLeaveType,
  applyLeave,
  getMyLeaveRequests,
  getCompanyLeaveRequests,
  updateLeaveStatus,
} = require('../controllers/leave.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');

router.use(verifyToken);

const canManageLeaves = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN');

// Smart handler for requests: managers get full company leave requests; employees get their personal leave requests
const handleGetLeaveRequests = (req, res, next) => {
  const isElevatedRole = ['ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'].includes(req.user?.role);
  if (isElevatedRole && req.query.mine !== 'true') {
    return getCompanyLeaveRequests(req, res, next);
  }
  return getMyLeaveRequests(req, res, next);
};

// Leave Types Configuration (Admin/HR)
router.post('/types', canManageLeaves, createLeaveType);
router.get('/types', cacheService.middleware({ ttlSeconds: 120, tags: ['leaves'] }), getLeaveTypes);
router.get('/types/:id', canManageLeaves, getLeaveTypeById);
router.put('/types/:id', canManageLeaves, updateLeaveType);
router.patch('/types/:id', canManageLeaves, updateLeaveType);
router.delete('/types/:id', canManageLeaves, deleteLeaveType);

// Employee Leave Application Routes
router.post('/apply', applyLeave);
router.post('/request', applyLeave);
router.get('/my-requests', cacheService.middleware({ ttlSeconds: 60, tags: ['leaves'] }), getMyLeaveRequests);

// Dynamic Leave Workflows (Smart role dispatch)
router.get('/', cacheService.middleware({ ttlSeconds: 60, tags: ['leaves'] }), handleGetLeaveRequests);
router.get('/requests', cacheService.middleware({ ttlSeconds: 60, tags: ['leaves'] }), handleGetLeaveRequests);
router.put('/:id/status', canManageLeaves, updateLeaveStatus);
router.patch('/:id/status', canManageLeaves, updateLeaveStatus);
router.patch('/requests/:id/status', canManageLeaves, updateLeaveStatus);

module.exports = router;

