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

router.use(verifyToken, requireTenant);

const canManageDepartments = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN');

router.post('/', canManageDepartments, createDepartment);
router.get('/', getDepartments);
router.get('/:id', getDepartmentById);
router.put('/:id', canManageDepartments, updateDepartment);
router.patch('/:id', canManageDepartments, updateDepartment);
router.delete('/:id', canManageDepartments, deleteDepartment);

module.exports = router;

