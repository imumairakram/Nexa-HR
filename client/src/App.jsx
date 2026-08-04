import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/website/Login';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/app/Dashboard';
import Employees from './pages/app/Employees';

function App() {
  return (
    <Router>
      <Routes>
        {/* Root Route directly renders Secure Internal Login */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Navigate to="/" replace />} />

        {/* Authenticated Internal Application Routes (Web & Mobile Layout) */}
        <Route path="/app" element={<MainLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="attendance" element={<Dashboard />} />
          <Route path="leaves" element={<Dashboard />} />
          <Route path="payroll" element={<Dashboard />} />
          <Route path="departments" element={<Dashboard />} />
          <Route path="settings" element={<Dashboard />} />
        </Route>

        {/* Catch-All Route redirects to Root Login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
