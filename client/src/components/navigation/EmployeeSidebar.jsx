import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Clock,
  CalendarDays,
  CreditCard,
  FolderKanban,
  Megaphone,
  Award,
  Calendar,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Zap,
  CheckCircle2,
  Building2,
  Shield,
  ArrowRightLeft,
  Users,
  LifeBuoy,
  BookOpen,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../common/Logo';

const EmployeeSidebar = ({ isCollapsed = false, toggleSidebar }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const u = localStorage.getItem('user');
        if (u) setCurrentUser(JSON.parse(u));
      } catch {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const menuItems = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutGrid },
    { label: 'My Attendance', path: '/employee/attendance', icon: Clock },
    { label: 'My Leaves', path: '/employee/leaves', icon: CalendarDays },
    { label: 'My Payslips', path: '/employee/payslips', icon: CreditCard },
    { label: 'My Projects', path: '/employee/projects', icon: FolderKanban },
    { label: 'Company Directory', path: '/employee/directory', icon: Users },
    { label: 'Announcements', path: '/employee/announcements', icon: Megaphone },
    { label: 'Awards & Kudos', path: '/employee/awards', icon: Award },
    { label: 'Company Holidays', path: '/employee/holidays', icon: Calendar },
    { label: 'Helpdesk & Support', path: '/employee/helpdesk', icon: LifeBuoy },
    { label: 'Documents & Policies', path: '/employee/documents', icon: BookOpen },
    { label: 'My Profile', path: '/employee/profile', icon: User },
    { label: 'Settings', path: '/employee/settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between py-5 bg-white dark:bg-[#1E293B] rounded-[32px] fixed left-3 top-3 bottom-3 shadow-soft border border-slate-100/80 dark:border-slate-800 shrink-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20 px-2 items-center' : 'w-64 px-3'
      }`}
    >
      {/* Top Section: Brand Header & Scrollable Nav */}
      <div className="w-full flex-1 flex flex-col min-h-0">
        <div
          className={`flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 ${
            isCollapsed ? 'flex-col space-y-3 items-center justify-center px-0' : 'flex-row px-2'
          }`}
        >
          {/* Logo Brand */}
          <div className="flex flex-col">
            <Logo collapsed={isCollapsed} />
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 mt-1.5 pl-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-bold tracking-wider uppercase bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
                  Employee Portal
                </span>
              </div>
            )}
          </div>

          {/* Collapse / Expand Toggle Button */}
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav
          className={`flex-1 overflow-y-auto overflow-x-hidden pt-2 space-y-1 w-full ${
            isCollapsed ? 'no-scrollbar px-0' : 'custom-scrollbar pr-1'
          }`}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 ${
                    isCollapsed
                      ? 'w-11 h-11 rounded-2xl justify-center mx-auto my-1'
                      : 'gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold'
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50/80 dark:from-emerald-950/70 dark:to-teal-950/40 text-emerald-800 dark:text-emerald-300 font-bold shadow-xs border border-emerald-200/50 dark:border-emerald-800/40'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 stroke-[2] ${
                        isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls: Theme Toggle, Sign Out */}
      <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-1 shrink-0">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className={`flex items-center transition-all cursor-pointer ${
            isCollapsed
              ? 'w-11 h-11 rounded-2xl justify-center mx-auto text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              : 'w-full gap-3 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 stroke-[2] shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2] shrink-0" />
          )}
          {!isCollapsed && <span>{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          title="Sign Out"
          className={`flex items-center transition-all cursor-pointer ${
            isCollapsed
              ? 'w-11 h-11 rounded-2xl justify-center mx-auto text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              : 'w-full gap-3 px-3 py-2 rounded-2xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-400'
          }`}
        >
          <LogOut className="w-4 h-4 stroke-[2] shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default EmployeeSidebar;
