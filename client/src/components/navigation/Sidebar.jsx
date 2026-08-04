import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutGrid,
  ClipboardCheck,
  SlidersHorizontal,
  BookOpen,
  BarChart2,
  FileText,
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { label: 'Dashboard', path: '/app/dashboard', icon: LayoutGrid, isPrimary: true },
    { label: 'Employees', path: '/app/employees', icon: ClipboardCheck },
    { label: 'Attendance', path: '/app/attendance', icon: SlidersHorizontal },
    { label: 'Leaves', path: '/app/leaves', icon: BookOpen },
    { label: 'Payroll', path: '/app/payroll', icon: BarChart2 },
    { label: 'Settings', path: '/app/settings', icon: FileText },
  ];

  return (
    <aside className="hidden lg:flex flex-col items-center py-6 px-3 bg-white rounded-[28px] fixed left-3 top-3 bottom-3 shadow-soft justify-between border border-slate-100/80 shrink-0 w-16 z-40">
      {/* Top Navigation Icons */}
      <div className="flex flex-col items-center space-y-5 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                `w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <Icon className="w-4 h-4 stroke-[2]" />
            </NavLink>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
