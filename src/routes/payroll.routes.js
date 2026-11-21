const express = require('express');
const router = express.Router();
const prisma = require('../config/prisma');
const {
  setSalaryStructure,
  getSalaryStructure,
  generateMonthlyPayroll,
  getMyPayslips,
  getCompanyPayslips,
  getPayslipById,
  updatePayslipStatus,
  PAYROLL_ROLES,
} = require('../controllers/payroll.controller');
const { verifyToken, blockDemo } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');

router.use(verifyToken);

const canManagePayroll = checkRole(...PAYROLL_ROLES);

// Route-level authorization: deny-by-default, allow only owner or explicit payroll role
const canReadSalaryStructure = (req, res, next) => {
  const isOwner = req.user?.userId && req.user.userId === req.params.userId;
  const hasPayrollRole = req.user?.role && PAYROLL_ROLES.includes(req.user.role);
  if (!isOwner && !hasPayrollRole) {
    return res.status(403).json({
      success: false,
      code: 'FORBIDDEN_PAYROLL_ACCESS',
      message: 'Access denied: You do not have permission to view this salary structure.',
    });
  }
  next();
};

// Route-level authorization: deny-by-default for individual payslip read
const canReadPayslip = async (req, res, next) => {
  const hasPayrollRole = req.user?.role && PAYROLL_ROLES.includes(req.user.role);
  if (hasPayrollRole) {
    return next();
  }

  try {
    const payslip = await prisma.legacyPayslip.findUnique({
      where: { id: req.params.id },
      select: { userId: true },
    });

    if (!payslip) {
      return res.status(404).json({
        success: false,
        code: 'PAYSLIP_NOT_FOUND',
        message: 'Payslip record not found.',
      });
    }

    if (payslip.userId !== req.user?.userId) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_PAYSLIP_ACCESS',
        message: 'Access denied: You do not have permission to view this payslip.',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Salary Structure Configuration
router.post('/salary-structure', blockDemo, canManagePayroll, setSalaryStructure);
router.get('/salary-structure/:userId', canReadSalaryStructure, cacheService.middleware({ ttlSeconds: 60, tags: ['payroll'] }), getSalaryStructure);

// Monthly Payroll Generation & Admin Directory
router.post('/generate-monthly', blockDemo, canManagePayroll, generateMonthlyPayroll);
router.post('/generate', blockDemo, canManagePayroll, generateMonthlyPayroll);
router.get('/payslips', canManagePayroll, cacheService.middleware({ ttlSeconds: 60, tags: ['payroll'] }), getCompanyPayslips);
router.get('/payslips/:id', canReadPayslip, cacheService.middleware({ ttlSeconds: 60, tags: ['payroll'] }), getPayslipById);
router.put('/payslips/:id/status', blockDemo, canManagePayroll, updatePayslipStatus);
router.patch('/payslips/:id/status', blockDemo, canManagePayroll, updatePayslipStatus);

// Employee Self-Service Payslip Route
router.get('/my-payslips', cacheService.middleware({ ttlSeconds: 60, tags: ['payroll'] }), getMyPayslips);

module.exports = router;
