import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import MobileBottomNav from '../components/navigation/MobileBottomNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-[#F4F4F7] flex text-slate-800 antialiased font-sans p-3 md:p-6 lg:pl-[96px]">
      {/* 100% Fixed Left Sidebar */}
      <Sidebar />

      {/* Scrollable Main Content Area with Generous Right Space from Sidebar */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>

      {/* Mobile Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;
