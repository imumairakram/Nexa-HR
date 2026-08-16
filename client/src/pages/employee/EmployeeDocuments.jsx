import React, { useState, useEffect } from 'react';
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
  Sparkles,
  ExternalLink,
  Grid,
  List,
  FileSpreadsheet,
  Award,
  Layers,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const COMPANY_POLICIES = [
  {
    id: 'POL-01',
    title: 'Employee Code of Conduct & Ethics',
    category: 'GOVERNANCE',
    version: 'v4.2 (2026)',
    size: '1.8 MB',
    updated: 'Jan 15, 2026',
    issuer: 'NexaHR Executive Board',
    description: 'Comprehensive guidelines on professional integrity, respectful workplace culture, anti-harassment, and compliance.',
  },
  {
    id: 'POL-02',
    title: 'Global Health & Medical Benefits Guide',
    category: 'BENEFITS',
    version: 'v2.0 (2026)',
    size: '3.4 MB',
    updated: 'Jul 01, 2026',
    issuer: 'People Operations & HR',
    description: 'Full breakdown of medical, dental, vision, 401(k) matching, and mental wellness coverage tiers.',
  },
  {
    id: 'POL-03',
    title: 'Remote Work & Travel Expense Policy',
    category: 'FINANCE',
    version: 'v3.1 (2026)',
    size: '1.2 MB',
    updated: 'Mar 10, 2026',
    issuer: 'Corporate Finance & Payroll',
    description: 'Reimbursement thresholds, travel per diem allowances, and home office equipment stipends.',
  },
  {
    id: 'POL-04',
    title: 'Information Security & Data Privacy (SOC-2)',
    category: 'SECURITY',
    version: 'v5.0 (2026)',
    size: '2.1 MB',
    updated: 'Feb 28, 2026',
    issuer: 'InfoSec & Compliance Dept',
    description: 'Standards for password security, 2FA protocols, device encryption, and customer data privacy.',
  },
];

const DEFAULT_PERSONAL_DOCS = [
  {
    id: 'DOC-101',
    title: 'Official Employment Contract & Offer Letter',
    type: 'CONTRACT',
    issueDate: 'Mar 15, 2022',
    size: '2.4 MB',
    status: 'VERIFIED',
    issuer: 'NexaHR People Operations',
  },
  {
    id: 'DOC-102',
    title: 'Annual Compensation & Equity Grant FY26',
    type: 'COMPENSATION',
    issueDate: 'Apr 01, 2026',
    size: '850 KB',
    status: 'VERIFIED',
    issuer: 'Executive Board',
  },
  {
    id: 'DOC-103',
    title: 'Signed Non-Disclosure & IP Assignment (NDA)',
    type: 'LEGAL',
    issueDate: 'Mar 15, 2022',
    size: '1.1 MB',
    status: 'VERIFIED',
    issuer: 'Legal & Compliance Dept',
  },
  {
    id: 'DOC-104',
    title: 'Tax Statement W-2 / Withholding Summary 2025',
    type: 'TAX_FORM',
    issueDate: 'Jan 31, 2026',
    size: '620 KB',
    status: 'VERIFIED',
    issuer: 'Finance & Payroll Operations',
  },
  {
    id: 'DOC-105',
    title: 'AWS Certified Solutions Architect Certificate',
    type: 'CERTIFICATE',
    issueDate: 'May 10, 2025',
    size: '1.5 MB',
    status: 'VERIFIED',
    issuer: 'Amazon Web Services',
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
    fileName: '',
  });

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
    if (!uploadForm.title.trim()) return;

    const newDoc = {
      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      title: uploadForm.title.trim(),
      type: uploadForm.type,
      issueDate: formatDate(new Date()),
      size: '1.2 MB',
      status: 'VERIFIED',
      issuer: uploadForm.issuer.trim() || 'Employee Self-Upload',
    };

    const updated = [newDoc, ...personalDocs];
    savePersonalDocs(updated);
    setIsUploadOpen(false);
    setUploadForm({
      title: '',
      type: 'CERTIFICATE',
      issuer: 'Certifying Authority',
      fileName: '',
    });
    setToastMsg('Document uploaded & encrypted in personal vault!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDownload = (doc) => {
    setToastMsg(`Downloading "${doc.title}"...`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filteredPersonal = personalDocs.filter((d) =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.issuer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPolicies = COMPANY_POLICIES.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDocIcon = (type) => {
    switch (type) {
      case 'CONTRACT':
      case 'LEGAL':
        return <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      case 'COMPENSATION':
      case 'TAX_FORM':
        return <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'CERTIFICATE':
        return <Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const getDocBadge = (type) => {
    switch (type) {
      case 'CONTRACT':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60';
      case 'COMPENSATION':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60';
      case 'LEGAL':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/60';
      case 'TAX_FORM':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/60';
      case 'CERTIFICATE':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/60';
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Documents & Policies"
        subtitle="Secure document vault, employment contracts, and corporate handbook repository."
        action={
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500 text-xs font-bold rounded-full flex items-center gap-2 shadow-sm cursor-pointer transition-all hover:scale-105"
          >
            <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
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
      {/* 1. VAULT METRICS OVERVIEW (PURE WHITE CARDS - NO CHUNKY GREEN BANNER) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Personal Vault Files</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{personalDocs.length} Verified Files</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">256-bit AES Encrypted</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Handbooks</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{COMPANY_POLICIES.length} Handbooks</div>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1">Active Compliance FY26</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between hover:shadow-md transition-all">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Storage & Security</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">8.5 MB Used</div>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold mt-1">SOC-2 & ISO-27001 Ready</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. FILE MANAGER CONTROLS (TABS, SEARCH, VIEW TOGGLE) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Segmented Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'personal'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Personal Vault ({personalDocs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'policies'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Company Policies ({COMPANY_POLICIES.length})</span>
          </button>
        </div>

        {/* Right Search + View Switcher */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shrink-0">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-xl cursor-pointer transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-xl cursor-pointer transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT: PERSONAL VAULT */}
      {/* ========================================================================= */}
      {activeTab === 'personal' && (
        viewMode === 'list' ? (
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  My Verified Documents & Agreements
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Official employment files and certificates verified by NexaHR People Operations
                </p>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {filteredPersonal.length} Documents
              </span>
            </div>

            {filteredPersonal.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-6">Document Name</th>
                      <th className="py-3.5 px-4">Category</th>
                      <th className="py-3.5 px-4">Issuing Authority</th>
                      <th className="py-3.5 px-4">Date Issued</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPersonal.map((doc) => (
                      <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                              {getDocIcon(doc.type)}
                            </div>
                            <div>
                              <div className="font-extrabold text-slate-800 dark:text-slate-100">{doc.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{doc.id} • {doc.size}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getDocBadge(doc.type)}`}>
                            {doc.type}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                          {doc.issuer}
                        </td>
                        <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                          {doc.issueDate}
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>VERIFIED</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedDoc(doc)}
                              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                              title="View Document Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDownload(doc)}
                              className="p-2 rounded-xl bg-slate-900 text-white dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-500 transition-colors cursor-pointer shadow-xs"
                              title="Download File"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
                <h4 className="text-base font-black text-slate-900 dark:text-white">No Documents Found</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm">
                  Click the "+ Upload Document" button above to add certifications or identification.
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonal.map((doc) => (
              <div
                key={doc.id}
                className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      {getDocIcon(doc.type)}
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getDocBadge(doc.type)}`}>
                      {doc.type}
                    </span>
                  </div>

                  <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2">
                    {doc.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 mt-1">{doc.issuer}</div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-mono">{doc.size}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ========================================================================= */}
      {/* 4. TAB CONTENT: COMPANY POLICIES */}
      {/* ========================================================================= */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredPolicies.map((pol) => (
            <div
              key={pol.id}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/60">
                    {pol.category} • {pol.version}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">{pol.size}</span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {pol.title}
                </h4>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {pol.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium text-[11px]">Updated {pol.updated}</span>
                <button
                  onClick={() => handleDownload(pol)}
                  className="px-4 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Guide</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. UPLOAD MODAL */}
      {/* ========================================================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">Upload Verified Document</h3>
                  <p className="text-xs text-slate-400">File will be encrypted and saved to your personal vault</p>
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
                  placeholder="e.g. Master Degree Diploma, PMP Certification..."
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Category *</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
                  >
                    <option value="CERTIFICATE">Certificate / Diploma</option>
                    <option value="TAX_FORM">Tax / Financial Form</option>
                    <option value="CONTRACT">Contract / Agreement</option>
                    <option value="LEGAL">Legal / Identity Doc</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Issuing Authority</label>
                  <input
                    type="text"
                    placeholder="e.g. Stanford University"
                    value={uploadForm.issuer}
                    onChange={(e) => setUploadForm({ ...uploadForm, issuer: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Drag & Drop File Area */}
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 text-center hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  Click to select file or drag and drop
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  PDF, DOCX, PNG up to 25MB (Encrypted storage)
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold transition-all hover:scale-105 cursor-pointer shadow-md"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DOCUMENT DETAIL MODAL */}
      {/* ========================================================================= */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {getDocIcon(selectedDoc.type)}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedDoc.title}</h3>
                  <p className="text-xs text-slate-400">{selectedDoc.id} • {selectedDoc.size}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Classification:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDoc.type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Issuing Entity:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDoc.issuer}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 font-semibold">Date Registered:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedDoc.issueDate}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-400 font-semibold">Encryption:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">256-bit AES Vault</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer text-xs"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(selectedDoc)}
                className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDocuments;
