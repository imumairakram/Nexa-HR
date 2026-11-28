import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { clearSession } from '../../utils/session';
import { api } from '../../services/api';
import {
  LayoutGrid,
  Users,
  Clock,
  CalendarDays,
  CreditCard,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  UserCheck,
  FileText,
  Megaphone,
  Briefcase,
  Calendar,
  KeyRound,
  ShieldCheck,
  User,
  LifeBuoy,
  BookOpen,
  X,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../common/Logo';

const Sidebar = ({ isCollapsed = false, toggleSidebar }) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  // Track open state of accordion menus
  const [openMenus, setOpenMenus] = useState(() => {
    const path = location.pathname;
    return {
      hr: path.includes('/app/hr') || path === '/app/employees',
      payroll: path.includes('/app/payroll'),
      recruitment: path.includes('/app/recruitment'),
    };
  });

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

  const handleAccordionClick = (item) => {
    if (isCollapsed) {
      // When sidebar is collapsed, navigate directly to the primary page
      const targetPath = item.defaultPath || (item.children && item.children[0]?.path);
      if (targetPath) {
        navigate(targetPath);
      }
    } else {
      // When sidebar is expanded, toggle accordion expand/collapse
      setOpenMenus((prev) => ({
        ...prev,
        [item.key]: !prev[item.key],
      }));
    }
  };

  const handleLogout = () => {
    api.logout().catch(() => {});
    clearSession();
    window.location.href = '/';
  };

  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const isAdmin = currentUser?.role === 'ADMIN';

  const menuStructure = [
    { type: 'link', label: 'Dashboard', path: '/app/dashboard', icon: LayoutGrid },

    {
      type: 'accordion',
      key: 'hr',
      label: 'HR',
      icon: Users,
      defaultPath: '/app/employees',
      children: [
        { label: 'New Employee', path: '/app/hr/new-employee' },
        { label: 'Company Directory & Team', path: '/app/employees' },
      ],
    },

    { type: 'link', label: 'Attendance', path: '/app/attendance', icon: Clock },

    {
      type: 'accordion',
      key: 'payroll',
      label: 'Payroll',
      icon: CreditCard,
      defaultPath: '/app/payroll',
      children: [
        { label: 'Global Payroll Processing', path: '/app/payroll' },
        { label: 'Payslip List', path: '/app/payroll/payslips' },
      ],
    },

    { type: 'link', label: 'Employment Status', path: '/app/employment-status', icon: UserCheck },
    { type: 'link', label: 'Leave', path: '/app/leaves', icon: CalendarDays },
    { type: 'link', label: 'Holiday', path: '/app/holiday/public', icon: Calendar },
    { type: 'link', label: 'Leave Policy', path: '/app/leave-policy', icon: FileText },
    { type: 'link', label: 'Announcements', path: '/app/announcement', icon: Megaphone },
    { type: 'link', label: 'Helpdesk & Support', path: '/app/helpdesk', icon: LifeBuoy },
    { type: 'link', label: 'Documents & Policies', path: '/app/documents', icon: BookOpen },

    {
      type: 'accordion',
      key: 'recruitment',
      label: 'Recruitment',
      icon: Briefcase,
      defaultPath: '/app/recruitment/workspace',
      children: [
        { label: 'Workspace', path: '/app/recruitment/workspace' },
        { label: 'ATS Pipeline', path: '/app/recruitment/pipeline' },
      ],
    },

    ...(isAdmin
      ? [{ type: 'link', label: 'Access Control', path: '/app/access-control', icon: KeyRound }]
      : []),
    { type: 'link', label: 'Profile', path: '/app/profile', icon: User },
    { type: 'link', label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <>
      <aside
      className={`hidden lg:flex flex-col justify-between py-5 bg-white dark:bg-[#16211E] rounded-[20px] fixed left-3 top-3 bottom-3 shadow-subtle border border-[#E2E1DC] dark:border-[#273834] shrink-0 z-40 transition-all duration-300 ${isCollapsed ? 'w-20 px-2 items-center' : 'w-64 px-3'
        }`}
    >
      {/* Top Section: Brand Header & Scrollable Nav */}
      <div className="w-full flex-1 flex flex-col min-h-0">
        <div
          className={`flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 ${isCollapsed ? 'flex-col space-y-3 items-center justify-center px-0' : 'flex-row px-2'
            }`}
        >
          {/* Logo Brand */}
          <div className="flex flex-col">
            <Logo collapsed={isCollapsed} variant="sky" />
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 mt-1.5 pl-1">
                <span className="inline-block w-2 h-2 rounded-full bg-sky-500"></span>
                <span className="text-[10px] font-bold tracking-wider uppercase text-sky-700 dark:text-sky-400">
                  {isAdmin ? 'System Admin' : 'HR Portal'}
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
            className="w-8 h-8 rounded-[12px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer shrink-0"
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
          className={`flex-1 overflow-y-auto overflow-x-hidden pt-3 space-y-1 w-full no-scrollbar ${
            isCollapsed ? 'px-0' : 'pr-1'
          }`}
        >
          {menuStructure.map((item, index) => {
            if (item.type === 'link') {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={isCollapsed ? item.label : undefined}
                  className={({ isActive }) =>
                    `flex items-center transition-all duration-200 ${isCollapsed
                      ? 'w-11 h-11 rounded-[8px] justify-center mx-auto my-1'
                      : 'gap-3 px-3 py-2 rounded-[8px] text-xs font-semibold'
                    } ${isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 font-bold shadow-xs border border-sky-200/60 dark:border-sky-800/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 stroke-[2] ${isActive
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-500 dark:text-slate-400'
                          }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              );
            }

            if (item.type === 'accordion') {
              const Icon = item.icon;
              const isOpen = openMenus[item.key];
              const isChildActive = item.children.some((child) => location.pathname === child.path);

              return (
                <div key={item.key} className="w-full my-0.5">
                  <button
                    onClick={() => handleAccordionClick(item)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between transition-all duration-200 cursor-pointer ${isCollapsed
                      ? 'w-11 h-11 rounded-[12px] justify-center mx-auto my-1'
                      : 'px-3 py-2 rounded-[12px] text-xs font-semibold'
                      } ${isChildActive
                        ? 'text-sky-800 dark:text-sky-200 font-bold bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/40'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 stroke-[2] ${isChildActive
                          ? 'text-sky-600 dark:text-sky-400'
                          : 'text-slate-500 dark:text-slate-400'
                          }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isCollapsed && (
                      <span className="text-slate-400">
                        {isOpen ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </button>

                  {/* Submenu links */}
                  {!isCollapsed && isOpen && (
                    <div className="pl-7 pr-1 py-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-5 my-1">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            `block px-3 py-1.5 rounded-[8px] text-[11px] font-medium transition-all ${isActive
                              ? 'bg-sky-100/80 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 font-bold'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                            }`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return null;
          })}
        </nav>
      </div>

      {/* Bottom Controls: Theme Toggle & Logout */}
      <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-1 shrink-0">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className={`flex items-center transition-all cursor-pointer ${isCollapsed
            ? 'w-11 h-11 rounded-[12px] justify-center mx-auto'
            : 'w-full gap-3 px-3 py-2 rounded-[12px] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
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
          className={`flex items-center transition-all cursor-pointer ${isCollapsed
            ? 'w-11 h-11 rounded-[12px] justify-center mx-auto text-[#d91448] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            : 'w-full gap-3 px-3 py-2 rounded-[12px] text-xs font-semibold text-[#d91448] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300'
            }`}
        >
          <LogOut className="w-4 h-4 stroke-[2] shrink-0" />
          {!isCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>

    {/* Mobile Left Sidebar Drawer */}
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
          aria-label="Mobile Left Navigation Menu"
        >
          {/* Top Section: Logo & Close Button */}
          <div className="w-full flex-1 flex flex-col min-h-0">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <Logo collapsed={false} variant="sky" />
                <div className="flex items-center gap-1.5 mt-1.5 pl-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-sky-500"></span>
                  <span className="text-[10px] font-bold tracking-wider uppercase text-sky-700 dark:text-sky-400">
                    {isAdmin ? 'System Admin' : 'HR Portal'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                title="Close Navigation Menu"
                aria-label="Close Navigation Menu"
                className="w-8 h-8 rounded-[12px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Navigation Items */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-3 space-y-1 w-full pr-1 custom-scrollbar">
              {menuStructure.map((item) => {
                if (item.type === 'link') {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-200 font-bold shadow-xs border border-sky-200/60 dark:border-sky-800/50'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-4 h-4 shrink-0 stroke-[2] ${
                              isActive
                                ? 'text-sky-600 dark:text-sky-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  );
                }

                if (item.type === 'accordion') {
                  const Icon = item.icon;
                  const isOpen = openMenus[item.key];
                  const isChildActive = item.children.some((child) => location.pathname === child.path);

                  return (
                    <div key={item.key} className="w-full my-0.5">
                      <button
                        type="button"
                        onClick={() => toggleMenu(item.key)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[12px] text-xs font-semibold transition-all duration-200 cursor-pointer ${
                          isChildActive
                            ? 'text-sky-800 dark:text-sky-200 font-bold bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/50 dark:border-sky-800/40'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <Icon
                            className={`w-4 h-4 shrink-0 stroke-[2] ${
                              isChildActive
                                ? 'text-sky-600 dark:text-sky-400'
                                : 'text-slate-500 dark:text-slate-400'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        <span className="text-slate-400">
                          {isOpen ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </span>
                      </button>

                      {isOpen && (
                        <div className="pl-7 pr-1 py-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-5 my-1">
                          {item.children.map((child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              onClick={() => setIsMobileOpen(false)}
                              className={({ isActive }) =>
                                `block px-3 py-2 rounded-[8px] text-xs font-medium transition-all ${
                                  isActive
                                    ? 'bg-sky-100/80 dark:bg-sky-900/60 text-sky-900 dark:text-sky-200 font-bold'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                                }`
                              }
                            >
                              {child.label}
                            </NavLink>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                return null;
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
                    {currentUser.role || 'Staff'} • {(currentUser?.isDemo || currentUser?.isGuest)
                      ? (currentUser?.role === 'ADMIN' ? 'guest.hr@nexahr.com' : 'guest.employee@nexahr.com')
                      : (currentUser.email || '')}
                  </p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              </div>
            )}

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
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
              className="w-full flex items-center gap-3 px-3 py-2 rounded-[12px] text-xs font-semibold text-[#d91448] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300 transition-all cursor-pointer"
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

export default Sidebar;

