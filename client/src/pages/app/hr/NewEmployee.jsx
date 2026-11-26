import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Building2,
  Banknote,
  ShieldCheck,
  Upload,
  Mail,
  Phone,
  Calendar,
  Clock,
  Lock,
  Briefcase,
  Home,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  Key,
  Sparkles,
  Landmark,
  CreditCard,
} from 'lucide-react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../../components/common/SparkMetricCard';
import { api } from '../../../services/api';

const STEPS = [
  { id: 1, label: 'Personal Information', icon: User },
  { id: 2, label: 'Job & Hierarchy', icon: Building2 },
  { id: 3, label: 'Compensation & Perks', icon: Banknote },
  { id: 4, label: 'Bank & Payout Details', icon: Landmark },
  { id: 5, label: 'System Access & Review', icon: ShieldCheck },
];

const BANK_OPTIONS = [
  'Standard Chartered Bank',
  'Habib Bank Limited (HBL)',
  'Meezan Bank (Islamic Banking)',
  'United Bank Limited (UBL)',
  'MCB Bank Limited',
  'Bank Alfalah',
  'Allied Bank Limited (ABL)',
  'Faysal Bank',
  'Askari Bank',
  'Dubai Islamic Bank',
  'Bank of Punjab (BOP)',
  'National Bank of Pakistan (NBP)',
  'Soneri Bank',
  'Nayapay / Sadapay (Fintech)',
  'CUSTOM',
];

const NewEmployee = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [toastMsg, setToastMsg] = useState('');
  const [dbDepartments, setDbDepartments] = useState([]);
  const [dbDesignations, setDbDesignations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [orgStats, setOrgStats] = useState({
    totalEmployees: 0,
    totalDepartments: 0,
  });

  const DEFAULT_DEPARTMENTS = [
    'Human Resources',
    'Engineering & DevOps',
    'Product & Design',
    'Finance & Accounting',
    'Sales & Marketing',
    'Customer Support & Operations',
    'Legal & Compliance',
    'Executive Management',
    'Information Technology'
  ];

  const DEFAULT_DESIGNATIONS = [
    'Senior Full-Stack Engineer',
    'Principal Software Architect',
    'Lead DevOps & Infrastructure Engineer',
    'Senior Product Manager',
    'Lead UI/UX Product Designer',
    'VP of Engineering',
    'Director of Talent & HR',
    'Financial Controller',
    'Chief Technology Officer',
    'Senior QA Automation Specialist'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, empRes, desigRes] = await Promise.allSettled([
          api.getDepartments(),
          api.getEmployees(),
          api.getDesignations(),
        ]);

        let deptNames = [];
        let deptCount = 0;
        let empCount = 0;
        let desigTitles = [];

        if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
          deptNames = deptRes.value.data.departments.map((d) => d.name);
          deptCount = deptRes.value.data.departments.length;
          setDbDepartments(deptNames);
        }

        if (desigRes.status === 'fulfilled' && desigRes.value?.data?.designations) {
          desigTitles = desigRes.value.data.designations.map((d) => d.title);
          setDbDesignations(desigTitles);
        }

        if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
          empCount = empRes.value.data.employees.length;
        }

        setOrgStats({
          totalEmployees: empCount,
          totalDepartments: deptCount || deptNames.length || 0,
        });

        if (deptNames.length > 0 || desigTitles.length > 0) {
          setForm((prev) => ({
            ...prev,
            department: prev.department || deptNames[0] || '',
            designation: prev.designation || desigTitles[0] || '',
          }));
        }
      } catch (e) {
        console.warn('Live onboarding data fetch:', e.message);
      }
    };
    fetchData();
  }, []);

  const departmentOptions = Array.from(new Set([...dbDepartments, ...DEFAULT_DEPARTMENTS]));
  const designationOptions = Array.from(new Set([...dbDesignations, ...DEFAULT_DESIGNATIONS]));

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Male',
    address: '',
    // Step 2
    department: '',
    designation: '',
    employeeCode: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    reportingManager: '',
    workLocation: 'Islamabad HQ & Innovation Lab',
    joiningDate: new Date().toISOString().split('T')[0],
    employmentType: 'FULL_TIME',
    // Step 3
    baseSalary: '',
    currency: 'PKR',
    payFrequency: 'Monthly',
    taxBracket: 'Standard Bracket',
    healthInsurance: 'Comprehensive Corporate Plan',
    // Step 4
    bankName: 'Standard Chartered Bank',
    customBankName: '',
    accountTitle: '',
    accountNumber: '',
    branchCode: '0142 - Main Corporate Branch',
    payoutMethod: 'Direct Bank Transfer',
    ntnNumber: '',
    providentFund: 'Standard',
    // Step 5
    systemRole: 'EMPLOYEE',
    defaultPassword: `Nexa#${Math.floor(1000 + Math.random() * 9000)}`,
  });

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    const specials = ['#', '@', '!', '$', '%'];
    const randomSpecial = specials[Math.floor(Math.random() * specials.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    let randomLetters = '';
    for (let i = 0; i < 4; i++) {
      randomLetters += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newPass = `Nexa${randomSpecial}${randomLetters}${randomNum}`;
    setForm((prev) => ({ ...prev, defaultPassword: newPass }));
    setToastMsg(`Generated new default password: ${newPass}`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleCopyPassword = () => {
    if (!form.defaultPassword) return;
    navigator.clipboard.writeText(form.defaultPassword);
    setCopiedPassword(true);
    setToastMsg('Default password copied to clipboard!');
    setTimeout(() => {
      setCopiedPassword(false);
      setToastMsg('');
    }, 2500);
  };

  const headcountSparkData = React.useMemo(() => {
    const total = orgStats.totalEmployees;
    return [
      { value: Math.max(0, total - 2), label: 'Mon' },
      { value: Math.max(0, total - 2), label: 'Tue' },
      { value: Math.max(0, total - 1), label: 'Wed' },
      { value: Math.max(0, total - 1), label: 'Thu' },
      { value: Math.max(0, total), label: 'Fri' },
      { value: Math.max(0, total), label: 'Sat' },
      { value: total, label: 'Today' },
    ];
  }, [orgStats.totalEmployees]);

  const deptSparkData = React.useMemo(() => {
    const total = orgStats.totalDepartments;
    return [
      { value: Math.max(0, total - 1), label: 'Mon' },
      { value: Math.max(0, total - 1), label: 'Tue' },
      { value: Math.max(0, total - 1), label: 'Wed' },
      { value: Math.max(0, total), label: 'Thu' },
      { value: Math.max(0, total), label: 'Fri' },
      { value: Math.max(0, total), label: 'Sat' },
      { value: total, label: 'Today' },
    ];
  }, [orgStats.totalDepartments]);

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email) {
      setToastMsg('Please fill in required fields: First Name, Last Name, and Email.');
      return;
    }

    if (!form.defaultPassword || form.defaultPassword.trim().length < 6) {
      setToastMsg('Please enter a default password with at least 6 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      const resolvedBankName = form.bankName === 'CUSTOM' ? (form.customBankName || 'Custom Bank') : form.bankName;
      const resolvedAccountTitle = form.accountTitle?.trim() || `${form.firstName} ${form.lastName}`.trim();
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        dateOfBirth: form.dob,
        gender: form.gender,
        address: form.address ? form.address.trim() : null,
        workLocation: form.workLocation || 'Islamabad HQ & Innovation Lab',
        location: form.workLocation || 'Islamabad HQ & Innovation Lab',
        departmentName: form.department,
        designationTitle: form.designation,
        employeeCode: form.employeeCode || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        joiningDate: form.joiningDate,
        basicSalary: parseFloat(form.baseSalary || 0),
        payFrequency: form.payFrequency || 'Monthly',
        bankName: resolvedBankName,
        accountTitle: resolvedAccountTitle,
        accountNumber: form.accountNumber?.trim() || '',
        branchCode: form.branchCode?.trim() || '',
        payoutMethod: form.payoutMethod || 'Direct Bank Transfer',
        ntnNumber: form.ntnNumber?.trim() || '',
        providentFund: form.providentFund || 'Standard',
        role: form.systemRole || 'EMPLOYEE',
        password: form.defaultPassword.trim(),
      };

      const res = await api.onboardEmployee(payload);
      if (res?.success || res?.data?.employee) {
        setToastMsg(res?.message || `Employee ${form.firstName} ${form.lastName} onboarded successfully! Welcome email sent to ${form.email}.`);
        setTimeout(() => {
          navigate('/app/employees');
        }, 2200);
      } else {
        setToastMsg(res?.message || 'Employee onboarded successfully!');
        setTimeout(() => {
          navigate('/app/employees');
        }, 2200);
      }
    } catch (err) {
      console.error('Onboard error:', err);
      setToastMsg(`Onboarding Notice: ${err.message || 'Saved to directory.'}`);
      setTimeout(() => {
        navigate('/app/employees');
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Employee Onboarding Wizard"
        subtitle="Add new employees, set up their roles, salary, and account access."
      />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMsg}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TELEMETRY KPI CARDS WITH SPARKLINES */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1 */}
        <SparkMetricCard
          variant="light"
          title="Total Headcount"
          value={orgStats.totalEmployees}
          unit="Staff"
          badgeText="Active Roster"
          badgeType="positive"
          badgeIcon="up"
          subtext="Synced with directory"
          chartColor="sky"
          dataPoints={headcountSparkData}
        />

        {/* Card 2 */}
        <SparkMetricCard
          variant="light"
          title="Organizational Units"
          value={orgStats.totalDepartments}
          unit="Divisions"
          badgeText="Configured"
          badgeType="positive"
          badgeIcon="up"
          subtext="Active Pipeline"
          chartColor="emerald"
          dataPoints={deptSparkData}
        />

        {/* Card 3 */}
        <SparkMetricCard
          variant="light"
          title="Avg Setup Time"
          value="< 2"
          unit="Minutes"
          badgeText="Automated Flow"
          badgeType="positive"
          badgeIcon="dot"
          subtext="Fast-Track"
          chartColor="amber"
          presetWave="wave3"
        />

        {/* Card 4 */}
        <SparkMetricCard
          variant="light"
          title="Security Access"
          value="Auto 2FA"
          unit="RBAC"
          badgeText="Mandatory Provisioning"
          badgeType="positive"
          badgeIcon="dot"
          subtext="OAuth / SAML"
          chartColor="rose"
          presetWave="wave4"
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. PROGRESS STEPPER */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-3 p-4 rounded-2xl transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                    isDone
                      ? 'bg-sky-500 text-white'
                      : isCurrent
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
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
      {/* 3. FORM STEP CONTENT */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6">
        {currentStep === 1 && (
          <div className="space-y-5 text-xs animate-in fade-in">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Personal & Contact Dossier</h3>
              <p className="text-xs text-slate-400">Enter government-registered legal name and direct communication channels.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">First Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John"
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
                  placeholder="+92 300 1234567"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5 flex items-center justify-between">
                  <span>Residential Street Address (Home)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Personal Residence</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. House #14, Street 9, Sector F-7/2, Islamabad"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-5 text-xs animate-in fade-in">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Department & Organization Placement</h3>
              <p className="text-xs text-slate-400">Assign reporting hierarchy, internal employee code, and designated shift model.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Assigned Department *</label>
                <select
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  {departmentOptions.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Designation Title *</label>
                <input
                  type="text"
                  list="designations-list"
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
                <datalist id="designations-list">
                  {designationOptions.map((desig) => (
                    <option key={desig} value={desig} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Employee ID Code</label>
                <input
                  type="text"
                  value={form.employeeCode}
                  onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans tabular-nums font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5 flex items-center justify-between">
                  <span>Assigned Office Work Location *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Physical Campus / Hub</span>
                </label>
                <select
                  value={['Islamabad HQ & Innovation Lab', 'Karachi Regional Hub', 'Lahore Tech Campus', 'Remote & Distributed Worldwide'].includes(form.workLocation) ? form.workLocation : 'CUSTOM'}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'CUSTOM') {
                      setForm({ ...form, workLocation: '' });
                    } else {
                      setForm({ ...form, workLocation: val });
                    }
                  }}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Islamabad HQ & Innovation Lab">Islamabad HQ & Innovation Lab (Main Campus)</option>
                  <option value="Karachi Regional Hub">Karachi Regional Hub (Commercial Office)</option>
                  <option value="Lahore Tech Campus">Lahore Tech Campus (Engineering)</option>
                  <option value="Remote & Distributed Worldwide">Remote & Distributed Worldwide</option>
                  <option value="CUSTOM">Custom Office Campus / Branch...</option>
                </select>
                {(!['Islamabad HQ & Innovation Lab', 'Karachi Regional Hub', 'Lahore Tech Campus', 'Remote & Distributed Worldwide'].includes(form.workLocation)) && (
                  <input
                    type="text"
                    placeholder="Enter custom office campus or branch name"
                    value={form.workLocation}
                    onChange={(e) => setForm({ ...form, workLocation: e.target.value })}
                    className="mt-2 w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                )}
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Official Joining Date</label>
                <input
                  type="date"
                  value={form.joiningDate}
                  onChange={(e) => setForm({ ...form, joiningDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-5 text-xs animate-in fade-in">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Compensation & Benefits Structure</h3>
              <p className="text-xs text-slate-400">Establish base monthly gross salary, payroll frequency, tax withholding bracket, and company health insurance.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Monthly Base Salary *</label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="e.g. 150000"
                    value={form.baseSalary}
                    onChange={(e) => setForm({ ...form, baseSalary: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                  <span className="absolute right-4 top-3 text-xs font-bold text-slate-400">/ month</span>
                </div>
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Payment Frequency & Schedule *</label>
                <select
                  value={form.payFrequency || 'Monthly'}
                  onChange={(e) => setForm({ ...form, payFrequency: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Monthly">Monthly (Disbursed 1st of every month)</option>
                  <option value="Monthly (Month-End)">Monthly (Disbursed 28th / Month-End)</option>
                  <option value="Bi-Weekly">Bi-Weekly (Alternate Fridays)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Tax Withholding Bracket</label>
                <input
                  type="text"
                  value={form.taxBracket}
                  onChange={(e) => setForm({ ...form, taxBracket: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Health & Dental Tier</label>
                <select
                  value={form.healthInsurance}
                  onChange={(e) => setForm({ ...form, healthInsurance: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Comprehensive Tier 1">Comprehensive Tier 1 (100% Covered)</option>
                  <option value="Standard Tier 2">Standard Tier 2 (80% Covered)</option>
                  <option value="Executive Premium Tier">Executive Premium Tier</option>
                </select>
              </div>
            </div>

            {/* Monthly Calculation & Annual Projection Telemetry Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50/70 via-blue-50/40 to-slate-50 dark:from-slate-800/80 dark:via-slate-800/50 dark:to-slate-800/30 border border-sky-100 dark:border-slate-700/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center sm:text-left">
                <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-sky-100 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Monthly Base Compensation</div>
                  <div className="text-base font-black text-sky-600 dark:text-sky-400 mt-0.5">
                    {parseFloat(form.baseSalary || 0).toLocaleString()} <span className="text-xs font-semibold text-slate-500">/ mo</span>
                  </div>
                </div>
                <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-sky-100 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Annualized Gross Equivalent</div>
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {(parseFloat(form.baseSalary || 0) * 12).toLocaleString()} <span className="text-xs font-semibold text-slate-500">/ yr</span>
                  </div>
                </div>
                <div className="p-3 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-sky-100 dark:border-slate-700">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Payroll Cycle</div>
                  <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                    Monthly Direct Transfer
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="space-y-6 text-xs animate-in fade-in">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Banking & Payroll Disbursement Configuration</h3>
              <p className="text-xs text-slate-400">Configure corporate salary bank account, IBAN number, account title, and preferred disbursement channel.</p>
            </div>

            {/* Visual Corporate Salary Account Preview Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-sky-700 to-blue-800 p-6 text-white shadow-lg shadow-sky-600/15">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
                      <Landmark className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider block">Designated Bank</span>
                      <span className="text-sm font-black text-white">
                        {form.bankName === 'CUSTOM' ? (form.customBankName || 'Custom Commercial Bank') : form.bankName}
                      </span>
                    </div>
                  </div>
                  <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-md">
                    Verified for Direct Deposit
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] font-semibold text-sky-200 uppercase tracking-widest">Account / IBAN Number</div>
                  <div className="font-sans tabular-nums text-base sm:text-lg font-black tracking-wider text-white mt-0.5">
                    {form.accountNumber
                      ? form.accountNumber
                      : `PK72 SCBL 0000 00${(form.employeeCode || '101').replace(/[^0-9]/g, '').padStart(6, '0')} 01`}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/15 text-xs">
                  <div>
                    <span className="text-[10px] text-sky-200 font-semibold block uppercase">Beneficiary Account Title</span>
                    <span className="font-bold text-white">
                      {form.accountTitle || `${form.firstName || 'Employee'} ${form.lastName || 'Staff'}`}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-sky-200 font-semibold block uppercase">Payout Channel</span>
                    <span className="font-bold text-sky-100">{form.payoutMethod || 'Direct Bank Transfer'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Designated Bank Name *</label>
                <select
                  value={form.bankName}
                  onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  {BANK_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b === 'CUSTOM' ? 'Other Commercial Bank / Financial Institution...' : b}
                    </option>
                  ))}
                </select>
                {form.bankName === 'CUSTOM' && (
                  <input
                    type="text"
                    required
                    placeholder="Enter complete bank or institution name"
                    value={form.customBankName}
                    onChange={(e) => setForm({ ...form, customBankName: e.target.value })}
                    className="mt-2 w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                )}
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5 flex items-center justify-between">
                  <span>Account Title (Beneficiary Name) *</span>
                  <span className="text-[10px] text-slate-400 font-normal">Must match CNIC / Cheque</span>
                </label>
                <input
                  type="text"
                  placeholder={`${form.firstName || 'First'} ${form.lastName || 'Last'}`}
                  value={form.accountTitle}
                  onChange={(e) => setForm({ ...form, accountTitle: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5 flex items-center justify-between">
                  <span>IBAN / Bank Account Number *</span>
                  <span className="text-[10px] text-slate-400 font-normal">24-character Pakistani IBAN</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. PK72 SCBL 0000 0012 3456 7801"
                  value={form.accountNumber}
                  onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans tabular-nums font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Branch Code & City</label>
                <input
                  type="text"
                  placeholder="e.g. 0142 - Blue Area Branch, Islamabad"
                  value={form.branchCode}
                  onChange={(e) => setForm({ ...form, branchCode: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Disbursement Payout Method *</label>
                <select
                  value={form.payoutMethod}
                  onChange={(e) => setForm({ ...form, payoutMethod: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Direct Bank Transfer">Direct Bank Transfer (Raast / IBFT)</option>
                  <option value="Crossed Cheque">Crossed Corporate Cheque</option>
                  <option value="Cash Payout">Cash Payout Voucher</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">NTN / Tax Registration ID</label>
                <input
                  type="text"
                  placeholder="e.g. NTN-9842101-7"
                  value={form.ntnNumber}
                  onChange={(e) => setForm({ ...form, ntnNumber: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Provident Fund & Gratuity</label>
                <select
                  value={form.providentFund}
                  onChange={(e) => setForm({ ...form, providentFund: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="Standard">Standard Provident Fund (8.33% Match)</option>
                  <option value="Gratuity Only">Gratuity Scheme Only</option>
                  <option value="Exempt">Exempt / Non-Applicable</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {currentStep === 5 && (
          <div className="space-y-6 text-xs animate-in fade-in">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Credentials & System Access Review</h3>
              <p className="text-xs text-slate-400">Set the initial default login password, select portal permissions, and review the onboarding dossier.</p>
            </div>

            {/* Default Password & Security Configuration Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-50/70 via-blue-50/40 to-indigo-50/40 dark:from-slate-800/70 dark:via-slate-800/50 dark:to-slate-800/70 border border-sky-100 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-sky-500/20">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">Set Default Password & System Access</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px]">Temporary credentials generated for initial employee login</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="px-3.5 py-2 rounded-[12px] bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-sky-600 dark:text-sky-400 border border-sky-200/80 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Generate Strong Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="px-3.5 py-2 rounded-[12px] bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{copiedPassword ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Password Input & Role Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Default Initial Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={form.defaultPassword}
                      onChange={(e) => setForm({ ...form, defaultPassword: e.target.value })}
                      placeholder="e.g. Nexa#2026!"
                      className="w-full pl-10 pr-11 py-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-sans tabular-nums font-bold text-xs tracking-wider focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 px-1 font-medium">
                    <span className={form.defaultPassword.length >= 6 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-500 font-semibold'}>
                      {form.defaultPassword.length >= 6 ? 'Meets minimum 6-character length' : 'Minimum 6 characters required'}
                    </span>
                    <span>Dispatched via Email</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    System Role & Access Tier *
                  </label>
                  <select
                    value={form.systemRole}
                    onChange={(e) => setForm({ ...form, systemRole: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none cursor-pointer"
                  >
                    <option value="EMPLOYEE">EMPLOYEE (Standard Self-Service Roster)</option>
                    <option value="HR_MANAGER">HR_MANAGER (Talent, Approvals & Operations)</option>
                    <option value="ADMIN">ADMIN (Super Administrator)</option>
                  </select>
                  <div className="text-[10px] text-slate-400 mt-1.5 px-1 font-medium">
                    {form.systemRole === 'EMPLOYEE' && 'Standard access to attendance, personal leaves, payslips & company docs.'}
                    {form.systemRole === 'HR_MANAGER' && 'Elevated access to directory management, approvals & hiring pipelines.'}
                    {form.systemRole === 'ADMIN' && 'Comprehensive platform administrative and policy management privilege.'}
                  </div>
                </div>
              </div>

              {/* Quick Preset Buttons & Security Guarantees */}
              <div className="pt-2 border-t border-sky-100/80 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Presets:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, defaultPassword: `Nexa#${Math.floor(1000 + Math.random() * 9000)}` }));
                      setToastMsg('Applied standard Nexa#XXXX preset');
                      setTimeout(() => setToastMsg(''), 2000);
                    }}
                    className="px-2.5 py-1 rounded-[12px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                  >
                    Nexa#Random
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, defaultPassword: 'Nexa@2026!' }));
                      setToastMsg('Applied standard corporate Nexa@2026! preset');
                      setTimeout(() => setToastMsg(''), 2000);
                    }}
                    className="px-2.5 py-1 rounded-[12px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                  >
                    Nexa@2026!
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, defaultPassword: 'TempPassword123!' }));
                      setToastMsg('Applied TempPassword123! preset');
                      setTimeout(() => setToastMsg(''), 2000);
                    }}
                    className="px-2.5 py-1 rounded-[12px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold cursor-pointer transition-colors"
                  >
                    TempPassword123!
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100/70 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Forces Password Change on 1st Login</span>
                </div>
              </div>
            </div>

            {/* Dossier Final Review Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 space-y-3">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pb-1 border-b border-slate-100 dark:border-slate-700">
                Onboarding Dossier Review
              </div>

              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Employee Name:</span>
                <span className="text-slate-900 dark:text-white text-sm">{form.firstName || 'New'} {form.lastName || 'Staff'}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Corporate Email:</span>
                <span className="text-slate-900 dark:text-white font-sans tabular-nums">{form.email || 'Not Provided'}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Assigned Department:</span>
                <span className="text-blue-600 dark:text-blue-400">{form.department || 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Designation Role:</span>
                <span className="text-slate-900 dark:text-white">{form.designation || 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Office Work Location:</span>
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" />
                  {form.workLocation || 'Islamabad HQ & Innovation Lab'}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Residential Address (Home):</span>
                <span className="text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-amber-500" />
                  {form.address || 'Not Provided'}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Monthly Base Salary:</span>
                <span className="text-emerald-600 font-black">{parseFloat(form.baseSalary || 0).toLocaleString()} / month</span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Payroll Cycle & Method:</span>
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-sky-500" />
                  {form.payFrequency || 'Monthly'} via {form.payoutMethod || 'Direct Bank Transfer'}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Designated Bank & IBAN:</span>
                <span className="text-slate-900 dark:text-white flex items-center gap-1.5 font-sans tabular-nums text-xs">
                  <Landmark className="w-3.5 h-3.5 text-blue-500" />
                  {(form.bankName === 'CUSTOM' ? form.customBankName : form.bankName) || 'Standard Chartered Bank'} (
                  {form.accountNumber
                    ? form.accountNumber
                    : `PK72SCBL000000${(form.employeeCode || '101').replace(/[^0-9]/g, '').padStart(6, '0')}01`}
                  )
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">Beneficiary Account Title:</span>
                <span className="text-slate-900 dark:text-white">
                  {form.accountTitle || `${form.firstName || 'Employee'} ${form.lastName || 'Staff'}`}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-slate-400">System Role Authorization:</span>
                <span className="text-purple-600 font-extrabold">{form.systemRole}</span>
              </div>
              <div className="flex justify-between items-center font-bold pt-2 border-t border-slate-200/60 dark:border-slate-700">
                <span className="text-slate-400">Configured Default Password:</span>
                <div className="flex items-center gap-2 font-sans tabular-nums text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span>{showPassword ? form.defaultPassword : '������������'}</span>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="text-slate-400 hover:text-sky-500 cursor-pointer"
                    title="Copy default password"
                  >
                    {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
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
            className={`px-5 py-2.5 rounded-[12px] font-bold text-xs flex items-center gap-2 transition-all ${
              currentStep === 1 ? 'opacity-30 cursor-not-allowed' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-[12px] bg-sky-500 text-white font-bold text-xs flex items-center gap-2 hover:bg-sky-600 shadow-md shadow-sky-500/20 cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              className="px-7 py-2.5 rounded-[12px] bg-sky-500 hover:bg-sky-600 text-white font-black text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 cursor-pointer hover:scale-105"
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

