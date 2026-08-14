import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Clock,
  CalendarDays,
  CreditCard,
  User,
  MoreHorizontal,
  FolderKanban,
  Users,
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
    { label: 'Company Directory', path: '/employee/directory', icon: Users },
    { label: 'Announcements', path: '/employee/announcements', icon: Megaphone },
    { label: 'Holidays', path: '/employee/holidays', icon: Calendar },
    { label: 'Helpdesk & Support', path: '/employee/helpdesk', icon: LifeBuoy },
    { label: 'Documents & Policies', path: '/employee/documents', icon: BookOpen },
    { label: 'My Profile', path: '/employee/profile', icon: User },
    { label: 'Settings', path: '/employee/settings', icon: Settings },
  ];


  return (
    <>
      {/* More Drawer Modal for Mobile */}
      {isMoreOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex flex-col justify-end p-3">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4 animate-in slide-in-from-bottom-6 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                All Portal Modules
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {moreItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setIsMoreOpen(false);
                    }}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 leading-tight">
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-[#F4F4F7] via-[#F4F4F7]/90 dark:from-[#0B0F19] dark:via-[#0B0F19]/90 to-transparent">
        <nav className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl p-1.5 shadow-2xl flex items-center justify-around border border-slate-200/80 dark:border-slate-800">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-600 text-white font-bold scale-105 shadow-md shadow-emerald-600/20'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}

          {/* More trigger */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
            <span className="text-[10px] tracking-tight">More</span>
          </button>
        </nav>
      </div>
    </>
  );
};

export default EmployeeBottomNav;
