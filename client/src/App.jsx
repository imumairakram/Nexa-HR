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
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="payroll" element={<Payroll />} />
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
