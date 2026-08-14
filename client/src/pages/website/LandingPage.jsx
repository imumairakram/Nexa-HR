import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight, Clock, CreditCard, ShieldCheck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#F4F4EC] text-slate-800 flex flex-col justify-between font-sans">
      {/* Public Navigation Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-slate-900">NexaHR</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-white/60 transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/register-admin"
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md"
          >
            Admin Setup
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pastelOrange-light text-pastelOrange-dark text-xs font-bold mb-6 shadow-sm border border-orange-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Internal Enterprise HRM Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 max-w-4xl tracking-tight leading-[1.15] mb-6">
          Streamlined Human Resource Management for Your Organization.
        </h1>

        <p className="text-lg text-slate-600 max-w-2xl mb-8 leading-relaxed">
          Manage your employee records, attendance tracking, leave requests, and monthly payroll processing—all in one secure, unified internal system.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <Link
            to="/app/dashboard"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-bold bg-emerald-500 text-white hover:bg-emerald-600 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <span>Open HRM Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto px-8 py-4 rounded-full text-base font-semibold bg-white text-slate-800 hover:bg-slate-50 transition-all shadow-soft flex items-center justify-center"
          >
            <span>Employee Sign In</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl text-left">
          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-pastelGreen-light text-pastelGreen-dark flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Employee Directory (PIM)</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Complete profile management, department hierarchies, job designations, and role-based access control.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-pastelOrange-light text-pastelOrange-dark flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Attendance & Leaves</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Web clock-in/out widgets, auto-late detection, work hours calculation, and leave approval workflows.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-soft border border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-pastelPurple-light text-pastelPurple-dark flex items-center justify-center mb-6">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Automated Payroll</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Fast monthly salary calculations factoring allowances, tax deductions, and unpaid leaves with payslips.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-500">
        <p>© 2026 NexaHR Enterprise System. Single-Company Architecture.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
