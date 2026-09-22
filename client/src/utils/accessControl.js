// Granular Feature & Module Access Control Engine for NexaHR

export const FEATURE_MODULES = [
  {
    id: 'hr_core',
    name: 'HR Core & Personnel (PIM)',
    description: 'Employee directory, dossiers, departments, designations, and onboarding.',
    icon: 'Users',
    features: [
      { key: 'view_directory', label: 'View Employee Directory', description: 'Access company directory and public staff profiles' },
      { key: 'onboard_employee', label: 'Onboard New Employees', description: 'Create and register new employee dossier profiles' },
      { key: 'edit_employee', label: 'Edit Employee Information', description: 'Modify staff details, positions, and emergency contacts' },
      { key: 'delete_employee', label: 'Deactivate / Terminate Staff', description: 'Archive or deactivate employee accounts' },
      { key: 'manage_departments', label: 'Manage Departments', description: 'Create and edit corporate functional divisions' },
      { key: 'manage_designations', label: 'Manage Job Designations', description: 'Define role titles, career levels, and leveling hierarchy' },
      { key: 'manage_roles_permissions', label: 'Manage Role Matrix (RBAC)', description: 'Configure system-wide role permissions' },
    ],
  },
  {
    id: 'attendance',
    name: 'Attendance & Biometrics',
    description: 'Punch logs, hardware simulator, shifts, and biometric timekeeping.',
    icon: 'Clock',
    features: [
      { key: 'view_attendance_logs', label: 'View Company Attendance Logs', description: 'Inspect daily check-in and check-out records' },
      { key: 'biometric_simulator', label: 'Use Biometric Terminal Simulator', description: 'Simulate IoT hardware face-ID and RFID card punches' },
      { key: 'manual_attendance_override', label: 'Manual Attendance Override', description: 'Correct missed punches and approve shift adjustments' },
      { key: 'manage_work_shifts', label: 'Manage Shift Rosters', description: 'Configure working shifts and employee shift assignments' },
      { key: 'export_attendance_audit', label: 'Export Biometric Audit Sheets', description: 'Download attendance spreadsheets and logs' },
    ],
  },
  {
    id: 'leaves',
    name: 'Leaves & Time-Off Management',
    description: 'Leave applications, manager approvals, carryovers, and quota policies.',
    icon: 'CalendarDays',
    features: [
      { key: 'view_leave_requests', label: 'View All Leave Requests', description: 'Access company-wide time-off applications' },
      { key: 'approve_reject_leaves', label: 'Approve & Reject Leave Requests', description: 'Make authorization decisions on pending leaves' },
      { key: 'apply_behalf_leave', label: 'Apply Leave on Behalf of Staff', description: 'Submit time-off requests for other team members' },
      { key: 'configure_leave_policies', label: 'Configure Leave Quotas & Policies', description: 'Set statutory leave rules, accruals, and carryovers' },
      { key: 'manage_company_holidays', label: 'Manage Public Holidays', description: 'Configure gazetted holidays and corporate calendar' },
    ],
  },
  {
    id: 'payroll',
    name: 'Payroll & Compensation',
    description: 'Automated tax calculations, salary disbursement batches, and payslips.',
    icon: 'CreditCard',
    features: [
      { key: 'view_payroll_batches', label: 'View Payroll History & Batches', description: 'Inspect historical monthly payroll runs' },
      { key: 'calculate_payroll_audit', label: 'Run Pre-Disbursement Audit Engine', description: 'Calculate biometric attendance deductions and taxes' },
      { key: 'disburse_payroll_batch', label: 'Confirm & Disburse Salary Batches', description: 'Finalize payroll and issue notifications/slips' },
      { key: 'manage_salary_structures', label: 'Edit Staff Salary Structures', description: 'Configure basic salary, allowances, and tax bands' },
      { key: 'download_all_payslips', label: 'Batch Export Payslips (PDF/CSV)', description: 'Download and print company payslip invoices' },
    ],
  },
  {
    id: 'recruitment',
    name: 'Recruitment & ATS Suite',
    description: 'Job requisitions, applicant tracking Kanban, and interview panels.',
    icon: 'Briefcase',
    features: [
      { key: 'publish_job_requisitions', label: 'Create & Publish Job Openings', description: 'Post new positions to the internal careers portal' },
      { key: 'manage_candidate_pipeline', label: 'Manage Kanban Hiring Pipeline', description: 'Drag and advance candidates across hiring stages' },
      { key: 'review_resumes', label: 'Review Resumes & ATS Scores', description: 'Evaluate candidate dossiers and match ratings' },
      { key: 'schedule_interviews', label: 'Schedule Technical Interviews', description: 'Set panel interview meetings and scorecards' },
      { key: 'manage_recruitment_taxonomy', label: 'Manage ATS Masters & Taxonomies', description: 'Configure categories, skills, locations, and job types' },
    ],
  },
  {
    id: 'operations_accounts',
    name: 'Operations, Accounts & Broadcasts',
    description: 'Corporate announcements, double-entry ledger, and recognition.',
    icon: 'Landmark',
    features: [
      { key: 'post_announcements', label: 'Broadcast Official Announcements', description: 'Publish company-wide announcements and pin alerts' },
      { key: 'manage_accounts_ledger', label: 'Record Ledger Vouchers & Accounts', description: 'Post department expenses, invoices, and income' },
    ],
  },
  {
    id: 'system_admin',
    name: 'System Administration & Security',
    description: 'Global presets, API keys, database security, and user access control.',
    icon: 'Shield',
    features: [
      { key: 'manage_regional_settings', label: 'Configure Regional Localization', description: 'Set timezone, currency, date formatting, and company brand' },
      { key: 'manage_user_access_control', label: 'Manage User Feature Permissions (Meta)', description: 'Grant or revoke feature permissions per employee' },
      { key: 'view_system_security_logs', label: 'View Security & Audit Trail Logs', description: 'Inspect login histories, permission alterations, and API keys' },
    ],
  },
];

// Helper to construct all feature keys set to a specific boolean value
const createAllFeaturesMap = (value = true) => {
  const map = {};
  FEATURE_MODULES.forEach((mod) => {
    mod.features.forEach((f) => {
      map[f.key] = value;
    });
  });
  return map;
};

// Standard Role Presets
export const ROLE_PRESETS = {
  SUPER_ADMIN: {
    label: 'Super Administrator',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200',
    description: 'Full uninhibited master access across every module and administrative tool.',
    permissions: createAllFeaturesMap(true),
  },
  HR_MANAGER: {
    label: 'HR Lead / Manager',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200',
    description: 'Comprehensive human resources, recruitment, leaves, attendance, and welfare management.',
    permissions: {
      ...createAllFeaturesMap(false),
      // HR Core
      view_directory: true,
      onboard_employee: true,
      edit_employee: true,
      delete_employee: false,
      manage_departments: true,
      manage_designations: true,
      manage_roles_permissions: true,
      // Attendance
      view_attendance_logs: true,
      biometric_simulator: true,
      manual_attendance_override: true,
      manage_work_shifts: true,
      export_attendance_audit: true,
      // Leaves
      view_leave_requests: true,
      approve_reject_leaves: true,
      apply_behalf_leave: true,
      configure_leave_policies: true,
      manage_company_holidays: true,
      // Payroll (view only)
      view_payroll_batches: true,
      download_all_payslips: true,
      // Recruitment
      publish_job_requisitions: true,
      manage_candidate_pipeline: true,
      review_resumes: true,
      schedule_interviews: true,
      manage_recruitment_taxonomy: true,
      // Operations
      post_announcements: true,
    },
  },
  PAYROLL_SPECIALIST: {
    label: 'Payroll & Compensation Officer',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
    description: 'Dedicated compensation calculation, tax deductions, financial ledger, and salary batching.',
    permissions: {
      ...createAllFeaturesMap(false),
      view_directory: true,
      view_attendance_logs: true,
      view_payroll_batches: true,
      calculate_payroll_audit: true,
      disburse_payroll_batch: true,
      manage_salary_structures: true,
      download_all_payslips: true,
      manage_accounts_ledger: true,
    },
  },
  RECRUITER: {
    label: 'Talent Acquisition & Recruiter',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200',
    description: 'Focused ATS management, job postings, candidate screening, and interview coordination.',
    permissions: {
      ...createAllFeaturesMap(false),
      view_directory: true,
      publish_job_requisitions: true,
      manage_candidate_pipeline: true,
      review_resumes: true,
      schedule_interviews: true,
      manage_recruitment_taxonomy: true,
      post_announcements: false,
    },
  },
  TEAM_LEAD: {
    label: 'Department Supervisor / Team Lead',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
    description: 'Team attendance oversight, leave approval authority, and team coordination.',
    permissions: {
      ...createAllFeaturesMap(false),
      view_directory: true,
      view_attendance_logs: true,
      view_leave_requests: true,
      approve_reject_leaves: true,
      schedule_interviews: true,
    },
  },
  STANDARD_EMPLOYEE: {
    label: 'Standard Staff Member',
    badgeColor: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200',
    description: 'Standard self-service employee portal access.',
    permissions: {
      ...createAllFeaturesMap(false),
      view_directory: true,
    },
  },
};

const STORAGE_KEY = 'nexahr_user_feature_access';

/**
 * Retrieve granular feature permissions for a specific user ID
 * Falls back to their system Role default if no custom override is defined
 */
export const getUserFeatureAccess = (userId, role = 'EMPLOYEE') => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const allUserAccess = JSON.parse(raw);
      if (allUserAccess[userId]) {
        return {
          isCustom: true,
          presetKey: allUserAccess[userId].presetKey || 'CUSTOM',
          permissions: {
            ...createAllFeaturesMap(false),
            ...allUserAccess[userId].permissions,
          },
          updatedAt: allUserAccess[userId].updatedAt,
        };
      }
    }
  } catch (e) {
    console.warn('Error reading user access permissions:', e);
  }

  // Fallback to role preset
  let fallbackPreset = 'STANDARD_EMPLOYEE';
  if (role === 'ADMIN') fallbackPreset = 'SUPER_ADMIN';
  else if (role === 'HR_MANAGER') fallbackPreset = 'HR_MANAGER';

  const defaultPreset = ROLE_PRESETS[fallbackPreset] || ROLE_PRESETS.STANDARD_EMPLOYEE;
  return {
    isCustom: false,
    presetKey: fallbackPreset,
    permissions: { ...defaultPreset.permissions },
    updatedAt: null,
  };
};

/**
 * Save custom feature permissions for a specific user ID
 */
export const saveUserFeatureAccess = (userId, permissions, presetKey = 'CUSTOM', updatedBy = 'System Admin') => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const allUserAccess = raw ? JSON.parse(raw) : {};

    allUserAccess[userId] = {
      presetKey,
      permissions,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allUserAccess));

    // Also record audit log entry
    const auditRaw = localStorage.getItem('nexahr_security_audit_logs');
    const auditLogs = auditRaw ? JSON.parse(auditRaw) : [];
    const newLog = {
      id: `SEC-AUD-${Date.now()}`,
      userId,
      action: `Feature permissions updated (${presetKey})`,
      performedBy: updatedBy,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('nexahr_security_audit_logs', JSON.stringify([newLog, ...auditLogs.slice(0, 49)]));

    // Dispatch event so active components can re-evaluate permissions
    window.dispatchEvent(new Event('nexahr_user_access_updated'));
    return true;
  } catch (e) {
    console.error('Failed to save user feature access:', e);
    return false;
  }
};

/**
 * Check if the active user has access to a specific feature key
 */
export const hasFeatureAccess = (user, featureKey) => {
  if (!user) return false;
  if (user.role === 'ADMIN') return true; // Super admins always have full access

  const access = getUserFeatureAccess(user.id, user.role);
  return !!access.permissions[featureKey];
};
