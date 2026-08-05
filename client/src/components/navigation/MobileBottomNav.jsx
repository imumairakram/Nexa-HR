import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Users, Clock, CalendarDays, Settings } from 'lucide-react';

const MobileBottomNav = () => {
  const mobileNavItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutGrid },
    { label: 'Employees', path: '/app/employees', icon: Users },
    { label: 'Attendance', path: '/app/attendance', icon: Clock },
    { label: 'Leaves', path: '/app/leaves', icon: CalendarDays },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-3 bg-gradient-to-t from-[#F4F4EC] via-[#F4F4EC]/90 to-transparent">
      <nav className="bg-slate-900/95 backdrop-blur-md rounded-3xl p-2.5 shadow-2xl flex items-center justify-around border border-slate-800">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-pastelOrange-DEFAULT text-slate-900 font-bold scale-105 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
