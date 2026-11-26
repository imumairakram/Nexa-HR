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
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-0">
      <nav className="bg-[#111111] dark:bg-[#0a0a0a] rounded-2xl px-2 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.45)] flex items-center justify-around border border-white/5">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-1 px-3.5 py-2 rounded-[14px] transition-all duration-200 min-w-[52px] ${
                  isActive
                    ? 'bg-white text-[#111111] font-bold shadow-sm'
                    : 'text-white/50 hover:text-white/90'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-[18px] h-[18px] transition-all duration-200 ${
                      isActive ? 'stroke-[2.4]' : 'stroke-[1.6]'
                    }`}
                  />
                  <span
                    className={`text-[10px] tracking-wide font-semibold transition-all duration-200 ${
                      isActive ? 'opacity-100' : 'opacity-70'
                    }`}
                  >
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
