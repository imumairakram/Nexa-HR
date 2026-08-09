import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  DollarSign,
  ShieldCheck,
  Upload,
  Mail,
  Phone,
  Calendar,
  Lock,
} from 'lucide-react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';

const STEPS = [
  { id: 1, label: 'Personal Information', icon: User },
  { id: 2, label: 'Job & Hierarchy', icon: Building2 },
  { id: 3, label: 'Compensation & Perks', icon: DollarSign },
  { id: 4, label: 'System Access & Review', icon: ShieldCheck },
];

const NewEmployee = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [toastMsg, setToastMsg] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '1995-05-15',
    gender: 'Male',
    address: '123 Market St, San Francisco, CA',
    // Step 2
    department: 'Engineering & DevOps',
    designation: 'Senior Full-Stack Engineer',
    employeeCode: 'EMP-108',
    reportingManager: 'Alex Mercer',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'FULL_TIME',
    // Step 3
    baseSalary: '135000',
    currency: 'USD',
    taxBracket: 'Federal Standard W-4',
    healthInsurance: 'Comprehensive Tier 1',
    // Step 4
    systemRole: 'EMPLOYEE',
    defaultPassword: 'TempPassword123!',
  });

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleComplete = (e) => {
    e.preventDefault();
    setToastMsg(`Employee ${form.firstName} ${form.lastName} successfully onboarded!`);
    setTimeout(() => {
      navigate('/app/employees');
    }, 1500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 max-w-4xl mx-auto">
      <AppPageHeader
        title="Employee Onboarding Wizard"
        subtitle="Step-by-step guided workflow to register new team members, configure salary bands, and grant system credentials."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PROGRESS STEPPER */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isDone
                      ? 'bg-emerald-500 text-white'
                      : isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">STEP 0{step.id}</div>
                  <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{step.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FORM STEP CONTENT */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Personal & Contact Dossier</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Last Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hayes"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Personal Work Email *</label>
                <input
                  type="email"
                  required
                  placeholder="jordan.hayes@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Mobile Phone *</label>
                <input
                  type="text"
                  placeholder="+1 (555) 019-4820"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Department & Organization Placement</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Assigned Department *</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Engineering & DevOps">Engineering & DevOps</option>
                  <option value="Product & Design">Product & Design</option>
                  <option value="People Operations & HR">People Operations & HR</option>
                  <option value="Marketing & Sales">Marketing & Sales</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Designation Title *</label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Employee ID Code</label>
                <input
                  type="text"
                  value={form.employeeCode}
                  onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Employment Type</label>
                <select
                  value={form.employmentType}
                  onChange={(e) => setForm({ ...form, employmentType: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="FULL_TIME">Full-Time Permanent</option>
                  <option value="REMOTE">Full-Time Remote</option>
                  <option value="CONTRACT">Fixed-Term Contractor</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Compensation & Benefits Structure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Annual Base Salary ($ USD) *</label>
                <input
                  type="number"
                  value={form.baseSalary}
                  onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Tax Withholding Bracket</label>
                <input
                  type="text"
                  value={form.taxBracket}
                  onChange={(e) => setForm({ ...form, taxBracket: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-4 text-xs animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Credentials & System Access Review</h3>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-2">
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Employee Name:</span>
                <span className="text-slate-900 dark:text-white">{form.firstName || 'New'} {form.lastName || 'Staff'}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Department:</span>
                <span className="text-blue-600 dark:text-blue-400">{form.department}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Annual Compensation:</span>
                <span className="text-emerald-600">${parseFloat(form.baseSalary || 0).toLocaleString()} / yr</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">System Role Authorization:</span>
                <span className="text-purple-600">{form.systemRole}</span>
              </div>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              currentStep === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="px-7 py-2.5 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-2 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Onboard</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewEmployee;
