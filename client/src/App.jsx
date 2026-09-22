import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/common/ScrollToTop';
import Login from './pages/website/Login';
import MainLayout from './layouts/MainLayout';
import EmployeeLayout from './layouts/EmployeeLayout';

// HR Admin Pages
import Dashboard from './pages/app/Dashboard';
import Employees from './pages/app/Employees';
import Attendance from './pages/app/Attendance';
import Leaves from './pages/app/Leaves';
import Payroll from './pages/app/Payroll';
import Departments from './pages/app/Departments';
import Settings from './pages/app/Settings';
import Profile from './pages/app/Profile';
import UserAccessControl from './pages/app/UserAccessControl';

// HR Sub-pages
import NewEmployee from './pages/app/hr/NewEmployee';
import Designation from './pages/app/hr/Designation';

// Attendance & Schedule
import EmploymentStatus from './pages/app/EmploymentStatus';

// Leave & Holiday
import PublicHoliday from './pages/app/holiday/PublicHoliday';
import LeavePolicy from './pages/app/LeavePolicy';

// Payroll Sub-pages
import CalculatePayroll from './pages/app/payroll/CalculatePayroll';
import PayslipList from './pages/app/payroll/PayslipList';

// Financial Accounts
import Accounts from './pages/app/Accounts';

// Engagement & Operations
import Announcement from './pages/app/Announcement';

// Recruitment Module Sub-pages
import JobCategory from './pages/app/recruitment/JobCategory';
import JobType from './pages/app/recruitment/JobType';
import JobLocation from './pages/app/recruitment/JobLocation';
import JobSkills from './pages/app/recruitment/JobSkills';
import JobExperience from './pages/app/recruitment/JobExperience';
import Jobs from './pages/app/recruitment/Jobs';
import JobApplication from './pages/app/recruitment/JobApplication';
import JobBoard from './pages/app/recruitment/JobBoard';
import JobInterview from './pages/app/recruitment/JobInterview';
import JobDesk from './pages/app/recruitment/JobDesk';

// Employee Portal Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeAttendance from './pages/employee/EmployeeAttendance';
import EmployeeLeaves from './pages/employee/EmployeeLeaves';
import EmployeePayslips from './pages/employee/EmployeePayslips';
import EmployeeAnnouncements from './pages/employee/EmployeeAnnouncements';
import EmployeeHolidays from './pages/employee/EmployeeHolidays';
import EmployeeHelpdesk from './pages/employee/EmployeeHelpdesk';
import EmployeeDocuments from './pages/employee/EmployeeDocuments';
import EmployeeProfile from './pages/employee/EmployeeProfile';
import EmployeeSettings from './pages/employee/EmployeeSettings';

// Admin Route Guard Component - strictly for System Admin (ADMIN)
const AdminRoute = ({ children }) => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = user.role === 'ADMIN';
    if (!isAdmin) {
      return <Navigate to="/app/dashboard" replace />;
    }
  } catch {
    return <Navigate to="/app/dashboard" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Root Route directly renders Secure Internal Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* Authenticated HR Admin Application Routes */}
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* HR Module */}
          <Route path="employees" element={<Employees />} />
          <Route path="directory" element={<Navigate to="/app/employees" replace />} />
          <Route path="hr/new-employee" element={<NewEmployee />} />
          <Route path="hr/employee-list" element={<Navigate to="/app/employees" replace />} />
          <Route path="hr/directory" element={<Navigate to="/app/employees" replace />} />
          <Route path="hr/roles" element={<Navigate to="/app/employees" replace />} />
          <Route path="hr/department" element={<Navigate to="/app/departments" replace />} />
          <Route path="hr/departments" element={<Navigate to="/app/departments" replace />} />
          <Route path="hr/designation" element={<Designation />} />
          <Route path="hr/designations" element={<Navigate to="/app/hr/designation" replace />} />
          <Route path="designation" element={<Navigate to="/app/hr/designation" replace />} />
          <Route path="designations" element={<Navigate to="/app/hr/designation" replace />} />

          {/* Attendance & Schedule */}
          <Route path="attendance" element={<Attendance />} />
          <Route path="employment-status" element={<EmploymentStatus />} />

          {/* Leave & Holiday */}
          <Route path="leaves" element={<Leaves />} />
          <Route path="leave" element={<Navigate to="/app/leaves" replace />} />
          <Route path="holiday" element={<Navigate to="/app/holiday/public" replace />} />
          <Route path="holiday/weekly" element={<Navigate to="/app/holiday/public" replace />} />
          <Route path="holiday/public" element={<PublicHoliday />} />
          <Route path="leave-policy" element={<LeavePolicy />} />

          {/* Payroll Module */}
          <Route path="payroll" element={<Payroll />} />
          <Route path="payroll/calculate" element={<CalculatePayroll />} />
          <Route path="payroll/payslips" element={<PayslipList />} />

          {/* Financial Accounts */}
          <Route path="accounts" element={<Accounts />} />
          <Route path="reports" element={<Navigate to="/app/dashboard" replace />} />

          {/* Engagement & Operations */}
          <Route path="announcement" element={<Announcement />} />
          <Route path="award" element={<Navigate to="/app/announcement" replace />} />
          <Route path="project" element={<Navigate to="/app/dashboard" replace />} />

          {/* Recruitment Module */}
          <Route path="recruitment/job-category" element={<JobCategory />} />
          <Route path="recruitment/job-type" element={<JobType />} />
          <Route path="recruitment/job-location" element={<JobLocation />} />
          <Route path="recruitment/job-skills" element={<JobSkills />} />
          <Route path="recruitment/job-experience" element={<JobExperience />} />
          <Route path="recruitment/jobs" element={<Jobs />} />
          <Route path="recruitment/applications" element={<JobApplication />} />
          <Route path="recruitment/board" element={<JobBoard />} />
          <Route path="recruitment/interviews" element={<JobInterview />} />
          <Route path="recruitment/desk" element={<JobDesk />} />

          {/* System */}
          <Route path="departments" element={<Departments />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="access-control"
            element={
              <AdminRoute>
                <UserAccessControl />
              </AdminRoute>
            }
          />
          <Route path="access" element={<Navigate to="/app/access-control" replace />} />
        </Route>

        {/* Authenticated Employee Self-Service Portal Routes */}
        <Route path="/employee" element={<EmployeeLayout />}>
          <Route index element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="attendance" element={<EmployeeAttendance />} />
          <Route path="leaves" element={<EmployeeLeaves />} />
          <Route path="payslips" element={<EmployeePayslips />} />
          <Route path="announcements" element={<EmployeeAnnouncements />} />
          <Route path="holidays" element={<EmployeeHolidays />} />
          <Route path="directory" element={<Navigate to="/employee/dashboard" replace />} />
          <Route path="helpdesk" element={<EmployeeHelpdesk />} />
          <Route path="documents" element={<EmployeeDocuments />} />
          <Route path="profile" element={<EmployeeProfile />} />
          <Route path="settings" element={<EmployeeSettings />} />
        </Route>


        {/* Catch-All Route redirects to Root Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;