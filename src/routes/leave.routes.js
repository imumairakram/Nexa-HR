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

router.use(verifyToken, requireTenant);

// Leave Types Configuration (Admin/HR)
router.post('/types', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), createLeaveType);
router.get('/types', getLeaveTypes);

// Employee Leave Application Routes
router.post('/apply', applyLeave);
router.get('/my-requests', getMyLeaveRequests);

// Admin/HR Leave Workflows
router.get('/', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), getCompanyLeaveRequests);
router.put('/:id/status', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), updateLeaveStatus);

module.exports = router;
