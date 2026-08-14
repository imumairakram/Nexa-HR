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
    description: 'Comprehensive guidelines on professional integrity, respectful workplace culture, and compliance.',
  },
  {
    id: 'POL-02',
    title: 'Global Health & Medical Benefits Guide',
    category: 'BENEFITS',
    version: 'v2.0 (2026)',
    size: '3.4 MB',
    updated: 'Jul 01, 2026',
    issuer: 'People Operations & HR',
    description: 'Full breakdown of medical, dental, vision, 401(k) matching, and mental wellness coverage.',
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
    setUploadForm({ title: '', type: 'CERTIFICATE', issuer: 'Certifying Authority', fileName: '' });
    setToastMsg(`Document "${newDoc.title}" uploaded & verified!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleDownload = (doc) => {
    setToastMsg(`Preparing encrypted download for ${doc.title}...`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filteredPersonal = personalDocs.filter((d) => {
    const q = searchQuery.toLowerCase();
    return d.title.toLowerCase().includes(q) || d.type.toLowerCase().includes(q) || d.issuer.toLowerCase().includes(q);
  });

  const filteredPolicies = COMPANY_POLICIES.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Documents & Policies"
        subtitle="Access employment agreements, salary letters, tax forms, and company policy handbooks."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* TOP STATS CARDS & UPLOAD BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">My Verified Documents</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{personalDocs.length} Files</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Company Policy Handbooks</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{COMPANY_POLICIES.length} Handbooks</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-emerald-600 dark:bg-emerald-700 text-white rounded-3xl p-5 shadow-soft flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">Need to Add Certificate?</div>
            <div className="text-sm font-black mt-0.5">Upload Verified Document</div>
          </div>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-extrabold rounded-2xl shadow-md cursor-pointer transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* TABS + SEARCH */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab('personal')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'personal'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Personal Documents & Contracts ({personalDocs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'policies'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Company Policies & Handbooks ({COMPANY_POLICIES.length})</span>
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* TAB CONTENT 1: PERSONAL DOCUMENTS */}
      {activeTab === 'personal' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>My Employment & Tax Documents</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">All files are 256-bit encrypted</span>
          </div>

          {filteredPersonal.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
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
                    <tr key={doc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">{doc.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {doc.id} • {doc.size}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                          {doc.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {doc.issuer}
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-medium">
                        {doc.issueDate}
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{doc.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
                            title="Preview Document"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
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
            <div className="p-12 text-center">
              <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h4 className="text-base font-black text-slate-900 dark:text-white">No Documents Found</h4>
              <p className="text-xs text-slate-400 mt-1">Upload verified files or certificates to store them securely.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: COMPANY POLICIES */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPolicies.map((pol) => (
            <div
              key={pol.id}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase">
                    {pol.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">{pol.version}</span>
                </div>

                <h4 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {pol.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {pol.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Updated: {pol.updated}</span>
                <button
                  onClick={() => handleDownload(pol)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Handbook ({pol.size})</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* UPLOAD MODAL */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Upload Verified Document</h3>
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
                  placeholder="e.g. Professional Cloud Architect Certificate"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Category *</label>
                  <select
                    value={uploadForm.type}
                    onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer"
                  >
                    <option value="CERTIFICATE">Certificate / Diploma</option>
                    <option value="CONTRACT">Employment Contract</option>
                    <option value="TAX_FORM">Tax Document / W-2</option>
                    <option value="LEGAL">Legal / Identity Document</option>
                    <option value="COMPENSATION">Compensation Record</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Issuing Authority</label>
                  <input
                    type="text"
                    placeholder="e.g. Amazon Web Services"
                    value={uploadForm.issuer}
                    onChange={(e) => setUploadForm({ ...uploadForm, issuer: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Select File (PDF, DOCX, PNG, JPG)</label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="font-bold text-slate-700 dark:text-slate-300">Click to browse or drag & drop file</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maximum file size: 25 MB</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">{selectedDoc.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">{selectedDoc.id} • {selectedDoc.size}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedDoc.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Issuing Authority:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedDoc.issuer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Date Issued:</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedDoc.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Security Verification:</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>256-bit SHA Encrypted</span>
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleDownload(selectedDoc)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-md cursor-pointer flex items-center gap-1.5 text-xs"
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
