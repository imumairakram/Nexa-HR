import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearSession } from '../../utils/session';
import { api } from '../../services/api';
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
  LifeBuoy,
  BookOpen,
  X,
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
    window.addEventListener('user_profile_updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user_profile_updated', handleStorageChange);
    };
  }, []);

  // Mobile Drawer State & Event Listeners
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsMobileOpen(true);
    const handleClose = () => setIsMobileOpen(false);
    const handleToggle = () => setIsMobileOpen((prev) => !prev);

    window.addEventListener('nexahr_open_mobile_sidebar', handleOpen);
    window.addEventListener('nexahr_close_mobile_sidebar', handleClose);
    window.addEventListener('nexahr_toggle_mobile_sidebar', handleToggle);

    return () => {
      window.removeEventListener('nexahr_open_mobile_sidebar', handleOpen);
      window.removeEventListener('nexahr_close_mobile_sidebar', handleClose);
      window.removeEventListener('nexahr_toggle_mobile_sidebar', handleToggle);
    };
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Handle escape key and body scroll lock when mobile drawer is open
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    if (isMobileOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const handleLogout = () => {
    api.logout().catch(() => {});
    clearSession();
    window.location.href = '/';
  };

  const menuItems = [
    { label: 'Dashboard', path: '/employee/dashboard', icon: LayoutGrid },
    { label: 'My Attendance', path: '/employee/attendance', icon: Clock },
    { label: 'My Leaves', path: '/employee/leaves', icon: CalendarDays },
    { label: 'My Payslips', path: '/employee/payslips', icon: CreditCard },
    { label: 'Announcements', path: '/employee/announcements', icon: Megaphone },
    { label: 'Company Holidays', path: '/employee/holidays', icon: Calendar },
    { label: 'Helpdesk & Support', path: '/employee/helpdesk', icon: LifeBuoy },
    { label: 'Documents & Policies', path: '/employee/documents', icon: BookOpen },
    { label: 'My Profile', path: '/employee/profile', icon: User },
    { label: 'Settings', path: '/employee/settings', icon: Settings },
  ];


  return (
    <>
      <aside
      className={`hidden lg:flex flex-col justify-between py-5 bg-white dark:bg-[#16211E] rounded-[20px] fixed left-3 top-3 bottom-3 shadow-subtle border border-[#E2E1DC] dark:border-[#273834] shrink-0 z-40 transition-all duration-300 ${
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
                <span className="inline-block w-2 h-2 rounded-full bg-teal-500"></span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700 dark:text-teal-400">
                  Employee Portal
                </span>
              </div>
            )}
          </div>

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSidebar();
            }}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="w-8 h-8 rounded-[8px] bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shadow-xs border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shrink-0"
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
          className={`flex-1 overflow-y-auto overflow-x-hidden pt-2 space-y-1 w-full no-scrollbar ${
            isCollapsed ? 'px-0' : 'pr-1'
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
                      ? 'w-11 h-11 rounded-[8px] justify-center mx-auto my-1'
                      : 'gap-3 px-3 py-2.5 rounded-[8px] text-xs font-semibold'
                  } ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold shadow-xs border border-teal-200/50 dark:border-teal-800/40'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 stroke-[2] ${
                        isActive
                          ? 'text-teal-700 dark:text-teal-400'
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
              ? 'w-11 h-11 rounded-[8px] justify-center mx-auto text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              : 'w-full gap-3 px-3 py-2 rounded-[8px] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
              ? 'w-11 h-11 rounded-[8px] justify-center mx-auto text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              : 'w-full gap-3 px-3 py-2 rounded-[8px] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <LogOut className="w-4 h-4 stroke-[2] shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>

    {/* Mobile Left Sidebar Drawer for Employee Portal */}
    {isMobileOpen && (
      <div className="lg:hidden fixed inset-0 z-[70] flex">
        {/* Backdrop Blur Overlay */}
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />

        {/* Slide-over Left Navigation Panel */}
        <aside
          className="relative w-[285px] max-w-[85vw] h-full bg-white dark:bg-[#16211E] shadow-2xl z-10 flex flex-col justify-between p-4 border-r border-slate-200/80 dark:border-slate-800 animate-in slide-in-from-left duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Employee Navigation Menu"
        >
          {/* Top Section: Brand & Close Button */}
          <div className="w-full flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <Logo collapsed={false} />
                <div className="flex items-center gap-1.5 mt-1.5 pl-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-500" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700 dark:text-teal-400">
                    Employee Portal
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                title="Close Navigation Menu"
                aria-label="Close Navigation Menu"
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Navigation Items */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-3 space-y-1 w-full pr-1 custom-scrollbar">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-200 font-bold shadow-xs border border-teal-200/50 dark:border-teal-800/40'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon
                          className={`w-4 h-4 shrink-0 stroke-[2] ${
                            isActive
                              ? 'text-teal-700 dark:text-teal-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section: Theme & Logout */}
          <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1 shrink-0">
            {/* User Profile Mini Dossier */}
            {currentUser?.firstName && (
              <div className="px-3 py-2 rounded-[8px] bg-slate-50 dark:bg-slate-800/60 mb-2 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {currentUser.firstName} {currentUser.lastName || ''}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {currentUser.role || 'Employee'} • {currentUser.email || ''}
                  </p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              </div>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 stroke-[2] shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400 stroke-[2] shrink-0" />
              )}
              <span>{resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-[8px] text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-400 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4 stroke-[2] shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>
      </div>
    )}
  </>
  );
};

export default EmployeeSidebar;
