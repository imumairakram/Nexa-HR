import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
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
  Landmark,
  BarChart3,
  FolderKanban,
  Briefcase,
  Calendar,
  KeyRound,
  ShieldCheck,
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
      hr: path.includes('/app/hr') || path === '/app/employees' || path === '/app/departments',
      payroll: path.includes('/app/payroll'),
      recruitment: path.includes('/app/recruitment'),
    };
  });

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.email === 'admin@company.com';

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
        { label: 'Role & Permissions', path: '/app/hr/roles' },
        { label: 'Department', path: '/app/departments' },
        { label: 'Designation', path: '/app/hr/designation' },
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
        { label: 'Calculate Payroll', path: '/app/payroll/calculate' },
        { label: 'Payslip List', path: '/app/payroll/payslips' },
      ],
    },

    { type: 'link', label: 'Employment Status', path: '/app/employment-status', icon: UserCheck },
    { type: 'link', label: 'Leave', path: '/app/leaves', icon: CalendarDays },
    { type: 'link', label: 'Holiday', path: '/app/holiday/public', icon: Calendar },
    { type: 'link', label: 'Leave Policy', path: '/app/leave-policy', icon: FileText },
    { type: 'link', label: 'Announcement', path: '/app/announcement', icon: Megaphone },
    { type: 'link', label: 'Accounts', path: '/app/accounts', icon: Landmark },
    { type: 'link', label: 'Reports', path: '/app/reports', icon: BarChart3 },
    { type: 'link', label: 'Project', path: '/app/project', icon: FolderKanban },

    {
      type: 'accordion',
      key: 'recruitment',
      label: 'Recruitment',
      icon: Briefcase,
      defaultPath: '/app/recruitment/desk',
      children: [
        { label: 'Job Category', path: '/app/recruitment/job-category' },
        { label: 'Job Type', path: '/app/recruitment/job-type' },
        { label: 'Job Location', path: '/app/recruitment/job-location' },
        { label: 'Job Skills', path: '/app/recruitment/job-skills' },
        { label: 'Job Work Experience', path: '/app/recruitment/job-experience' },
        { label: 'Job', path: '/app/recruitment/jobs' },
        { label: 'Job Application', path: '/app/recruitment/applications' },
        { label: 'Job Board', path: '/app/recruitment/board' },
        { label: 'Job Interview', path: '/app/recruitment/interviews' },
        { label: 'Job Desk', path: '/app/recruitment/desk' },
      ],
    },

    ...(isAdmin
      ? [{ type: 'link', label: 'Access Control', path: '/app/access-control', icon: KeyRound }]
      : []),
    { type: 'link', label: 'Settings', path: '/app/settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden lg:flex flex-col justify-between py-5 bg-white dark:bg-[#1E293B] rounded-[32px] fixed left-3 top-3 bottom-3 shadow-soft border border-slate-100/80 dark:border-slate-800 shrink-0 z-40 transition-all duration-300 ${isCollapsed ? 'w-20 px-2 items-center' : 'w-64 px-3'
        }`}
    >
      {/* Top Section: Brand Header & Scrollable Nav */}
      <div className="w-full flex-1 flex flex-col min-h-0">
        <div
          className={`flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 ${isCollapsed ? 'flex-col space-y-3 items-center justify-center px-0' : 'flex-row px-2'
            }`}
        >
          {/* Logo Brand */}
          <Logo collapsed={isCollapsed} />

          {/* Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleSidebar();
            }}
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
          className={`flex-1 overflow-y-auto overflow-x-hidden pt-3 space-y-1 w-full ${isCollapsed ? 'no-scrollbar px-0' : 'custom-scrollbar pr-1'
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
                      ? 'w-11 h-11 rounded-2xl justify-center mx-auto my-1'
                      : 'gap-3 px-3 py-2 rounded-2xl text-xs font-semibold'
                    } ${isActive
                      ? 'bg-[#E6F4EA] dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-4 h-4 shrink-0 stroke-[2] ${isActive
                          ? 'text-emerald-600 dark:text-emerald-400'
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
                      ? 'w-11 h-11 rounded-2xl justify-center mx-auto my-1'
                      : 'px-3 py-2 rounded-2xl text-xs font-semibold'
                      } ${isChildActive
                        ? 'text-emerald-800 dark:text-emerald-400 font-bold bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon
                        className={`w-4 h-4 shrink-0 stroke-[2] ${isChildActive
                          ? 'text-emerald-600 dark:text-emerald-400'
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
                            `block px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all ${isActive
                              ? 'bg-emerald-100/70 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-300 font-bold'
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
            ? 'w-11 h-11 rounded-2xl justify-center mx-auto'
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
          className={`flex items-center transition-all cursor-pointer ${isCollapsed
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

export default Sidebar;

