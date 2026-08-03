const express = require('express');
const router = express.Router();
const {
  onboardEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
} = require('../controllers/employee.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

router.use(verifyToken, requireTenant);

router.post('/', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), onboardEmployee);
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), updateEmployee);

module.exports = router;
