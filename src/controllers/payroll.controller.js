const prisma = require('../config/prisma');
const { calculateEmployeePayroll } = require('../services/payroll.service');

/**
 * Define or Update Employee Salary Structure
 * POST /api/payroll/salary-structure
 */
const setSalaryStructure = async (req, res) => {
  try {
    const tenantId = req.tenantId;
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

    // Verify user belongs to tenant
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found in your company.',
      });
    }

    const structure = await prisma.salaryStructure.upsert({
      where: {
        tenantId_userId: { tenantId, userId },
      },
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
        tenantId,
        userId,
        basicSalary: parseFloat(basicSalary),
        housingAllowance: parseFloat(housingAllowance),
        transportAllowance: parseFloat(transportAllowance),
        otherAllowances: parseFloat(otherAllowances),
        taxDeductions: parseFloat(taxDeductions),
        otherDeductions: parseFloat(otherDeductions),
      },
    });

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

/**
 * Get Employee Salary Structure
 * GET /api/payroll/salary-structure/:userId
 */
const getSalaryStructure = async (req, res) => {
  try {
    const { userId } = req.params;
    const tenantId = req.tenantId;

    // Self check or HR check
    if (req.user.role === 'EMPLOYEE' && req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied.',
      });
    }

    const structure = await prisma.salaryStructure.findUnique({
      where: {
        tenantId_userId: { tenantId, userId },
      },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    if (!structure) {
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

/**
 * Bulk Generate Monthly Payslips (Admin/HR)
 * POST /api/payroll/generate-monthly
 */
const generateMonthlyPayroll = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please specify month (1-12) and year.',
      });
    }

    // Fetch active employees with configured salary structure
    const employees = await prisma.user.findMany({
      where: {
        tenantId,
        isActive: true,
        salaryStructure: { isNot: null },
      },
      select: { id: true },
    });

    if (employees.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No active employees with configured salary structures found for this tenant.',
      });
    }

    const payslipsData = [];
    for (const emp of employees) {
      const computed = await calculateEmployeePayroll(tenantId, emp.id, month, year);
      if (computed) {
        payslipsData.push(computed);
      }
    }

    // Upsert payslips in transaction
    const createdPayslips = await prisma.$transaction(
      payslipsData.map((data) =>
        prisma.payslip.upsert({
          where: {
            tenantId_userId_month_year: {
              tenantId: data.tenantId,
              userId: data.userId,
              month: data.month,
              year: data.year,
            },
          },
          update: data,
          create: data,
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: `Successfully generated ${createdPayslips.length} payslips for ${month}/${year}.`,
      data: { count: createdPayslips.length, payslips: createdPayslips },
    });
  } catch (error) {
    console.error('Error in generateMonthlyPayroll:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate monthly payroll.',
      error: error.message,
    });
  }
};

/**
 * Get Personal Payslips (Employee)
 * GET /api/payroll/my-payslips
 */
const getMyPayslips = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const userId = req.user.userId;

    const payslips = await prisma.payslip.findMany({
      where: { tenantId, userId },
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

/**
 * Get Company Payslips (Admin/HR)
 * GET /api/payroll/payslips
 */
const getCompanyPayslips = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { month, year, status } = req.query;

    const whereClause = { tenantId };
    if (month) whereClause.month = parseInt(month);
    if (year) whereClause.year = parseInt(year);
    if (status) whereClause.status = status;

    const payslips = await prisma.payslip.findMany({
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
      message: 'Failed to fetch company payslips.',
      error: error.message,
    });
  }
};

/**
 * Update Payslip Status (e.g. Mark PAID)
 * PUT /api/payroll/payslips/:id/status
 */
const updatePayslipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const tenantId = req.tenantId;

    if (!['DRAFT', 'GENERATED', 'PAID'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be DRAFT, GENERATED, or PAID.',
      });
    }

    const updated = await prisma.payslip.updateMany({
      where: { id, tenantId },
      data: { status },
    });

    if (updated.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'Payslip record not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: `Payslip status updated to ${status}.`,
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
  updatePayslipStatus,
};
