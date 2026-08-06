import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/website/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/app/Dashboard';
import Employees from './pages/app/Employees';
import Attendance from './pages/app/Attendance';
import Leaves from './pages/app/Leaves';
import Payroll from './pages/app/Payroll';
import Departments from './pages/app/Departments';
import Settings from './pages/app/Settings';
import Profile from './pages/app/Profile';

// HR Sub-pages
import NewEmployee from './pages/app/hr/NewEmployee';
import RolePermissions from './pages/app/hr/RolePermissions';
import Designation from './pages/app/hr/Designation';

// Attendance & Schedule
import EmploymentStatus from './pages/app/EmploymentStatus';

// Leave & Holiday
import WeeklyHoliday from './pages/app/holiday/WeeklyHoliday';
import PublicHoliday from './pages/app/holiday/PublicHoliday';
import LeavePolicy from './pages/app/LeavePolicy';

// Payroll Sub-pages
import CalculatePayroll from './pages/app/payroll/CalculatePayroll';
import PayslipList from './pages/app/payroll/PayslipList';

// Accounts & Reports
import Accounts from './pages/app/Accounts';
import Reports from './pages/app/Reports';

// Engagement & Operations
import Announcement from './pages/app/Announcement';
import Award from './pages/app/Award';
import ProjectManagement from './pages/app/ProjectManagement';

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

function App() {
  return (
    <Router>
      <Routes>
        {/* Root Route directly renders Secure Internal Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* Authenticated Internal Application Routes */}
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          
          {/* HR Module */}
          <Route path="employees" element={<Employees />} />
          <Route path="hr/new-employee" element={<NewEmployee />} />
          <Route path="hr/employee-list" element={<Navigate to="/app/employees" replace />} />
          <Route path="hr/roles" element={<RolePermissions />} />
          <Route path="hr/designation" element={<Designation />} />

          {/* Attendance & Schedule */}
          <Route path="attendance" element={<Attendance />} />
          <Route path="employment-status" element={<EmploymentStatus />} />

          {/* Leave & Holiday */}
          <Route path="leaves" element={<Leaves />} />
          <Route path="leave" element={<Navigate to="/app/leaves" replace />} />
          <Route path="holiday/weekly" element={<WeeklyHoliday />} />
          <Route path="holiday/public" element={<PublicHoliday />} />
          <Route path="leave-policy" element={<LeavePolicy />} />

          {/* Payroll Module */}
          <Route path="payroll" element={<Payroll />} />
          <Route path="payroll/calculate" element={<CalculatePayroll />} />
          <Route path="payroll/payslips" element={<PayslipList />} />

          {/* Financial & Analytics */}
          <Route path="accounts" element={<Accounts />} />
          <Route path="reports" element={<Reports />} />

          {/* Engagement & Operations */}
          <Route path="announcement" element={<Announcement />} />
          <Route path="award" element={<Award />} />
          <Route path="project" element={<ProjectManagement />} />

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
        </Route>

        {/* Catch-All Route redirects to Root Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

