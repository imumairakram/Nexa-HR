import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Upload,
  Eye,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  FileCode,
  Lock,
  Plus,
  X,
  Search,
  BookOpen,
  Calendar,
  ExternalLink,
  Grid,
  List,
  FileSpreadsheet,
  Award,
  Layers,
  Shield,
  HardDrive,
  Check,
  ArrowRight,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const COMPANY_POLICIES = [
  {
    id: 'POL-01',
    title: 'Employee Code of Conduct & Ethics Charter',
    category: 'GOVERNANCE',
    categoryLabel: 'Corporate Governance',
    version: 'v4.2 (2026)',
    size: '1.8 MB',
    updated: 'Jan 15, 2026',
    issuer: 'NexaHR Executive Board',
    description:
      'Comprehensive guidelines on professional integrity, respectful workplace culture, anti-harassment, and compliance with local statutory laws.',
  },
  {
    id: 'POL-02',
    title: 'Global Health & Medical Benefits Guide',
    category: 'BENEFITS',
    categoryLabel: 'Benefits & Perks',
    version: 'v2.0 (2026)',
    size: '3.4 MB',
    updated: 'Jul 01, 2026',
    issuer: 'People Operations & HR',
    description:
      'Full breakdown of medical, dental, vision, hospitalization insurance limits, OPD coverage ceiling, and mental wellness resources.',
  },
  {
    id: 'POL-03',
    title: 'Remote Work & Travel Expense Policy',
    category: 'FINANCE',
    categoryLabel: 'Finance & Reimbursement',
    version: 'v3.1 (2026)',
    size: '1.2 MB',
    updated: 'Mar 10, 2026',
    issuer: 'Corporate Finance & Payroll',
    description:
      'Reimbursement thresholds, travel per diem allowances, hotel lodging ceilings, and home office equipment stipends.',
  },
  {
    id: 'POL-04',
    title: 'Information Security & Data Privacy (SOC-2 Type II)',
    category: 'SECURITY',
    categoryLabel: 'InfoSec & Compliance',
    version: 'v5.0 (2026)',
    size: '2.1 MB',
    updated: 'Feb 28, 2026',
    issuer: 'InfoSec & Compliance Dept',
    description:
      'Standards for credential management, mandatory 2FA protocols, disk encryption, and confidential customer data handling.',
  },
];

const DEFAULT_PERSONAL_DOCS = [
  {
    id: 'DOC-101',
    title: 'Official Employment Contract & Offer Letter',
    type: 'CONTRACT',
    typeLabel: 'Employment Contract',
    issueDate: 'Mar 15, 2022',
    size: '2.4 MB',
    status: 'VERIFIED',
    issuer: 'NexaHR People Operations',
    description: 'Signed full-time indefinite employment agreement with job scope, compensation tier, and organizational charter.',
  },
  {
    id: 'DOC-102',
    title: 'Annual Compensation & Equity Grant FY26',
    type: 'COMPENSATION',
    typeLabel: 'Compensation Grant',
    issueDate: 'Apr 01, 2026',
    size: '850 KB',
    status: 'VERIFIED',
    issuer: 'Executive Board & Remuneration Committee',
    description: 'Annual salary revision statement, performance bonus tier, and stock option vesting schedule breakdown.',
  },
  {
    id: 'DOC-103',
    title: 'Signed Non-Disclosure & IP Assignment (NDA)',
    type: 'LEGAL',
    typeLabel: 'Legal & Compliance',
    issueDate: 'Mar 15, 2022',
    size: '1.1 MB',
    status: 'VERIFIED',
    issuer: 'Corporate Legal Dept',
    description: 'Intellectual property ownership assignment and proprietary code confidentiality charter.',
  },
  {
    id: 'DOC-104',
    title: 'Tax Withholding & Annual Deduction Summary (W-2)',
    type: 'TAX_FORM',
    typeLabel: 'Statutory Tax Certificate',
    issueDate: 'Jan 31, 2026',
    size: '620 KB',
    status: 'VERIFIED',
    issuer: 'Finance & Payroll Operations',
    description: 'Annual statutory tax deduction certificate for individual income tax return filing.',
  },
  {
    id: 'DOC-105',
    title: 'AWS Certified Solutions Architect Certificate',
    type: 'CERTIFICATE',
    typeLabel: 'Professional Certificate',
    issueDate: 'May 10, 2025',
    size: '1.5 MB',
    status: 'VERIFIED',
    issuer: 'Amazon Web Services',
    description: 'Verified professional cloud architecture certification accredited by AWS training partner network.',
  },
];

const EmployeeDocuments = () => {
  const { formatDate } = useRegionalSettings();
  const [personalDocs, setPersonalDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_personal_docs');
      return saved ? JSON.parse(saved) : DEFAULT_PERSONAL_DOCS;
    } catch {
      return DEFAULT_PERSONAL_DOCS;
    }
  });

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'policies'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'CERTIFICATE',
    issuer: 'Certifying Authority',
    file: null,
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const savePersonalDocs = (updated) => {
    setPersonalDocs(updated);
    try {
      localStorage.setItem('nexahr_personal_docs', JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) {
      showToast('Please enter a valid document title');
      return;
    }

    const docId = `DOC-${Math.floor(100 + Math.random() * 900)}`;
    const newDoc = {
      id: docId,
      title: uploadForm.title.trim(),
      type: uploadForm.type,
      typeLabel:
        uploadForm.type === 'CERTIFICATE'
          ? 'Professional Certificate'
          : uploadForm.type === 'IDENTIFICATION'
          ? 'National ID / Passport'
          : 'Official Document',
      issueDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      size: uploadForm.file ? `${(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB',
      status: 'VERIFIED',
      issuer: uploadForm.issuer.trim() || 'Verified Self-Submission',
      description: 'Encrypted document stored securely in NexaHR Personal Compliance Vault.',
    };

    const updated = [newDoc, ...personalDocs];
    savePersonalDocs(updated);
    setIsUploadOpen(false);
    setUploadForm({
      title: '',
      type: 'CERTIFICATE',
      issuer: 'Certifying Authority',
      file: null,
    });
    showToast(`Document "${newDoc.title}" successfully verified and stored in your vault!`);
  };

  const handleDownload = (doc) => {
    showToast(`Downloading secure file: ${doc.title} (${doc.size || 'PDF'})...`);
  };

  // Filtered documents
  const filteredPersonalDocs = useMemo(() => {
    return personalDocs.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.id.toLowerCase().includes(q) ||
        d.issuer.toLowerCase().includes(q) ||
        d.type.toLowerCase().includes(q)
      );
    });
  }, [personalDocs, searchQuery]);

  const filteredPolicies = useMemo(() => {
    return COMPANY_POLICIES.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.issuer.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <EmployeePageHeader
        title="Documents & Policies Hub"
        subtitle="Access your personal employment vault, contracts, tax certificates, and verified company compliance handbooks."
        action={
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold rounded-full flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-105"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Document</span>
          </button>
        }
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC DOCUMENTS HERO BANNER (AQUA-TEAL LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-cyan-50/90 via-teal-50/80 to-blue-50/60 dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-teal-200/70 dark:border-teal-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/15 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-300/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Vault Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-600/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-xs font-extrabold border border-teal-600/20 dark:border-teal-500/30">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>SOC-2 Type II Certified Vault</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-600/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-xs font-semibold border border-cyan-600/20 dark:border-cyan-500/30">
                <Lock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>256-Bit AES Encryption</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Enterprise Document Vault & Policy Repository
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Secure digital repository for verified employment contracts, annual tax forms, professional licenses, and company operational charters.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950/60 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800/60">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{personalDocs.length} Verified Personal Files</span>
              </span>
              <span className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 font-bold bg-cyan-100/60 dark:bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-200 dark:border-cyan-800/60">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{COMPANY_POLICIES.length} Official Handbooks</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-teal-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Upload className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Add New Document</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Upload certificate, CNIC, or license</div>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="w-full px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Upload Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED KPI TELEMETRY CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Personal Files */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-teal-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-teal-500/10 blur-2xl pointer-events-none group-hover:bg-teal-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Personal Vault
            </span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60 dark:border-teal-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {personalDocs.length} <span className="text-base font-bold text-slate-400">{personalDocs.length === 1 ? 'File' : 'Files'}</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-teal-600 dark:text-teal-400 font-bold">100% Encrypted</span>
              <span className="text-slate-400">Self-Service</span>
            </div>
          </div>
        </div>

        {/* Card 2: Handbooks & Charters */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Company Handbooks
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {COMPANY_POLICIES.length} <span className="text-base font-bold text-slate-400">Policies</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">FY26 Certified</span>
              <span className="text-slate-400">Active</span>
            </div>
          </div>
        </div>

        {/* Card 3: Verification Status */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Authenticity State
            </span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              100% <span className="text-base font-bold text-slate-400">Verified</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">HR Compliant</span>
              <span className="text-slate-400">Audited</span>
            </div>
          </div>
        </div>

        {/* Card 4: Vault Storage Quota */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-cyan-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none group-hover:bg-cyan-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
              Vault Storage
            </span>
            <div className="w-10 h-10 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-200/60 dark:border-cyan-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              6.4 <span className="text-base font-bold text-slate-400">/ 50 MB</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">Cloud Tier Free</span>
              <span className="text-slate-400">12% Used</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. REPOSITORY TABS & SEARCH CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Navigation Category Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'personal'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Personal Vault ({personalDocs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'policies'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Company Policies ({COMPANY_POLICIES.length})</span>
          </button>
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documents by title or issuer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              onClick={() => setViewMode('list')}
              title="Table List View"
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DOCUMENTS CONTENT VIEW (PERSONAL VAULT OR COMPANY POLICIES) */}
      {/* ========================================================================= */}
      {activeTab === 'personal' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Personal Employment Vault & Certificates
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Encrypted repository of your signed agreements, salary letters, and uploaded licenses
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {filteredPersonalDocs.length} Documents
            </span>
          </div>

          {viewMode === 'list' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3.5 px-6">Document Title</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Issuer / Authority</th>
                    <th className="py-3.5 px-4">Date Added</th>
                    <th className="py-3.5 px-4">File Size</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredPersonalDocs.map((doc) => (
                    <tr
                      key={doc.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-800/50">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white text-xs block group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                              {doc.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold">#{doc.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {doc.typeLabel || doc.type}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                        {doc.issuer}
                      </td>

                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-mono">
                        {doc.issueDate}
                      </td>

                      <td className="py-4 px-4 text-slate-400 font-mono">
                        {doc.size}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 transition-colors cursor-pointer"
                            title="Preview Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPersonalDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="rounded-3xl p-5 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                      Verified
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-teal-600 transition-colors">
                      {doc.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{doc.issuer}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                    <span className="text-[11px] text-slate-400 font-mono">{doc.size}</span>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Policies Tab Content */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPolicies.map((pol) => (
            <div
              key={pol.id}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {pol.categoryLabel}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{pol.version}</span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {pol.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {pol.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-[11px] text-slate-400 font-medium">
                  Updated {pol.updated} • {pol.size}
                </span>

                <button
                  onClick={() => handleDownload(pol)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Handbook</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. UPLOAD DOCUMENT MODAL */}
      {/* ========================================================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Upload to Personal Vault</h3>
                  <p className="text-xs text-slate-400 font-medium">Add verified certificate or compliance document</p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Certified Scrum Master (CSM) Certificate"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Document Category</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none cursor-pointer"
                  >
                    <option value="CERTIFICATE">Professional Certificate</option>
                    <option value="IDENTIFICATION">National ID / Passport</option>
                    <option value="ACADEMIC">Academic Degree / Transcript</option>
                    <option value="TAX_FORM">Tax Certificate</option>
                    <option value="CONTRACT">Agreement / NDA</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Issuing Authority</label>
                  <input
                    type="text"
                    placeholder="e.g. Scrum Alliance / NADRA"
                    value={uploadForm.issuer}
                    onChange={(e) => setUploadForm({ ...uploadForm, issuer: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Select File (PDF, DOCX, PNG) *</label>
                <input
                  type="file"
                  required
                  onChange={(e) => setUploadForm({ ...uploadForm, file: e.target.files[0] })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 cursor-pointer transition-all"
                >
                  Save & Encrypt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DOCUMENT PREVIEW MODAL */}
      {/* ========================================================================= */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200">
                  {selectedDoc.typeLabel || selectedDoc.type}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {selectedDoc.title}
                </h3>
                <div className="text-xs text-slate-400 font-medium">
                  Issuer: <strong>{selectedDoc.issuer}</strong>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Vault ID:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">#{selectedDoc.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Issue Date:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedDoc.issueDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">File Size:</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{selectedDoc.size}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Verification Status:</span>
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>HR Verified & Encrypted</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedDoc);
                  setSelectedDoc(null);
                }}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Secure Copy</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
