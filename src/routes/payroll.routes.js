const express = require('express');
const router = express.Router();
const {
  setSalaryStructure,
  getSalaryStructure,
  generateMonthlyPayroll,
  getMyPayslips,
  getCompanyPayslips,
  updatePayslipStatus,
} = require('../controllers/payroll.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

router.use(verifyToken, requireTenant);

// Salary Structure Configuration
router.post('/salary-structure', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), setSalaryStructure);
router.get('/salary-structure/:userId', getSalaryStructure);

// Monthly Payroll Generation & Admin Directory
router.post('/generate-monthly', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), generateMonthlyPayroll);
router.get('/payslips', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), getCompanyPayslips);
router.put('/payslips/:id/status', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), updatePayslipStatus);

// Employee Self-Service Payslip Route
router.get('/my-payslips', getMyPayslips);

module.exports = router;
