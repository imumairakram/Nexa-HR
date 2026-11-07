/**
 * src/utils/userFilters.js
 *
 * Single Source of Truth for excluding demo / guest accounts from operational views.
 * Ensures demo users (isDemo: true) never appear in real employee lists, dashboard KPIs,
 * attendance, payroll, leave management, department counts, or notification broadcasts.
 */

// Filter for queries directly on the User model
const nonDemoUsersWhere = {
  isDemo: false,
};

// Relation filter for models linked to User (e.g. EmployeeProfile, Attendance, LeaveRequest, Payslip, Ticket)
const nonDemoRelationWhere = {
  user: {
    isDemo: false,
  },
};

module.exports = {
  nonDemoUsersWhere,
  nonDemoRelationWhere,
};

