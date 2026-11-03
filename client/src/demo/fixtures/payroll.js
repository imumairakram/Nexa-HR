/**
 * client/src/demo/fixtures/payroll.js
 * Synthetic Monthly Payroll & Payslip Records
 */

import { DEMO_EMPLOYEES } from './employees.js';

export const DEMO_PAYSLIPS = DEMO_EMPLOYEES.map((emp, idx) => {
  const basic = emp.salaryStructure?.basicSalary || 160000;
  const allowances = Math.round(basic * 0.45);
  const gross = basic + allowances;
  const tax = Math.round(gross * 0.08);
  const providentFund = Math.round(basic * 0.0833);
  const totalDeductions = tax + providentFund;
  const net = gross - totalDeductions;

  return {
    id: `ps-2026-10-${emp.id}`,
    userId: emp.id,
    user: emp,
    employeeCode: emp.employeeCode,
    employeeName: `${emp.firstName} ${emp.lastName}`,
    designation: emp.profile.designation.title,
    department: emp.profile.department.name,
    month: 10,
    year: 2026,
    period: 'October 2026',
    basicSalary: basic,
    houseRentAllowance: Math.round(basic * 0.25),
    medicalAllowance: Math.round(basic * 0.1),
    transportAllowance: Math.round(basic * 0.1),
    grossSalary: gross,
    taxDeduction: tax,
    providentFundDeduction: providentFund,
    totalDeductions,
    netSalary: net,
    paymentStatus: 'PAID',
    disbursedAt: '2026-10-31T17:00:00.000Z',
    paymentMethod: 'Direct Bank Transfer',
    bankName: 'Standard Chartered Corporate',
    accountNumber: `PK72SCBL000000${(idx + 101).toString().padStart(6, '0')}01`,
  };
});

export const DEMO_PAYROLL_SUMMARY = {
  month: 10,
  year: 2026,
  period: 'October 2026',
  totalEmployees: DEMO_EMPLOYEES.length,
  totalGrossDisbursed: DEMO_PAYSLIPS.reduce((sum, p) => sum + p.grossSalary, 0),
  totalNetDisbursed: DEMO_PAYSLIPS.reduce((sum, p) => sum + p.netSalary, 0),
  totalTaxDeductions: DEMO_PAYSLIPS.reduce((sum, p) => sum + p.taxDeduction, 0),
  disbursementStatus: 'COMPLETED',
  disbursementDate: '2026-10-31',
};
