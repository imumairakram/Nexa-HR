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
const cacheService = require('../services/cache.service');

router.use(verifyToken, requireTenant);

const canManagePayroll = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN');

// Salary Structure Configuration
router.post('/salary-structure', canManagePayroll, setSalaryStructure);
router.get('/salary-structure/:userId', cacheService.middleware({ ttlSeconds: 60, tags: ['payroll'] }), getSalaryStructure);

// Monthly Payroll Generation & Admin Directory
router.post('/generate-monthly', canManagePayroll, generateMonthlyPayroll);
router.post('/generate', canManagePayroll, generateMonthlyPayroll);
router.get('/payslips', canManagePayroll, cacheService.middleware({ ttlSeconds: 60, tags: ['payroll'] }), getCompanyPayslips);
router.get('/payslips/:id', canManagePayroll, cacheService.middleware({ ttlSeconds: 60, tags: ['payroll'] }), getCompanyPayslips);
router.put('/payslips/:id/status', canManagePayroll, updatePayslipStatus);
router.patch('/payslips/:id/status', canManagePayroll, updatePayslipStatus);

// Employee Self-Service Payslip Route
router.get('/my-payslips', cacheService.middleware({ ttlSeconds: 60, tags: ['payroll'] }), getMyPayslips);

module.exports = router;

