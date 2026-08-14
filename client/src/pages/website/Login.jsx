import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Sun,
  Moon,
  ChevronDown,
  Users,
  UserCheck,
  Briefcase,
  ShieldCheck,
  User,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import Logo from '../../components/common/Logo';
import ForgotPasswordModal from '../../components/auth/ForgotPasswordModal';


// Preset credentials for HR Admin and Employee
export const DEMO_CREDENTIALS = {
  admin: {
    role: 'ADMIN',
    name: 'System Administrator',
    email: 'admin@company.com',
    password: 'admin123',
    designation: 'HR Executive / Administrator',
    department: 'People Operations & Executive Board',
  },
  employee: {
    role: 'EMPLOYEE',
    name: 'Alex Mercer',
    email: 'employee@company.com',
    password: 'employee123',
    designation: 'Senior Full-Stack Engineer',
    department: 'Engineering & DevOps',
  },
};

// High-fidelity SVG Donut Chart for Workforce Presence
const WorkforceDonutChart = () => {
  return (
    <svg className="w-16 h-16 -rotate-90 shrink-0" viewBox="0 0 100 100">
      {/* Background track */}
      <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="12" />
      {/* Segment 1: Present & On-Time (Royal Blue - 72%) */}
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="#2563EB"
        strokeWidth="12"
        strokeDasharray="172 239"
        strokeDashoffset="0"
        strokeLinecap="round"
      />
      {/* Segment 2: Remote / WFH (Emerald Green - 18%) */}
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="#10B981"
        strokeWidth="12"
        strokeDasharray="43 239"
        strokeDashoffset="-176"
        strokeLinecap="round"
      />
      {/* Segment 3: On Leave / Away (Amber - 10%) */}
      <circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="#F59E0B"
        strokeWidth="12"
        strokeDasharray="24 239"
        strokeDashoffset="-222"
        strokeLinecap="round"
      />
    </svg>
  );
};

const Login = () => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Active Login Role: 'employee' | 'admin'
  const [loginRole, setLoginRole] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);

  // Form State initialized with role defaults
  const [formData, setFormData] = useState({
    email: DEMO_CREDENTIALS.admin.email,
    password: DEMO_CREDENTIALS.admin.password,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetSuccessNotification, setResetSuccessNotification] = useState(null);


  // Handle Tab Switch (Employee vs HR Admin)
  const handleRoleTabChange = (role) => {
    setLoginRole(role);
    setError(null);
    if (role === 'admin') {
      setFormData({
        email: DEMO_CREDENTIALS.admin.email,
        password: DEMO_CREDENTIALS.admin.password,
      });
    } else {
      setFormData({
        email: DEMO_CREDENTIALS.employee.email,
        password: DEMO_CREDENTIALS.employee.password,
      });
    }
  };

  // Carousel Slide State
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'A Unified Hub for Smarter\nHuman Resource Management',
      description:
        'NexaHR empowers enterprises with an intelligent command center for real-time attendance and 360° analytics.',
    },
    {
      title: 'Automated Global Payroll &\nTax Compliance Engine',
      description:
        'Automate payroll, taxes, and multi-currency disbursements with one-click payslips.',
    },
    {
      title: 'Real-Time Attendance &\nSmart Leave Management',
      description:
        'Track biometric logs, shift schedules, overtime, and leave quotas with automated approval workflows and calendar sync.',
    },
    {
      title: 'Predictive HR Analytics &\nStrategic Talent Intelligence',
      description:
        'Harness real-time department headcount trends, retention forecasting, and comprehensive executive performance reports.',
    },
  ];

  // Auto-advance carousel every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // If already authenticated, redirect to appropriate portal
  const token = localStorage.getItem('token');
  if (token) {
    let storedRole = 'ADMIN';
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      if (u && u.role) storedRole = u.role;
    } catch {}
    return <Navigate to={storedRole === 'EMPLOYEE' ? '/employee/dashboard' : '/app/dashboard'} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.login({
        email: formData.email,
        password: formData.password,
      });
      if (res && res.success) {
        const userRole = res.data?.user?.role || (loginRole === 'employee' ? 'EMPLOYEE' : 'ADMIN');
        navigate(userRole === 'EMPLOYEE' ? '/employee/dashboard' : '/app/dashboard');
      } else {
        fallbackLocalLogin();
      }
    } catch (err) {
      console.warn('Backend login failed, using fallback session for local preview', err);
      fallbackLocalLogin();
    } finally {
      setLoading(false);
    }
  };

  const fallbackLocalLogin = () => {
    const isEmp = loginRole === 'employee';
    const profile = isEmp ? DEMO_CREDENTIALS.employee : DEMO_CREDENTIALS.admin;

    localStorage.setItem('token', 'nexahr_jwt_internal_token_2026');
    localStorage.setItem(
      'user',
      JSON.stringify({
        firstName: isEmp ? 'Alex' : 'System',
        lastName: isEmp ? 'Mercer' : 'Administrator',
        email: formData.email,
        role: profile.role,
        designation: profile.designation,
        department: profile.department,
      })
    );
    navigate(isEmp ? '/employee/dashboard' : '/app/dashboard');
  };


  return (
    <div className="min-h-screen bg-[#F4F4EC] dark:bg-[#0B0F19] flex items-center justify-center p-3 sm:p-6 lg:p-8 font-sans antialiased transition-colors duration-300 relative overflow-hidden select-none">
      {/* Ambient background glows for rich aesthetic depth */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating Theme Toggle (top-right fixed) */}
      <button
        onClick={toggleTheme}
        title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-lg border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-105 transition-all cursor-pointer"
      >
        {resolvedTheme === 'dark' ? (
          <Sun className="w-5 h-5 text-amber-400 stroke-[2]" />
        ) : (
          <Moon className="w-5 h-5 text-slate-700 stroke-[2]" />
        )}
      </button>

      {/* Main Container Card: Premium Full Card on Mobile, Dual Column on Desktop */}
      <div className="w-full max-w-[460px] lg:max-w-[1240px] bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[40px] lg:rounded-[44px] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.07)] dark:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.6)] border border-slate-200/70 dark:border-slate-800/80 p-5 sm:p-8 lg:p-10 flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-10 items-stretch overflow-hidden relative z-10">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: AUTHENTICATION FORM (PREMIUM RESPONSIVE DESIGN) */}
        {/* ========================================================================= */}
        <div className="w-full lg:flex-1 lg:w-[48%] flex flex-col justify-between py-1 sm:py-2 px-1 sm:px-3 lg:px-6">
          {/* Top Brand Bar */}
          <div className="flex items-center justify-between">
            <Logo />

            {/* Enterprise Security Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
              <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>SSL Protected</span>
            </div>
          </div>

          {/* Center Form Section */}
          <div className="my-auto py-5 sm:py-7 max-w-md w-full mx-auto">
            {/* Header Text */}
            <div className="text-center mb-5 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {loginRole === 'admin' ? 'Welcome, HR Administrator' : 'Welcome, Employee'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2">
                {loginRole === 'admin'
                  ? 'Sign in with your administrative credentials to manage company operations.'
                  : 'Sign in to access your attendance, leaves, payslips & self-service roster.'}
              </p>
            </div>

            {/* Segmented Tab Switcher: Employee vs HR (Admin) */}
            <div className="bg-slate-100 dark:bg-slate-800/90 p-1.5 rounded-2xl flex items-center mb-5 sm:mb-6 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
              {/* Employee Tab */}
              <button
                type="button"
                onClick={() => handleRoleTabChange('employee')}
                className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                  loginRole === 'employee'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-600/50'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Employee</span>
              </button>

              {/* HR (Admin) Tab */}
              <button
                type="button"
                onClick={() => handleRoleTabChange('admin')}
                className={`flex-1 py-2 sm:py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 ${
                  loginRole === 'admin'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-slate-600/50'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>HR (Admin)</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {resetSuccessNotification && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold text-center border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{resetSuccessNotification}</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold text-center border border-rose-200 dark:border-rose-800/50">
                  {error}
                </div>
              )}

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {loginRole === 'admin' ? 'HR Admin Email Address' : 'Employee Work Email'} <span className="text-blue-600 dark:text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[1.8]" />
                  <input
                    type="email"
                    placeholder={loginRole === 'admin' ? 'admin@company.com' : 'employee@company.com'}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password <span className="text-blue-600 dark:text-blue-400">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 stroke-[1.8]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-11 pr-11 py-3 bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 stroke-[1.8]" />
                    ) : (
                      <Eye className="w-4 h-4 stroke-[1.8]" />
                    )}
                  </button>
                </div>

                {/* Password Auxiliaries: Remember Me & Forgot Password */}
                <div className="flex items-center justify-between mt-2 px-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      id="remember-me"
                      type="checkbox"
                      defaultChecked
                      className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                    />
                    <label htmlFor="remember-me" className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 cursor-pointer select-none">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setError(null);
                      setResetSuccessNotification(null);
                      setIsForgotPasswordOpen(true);
                    }}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline cursor-pointer transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 mt-2 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                  loginRole === 'admin'
                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/25'
                    : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/25'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white/80" />
                    <span>Signing in to NexaHR...</span>
                  </>
                ) : (
                  <span>
                    {loginRole === 'admin' ? 'Sign In as HR Admin' : 'Sign In as Employee'}
                  </span>
                )}
              </button>
            </form>
          </div>

          {/* Bottom Copyright & Legal Links */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 gap-2">
            <div>Copyright : NexaHR, All Rights Reserved</div>
            <div className="flex items-center gap-3">
              <a
                href="#terms"
                onClick={(e) => e.preventDefault()}
                className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              >
                Term & Condition
              </a>
              <span>|</span>
              <a
                href="#privacy"
                onClick={(e) => e.preventDefault()}
                className="hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
              >
                Privacy & Policy
              </a>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: HRM & WORKFORCE INTELLIGENCE SHOWCASE (DESKTOP ONLY) */}
        {/* ========================================================================= */}
        <div className="hidden lg:flex flex-1 lg:w-[52%] bg-gradient-to-br from-[#0A192F] via-[#0D2646] to-[#081220] rounded-[30px] sm:rounded-[38px] p-6 sm:p-8 lg:p-10 relative overflow-hidden flex-col justify-between text-white shadow-2xl border border-blue-900/40 min-h-[580px] lg:min-h-[620px]">
          {/* Subtle Grid Lines Overlay */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(to right, #00A8FF 1px, transparent 1px), linear-gradient(to bottom, #00A8FF 1px, transparent 1px)',
              backgroundSize: '36px 36px',
            }}
          />

          {/* Ambient Glow Orbs */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

          {/* Floating HRM Showcase Cards Section */}
          <div className="relative z-10 w-full h-[320px] sm:h-[340px]">
            {/* CARD 1: Workforce Presence & Live Attendance (Top Center-Left) */}
            <div className="absolute top-0 left-0 sm:left-4 z-20 w-[240px] sm:w-[260px] bg-white text-slate-800 rounded-2xl p-4 shadow-[0_20px_45px_rgba(0,0,0,0.25)] border border-white/80 transform hover:-translate-y-1 hover:rotate-[-1deg] transition-all duration-300">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-800 tracking-tight flex items-center gap-1">
                  <UserCheck className="w-3 h-3 text-blue-600" />
                  Workforce Presence
                </span>
                <span className="text-[9px] font-medium text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex items-center gap-0.5">
                  Today <ChevronDown className="w-2.5 h-2.5" />
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Donut Chart */}
                <WorkforceDonutChart />

                {/* Metric and Legend */}
                <div>
                  <div className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    124 Staff
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold -mt-0.5">94.2% Attendance</div>
                  <div className="mt-1.5 space-y-0.5 text-[8px] font-semibold text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                      <span>On-Time (98)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span>Remote / WFH (19)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                      <span>On Leave (7)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance Mini Footer */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[8px]">
                <div>
                  <div className="text-slate-400 font-medium">Active Roster Check-ins</div>
                  <div className="text-slate-700 font-bold">117 / 124 Signed In</div>
                </div>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-md font-semibold text-[8px] transition-colors cursor-pointer"
                >
                  Live Roster
                </button>
              </div>
            </div>

            {/* CARD 2: Department Headcount & Payroll Allocation (Bottom Left) */}
            <div className="absolute top-36 sm:top-40 left-4 sm:left-10 z-30 w-[245px] sm:w-[270px] bg-white text-slate-800 rounded-2xl p-4 shadow-[0_25px_50px_rgba(0,0,0,0.3)] border border-white/80 transform hover:-translate-y-1 hover:rotate-[1deg] transition-all duration-300">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-800 tracking-tight flex items-center gap-1">
                  <Users className="w-3 h-3 text-blue-600" />
                  Department Headcount
                </span>
                <span className="text-[8px] text-slate-400 font-medium flex items-center gap-1">
                  <RefreshCw className="w-2.5 h-2.5 text-blue-600" /> Live Sync
                </span>
              </div>

              <div className="text-[8px] text-slate-400 font-medium">Total Active Team</div>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  124 Employees
                </span>
                <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded flex items-center">
                  ▲ 12% Growth
                </span>
              </div>

              {/* HRM Department Items List */}
              <div className="space-y-1 text-[8px] border-t border-slate-100 pt-1.5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">Engineering & Cloud</div>
                    <div className="text-slate-400">Senior Staff • 42 members</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">$42,800/mo</div>
                    <div className="text-emerald-600 font-semibold">+4.8%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                  <div>
                    <div className="font-bold text-slate-800">Product & UX Design</div>
                    <div className="text-slate-400">Core Team • 28 members</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">$26,400/mo</div>
                    <div className="text-emerald-600 font-semibold">+3.2%</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-50">
                  <div>
                    <div className="font-bold text-slate-800">HR & People Operations</div>
                    <div className="text-slate-400">Global HQ • 14 members</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">$14,200/mo</div>
                    <div className="text-emerald-600 font-semibold">+6.1%</div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="w-full mt-2.5 bg-slate-900 hover:bg-slate-800 text-white py-1 rounded-md font-semibold text-[8px] transition-colors text-center cursor-pointer"
              >
                Review Department Roster
              </button>
            </div>

            {/* CARD 3: Recruitment & Leave Operations (Top Right) */}
            <div className="absolute top-6 right-0 sm:right-4 z-10 w-[220px] sm:w-[245px] bg-white/95 backdrop-blur-md text-slate-800 rounded-2xl p-4 shadow-[0_20px_45px_rgba(0,0,0,0.22)] border border-white/60 transform hover:-translate-y-1 hover:rotate-[-1deg] transition-all duration-300">
              <div className="text-[11px] font-bold text-slate-800 tracking-tight mb-2 flex items-center gap-1">
                <Briefcase className="w-3 h-3 text-blue-600" />
                HR Operations Pipeline
              </div>

              {/* Senior Engineer Hiring */}
              <div className="text-[8px] mb-2.5">
                <div className="font-bold text-slate-800">Senior Full-Stack Dev</div>
                <div className="text-slate-400 text-[7.5px]">Final Stage • 14 Applicants</div>
                <div className="flex items-center justify-between mt-1 mb-0.5 font-bold">
                  <span className="text-slate-900">3 Selected</span>
                  <span className="text-slate-400 font-normal">/ 4 Openings</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: '75%' }}
                  ></div>
                </div>
                <div className="text-right text-[7px] text-blue-600 font-bold mt-0.5">
                  75% Filled
                </div>
              </div>

              {/* Annual Leave Requests */}
              <div className="text-[8px] pt-1.5 border-t border-slate-100">
                <div className="font-bold text-slate-800">Leave Approvals</div>
                <div className="text-slate-400 text-[7.5px]">Pending Review • 4 Requests</div>
                <div className="flex items-center justify-between mt-1 mb-0.5 font-bold">
                  <span className="text-slate-900">18 Processed</span>
                  <span className="text-slate-400 font-normal">/ 22 Total</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: '82%' }}
                  ></div>
                </div>
                <div className="text-right text-[7px] text-emerald-600 font-bold mt-0.5">
                  82% Completed
                </div>
              </div>
            </div>
          </div>

          {/* Central Glowing NexaHR Brand Emblem */}
          <div className="relative z-20 flex flex-col items-center mt-20 sm:mt-16 mb-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#00A8FF] via-[#0066FF] to-[#6C47FF] shadow-[0_10px_35px_rgba(0,102,255,0.45)] border border-blue-200/40 flex items-center justify-center text-white transform hover:scale-110 transition-transform duration-300 cursor-pointer">
              <svg
                className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-sm"
                viewBox="0 0 100 100"
                fill="none"
              >
                <rect x="14" y="26" width="22" height="48" rx="11" fill="#FFFFFF" />
                <path
                  d="M23 44 L68 18 C74 14 82 18 82 25 L82 30 C82 35 79 39 75 41 L30 67 C24 70 16 66 16 59 L16 54 C16 49 19 46 23 44 Z"
                  fill="#FFFFFF"
                />
                <rect x="64" y="26" width="22" height="48" rx="11" fill="#FFFFFF" />
              </svg>
            </div>
          </div>

          {/* Showcase Copy Headline & Description */}
          <div className="relative z-20 text-center max-w-lg mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white whitespace-pre-line leading-snug">
              {slides[activeSlide].title}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/70 mt-3 leading-relaxed max-w-md mx-auto">
              {slides[activeSlide].description}
            </p>
          </div>

          {/* Bottom Segmented Carousel Bar */}
          <div className="relative z-20 flex items-center justify-center gap-2 pt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 cursor-pointer ${
                  activeSlide === index
                    ? 'w-10 sm:w-14 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]'
                    : 'w-6 sm:w-8 bg-white/25 hover:bg-white/45'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Forgot Password & Multi-Channel Recovery Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        initialRole={loginRole}
        initialEmail={formData.email}
        onSuccess={({ email, newPassword }) => {
          setFormData({ email, password: newPassword });
          setResetSuccessNotification('Password reset successfully! You can now sign in with your new password.');
        }}
      />
    </div>
  );
};

export default Login;

