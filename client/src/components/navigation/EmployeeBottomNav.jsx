import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Clock,
  CalendarDays,
  CreditCard,
  User,
  MoreHorizontal,
  Megaphone,
  Award,
  Calendar,
  LifeBuoy,
  BookOpen,
  Settings,
  X,
} from 'lucide-react';

const EmployeeBottomNav = () => {
  const navigate = useNavigate();
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const mainNavItems = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutGrid },
    { label: 'Attendance', path: '/employee/attendance', icon: Clock },
    { label: 'Leaves', path: '/employee/leaves', icon: CalendarDays },
    { label: 'Payslips', path: '/employee/payslips', icon: CreditCard },
  ];

  const moreItems = [
    { label: 'Announcements', path: '/employee/announcements', icon: Megaphone },
    { label: 'Holidays', path: '/employee/holidays', icon: Calendar },
    { label: 'Helpdesk & Support', path: '/employee/helpdesk', icon: LifeBuoy },
    { label: 'Documents & Policies', path: '/employee/documents', icon: BookOpen },
    { label: 'My Profile', path: '/employee/profile', icon: User },
    { label: 'Settings', path: '/employee/settings', icon: Settings },
  ];

  return (
    <>
      {/* More Drawer Modal */}
      {isMoreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end"
          onClick={() => setIsMoreOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Sheet */}
          <div
            className="relative bg-[#111111] rounded-t-3xl p-5 pb-8 shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-200 border-t border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center mb-1">
              <div className="w-10 h-1 rounded-full bg-white/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-[11px] font-black uppercase tracking-widest text-white/40">
                All Modules
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white cursor-pointer transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMoreOpen(false);
                    }}
                    className="p-3.5 rounded-2xl bg-white/8 hover:bg-white/15 border border-white/8 hover:border-white/20 flex flex-col items-center gap-2 text-center transition-all cursor-pointer group active:scale-95"
                  >
                    <Icon className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                    <span className="text-[11px] font-semibold text-white/60 group-hover:text-white leading-tight transition-colors">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-3 pt-0">
        <nav className="bg-[#111111] dark:bg-[#0a0a0a] rounded-full p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.45)] flex items-center justify-between border border-white/5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-full transition-all duration-200 flex-1 ${
                    isActive
                      ? 'bg-white text-[#111111] font-bold shadow-sm'
                      : 'text-white/55 hover:text-white/90'
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

          {/* More trigger */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-full text-white/55 hover:text-white/90 transition-all cursor-pointer flex-1"
          >
            <MoreHorizontal className="w-[18px] h-[18px] stroke-[1.6]" />
            <span className="text-[10px] tracking-wide font-semibold opacity-70">More</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default EmployeeBottomNav;
