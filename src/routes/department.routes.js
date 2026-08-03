const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

// Apply Auth and Tenant Isolation middlewares to all routes
router.use(verifyToken, requireTenant);

router.post('/', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), createDepartment);
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.put('/:id', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), updateDepartment);
router.delete('/:id', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), deleteDepartment);

module.exports = router;
