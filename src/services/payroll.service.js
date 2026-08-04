const prisma = require('../config/prisma');

/**
 * Calculate single employee payroll for a given month & year
 */
const calculateEmployeePayroll = async (userId, month, year) => {
  const structure = await prisma.salaryStructure.findUnique({
    where: { userId },
  });

  if (!structure) {
    return null;
  }

  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  const unpaidLeaves = await prisma.leaveRequest.findMany({
    where: {
      userId,
      status: 'APPROVED',
      leaveType: { isPaid: false },
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
    },
  });

  let unpaidLeaveDays = 0;
  unpaidLeaves.forEach((leave) => {
    unpaidLeaveDays += leave.totalDays;
  });

  const dailyRate = structure.basicSalary / 30;
  const unpaidLeaveDeduction = parseFloat((unpaidLeaveDays * dailyRate).toFixed(2));
  const totalAllowances = parseFloat(
    (structure.housingAllowance + structure.transportAllowance + structure.otherAllowances).toFixed(2)
  );

  const grossSalary = parseFloat((structure.basicSalary + totalAllowances).toFixed(2));
  const totalDeductions = parseFloat(
    (structure.taxDeductions + structure.otherDeductions + unpaidLeaveDeduction).toFixed(2)
  );
  const netSalary = parseFloat((grossSalary - totalDeductions).toFixed(2));

  return {
    userId,
    month: parseInt(month),
    year: parseInt(year),
    basicSalary: structure.basicSalary,
    totalAllowances,
    taxDeductions: structure.taxDeductions,
    unpaidLeaveDays,
    unpaidLeaveDeduction,
    otherDeductions: structure.otherDeductions,
    grossSalary,
    netSalary,
    status: 'GENERATED',
  };
};

module.exports = {
  calculateEmployeePayroll,
};
