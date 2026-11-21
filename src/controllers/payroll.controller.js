const prisma = require('../config/prisma');
const { calculateEmployeePayroll } = require('../services/payroll.service');
const { nonDemoUsersWhere, nonDemoRelationWhere } = require('../utils/userFilters');
const {
  createInAppNotification,
  sendPayslipEmail,
} = require('../services/notification.service');
const cacheService = require('../services/cache.service');

const PAYROLL_ROLES = ['ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'PAYROLL_ADMIN', 'PAYROLL_APPROVER'];
const activePayrollRuns = new Set();

const setSalaryStructure = async (req, res) => {
  try {
    const {
      userId,
      basicSalary,
      housingAllowance = 0,
      transportAllowance = 0,
      otherAllowances = 0,
      taxDeductions = 0,
      otherDeductions = 0,
    } = req.body;

    if (!userId || basicSalary === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Required fields: userId and basicSalary.',
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.deletedAt) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const structure = await prisma.salaryStructure.upsert({
      where: { userId },
      update: {
        basicSalary: parseFloat(basicSalary),
        housingAllowance: parseFloat(housingAllowance),
        transportAllowance: parseFloat(transportAllowance),
        otherAllowances: parseFloat(otherAllowances),
        taxDeductions: parseFloat(taxDeductions),
        otherDeductions: parseFloat(otherDeductions),
        effectiveDate: new Date(),
      },
      create: {
        userId,
        basicSalary: parseFloat(basicSalary),
        housingAllowance: parseFloat(housingAllowance),
        transportAllowance: parseFloat(transportAllowance),
        otherAllowances: parseFloat(otherAllowances),
        taxDeductions: parseFloat(taxDeductions),
        otherDeductions: parseFloat(otherDeductions),
      },
    });

    cacheService.invalidateTags(['payroll', 'dashboard']);

    return res.status(200).json({
      success: true,
      message: 'Employee salary structure updated successfully.',
      data: { salaryStructure: structure },
    });
  } catch (error) {
    console.error('Error in setSalaryStructure:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to configure salary structure.',
      error: error.message,
    });
  }
};

const getSalaryStructure = async (req, res) => {
  try {
    const { userId } = req.params;

    const isOwner = req.user?.userId && req.user.userId === userId;
    const hasPayrollAccess = req.user?.role && PAYROLL_ROLES.includes(req.user.role);

    if (!isOwner && !hasPayrollAccess) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_PAYROLL_ACCESS',
        message: 'Access denied: You do not have permission to view this salary structure.',
      });
    }

    const structure = await prisma.salaryStructure.findUnique({
      where: { userId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, deletedAt: true } },
      },
    });

    if (!structure || structure.user?.deletedAt) {
      return res.status(404).json({
        success: false,
        message: 'Salary structure not configured for this employee.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { salaryStructure: structure },
    });
  } catch (error) {
    console.error('Error in getSalaryStructure:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch salary structure.',
      error: error.message,
    });
  }
};

const generateMonthlyPayroll = async (req, res) => {
  const { month, year } = req.body;

  if (!month || !year) {
    return res.status(400).json({
      success: false,
      message: 'Please specify month (1-12) and year.',
    });
  }

  const parsedMonth = parseInt(month, 10);
  const parsedYear = parseInt(year, 10);

  if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12 || isNaN(parsedYear) || parsedYear < 2000) {
    return res.status(400).json({
      success: false,
      message: 'Invalid month (1-12) or year.',
    });
  }

  const runKey = `${parsedYear}-${parsedMonth}`;
  if (activePayrollRuns.has(runKey)) {
    return res.status(409).json({
      success: false,
      code: 'PAYROLL_RUN_IN_PROGRESS',
      message: `A payroll generation run for ${parsedMonth}/${parsedYear} is currently in progress. Please wait for the current batch to complete.`,
    });
  }

  activePayrollRuns.add(runKey);

  try {
    const employees = await prisma.user.findMany({
      where: {
        isActive: true,
        deletedAt: null,
        ...nonDemoUsersWhere,
        salaryStructure: { isNot: null },
      },
      select: { id: true },
    });

    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active employees with configured salary structures found.',
      });
    }

    // Query existing payslips for the given period to protect immutable PAID payslips
    const existingPayslips = await prisma.legacyPayslip.findMany({
      where: {
        month: parsedMonth,
        year: parsedYear,
      },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    const paidUserIds = new Set(
      existingPayslips.filter((p) => p.status === 'PAID').map((p) => p.userId)
    );

    const skippedPaidPayslips = [];
    const payslipsData = [];

    for (const emp of employees) {
      if (paidUserIds.has(emp.id)) {
        skippedPaidPayslips.push({
          userId: emp.id,
          reason: 'Payslip is already PAID and cannot be modified.',
        });
        continue;
      }

      const computed = await calculateEmployeePayroll(emp.id, parsedMonth, parsedYear);
      if (computed) {
        payslipsData.push(computed);
      }
    }

    const createdPayslips = payslipsData.length > 0
      ? await prisma.$transaction(
          payslipsData.map((data) =>
            prisma.legacyPayslip.upsert({
              where: {
                userId_month_year: {
                  userId: data.userId,
                  month: data.month,
                  year: data.year,
                },
              },
              update: data,
              create: data,
            })
          )
        )
      : [];

    // Invalidate payroll and dashboard caches
    cacheService.invalidateTags(['payroll', 'dashboard']);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthLabel = monthNames[parsedMonth - 1] || `Month ${parsedMonth}`;

    // Notify each employee whose payslip was generated/updated
    for (const slip of createdPayslips) {
      const user = await prisma.user.findUnique({
        where: { id: slip.userId },
        select: { firstName: true, lastName: true, email: true },
      });

      if (user) {
        // 1. In-App Notification
        await createInAppNotification({
          userId: slip.userId,
          title: `${monthLabel} ${parsedYear} Payslip Ready`,
          message: `Your monthly salary slip (PKR ${Number(slip.netSalary).toLocaleString()}) is ready for download.`,
          type: 'success',
          category: 'PAYROLL',
          link: '/employee/payslips',
        });

        // 2. Corporate Email Dispatch
        if (user.email) {
          await sendPayslipEmail({
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            month: monthLabel,
            year: parsedYear,
            grossSalary: slip.grossSalary,
            deductions: (slip.taxDeductions || 0) + (slip.unpaidLeaveDeduction || 0) + (slip.otherDeductions || 0),
            netSalary: slip.netSalary,
          });
        }
      }
    }

    return res.status(201).json({
      success: true,
      message: `Successfully processed payroll for ${parsedMonth}/${parsedYear}: generated ${createdPayslips.length} payslip(s).${skippedPaidPayslips.length > 0 ? ` Skipped ${skippedPaidPayslips.length} already PAID payslip(s).` : ''}`,
      data: {
        count: createdPayslips.length,
        payslips: createdPayslips,
        skippedCount: skippedPaidPayslips.length,
        skipped: skippedPaidPayslips,
      },
    });
  } catch (error) {
    console.error('Error in generateMonthlyPayroll:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate monthly payroll.',
      error: error.message,
    });
  } finally {
    activePayrollRuns.delete(runKey);
  }
};

const getMyPayslips = async (req, res) => {
  try {
    const userId = req.user.userId;

    const payslips = await prisma.legacyPayslip.findMany({
      where: { userId },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return res.status(200).json({
      success: true,
      data: { payslips },
    });
  } catch (error) {
    console.error('Error in getMyPayslips:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payslips.',
      error: error.message,
    });
  }
};

const getCompanyPayslips = async (req, res) => {
  try {
    const { month, year, status } = req.query;

    const whereClause = {
      ...nonDemoRelationWhere,
      user: {
        ...nonDemoRelationWhere.user,
        deletedAt: null,
      },
    };
    if (month) whereClause.month = parseInt(month);
    if (year) whereClause.year = parseInt(year);
    if (status) whereClause.status = status;

    const payslips = await prisma.legacyPayslip.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            profile: {
              include: {
                department: { select: { name: true } },
                designation: { select: { title: true } },
              },
            },
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });

    return res.status(200).json({
      success: true,
      data: { payslips },
    });
  } catch (error) {
    console.error('Error in getCompanyPayslips:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payslips.',
      error: error.message,
    });
  }
};

const getPayslipById = async (req, res) => {
  try {
    const { id } = req.params;

    const payslip = await prisma.legacyPayslip.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            employeeCode: true,
            profile: {
              include: {
                department: { select: { name: true } },
                designation: { select: { title: true } },
              },
            },
          },
        },
      },
    });

    if (!payslip) {
      return res.status(404).json({
        success: false,
        code: 'PAYSLIP_NOT_FOUND',
        message: 'Payslip record not found.',
      });
    }

    const isOwner = req.user?.userId && req.user.userId === payslip.userId;
    const hasPayrollAccess = req.user?.role && PAYROLL_ROLES.includes(req.user.role);

    if (!isOwner && !hasPayrollAccess) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN_PAYSLIP_ACCESS',
        message: 'Access denied: You do not have permission to view this payslip.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { payslip },
    });
  } catch (error) {
    console.error('Error in getPayslipById:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch payslip.',
      error: error.message,
    });
  }
};

const VALID_STATUSES = ['DRAFT', 'GENERATED', 'PAID'];
const VALID_PREVIOUS_STATUSES = {
  GENERATED: ['DRAFT'],
  PAID: ['GENERATED', 'DRAFT'],
};

const updatePayslipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status) || !VALID_PREVIOUS_STATUSES[status]) {
      return res.status(400).json({
        success: false,
        code: 'INVALID_STATUS',
        message: `Invalid target status '${status}'. Forward transitions only support target status GENERATED or PAID.`,
      });
    }

    const allowedPrevious = VALID_PREVIOUS_STATUSES[status];

    // Atomic conditional update: only modifies if payslip is currently in an allowed previous status
    const updateResult = await prisma.legacyPayslip.updateMany({
      where: {
        id,
        status: { in: allowedPrevious },
      },
      data: { status },
    });

    if (updateResult.count === 0) {
      const existing = await prisma.legacyPayslip.findUnique({
        where: { id },
        select: { id: true, status: true },
      });

      if (!existing) {
        return res.status(404).json({
          success: false,
          code: 'PAYSLIP_NOT_FOUND',
          message: 'Payslip record not found.',
        });
      }

      if (existing.status === 'PAID') {
        return res.status(400).json({
          success: false,
          code: 'PAYSLIP_IMMUTABLE',
          message: 'Paid payslips are immutable and cannot be modified or reverted.',
        });
      }

      return res.status(409).json({
        success: false,
        code: 'PAYSLIP_STATUS_CONFLICT',
        message: `Conflict: Payslip status could not be updated to '${status}'. Current status is '${existing.status}'.`,
      });
    }

    const updated = await prisma.legacyPayslip.findUnique({
      where: { id },
    });

    cacheService.invalidateTags(['payroll', 'dashboard']);

    return res.status(200).json({
      success: true,
      message: `Payslip status updated to ${status}.`,
      data: { payslip: updated },
    });
  } catch (error) {
    console.error('Error in updatePayslipStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update payslip status.',
      error: error.message,
    });
  }
};

module.exports = {
  setSalaryStructure,
  getSalaryStructure,
  generateMonthlyPayroll,
  getMyPayslips,
  getCompanyPayslips,
  getPayslipById,
  updatePayslipStatus,
  PAYROLL_ROLES,
};
