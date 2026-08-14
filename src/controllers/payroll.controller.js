const prisma = require('../config/prisma');
const { calculateEmployeePayroll } = require('../services/payroll.service');
const {
  createInAppNotification,
  sendPayslipEmail,
} = require('../services/notification.service');

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
    if (!user) {
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

    if (req.user.role === 'EMPLOYEE' && req.user.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const structure = await prisma.salaryStructure.findUnique({
      where: { userId },
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

const generateMonthlyPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Please specify month (1-12) and year.',
      });
    }

    const employees = await prisma.user.findMany({
      where: {
        isActive: true,
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

    const payslipsData = [];
    for (const emp of employees) {
      const computed = await calculateEmployeePayroll(emp.id, month, year);
      if (computed) {
        payslipsData.push(computed);
      }
    }

    const createdPayslips = await prisma.$transaction(
      payslipsData.map((data) =>
        prisma.payslip.upsert({
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
    );

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthLabel = monthNames[month - 1] || `Month ${month}`;

    // Notify each employee in-app and via email
    for (const slip of createdPayslips) {
      const user = await prisma.user.findUnique({
        where: { id: slip.userId },
        select: { firstName: true, lastName: true, email: true },
      });

      if (user) {
        // 1. In-App Notification
        await createInAppNotification({
          userId: slip.userId,
          title: `${monthLabel} ${year} Payslip Ready`,
          message: `Your monthly salary slip ($${Number(slip.netSalary).toLocaleString()}) is ready for download.`,
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
            year,
            grossSalary: slip.grossSalary,
            deductions: (slip.taxDeductions || 0) + (slip.unpaidLeaveDeduction || 0) + (slip.otherDeductions || 0),
            netSalary: slip.netSalary,
          });
        }
      }
    }

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

const getMyPayslips = async (req, res) => {
  try {
    const userId = req.user.userId;

    const payslips = await prisma.payslip.findMany({
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

    const whereClause = {};
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
      message: 'Failed to fetch payslips.',
      error: error.message,
    });
  }
};

const updatePayslipStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['DRAFT', 'GENERATED', 'PAID'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be DRAFT, GENERATED, or PAID.',
      });
    }

    const updated = await prisma.payslip.updateMany({
      where: { id },
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
