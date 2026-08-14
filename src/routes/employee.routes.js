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

const canManageEmployees = checkRole('ADMIN', 'HR_MANAGER', 'COMPANY_ADMIN', 'SUPER_ADMIN');

router.post('/', canManageEmployees, onboardEmployee);
router.post('/onboard', canManageEmployees, onboardEmployee);
router.get('/', canManageEmployees, getEmployees);
router.get('/:id', getEmployeeById);
router.put('/:id', canManageEmployees, updateEmployee);
router.patch('/:id', canManageEmployees, updateEmployee);

module.exports = router;

