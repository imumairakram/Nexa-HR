import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import MobileBottomNav from '../components/navigation/MobileBottomNav';

const MainLayout = () => {
  const token = localStorage.getItem('token');
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('nexahr_sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('nexahr_sidebar_collapsed', String(next));
      return next;
    });
  };

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className={`min-h-screen bg-[#F4F4F7] dark:bg-[#0B0F19] flex text-slate-800 dark:text-slate-100 antialiased font-sans p-3 md:p-6 transition-all duration-300 ${
        isCollapsed ? 'lg:pl-[120px]' : 'lg:pl-[296px]'
      }`}
    >
      {/* Fixed Left Sidebar with Collapse/Expand */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 transition-all duration-300">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
