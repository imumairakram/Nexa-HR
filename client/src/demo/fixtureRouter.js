/**
 * client/src/demo/fixtureRouter.js
 *
 * Synthetic In-Memory Router for Demo Mode GET Requests
 * Intercepts all client GET requests during an active demo session and returns
 * realistic mock responses without making network calls.
 */

import { DEMO_EMPLOYEES } from './fixtures/employees.js';
import { DEMO_DEPARTMENTS, DEMO_DESIGNATIONS } from './fixtures/departments.js';
import {
  DEMO_ATTENDANCE_LOGS,
  DEMO_TODAY_ATTENDANCE_SUMMARY,
  DEMO_SIMULATE_PUNCH_STATUS,
} from './fixtures/attendance.js';
import {
  DEMO_LEAVE_TYPES,
  DEMO_LEAVE_REQUESTS,
  DEMO_EMPLOYEE_LEAVE_BALANCE,
} from './fixtures/leaves.js';
import { DEMO_PAYSLIPS, DEMO_PAYROLL_SUMMARY } from './fixtures/payroll.js';
import {
  DEMO_JOB_OPENINGS,
  DEMO_CANDIDATES,
  DEMO_RECRUITMENT_STATS,
  DEMO_INTERVIEWS,
  DEMO_SCREENED_OUT_CANDIDATES,
  DEMO_TAXONOMIES,
} from './fixtures/recruitment.js';
import { DEMO_ANNOUNCEMENTS } from './fixtures/announcements.js';
import { DEMO_HOLIDAYS } from './fixtures/holidays.js';
import { DEMO_TICKETS } from './fixtures/tickets.js';
import { DEMO_POLICIES, DEMO_ISSUED_DOCUMENTS } from './fixtures/documents.js';
import { DEMO_ADMIN_DASHBOARD, DEMO_EMPLOYEE_DASHBOARD } from './fixtures/dashboard.js';
import { getDemoCurrentUser } from './fixtures/profile.js';
import { DEMO_NOTIFICATIONS } from './fixtures/notifications.js';
import { DEMO_ACCOUNT_TRANSACTIONS, DEMO_ACCOUNT_STATS } from './fixtures/accounts.js';

/**
 * Handles incoming demo GET requests
 * @param {string} endpoint - The requested endpoint path + query (e.g. '/employees?page=1')
 * @returns {Promise<any>} Mocked response object matching NexaHR API standard shape
 */
export async function handleDemoGetRequest(endpoint) {
  // Normalize endpoint URL and query
  const clean = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  let pathname = clean;
  let searchParams = new URLSearchParams();

  const queryIndex = clean.indexOf('?');
  if (queryIndex !== -1) {
    pathname = clean.substring(0, queryIndex);
    searchParams = new URLSearchParams(clean.substring(queryIndex + 1));
  }

  // Remove trailing slashes (except root)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    pathname = pathname.slice(0, -1);
  }

  // Small artificial micro-delay (10-20ms) to ensure smooth asynchronous state updates
  await new Promise((resolve) => setTimeout(resolve, 15));

  // 1. Auth & Current User
  if (pathname === '/auth/me') {
    return { success: true, data: getDemoCurrentUser() };
  }

  if (pathname === '/auth/config') {
    return { success: true, data: { guestDemoEnabled: true } };
  }

  // 2. Dashboards
  if (pathname === '/dashboard/admin') {
    return { success: true, data: DEMO_ADMIN_DASHBOARD };
  }

  if (pathname === '/dashboard/employee') {
    return { success: true, data: DEMO_EMPLOYEE_DASHBOARD };
  }

  // 3. Employees
  if (pathname === '/employees') {
    let list = [...DEMO_EMPLOYEES];
    const search = (searchParams.get('search') || '').toLowerCase().trim();
    const department = searchParams.get('department') || searchParams.get('departmentId');
    const status = searchParams.get('status');

    if (search) {
      list = list.filter((e) =>
        `${e.firstName} ${e.lastName} ${e.email} ${e.employeeCode}`
          .toLowerCase()
          .includes(search)
      );
    }

    if (department && department !== 'ALL') {
      list = list.filter(
        (e) =>
          e.departmentId === department ||
          (e.department && e.department.toLowerCase() === department.toLowerCase())
      );
    }

    if (status && status !== 'ALL') {
      list = list.filter((e) => e.status?.toUpperCase() === status.toUpperCase());
    }

    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const start = (page - 1) * limit;
    const paginated = list.slice(start, start + limit);

    return {
      success: true,
      data: {
        employees: paginated,
        pagination: {
          total: list.length,
          page,
          limit,
          pages: Math.max(1, Math.ceil(list.length / limit)),
        },
      },
    };
  }

  // Single employee match: /employees/:id
  const empMatch = pathname.match(/^\/employees\/([^/]+)$/);
  if (empMatch) {
    const id = empMatch[1];
    const emp =
      DEMO_EMPLOYEES.find((e) => e.id === id || e.employeeCode === id) || DEMO_EMPLOYEES[0];
    return { success: true, data: { employee: emp, ...emp } };
  }

  // 4. Attendance
  if (pathname === '/attendance') {
    return {
      success: true,
      data: {
        attendances: DEMO_ATTENDANCE_LOGS,
        logs: DEMO_ATTENDANCE_LOGS,
        summary: DEMO_TODAY_ATTENDANCE_SUMMARY,
      },
    };
  }

  if (pathname === '/attendance/my-logs') {
    const limit = parseInt(searchParams.get('limit') || '30', 10);
    // Find logs for current employee (default Gabriel Ross: usr-demo-emp-02)
    const targetUserId = 'usr-demo-emp-02';
    let userLogs = DEMO_ATTENDANCE_LOGS.filter((l) => l.userId === targetUserId);
    if (!userLogs.length) {
      userLogs = DEMO_ATTENDANCE_LOGS.filter((l) => l.userId === DEMO_ATTENDANCE_LOGS[0]?.userId);
    }
    // Sort descending by date (most recent workday first)
    userLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const sliced = userLogs.slice(0, limit);
    return {
      success: true,
      data: {
        attendances: sliced,
        logs: sliced,
      },
    };
  }

  if (pathname === '/attendance/simulate-punch/status') {
    return { success: true, data: DEMO_SIMULATE_PUNCH_STATUS };
  }

  // 5. Leaves
  if (pathname === '/leaves/types') {
    return {
      success: true,
      data: {
        leaveTypes: DEMO_LEAVE_TYPES,
      },
    };
  }

  const leaveTypeMatch = pathname.match(/^\/leaves\/types\/([^/]+)$/);
  if (leaveTypeMatch) {
    const type = DEMO_LEAVE_TYPES.find((t) => t.id === leaveTypeMatch[1]) || DEMO_LEAVE_TYPES[0];
    return { success: true, data: { leaveType: type, ...type } };
  }

  if (pathname === '/leaves/my-requests') {
    return {
      success: true,
      data: {
        leaveRequests: DEMO_LEAVE_REQUESTS,
        requests: DEMO_LEAVE_REQUESTS,
        balance: DEMO_EMPLOYEE_LEAVE_BALANCE,
      },
    };
  }

  if (pathname === '/leaves/requests') {
    return {
      success: true,
      data: {
        leaveRequests: DEMO_LEAVE_REQUESTS,
        requests: DEMO_LEAVE_REQUESTS,
      },
    };
  }

  // 6. Payroll
  if (pathname === '/payroll/my-payslips') {
    return {
      success: true,
      data: {
        payslips: DEMO_PAYSLIPS.slice(0, 3),
      },
    };
  }

  if (pathname === '/payroll/payslips') {
    return {
      success: true,
      data: {
        payslips: DEMO_PAYSLIPS,
        summary: DEMO_PAYROLL_SUMMARY,
      },
    };
  }

  const payslipMatch = pathname.match(/^\/payroll\/payslips\/([^/]+)$/);
  if (payslipMatch) {
    const slip = DEMO_PAYSLIPS.find((p) => p.id === payslipMatch[1]) || DEMO_PAYSLIPS[0];
    return { success: true, data: { payslip: slip, ...slip } };
  }

  // 7. Departments & Designations
  if (pathname === '/departments') {
    return {
      success: true,
      data: {
        departments: DEMO_DEPARTMENTS,
      },
    };
  }

  if (pathname === '/designations') {
    const deptId = searchParams.get('departmentId');
    const filtered = deptId
      ? DEMO_DESIGNATIONS.filter((d) => d.departmentId === deptId)
      : DEMO_DESIGNATIONS;
    return {
      success: true,
      data: {
        designations: filtered,
      },
    };
  }

  // 8. Notifications
  if (pathname === '/notifications') {
    return {
      success: true,
      data: {
        notifications: DEMO_NOTIFICATIONS,
        count: DEMO_NOTIFICATIONS.length,
      },
    };
  }

  // 9. Announcements & Holidays
  if (pathname === '/announcements') {
    return {
      success: true,
      data: {
        announcements: DEMO_ANNOUNCEMENTS,
      },
    };
  }

  if (pathname === '/holidays') {
    return {
      success: true,
      data: {
        holidays: DEMO_HOLIDAYS,
      },
    };
  }

  // 10. Tickets / Helpdesk
  if (pathname === '/tickets') {
    return {
      success: true,
      data: {
        tickets: DEMO_TICKETS,
      },
    };
  }

  // 11. Documents
  if (pathname === '/documents/policies') {
    return {
      success: true,
      data: {
        policies: DEMO_POLICIES,
      },
    };
  }

  const policyMatch = pathname.match(/^\/documents\/policies\/([^/]+)$/);
  if (policyMatch) {
    const policy = DEMO_POLICIES.find((p) => p.id === policyMatch[1]) || DEMO_POLICIES[0];
    return { success: true, data: { policy, ...policy } };
  }

  if (pathname === '/documents/issued') {
    return {
      success: true,
      data: {
        documents: DEMO_ISSUED_DOCUMENTS,
      },
    };
  }

  const docMatch = pathname.match(/^\/documents\/issued\/([^/]+)$/);
  if (docMatch) {
    const doc = DEMO_ISSUED_DOCUMENTS.find((d) => d.id === docMatch[1]) || DEMO_ISSUED_DOCUMENTS[0];
    return { success: true, data: { document: doc, ...doc } };
  }

  // 12. Accounts & Finance
  if (pathname === '/accounts/transactions') {
    return {
      success: true,
      data: {
        transactions: DEMO_ACCOUNT_TRANSACTIONS,
      },
    };
  }

  if (pathname === '/accounts/stats') {
    return {
      success: true,
      data: DEMO_ACCOUNT_STATS,
    };
  }

  if (pathname === '/accounts/batch-status') {
    return {
      success: true,
      data: { status: 'idle', total: 0, processed: 0 },
    };
  }

  // 13. Recruitment & ATS
  if (pathname === '/recruitment/stats') {
    return {
      success: true,
      data: DEMO_RECRUITMENT_STATS,
    };
  }

  if (pathname === '/recruitment/jobs') {
    return {
      success: true,
      data: {
        jobs: DEMO_JOB_OPENINGS,
      },
    };
  }

  const jobMatch = pathname.match(/^\/recruitment\/jobs\/([^/]+)$/);
  if (jobMatch) {
    const job = DEMO_JOB_OPENINGS.find((j) => j.id === jobMatch[1]) || DEMO_JOB_OPENINGS[0];
    return { success: true, data: { job, ...job } };
  }

  if (pathname === '/recruitment/applications') {
    return {
      success: true,
      data: {
        applications: DEMO_CANDIDATES,
      },
    };
  }

  const candidateMatch = pathname.match(/^\/recruitment\/applications\/([^/]+)$/);
  if (candidateMatch) {
    const id = candidateMatch[1];
    const candidate = DEMO_CANDIDATES.find((c) => c.id === id) || DEMO_CANDIDATES[0];
    return { success: true, data: { application: candidate, ...candidate } };
  }

  if (pathname === '/recruitment/interviews') {
    return {
      success: true,
      data: {
        interviews: DEMO_INTERVIEWS,
      },
    };
  }

  const interviewMatch = pathname.match(/^\/recruitment\/interviews\/([^/]+)$/);
  if (interviewMatch) {
    const interview = DEMO_INTERVIEWS.find((i) => i.id === interviewMatch[1]) || DEMO_INTERVIEWS[0];
    return { success: true, data: { interview, ...interview } };
  }

  if (pathname === '/recruitment/ai-screening/status') {
    return {
      success: true,
      data: { status: 'idle', active: false, totalScanned: 6 },
    };
  }

  if (pathname === '/recruitment/ai-screening/screened-out') {
    return {
      success: true,
      data: {
        applications: DEMO_SCREENED_OUT_CANDIDATES,
      },
    };
  }

  if (pathname === '/recruitment/taxonomies') {
    const taxType = searchParams.get('type');
    const items = taxType ? DEMO_TAXONOMIES[taxType] || [] : DEMO_TAXONOMIES;
    return {
      success: true,
      data: items,
    };
  }

  // Fallback for unhandled GET routes: return valid empty shape and warn in console
  console.warn('[DEMO] Unhandled endpoint:', endpoint);
  return {
    success: true,
    data: [],
  };
}
