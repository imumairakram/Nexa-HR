import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  Building2,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../common/Logo';

const Sidebar = ({ isCollapsed = false, toggleSidebar }) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutGrid },
    { label: 'Employees', path: '/app/employees', icon: Users },
    { label: 'Attendance', path: '/app/attendance', icon: Clock },
    { label: 'Leaves', path: '/app/leaves', icon: CalendarDays },
    { label: 'Payroll', path: '/app/payroll', icon: CreditCard },
    { label: 'Departments', path: '/app/departments', icon: Building2 },
    { label: 'My Profile', path: '/app/profile', icon: User },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between py-5 bg-white dark:bg-[#1E293B] rounded-[32px] fixed left-3 top-3 bottom-3 shadow-soft border border-slate-100/80 dark:border-slate-800 shrink-0 z-40 transition-all duration-300 ${
        isCollapsed ? 'w-20 px-2 items-center' : 'w-64 px-3'
      }`}
    >
      {/* Top Section: Brand Header & Collapse Toggle */}
      <div className="w-full space-y-5">
        <div
          className={`flex items-center justify-between ${
            isCollapsed ? 'flex-col space-y-3 items-center justify-center px-0' : 'flex-row px-2'
          }`}
        >
          {/* Logo Brand */}
          <Logo collapsed={isCollapsed} />

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

        {/* Navigation Items */}
        <nav className="flex flex-col space-y-1.5 w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex items-center transition-all duration-200 ${
                    isCollapsed
                      ? 'w-11 h-11 rounded-2xl justify-center mx-auto'
                      : 'gap-3.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold'
                  } ${
                    isActive
                      ? 'bg-[#E6F4EA] dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 shrink-0 stroke-[2] ${
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

      {/* Bottom Controls: Theme Toggle & Logout */}
      <div className="w-full pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-1.5">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className={`flex items-center transition-all cursor-pointer ${
            isCollapsed
              ? 'w-11 h-11 rounded-2xl justify-center mx-auto'
              : 'w-full gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 stroke-[2] shrink-0" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 dark:text-slate-400 stroke-[2] shrink-0" />
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
              : 'w-full gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-400'
          }`}
        >
          <LogOut className="w-5 h-5 stroke-[2] shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
