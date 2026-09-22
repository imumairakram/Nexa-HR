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
  Building,
  Zap,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
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

  // Dynamic Sparkline Data for Documents Hub
  const personalDocsSparkData = useMemo(() => {
    const typeCount = {
      CONTRACT: 0,
      COMPENSATION: 0,
      LEGAL: 0,
      TAX_FORM: 0,
      CERTIFICATE: 0,
    };
    personalDocs.forEach((d) => {
      if (typeCount[d.type] !== undefined) typeCount[d.type]++;
      else typeCount.CERTIFICATE++;
    });

    return [
      { value: typeCount.CONTRACT || 1, label: 'Contract', tooltip: `Contracts: ${typeCount.CONTRACT || 1} Files` },
      { value: typeCount.COMPENSATION || 1, label: 'Comp', tooltip: `Compensation: ${typeCount.COMPENSATION || 1} Files` },
      { value: typeCount.LEGAL || 1, label: 'Legal', tooltip: `Legal & NDA: ${typeCount.LEGAL || 1} Files` },
      { value: typeCount.TAX_FORM || 1, label: 'Tax', tooltip: `Tax Forms: ${typeCount.TAX_FORM || 1} Files` },
      { value: typeCount.CERTIFICATE || 1, label: 'Certs', tooltip: `Certificates: ${typeCount.CERTIFICATE || 1} Files` },
    ];
  }, [personalDocs]);

  const policiesSparkData = useMemo(() => {
    return [
      { value: 1, label: 'Ethics', tooltip: 'Corporate Governance Charter' },
      { value: 2, label: 'Benefits', tooltip: 'Global Health & Medical Guide' },
      { value: 3, label: 'Finance', tooltip: 'Remote Work & Expense Policy' },
      { value: 4, label: 'Security', tooltip: 'SOC-2 Data Security Policy' },
    ];
  }, []);

  const complianceSparkData = useMemo(() => {
    return [
      { value: 25, label: 'Offer', tooltip: 'Offer & Contract Signed (100%)' },
      { value: 50, label: 'NDA', tooltip: 'Proprietary IP Assignment (100%)' },
      { value: 75, label: 'Tax', tooltip: 'Statutory W-2 Tax Registered (100%)' },
      { value: 100, label: 'SOC2', tooltip: 'InfoSec Compliance Certified (100%)' },
    ];
  }, []);

  const securitySparkData = useMemo(() => {
    return [
      { value: 128, label: '2FA', tooltip: 'Multi-Factor Key Auth: Verified' },
      { value: 192, label: 'TLS', tooltip: 'TLS 1.3 End-to-End Encryption' },
      { value: 256, label: 'AES', tooltip: 'AES-256 Cloud Vault Encryption' },
    ];
  }, []);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <EmployeePageHeader
        title="Documents & Policies Hub"
        subtitle="Access your personal employment vault, contracts, tax certificates, and verified company compliance handbooks."
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
      {/* 2. SPARKLINE KPI METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Dark Navy Card - Personal Vault */}
        <SparkMetricCard
          variant="dark"
          title="Personal Vault"
          value={personalDocs.length}
          unit={personalDocs.length === 1 ? 'File' : 'Files'}
          badgeText="100% Encrypted"
          badgeType="positive"
          badgeIcon="up"
          subtext="Self-Service Verified Files"
          chartColor="purple"
          presetWave="wave1"
          dataPoints={personalDocsSparkData}
        />

        {/* Card 2: Light Card - Handbooks & Charters */}
        <SparkMetricCard
          variant="light"
          title="Company Handbooks"
          value={COMPANY_POLICIES.length}
          unit="Policies"
          badgeText="FY26 Certified"
          badgeType="positive"
          badgeIcon="up"
          subtext="Official Governance Charters"
          chartColor="coral"
          presetWave="wave2"
          dataPoints={policiesSparkData}
        />

        {/* Card 3: Light Card - Authenticity & Compliance */}
        <SparkMetricCard
          variant="light"
          title="Compliance State"
          value="100%"
          unit="Verified"
          badgeText="Fully Audited"
          badgeType="positive"
          badgeIcon="up"
          subtext="All Mandatory Charters Signed"
          chartColor="amber"
          presetWave="wave3"
          dataPoints={complianceSparkData}
        />

        {/* Card 4: Light Card - Security Tier */}
        <SparkMetricCard
          variant="light"
          title="Vault Security"
          value="AES-256"
          unit="Bit"
          badgeText="Zero-Trust"
          badgeType="neutral"
          badgeIcon="dot"
          subtext="Cloud Storage Protected"
          chartColor="rose"
          presetWave="wave4"
          dataPoints={securitySparkData}
        />
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
      {/* 5. UPLOAD DOCUMENT MODAL (ULTRA PREMIUM THEMED DESIGN) */}
      {/* ========================================================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-[32px] max-w-5xl w-full shadow-2xl shadow-teal-950/15 dark:shadow-black/60 border border-teal-100/60 dark:border-slate-800/80 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 sm:p-7 md:p-8 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-teal-50/80 via-cyan-50/50 to-blue-50/50 dark:from-slate-900/80 dark:via-teal-950/20 dark:to-slate-900/80 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/15 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/30 ring-4 ring-teal-100/70 dark:ring-teal-950/60">
                  <Upload className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                      Upload to Vault
                    </h3>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-teal-500 text-teal-500" />
                      AES-256 Vault
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5 max-w-md">
                    Add verified professional certificates, government IDs, and compliance records.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleUploadSubmit} className="overflow-y-auto flex-1 p-6 sm:p-7 md:p-8 space-y-6 custom-scrollbar text-xs">
              {/* Document Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-500" />
                    Document Title <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {uploadForm.title.length}/100 chars
                  </span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Certified Scrum Master (CSM) Certificate or National Passport Scan"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 outline-none transition-all shadow-xs"
                />
              </div>

              {/* Category Visual Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Document Classification <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Select the file classification</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {[
                    { id: 'CERTIFICATE', label: 'Professional Certificate', icon: Award, desc: 'AWS, Scrum, PMP, CFA' },
                    { id: 'IDENTIFICATION', label: 'National ID / Passport', icon: ShieldCheck, desc: 'Passport, CNIC, License' },
                    { id: 'ACADEMIC', label: 'Academic Transcript', icon: BookOpen, desc: 'Degrees & Diplomas' },
                    { id: 'TAX_FORM', label: 'Tax Certificate', icon: FileSpreadsheet, desc: 'W-2, 1099, Deductions' },
                    { id: 'CONTRACT', label: 'Agreement & NDA', icon: FileCheck, desc: 'Signed contracts & NDAs' },
                  ].map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = uploadForm.type === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setUploadForm({ ...uploadForm, type: cat.id })}
                        className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-br from-teal-50 to-cyan-50/50 dark:from-teal-950/50 dark:to-slate-800 border-teal-500/80 dark:border-teal-600 text-teal-950 dark:text-white shadow-sm ring-2 ring-teal-500/20'
                            : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                              isSelected
                                ? 'bg-teal-500 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600'
                            }`}
                          >
                            <CatIcon className="w-4 h-4" />
                          </div>
                          {isSelected && (
                            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 ring-2 ring-teal-300 dark:ring-teal-800" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-xs leading-tight">
                            {cat.label}
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-400 mt-0.5 line-clamp-1">
                            {cat.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Issuing Authority */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-teal-500" />
                    Issuing Authority or Institute
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">e.g. Scrum Alliance, AWS, NADRA</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Scrum Alliance / Amazon Web Services / NADRA"
                  value={uploadForm.issuer}
                  onChange={(e) => setUploadForm({ ...uploadForm, issuer: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 outline-none transition-all shadow-xs"
                />
              </div>

              {/* Styled File Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-3.5 h-3.5 text-teal-500" />
                    File Attachment (PDF, DOCX, PNG) <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">Max size: 15 MB</span>
                </label>

                <div className="relative">
                  <input
                    type="file"
                    required={!uploadForm.file}
                    accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadForm({ ...uploadForm, file: e.target.files[0] });
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />

                  <div
                    className={`p-5 sm:p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center relative z-10 ${
                      uploadForm.file
                        ? 'border-teal-500/80 bg-teal-50/50 dark:bg-teal-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/20'
                    }`}
                  >
                    {uploadForm.file ? (
                      <div className="flex items-center justify-between w-full gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <FileCheck className="w-5 h-5" />
                          </div>
                          <div className="text-left min-w-0">
                            <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                              {uploadForm.file.name}
                            </div>
                            <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                              {(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB • Ready to Encrypt
                            </div>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 text-[11px] font-bold border border-teal-200 dark:border-teal-800/60 shrink-0 shadow-xs">
                          Replace File
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs">
                          <Upload className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            Click to browse or drag & drop document
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            PDF, Word (DOCX), PNG, JPG up to 15 MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Vault Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20 dark:from-slate-800/60 dark:via-teal-950/20 dark:to-slate-800/60 border border-teal-100 dark:border-slate-700/70 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-xs border border-teal-100 dark:border-slate-600">
                    <FileText className="w-4.5 h-4.5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-extrabold text-slate-900 dark:text-white text-xs truncate">
                      {uploadForm.title.trim() || 'Untitled Vault Document'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mt-0.5">
                      <span>{uploadForm.type}</span>
                      <span>•</span>
                      <span className="text-teal-600 dark:text-teal-400 font-semibold truncate">
                        {uploadForm.issuer.trim() || 'Self-Submission'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-lg bg-teal-100/80 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-teal-500" />
                    AES-256
                  </span>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-3">
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Encrypted Personal Vault</span>
                </div>

                <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-600 active:scale-95 text-white text-xs font-black shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Save & Encrypt</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DOCUMENT PREVIEW MODAL (LUXURY THEMED) */}
      {/* ========================================================================= */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-[32px] max-w-5xl w-full shadow-2xl shadow-teal-950/15 dark:shadow-black/60 border border-teal-100/60 dark:border-slate-800/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="p-6 sm:p-7 md:p-8 border-b border-slate-100 dark:border-slate-800/80 flex items-start justify-between gap-4 shrink-0 bg-gradient-to-r from-teal-50/70 via-cyan-50/40 to-blue-50/40 dark:from-slate-900/80 dark:via-teal-950/20 dark:to-slate-900/80 relative overflow-hidden">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/25 ring-4 ring-teal-100/60 dark:ring-teal-950/50">
                  <FileText className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/80 dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800/60">
                    {selectedDoc.typeLabel || selectedDoc.type}
                  </span>
                  <h3 className="text-base sm:text-lg md:text-xl font-black text-slate-900 dark:text-white truncate">
                    {selectedDoc.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    Issuer: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedDoc.issuer}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-2xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata Body */}
            <div className="p-6 sm:p-7 md:p-8 space-y-4 text-xs">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/30 dark:from-slate-800/50 dark:to-teal-950/20 border border-teal-100/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Vault Record ID</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">#{selectedDoc.id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Issue / Verification Date</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedDoc.issueDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Encrypted File Size</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedDoc.size}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 font-medium">Compliance Verification</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>HR Verified & Encrypted</span>
                  </span>
                </div>
              </div>

              {selectedDoc.description && (
                <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {selectedDoc.description}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 sm:p-7 md:p-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-900/50">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedDoc);
                  setSelectedDoc(null);
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-teal-600/20 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.2]" />
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
