/**
 * client/src/demo/fixtures/dashboard.js
 * Synthetic Dashboard BI Metrics & Telemetry
 */

import { DEMO_EMPLOYEES } from './employees.js';
import { DEMO_TODAY_ATTENDANCE_SUMMARY, DEMO_ATTENDANCE_LOGS } from './attendance.js';

export const DEMO_ADMIN_DASHBOARD = {
  metrics: {
    totalEmployees: DEMO_EMPLOYEES.length,
    activeEmployees: DEMO_EMPLOYEES.length,
    presentToday: DEMO_TODAY_ATTENDANCE_SUMMARY.present,
    lateToday: DEMO_TODAY_ATTENDANCE_SUMMARY.late,
    onLeaveToday: DEMO_TODAY_ATTENDANCE_SUMMARY.onLeave,
    attendanceRate: DEMO_TODAY_ATTENDANCE_SUMMARY.attendancePercentage,
    monthlyPayrollBudget: 3850000,
    openRequisitions: 3,
    activeCandidates: 6,
    pendingLeavesCount: 2,
    openTicketsCount: 1,
    genderRatio: {
      male: 8,
      female: 7,
      malePercentage: 53.3,
      femalePercentage: 46.7,
    },
  },
  todayAttendance: DEMO_TODAY_ATTENDANCE_SUMMARY,
  charts: {
    departmentHeadcounts: [
      { department: 'Engineering', count: 5, budget: 450000 },
      { department: 'Human Resources', count: 3, budget: 180000 },
      { department: 'Finance', count: 2, budget: 160000 },
      { department: 'Product & Design', count: 3, budget: 220000 },
      { department: 'Operations', count: 2, budget: 140000 },
    ],
    attendanceTrend: [
      { date: 'Oct 28', present: 14, late: 0, leave: 1 },
      { date: 'Oct 29', present: 13, late: 1, leave: 1 },
      { date: 'Oct 30', present: 15, late: 0, leave: 0 },
      { date: 'Oct 31', present: 14, late: 1, leave: 0 },
      { date: 'Nov 01', present: 13, late: 1, leave: 2 },
      { date: 'Nov 02', present: 14, late: 0, leave: 1 },
      { date: 'Today', present: 13, late: 1, leave: 2 },
    ],
    payrollTrend: [
      { month: 'Jun', total: 3620000 },
      { month: 'Jul', total: 3680000 },
      { month: 'Aug', total: 3740000 },
      { month: 'Sep', total: 3810000 },
      { month: 'Oct', total: 3850000 },
    ],
  },
  recentLogs: DEMO_ATTENDANCE_LOGS.slice(0, 10),
};

export const DEMO_EMPLOYEE_DASHBOARD = {
  user: DEMO_EMPLOYEES[1], // Gabriel Ross
  todayClockStatus: {
    isClockedIn: true,
    clockInTime: `${new Date().toISOString().split('T')[0]}T08:58:00.000Z`,
    status: 'PRESENT',
    workHoursToday: 6.5,
    expectedHours: 8.5,
  },
  monthlyAttendance: {
    month: 'November 2026',
    presentDays: 20,
    lateDays: 1,
    leaveDays: 2,
    totalWorkingDays: 22,
    punctualityRate: 95.2,
  },
  leavesSummary: {
    annualRemaining: 16,
    casualRemaining: 10,
    sickRemaining: 10,
    totalRemaining: 36,
    pendingRequests: 0,
  },
  latestPayslip: {
    month: 'October',
    year: 2026,
    netSalary: 273500,
    status: 'PAID',
    disbursedDate: '2026-10-31',
  },
};
