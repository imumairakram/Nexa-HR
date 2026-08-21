import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import MobileBottomNav from '../components/navigation/MobileBottomNav';
import ErrorBoundary from '../components/common/ErrorBoundary';
import FirstLoginPasswordModal from '../components/common/FirstLoginPasswordModal';

const MainLayout = () => {
  const [authToken] = useState(() => localStorage.getItem('token'));
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('nexahr_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('nexahr_sidebar_collapsed', String(next));
      } catch (e) {
        console.warn('LocalStorage error:', e);
      }
      return next;
    });
  };

  if (!authToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className={`min-h-screen bg-[#F4F4F7] dark:bg-[#0B0F19] flex text-slate-800 dark:text-slate-100 antialiased font-sans p-3 md:p-6 transition-all duration-300 ${
        isCollapsed ? 'lg:pl-[112px]' : 'lg:pl-[288px]'
      }`}
    >
      {/* Mandatory Password Change Modal for First Time Login */}
      <FirstLoginPasswordModal />

      {/* Fixed Left Sidebar with Collapse/Expand */}
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 transition-all duration-300">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {/* Mobile Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
