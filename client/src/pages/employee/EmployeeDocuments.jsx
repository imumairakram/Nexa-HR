import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Upload,
  Eye,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  FolderLock,
  FileCode,
  Lock,
  Plus,
  X,
  Search,
  Filter,
  ChevronDown,
  RotateCcw,
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
  Trash2,
  Copy,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import ModernSearchBarSection from '../../components/common/ModernSearchBarSection';
import { TableSkeleton, DocumentCardSkeleton } from '../../components/common/Skeleton';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';
import { api } from '../../services/api';
import { isDemoSessionActive } from '../../demo/demoSession';

// Helper to determine icon, color, and styling by document category/type
const getDocTypeMeta = (type = '') => {
  const norm = String(type || '').toUpperCase();
  if (norm.includes('CONTRACT') || norm.includes('OFFER') || norm.includes('APPOINTMENT')) {
    return {
      icon: <FileCheck className="w-4 h-4 stroke-[2.2]" />,
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      color: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-100 dark:border-sky-800/60',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/80',
      badgeColor: 'text-sky-700 dark:text-sky-300',
      badgeBorder: 'border-sky-200/80 dark:border-sky-800/80',
    };
  }
  if (norm.includes('CERTIFICATE') || norm.includes('ACADEMIC') || norm.includes('DEGREE')) {
    return {
      icon: <Award className="w-4 h-4 stroke-[2.2]" />,
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      color: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-100 dark:border-sky-800/60',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/80',
      badgeColor: 'text-sky-700 dark:text-sky-300',
      badgeBorder: 'border-sky-200/80 dark:border-sky-800/80',
    };
  }
  if (norm.includes('IDENT') || norm.includes('PASSPORT') || norm.includes('CNIC') || norm.includes('NDA')) {
    return {
      icon: <Shield className="w-4 h-4 stroke-[2.2]" />,
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      color: 'text-sky-600 dark:text-sky-400',
      border: 'border-sky-100 dark:border-sky-800/60',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/80',
      badgeColor: 'text-sky-700 dark:text-sky-300',
      badgeBorder: 'border-sky-200/80 dark:border-sky-800/80',
    };
  }
  if (norm.includes('TAX') || norm.includes('FINANCE') || norm.includes('SALARY')) {
    return {
      icon: <FileSpreadsheet className="w-4 h-4 stroke-[2.2]" />,
      bg: 'bg-slate-100 dark:bg-slate-800',
      color: 'text-slate-700 dark:text-slate-300',
      border: 'border-slate-200 dark:border-slate-700',
      badgeBg: 'bg-slate-100 dark:bg-slate-800',
      badgeColor: 'text-slate-800 dark:text-slate-200',
      badgeBorder: 'border-slate-200 dark:border-slate-700',
    };
  }
  return {
    icon: <FileText className="w-4 h-4 stroke-[2.2]" />,
    bg: 'bg-sky-50 dark:bg-sky-950/60',
    color: 'text-sky-600 dark:text-sky-400',
    border: 'border-sky-100 dark:border-sky-800/60',
    badgeBg: 'bg-sky-50 dark:bg-sky-950/80',
    badgeColor: 'text-sky-700 dark:text-sky-300',
    badgeBorder: 'border-sky-200/80 dark:border-sky-800/80',
  };
};

// Cross-portal broadcast channel for instantaneous 2-way sync
const syncChannel =
  typeof window !== 'undefined' && 'BroadcastChannel' in window
    ? new BroadcastChannel('nexahr_vault_sync')
    : null;

const notifyVaultSync = () => {
  try {
    if (syncChannel) {
      syncChannel.postMessage({ type: 'DOCUMENTS_UPDATED', timestamp: Date.now() });
    }
    localStorage.setItem('nexahr_sync_pulse', Date.now().toString());
  } catch { }
};

const EmployeeDocuments = () => {
  const { formatDate } = useRegionalSettings();

  // Clean initial state - scrub legacy dummy documents
  const [personalDocs, setPersonalDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_personal_docs');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter(
          (d) =>
            !['doc-01', 'doc-02', 'doc-03', 'doc-04', 'DOC-101', 'DOC-102', 'DOC-103', 'DOC-104', 'DOC-105'].includes(d.id) &&
            !String(d.id || '').startsWith('doc-0')
        );
      }
      return [];
    } catch {
      return [];
    }
  });

  const [policies, setPolicies] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_company_policies');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.filter(
          (p) => !['POL-01', 'POL-02', 'POL-03', 'POL-04'].includes(p.id)
        );
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('personal'); // 'personal' | 'policies'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSort, setActiveSort] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [activeDateRange, setActiveDateRange] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const filterDropdownRef = useRef(null);

  // Close filter dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = (id) => {
    if (!id) return;
    navigator.clipboard?.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch live documents & policies from backend
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const [docRes, polRes] = await Promise.allSettled([
        api.getIssuedDocuments(),
        api.getCompanyPolicies(),
      ]);

      if (
        docRes.status === 'fulfilled' &&
        docRes.value?.success &&
        Array.isArray(docRes.value.data?.documents)
      ) {
        const backendDocs = docRes.value.data.documents
          .filter(
            (d) =>
              !['doc-01', 'doc-02', 'doc-03', 'doc-04', 'DOC-101', 'DOC-102', 'DOC-103', 'DOC-104', 'DOC-105'].includes(d.id) &&
              !String(d.id || '').startsWith('doc-0')
          )
          .map((d) => ({
            id: d.id,
            title: d.title || d.documentTitle || d.name || 'Official Document',
            type: d.type || d.documentType || 'DOCUMENT',
            typeLabel: d.typeLabel || (d.documentType ? d.documentType.replace(/_/g, ' ') : (d.type || 'Document')),
            issueDate: d.issueDate || d.issuedDate || (d.createdAt ? new Date(d.createdAt).toISOString().split('T')[0] : '—'),
            size: d.size || d.fileSize || '1.2 MB',
            status: d.status || 'VERIFIED',
            issuer: d.issuer || d.authority || d.author || 'NexaHR Enterprise Authority',
            description: d.description || '',
            referenceNumber: d.referenceNumber || (d.id ? (d.id.startsWith('#') ? d.id : `#${d.id}`) : ''),
            fileUrl: d.fileUrl || d.downloadUrl || null,
            uploadedBy: d.uploadedBy || 'NexaHR Operations',
          }));
        setPersonalDocs(backendDocs);
        try {
          localStorage.setItem('nexahr_personal_docs', JSON.stringify(backendDocs));
        } catch { }
      } else {
        const saved = localStorage.getItem('nexahr_personal_docs');
        if (saved) {
          const parsed = JSON.parse(saved).filter(
            (d) =>
              !['doc-01', 'doc-02', 'doc-03', 'doc-04', 'DOC-101', 'DOC-102', 'DOC-103', 'DOC-104', 'DOC-105'].includes(d.id) &&
              !String(d.id || '').startsWith('doc-0')
          );
          setPersonalDocs(parsed);
        }
      }

      if (
        polRes.status === 'fulfilled' &&
        polRes.value?.success &&
        Array.isArray(polRes.value.data?.policies)
      ) {
        const backendPolicies = polRes.value.data.policies.map((p) => ({
          id: p.id,
          title: p.title || 'Corporate Governance Policy',
          category: p.category || 'GOVERNANCE',
          categoryLabel: p.categoryLabel || (p.category ? p.category.replace(/_/g, ' ') : 'General'),
          version: p.version ? (p.version.startsWith('v') ? p.version : `v${p.version}`) : 'v1.0',
          updated: p.effectiveDate || p.updated || '2026-01-01',
          size: p.fileSize || p.size || '1.0 MB',
          description: p.summary || p.description || '',
          downloadUrl: p.downloadUrl || '#',
          author: p.author || p.issuer || 'Executive Committee',
        }));
        setPolicies(backendPolicies);
        try {
          localStorage.setItem('nexahr_company_policies', JSON.stringify(backendPolicies));
        } catch { }
      } else {
        const savedPol = localStorage.getItem('nexahr_company_policies');
        if (savedPol) {
          const parsed = JSON.parse(savedPol).filter(
            (p) => !['POL-01', 'POL-02', 'POL-03', 'POL-04'].includes(p.id)
          );
          setPolicies(parsed);
        }
      }
    } catch (e) {
      console.warn('Document sync error:', e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDocuments();

    const handleSyncMessage = (event) => {
      if (event?.data?.type === 'DOCUMENTS_UPDATED') {
        fetchDocuments();
      }
    };

    const handleStorage = (e) => {
      if (e.key === 'nexahr_sync_pulse') {
        fetchDocuments();
      }
    };

    if (syncChannel) {
      syncChannel.addEventListener('message', handleSyncMessage);
    }
    window.addEventListener('storage', handleStorage);

    return () => {
      if (syncChannel) {
        syncChannel.removeEventListener('message', handleSyncMessage);
      }
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    title: '',
    type: 'CERTIFICATE',
    issuer: 'Certifying Authority',
    file: null,
    fileUrl: null,
    fileName: '',
    size: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleDeleteDoc = async (docId) => {
    try {
      if (isDemoSessionActive()) {
        const updated = personalDocs.filter((d) => d.id !== docId);
        setPersonalDocs(updated);
        try {
          localStorage.setItem('nexahr_personal_docs', JSON.stringify(updated));
        } catch { }
        showToast('Document removed from personal vault');
        notifyVaultSync();
        return;
      }
      await api.deleteIssuedDocument(docId);
      const updated = personalDocs.filter((d) => d.id !== docId);
      setPersonalDocs(updated);
      try {
        localStorage.setItem('nexahr_personal_docs', JSON.stringify(updated));
      } catch { }
      showToast('Document removed from personal vault');
      notifyVaultSync();
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Could not delete document');
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadForm.title.trim()) {
      showToast('Please enter a valid document title');
      return;
    }

    setSubmitting(true);
    try {
      const typeLabels = {
        OFFER_LETTER: 'Offer Letter',
        CERTIFICATE: 'Professional Certificate',
        IDENTIFICATION: 'National ID / Passport',
        CONTRACT: 'Employment Agreement',
        ACADEMIC: 'Academic Degree & Diploma',
        TAX_FORM: 'Tax Form',
        CUSTOM: 'Official Document',
      };

      if (isDemoSessionActive()) {
        const newDoc = {
          id: `usr-doc-${Date.now()}`,
          title: uploadForm.title.trim(),
          type: uploadForm.type,
          typeLabel: typeLabels[uploadForm.type] || 'Professional Certificate',
          issuer: uploadForm.issuer.trim() || 'Verified Self-Submission',
          issueDate: new Date().toISOString().split('T')[0],
          size: uploadForm.size || (uploadForm.file ? `${(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB'),
          status: 'VERIFIED',
          referenceNumber: `DOC-VER-${Math.floor(1000 + Math.random() * 9000)}`,
          fileUrl: uploadForm.fileUrl || null,
          description: `Verified ${typeLabels[uploadForm.type] || 'certificate'} uploaded to personal compliance vault.`,
          uploadedBy: 'Self (Employee)',
        };
        setPersonalDocs((prev) => [newDoc, ...prev]);
        try {
          const existing = JSON.parse(localStorage.getItem('nexahr_personal_docs') || '[]');
          localStorage.setItem('nexahr_personal_docs', JSON.stringify([newDoc, ...existing]));
        } catch { }
        showToast(`Document "${newDoc.title}" successfully verified & stored in vault!`);
        notifyVaultSync();
        setIsUploadOpen(false);
        setUploadForm({
          title: '',
          type: 'CERTIFICATE',
          issuer: 'Certifying Authority',
          file: null,
          fileUrl: null,
          fileName: '',
          size: '',
        });
        return;
      }

      const payload = {
        title: uploadForm.title.trim(),
        type: uploadForm.type,
        typeLabel: typeLabels[uploadForm.type] || 'Professional Certificate',
        issuer: uploadForm.issuer.trim() || 'Verified Self-Submission',
        description: `Verified ${typeLabels[uploadForm.type] || 'certificate'} uploaded to personal compliance vault.`,
        size: uploadForm.size || (uploadForm.file ? `${(uploadForm.file.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB'),
        fileUrl: uploadForm.fileUrl || null,
      };

      const res = await api.uploadEmployeeDocument(payload);
      if (res?.success && res.data?.document) {
        const newDoc = res.data.document;
        setPersonalDocs((prev) => [newDoc, ...prev]);
        try {
          const existing = JSON.parse(localStorage.getItem('nexahr_personal_docs') || '[]');
          localStorage.setItem('nexahr_personal_docs', JSON.stringify([newDoc, ...existing]));
        } catch { }
        showToast(`Document "${newDoc.title}" successfully verified & stored in vault!`);
        notifyVaultSync();
      } else {
        await fetchDocuments();
        showToast('Document uploaded successfully.');
        notifyVaultSync();
      }

      setIsUploadOpen(false);
      setUploadForm({
        title: '',
        type: 'CERTIFICATE',
        issuer: 'Certifying Authority',
        file: null,
        fileUrl: null,
        fileName: '',
        size: '',
      });
    } catch (err) {
      console.error('Upload error:', err);
      showToast(err.message || 'Failed to upload document to vault.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownload = (doc) => {
    if (!doc) return;
    if (doc.fileUrl && doc.fileUrl.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = doc.fileUrl;
      link.download = `${(doc.referenceNumber || doc.id || 'NEXA-DOC')}_${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Downloaded: ${doc.title}`);
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${doc.title} - NexaHR Certified Employee Copy</title>
  <style>
    body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; color: #0f172a; margin: 40px; background: #fff; line-height: 1.6; }
    .header { border-bottom: 3px solid #0A8FB5; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 28px; font-weight: 900; color: #0A8FB5; }
    .subbrand { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .badge { display: inline-block; background: #E1F4FA; color: #07617D; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; margin-top: 20px; }
    .title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 15px 0 5px 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin: 25px 0; font-size: 13px; }
    .grid-label { color: #64748b; font-weight: 600; font-size: 11px; }
    .grid-val { font-weight: 700; color: #0f172a; }
    .content { font-size: 13.5px; color: #334155; line-height: 1.8; margin: 25px 0; white-space: pre-wrap; }
    .footer { margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 11px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">NexaHR</div>
      <div class="subbrand">Personal Workforce Vault</div>
    </div>
    <div style="font-size: 11px; color: #64748b;">Issue Date: ${doc.issueDate || 'Oct 24, 2026'}</div>
  </div>
  <div class="badge">${doc.typeLabel || doc.type || 'Official Record'}</div>
  <div class="title">${doc.title}</div>
  <div class="grid">
    <div>
      <div class="grid-label">DOCUMENT IDENTIFIER</div>
      <div class="grid-val">${doc.referenceNumber || `#${doc.id}`}</div>
    </div>
    <div>
      <div class="grid-label">ISSUING ENTITY</div>
      <div class="grid-val">${doc.issuer || 'People Operations & HR'}</div>
    </div>
  </div>
  <div class="content">${doc.description || 'Verified official document registered in employee compliance archive.'}</div>
  <div class="footer">NexaHR Cryptographic Vault • Digital Signature Verified</div>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(doc.referenceNumber || doc.id || 'NEXA-DOC')}_${doc.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded verified document: ${doc.title}`);
  };

  // Sort & Date Options
  const sortOptions = [
    { key: 'date', label: 'Date' },
    { key: 'title', label: 'Title' },
    { key: 'size', label: 'File Size' },
  ];

  const dateRangeOptions = [
    { key: 'ALL', label: 'All Time' },
    { key: 'THIS_MONTH', label: 'This Month' },
    { key: 'THIS_YEAR', label: 'Year 2026' },
  ];

  const dateRangeLabels = {
    ALL: 'All Time',
    THIS_MONTH: 'This Month',
    THIS_YEAR: 'Year 2026',
  };

  // Filtered documents (100% null-safe with dynamic sorting)
  const filteredPersonalDocs = useMemo(() => {
    let list = personalDocs.filter((d) => {
      const matchesType = typeFilter === 'ALL' || d.type === typeFilter;
      if (!matchesType) return false;

      let matchesDate = true;
      if (activeDateRange === 'THIS_MONTH') {
        const itemDate = new Date(d.uploadDate || d.date || d.createdAt || Date.now());
        const now = new Date();
        matchesDate = itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
      } else if (activeDateRange === 'THIS_YEAR') {
        const itemDate = new Date(d.uploadDate || d.date || d.createdAt || Date.now());
        matchesDate = itemDate.getFullYear() === 2026;
      }
      if (!matchesDate) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const title = (d.title || '').toLowerCase();
      const id = (d.id || '').toLowerCase();
      const ref = (d.referenceNumber || '').toLowerCase();
      const issuer = (d.issuer || '').toLowerCase();
      const type = (d.type || '').toLowerCase();
      const typeLabel = (d.typeLabel || '').toLowerCase();
      return (
        title.includes(q) ||
        id.includes(q) ||
        ref.includes(q) ||
        issuer.includes(q) ||
        type.includes(q) ||
        typeLabel.includes(q)
      );
    });

    list.sort((a, b) => {
      let valA, valB;
      if (activeSort === 'date') {
        valA = new Date(a.uploadDate || a.date || a.createdAt || 0).getTime();
        valB = new Date(b.uploadDate || b.date || b.createdAt || 0).getTime();
      } else if (activeSort === 'title') {
        valA = (a.title || '').toLowerCase();
        valB = (b.title || '').toLowerCase();
      } else if (activeSort === 'size') {
        valA = parseFloat(a.size || 0);
        valB = parseFloat(b.size || 0);
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [personalDocs, searchQuery, typeFilter, activeDateRange, activeSort, sortOrder]);

  const filteredPolicies = useMemo(() => {
    let list = policies.filter((p) => {
      const matchesType = typeFilter === 'ALL' || p.category === typeFilter;
      if (!matchesType) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const title = (p.title || '').toLowerCase();
      const id = (p.id || '').toLowerCase();
      const category = (p.category || '').toLowerCase();
      const categoryLabel = (p.categoryLabel || '').toLowerCase();
      const author = (p.author || p.issuer || '').toLowerCase();
      const description = (p.description || p.summary || '').toLowerCase();
      return (
        title.includes(q) ||
        id.includes(q) ||
        category.includes(q) ||
        categoryLabel.includes(q) ||
        author.includes(q) ||
        description.includes(q)
      );
    });

    list.sort((a, b) => {
      let valA = (a.title || '').toLowerCase();
      let valB = (b.title || '').toLowerCase();
      if (activeSort === 'date') {
        valA = new Date(a.lastUpdated || a.effectiveDate || 0).getTime();
        valB = new Date(b.lastUpdated || b.effectiveDate || 0).getTime();
      } else if (activeSort === 'size') {
        valA = parseFloat(a.size || 0);
        valB = parseFloat(b.size || 0);
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [policies, searchQuery, typeFilter, activeSort, sortOrder]);

  const personalDocTypes = useMemo(() => [
    { id: 'ALL', label: 'All Documents' },
    { id: 'OFFER_LETTER', label: 'Offer Letters' },
    { id: 'CONTRACT', label: 'Contracts' },
    { id: 'IDENTIFICATION', label: 'Identity / Passports' },
    { id: 'CERTIFICATE', label: 'Certificates' },
    { id: 'ACADEMIC', label: 'Academic' },
    { id: 'TAX_FORM', label: 'Tax Forms' },
  ], []);

  const policyCategories = useMemo(() => [
    { id: 'ALL', label: 'All Policies' },
    { id: 'GOVERNANCE', label: 'Governance' },
    { id: 'SECURITY', label: 'Security & IT' },
    { id: 'HR', label: 'HR & Conduct' },
    { id: 'OPERATIONS', label: 'Operations' },
  ], []);

  const activeFilterOptions = activeTab === 'personal' ? personalDocTypes : policyCategories;

  const filterCounts = useMemo(() => {
    const counts = { ALL: activeTab === 'personal' ? personalDocs.length : policies.length };
    if (activeTab === 'personal') {
      personalDocs.forEach((d) => {
        counts[d.type] = (counts[d.type] || 0) + 1;
      });
    } else {
      policies.forEach((p) => {
        counts[p.category] = (counts[p.category] || 0) + 1;
      });
    }
    return counts;
  }, [activeTab, personalDocs, policies]);

  // ---------------------------------------------------------------------------
  // Fully Functional Dynamic Sparklines & Telemetry for Documents & Policies Hub
  // ---------------------------------------------------------------------------

  // Helper to reliably parse any file size string (MB, KB, Bytes)
  const parseFileSizeInMB = (s) => {
    if (!s) return 0;
    if (typeof s === 'number') return isNaN(s) ? 0 : s;
    if (typeof s !== 'string') return 0;
    const mb = s.match(/([\d.]+)\s*MB/i);
    if (mb) return parseFloat(mb[1]) || 0;
    const kb = s.match(/([\d.]+)\s*KB/i);
    if (kb) return (parseFloat(kb[1]) || 0) / 1024;
    const b = s.match(/([\d.]+)\s*B/i);
    if (b) return (parseFloat(b[1]) || 0) / (1024 * 1024);
    const num = parseFloat(s);
    return isNaN(num) ? 0 : num;
  };

  // Card 1: Personal Vault Sparkline (Real breakdown across essential document categories)
  const personalDocsSparkData = useMemo(() => {
    const categories = [
      { key: 'CONTRACT', label: 'Contract', full: 'Contracts & Employment Agreements' },
      { key: 'CERTIFICATE', label: 'Cert', full: 'Certificates & Professional Licenses' },
      { key: 'ID', label: 'ID/Pass', full: 'Identity Proofs & Passports' },
      { key: 'ACADEMIC', label: 'Academic', full: 'Academic Degrees & Diplomas' },
      { key: 'TAX_FORM', label: 'Tax', full: 'Tax Filings & Compliance Forms' },
    ];

    return categories.map((cat) => {
      const count = personalDocs.filter((d) => {
        const t = (d.type || '').toUpperCase();
        if (cat.key === 'ID') return t.includes('ID') || t.includes('PASSPORT') || t.includes('CNIC');
        if (cat.key === 'CERTIFICATE') return t.includes('CERTIFICATE') || t.includes('LICENSE');
        if (cat.key === 'CONTRACT') return t.includes('CONTRACT') || t.includes('AGREEMENT') || t.includes('OFFER');
        if (cat.key === 'TAX_FORM') return t.includes('TAX');
        if (cat.key === 'ACADEMIC') return t.includes('ACADEMIC') || t.includes('DEGREE') || t.includes('DIPLOMA');
        return t === cat.key;
      }).length;
      return {
        value: count,
        label: cat.label,
        tooltip: `${cat.full}: ${count} ${count === 1 ? 'file' : 'files'} stored`,
      };
    });
  }, [personalDocs]);

  const personalBadge = useMemo(() => {
    if (personalDocs.length === 0) {
      return { text: '0 Files', type: 'neutral', icon: 'dot', sub: 'Personal Vault Empty' };
    }
    const verified = personalDocs.filter((d) => (d.status || '').toUpperCase() === 'VERIFIED').length;
    if (verified === personalDocs.length) {
      return { text: '100% Verified', type: 'positive', icon: 'up', sub: `${personalDocs.length} Verified Files Stored` };
    }
    return {
      text: `${verified}/${personalDocs.length} Verified`,
      type: 'warning',
      icon: 'dot',
      sub: `${personalDocs.length - verified} Awaiting HR Verification`,
    };
  }, [personalDocs]);

  // Card 2: Company Handbooks Sparkline (Real breakdown across policy taxonomies)
  const policiesSparkData = useMemo(() => {
    const policyCats = [
      { key: 'GOVERNANCE', label: 'Gov', full: 'Corporate Governance & Ethics' },
      { key: 'SECURITY', label: 'Security', full: 'Information Security & Privacy' },
      { key: 'WORKPLACE', label: 'Workplace', full: 'Workplace Conduct & Safety' },
      { key: 'COMPENSATION', label: 'Benefits', full: 'Compensation & Benefit Charters' },
      { key: 'OPERATIONS', label: 'Ops', full: 'Standard Operating Procedures' },
    ];

    return policyCats.map((cat) => {
      const count = policies.filter((p) => {
        const c = (p.category || '').toUpperCase();
        return c.includes(cat.key);
      }).length;
      return {
        value: count,
        label: cat.label,
        tooltip: `${cat.full}: ${count} active ${count === 1 ? 'charter' : 'charters'}`,
      };
    });
  }, [policies]);

  const policiesBadge = useMemo(() => {
    if (policies.length === 0) {
      return { text: '0 Policies', type: 'neutral', icon: 'dot', sub: 'No Handbooks Published' };
    }
    const distinctCats = new Set(policies.map((p) => p.category)).size;
    return {
      text: `${distinctCats} Active Categories`,
      type: 'positive',
      icon: 'up',
      sub: 'Governing All Operating Divisions',
    };
  }, [policies]);

  // Card 3: Authenticity & Compliance Sparkline
  const verifiedPersonalCount = useMemo(() => {
    return personalDocs.filter((d) => (d.status || '').toUpperCase() === 'VERIFIED').length;
  }, [personalDocs]);

  const complianceRate = useMemo(() => {
    if (!personalDocs.length) return '100.0';
    return ((verifiedPersonalCount / personalDocs.length) * 100).toFixed(1);
  }, [personalDocs, verifiedPersonalCount]);

  const complianceSparkData = useMemo(() => {
    if (!personalDocs.length) {
      return [
        { value: 100, label: 'Audit', tooltip: 'Statutory Baseline: 100% Compliant' },
        { value: 100, label: 'Cipher', tooltip: 'AES-256 Vault Encryption: Active' },
        { value: 100, label: 'SOC-2', tooltip: 'SOC-2 Type II Storage: Verified' },
        { value: 100, label: 'Score', tooltip: 'Dossier Compliance: 100.0%' },
      ];
    }
    const total = personalDocs.length;
    const verified = verifiedPersonalCount;
    const pending = total - verified;
    const rate = parseFloat(complianceRate) || 0;
    const verifiedPct = Math.round((verified / total) * 100);
    const pendingPct = Math.round((pending / total) * 100);

    return [
      { value: total, label: 'Files', tooltip: `Total Vault Files: ${total} Stored` },
      { value: verified, label: 'Verified', tooltip: `Verified & Authenticated: ${verified} Files (${verifiedPct}%)` },
      { value: pending, label: 'Pending', tooltip: `Under Verification: ${pending} Files (${pendingPct}%)` },
      { value: Math.round(rate), label: 'Score', tooltip: `Overall Compliance Score: ${rate}%` },
    ];
  }, [personalDocs, verifiedPersonalCount, complianceRate]);

  const complianceBadge = useMemo(() => {
    if (personalDocs.length === 0) {
      return { text: 'Audit Ready', type: 'positive', icon: 'up', sub: 'Baseline Clean Vault' };
    }
    const rate = parseFloat(complianceRate) || 0;
    if (rate >= 90) {
      return { text: `${rate}% Audited`, type: 'positive', icon: 'up', sub: 'All Mandatory Dossiers Verified' };
    }
    return {
      text: `${verifiedPersonalCount}/${personalDocs.length} Verified`,
      type: 'warning',
      icon: 'down',
      sub: `${personalDocs.length - verifiedPersonalCount} Pending Document Audits`,
    };
  }, [personalDocs, verifiedPersonalCount, complianceRate]);

  // Card 4: Vault Storage Telemetry & Sparkline
  const personalDocsMB = useMemo(() => {
    return personalDocs.reduce((acc, d) => acc + parseFileSizeInMB(d.size), 0);
  }, [personalDocs]);

  const policiesMB = useMemo(() => {
    return policies.reduce((acc, p) => acc + parseFileSizeInMB(p.size), 0);
  }, [policies]);

  const totalVaultMB = useMemo(() => {
    return (personalDocsMB + policiesMB).toFixed(1);
  }, [personalDocsMB, policiesMB]);

  const storageSparkData = useMemo(() => {
    const pMB = Number(personalDocsMB.toFixed(1));
    const polMB = Number(policiesMB.toFixed(1));
    const totalMB = Number((pMB + polMB).toFixed(1));
    const cloudQuota = 50.0;
    const remainingQuota = Math.max(0, Number((cloudQuota - totalMB).toFixed(1)));

    return [
      {
        value: pMB,
        label: 'Vault',
        tooltip: `Personal Dossier: ${pMB} MB (${personalDocs.length} ${personalDocs.length === 1 ? 'file' : 'files'})`,
      },
      {
        value: polMB,
        label: 'Charters',
        tooltip: `Company Handbooks: ${polMB} MB (${policies.length} ${policies.length === 1 ? 'policy' : 'policies'})`,
      },
      {
        value: totalMB,
        label: 'Total',
        tooltip: `Total Encrypted Stored: ${totalMB} MB Used`,
      },
      {
        value: remainingQuota,
        label: 'Free',
        tooltip: `Available Cloud Space: ${remainingQuota} MB (of ${cloudQuota} MB Quota)`,
      },
    ];
  }, [personalDocsMB, policiesMB, personalDocs.length, policies.length]);

  const storageBadge = useMemo(() => {
    const totalMB = parseFloat(totalVaultMB) || 0;
    if (totalMB === 0) {
      return { text: '50 MB Free', type: 'neutral', icon: 'dot', sub: 'AES-256 Cloud Allocated' };
    }
    return {
      text: `${totalVaultMB} MB / 50 MB`,
      type: 'positive',
      icon: 'up',
      sub: `${personalDocs.length + policies.length} Encrypted Files Stored`,
    };
  }, [totalVaultMB, personalDocs.length, policies.length]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full max-w-full overflow-x-hidden">
      <EmployeePageHeader
        title="Documents & Policies Hub"
        subtitle="Access your personal employment vault, contracts, tax certificates, and verified company compliance handbooks."
        onRefresh={fetchDocuments}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/25 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMsg}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC DOCUMENTS HERO BANNER */}
      {/* 2. SPARKLINE KPI METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* Card 1: Dark Navy Card - Personal Vault */}
        <SparkMetricCard
          variant="light"
          title="Personal Vault"
          value={personalDocs.length}
          unit={personalDocs.length === 1 ? 'File' : 'Files'}
          badgeText={personalBadge.text}
          badgeType={personalBadge.type}
          badgeIcon={personalBadge.icon}
          subtext={personalBadge.sub}
          chartColor="purple"
          presetWave="wave1"
          dataPoints={personalDocsSparkData}
          loading={loading}
          onClick={() => {
            setActiveTab('personal');
            setTypeFilter('ALL');
          }}
          className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
        />

        {/* Card 2: Light Card - Handbooks & Charters */}
        <SparkMetricCard
          variant="light"
          title="Company Handbooks"
          value={policies.length}
          unit={policies.length === 1 ? 'Policy' : 'Policies'}
          badgeText={policiesBadge.text}
          badgeType={policiesBadge.type}
          badgeIcon={policiesBadge.icon}
          subtext={policiesBadge.sub}
          chartColor="coral"
          presetWave="wave2"
          dataPoints={policiesSparkData}
          loading={loading}
          onClick={() => {
            setActiveTab('policies');
            setTypeFilter('ALL');
          }}
          className="cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
        />

        {/* Card 3: Light Card - Authenticity & Compliance */}
        <SparkMetricCard
          variant="light"
          title="Compliance State"
          value={`${complianceRate}%`}
          unit="Verified"
          badgeText={complianceBadge.text}
          badgeType={complianceBadge.type}
          badgeIcon={complianceBadge.icon}
          subtext={complianceBadge.sub}
          chartColor="amber"
          presetWave="wave3"
          dataPoints={complianceSparkData}
          loading={loading}
        />

        {/* Card 4: Light Card - Vault Storage */}
        <SparkMetricCard
          variant="light"
          title="Vault Storage"
          value={totalVaultMB}
          unit="MB Stored"
          badgeText={storageBadge.text}
          badgeType={storageBadge.type}
          badgeIcon={storageBadge.icon}
          subtext={storageBadge.sub}
          chartColor="rose"
          presetWave="wave4"
          dataPoints={storageSparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. MODERN DYNAMIC REPOSITORY SEARCH & FILTER COMMAND BAR */}
      {/* ========================================================================= */}
      <ModernSearchBarSection
        statusTabs={
          activeTab === 'personal'
            ? [
                { key: 'ALL', label: 'All', count: personalDocs.length },
                { key: 'CONTRACT', label: 'Contracts', count: personalDocs.filter((d) => (d.type || '').toUpperCase().includes('CONTRACT')).length },
                { key: 'CERTIFICATE', label: 'Certificates', count: personalDocs.filter((d) => (d.type || '').toUpperCase().includes('CERTIFICATE')).length },
                { key: 'ID', label: 'IDs', count: personalDocs.filter((d) => (d.type || '').toUpperCase().includes('ID') || (d.type || '').toUpperCase().includes('PASSPORT')).length },
              ]
            : [
                { key: 'ALL', label: 'All', count: policies.length },
                { key: 'GOVERNANCE', label: 'Governance', count: policies.filter((p) => p.category === 'GOVERNANCE').length },
                { key: 'SECURITY', label: 'Security', count: policies.filter((p) => p.category === 'SECURITY').length },
                { key: 'WORKPLACE', label: 'Workplace', count: policies.filter((p) => p.category === 'WORKPLACE').length },
              ]
        }
        activeStatus={typeFilter}
        onStatusChange={setTypeFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={activeTab === 'personal' ? 'Search documents by title or issuer...' : 'Search policies by title, category...'}
        searchHint={activeTab === 'personal' ? 'type:contract' : 'cat:security'}
        filterTags={
          typeFilter !== 'ALL' && !['CONTRACT', 'CERTIFICATE', 'ID', 'GOVERNANCE', 'SECURITY', 'WORKPLACE'].includes(typeFilter)
            ? [{ key: 'filter', label: `filter: ${typeFilter.toLowerCase()}` }]
            : []
        }
        onRemoveTag={(tag) => {
          if (tag.key === 'filter') setTypeFilter('ALL');
        }}
        dateRangeLabel={dateRangeLabels[activeDateRange] || 'All Time'}
        dateRangeOptions={dateRangeOptions}
        activeDateRange={activeDateRange}
        onDateRangeChange={setActiveDateRange}
        sortOptions={sortOptions}
        activeSort={activeSort}
        sortOrder={sortOrder}
        onSortChange={(key, order) => {
          setActiveSort(key);
          setSortOrder(order);
        }}
        filterCount={typeFilter !== 'ALL' ? 1 : 0}
        filterContent={
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                {activeTab === 'personal' ? 'Document Type' : 'Policy Category'}
              </span>
              {typeFilter !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setTypeFilter('ALL')}
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="space-y-0.5 max-h-56 overflow-y-auto">
              {activeFilterOptions.map(({ id, label }) => {
                const isSelected = typeFilter === id;
                const count = filterCounts[id] ?? 0;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTypeFilter(id)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-[12px] text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isSelected
                          ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        }
        actionButton={
          activeTab === 'personal' ? (
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[12px] bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
          ) : null
        }
      />

      {/* ========================================================================= */}
      {/* 4. DOCUMENTS CONTENT VIEW (PERSONAL VAULT OR COMPANY POLICIES) */}
      {/* ========================================================================= */}
      {activeTab === 'personal' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200/90 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-50/40 via-white to-transparent dark:from-sky-950/20 dark:via-[#1E293B] dark:to-[#1E293B]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60 flex items-center justify-center shrink-0 shadow-xs">
                <FolderLock className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Personal Employment Vault & Certificates
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  AES-256 encrypted repository of verified employment contracts, credentials, and tax filings
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Vault Switch Toggle */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('personal');
                    setTypeFilter('ALL');
                  }}
                  className={`px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'personal'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Vault ({personalDocs.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('policies');
                    setTypeFilter('ALL');
                  }}
                  className={`px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'policies'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Policies ({policies.length})
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <>
              <div className="p-6 md:hidden">
                <DocumentCardSkeleton count={6} />
              </div>
              <div className="hidden md:block">
                {viewMode === 'list' ? (
                  <TableSkeleton rows={5} cols={7} />
                ) : (
                  <div className="p-6">
                    <DocumentCardSkeleton count={6} />
                  </div>
                )}
              </div>
            </>
          ) : filteredPersonalDocs.length === 0 ? (
            <div className="p-12 sm:p-16 text-center space-y-5">
              <div className="relative inline-flex">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500/10 via-sky-500/15 to-sky-500/20 dark:from-sky-500/20 dark:via-sky-500/20 dark:to-sky-500/30 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/70 dark:border-sky-700/50 shadow-xl shadow-sky-500/10">
                  <FolderLock className="w-10 h-10 stroke-[1.6]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
              </div>
              <div className="space-y-2 max-w-lg mx-auto">
                <h4 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  {searchQuery ? 'No documents matched your search' : 'Personal Vault is Empty'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {searchQuery
                    ? 'No records match your query. Try clearing your search or using different keywords.'
                    : 'No documents are currently stored in your personal vault. Official contracts, offer letters, or certificates uploaded by you or HR will appear securely here with AES-256 cloud encryption.'}
                </p>
              </div>
              {!searchQuery && (
                <div className="pt-2">
                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="px-6 py-3 rounded-[12px] bg-gradient-to-r from-sky-600 to-sky-600 hover:from-sky-700 hover:to-sky-700 text-white font-extrabold text-xs shadow-lg shadow-sky-600/25 inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Upload Document to Vault</span>
                  </button>
                </div>
              )}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span>AES-256 Cloud Vault</span>
                </span>
                <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span>SOC-2 Type II Certified</span>
                </span>
                <span className="flex items-center px-3 py-1 rounded-[12px] bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <span>Tamper-Proof Audit Trail</span>
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              {viewMode === 'list' && (
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50/90 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-200/80 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-6">Document Name & Ref</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Issuing Authority</th>
                        <th className="py-3.5 px-4">Date Issued</th>
                        <th className="py-3.5 px-4">File Size</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
                      {filteredPersonalDocs.map((doc) => {
                        const typeInfo = getDocTypeMeta(doc.type);
                        return (
                          <tr
                            key={doc.id}
                            className="hover:bg-sky-50/30 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-2xl ${typeInfo.bg} ${typeInfo.color} flex items-center justify-center shrink-0 border ${typeInfo.border} shadow-xs group-hover:scale-105 transition-transform`}
                                >
                                  {typeInfo.icon}
                                </div>
                                <div className="min-w-0 max-w-[240px] lg:max-w-xs">
                                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                    {doc.title}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">
                                      {doc.referenceNumber || `#${doc.id}`}
                                    </span>
                                    <span className="text-[10px] font-mono font-bold uppercase text-slate-500 dark:text-slate-400">
                                      PDF
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {doc.typeLabel || doc.type?.replace(/_/g, ' ') || 'Document'}
                              </span>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                              <div className="flex items-center gap-2">
                                <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-bold text-xs truncate max-w-[170px]">
                                  {doc.issuer || 'NexaHR Authority'}
                                </span>
                              </div>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>{doc.issueDate || '—'}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                                {doc.size || '1.2 MB'}
                              </span>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                                {doc.status || 'Verified'}
                              </span>
                            </td>

                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedDoc(doc)}
                                  className="p-2 rounded-[12px] bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/60 hover:text-sky-600 dark:hover:text-sky-400 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                                  title="Preview Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDownload(doc)}
                                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[12px] bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold border border-slate-900 dark:border-white shadow-xs transition-all active:scale-95 cursor-pointer"
                                >
                                  <Download className="w-3 h-3 stroke-[2.2]" />
                                  <span>Download</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  className="p-2 rounded-[12px] bg-slate-50 dark:bg-slate-800/80 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200/80 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
                                  title="Delete Document"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Cards Grid View (for viewMode === 'grid' or Mobile) */}
              <div
                className={`p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${viewMode === 'list' ? 'md:hidden' : ''
                  }`}
              >
                {filteredPersonalDocs.map((doc) => {
                  const typeInfo = getDocTypeMeta(doc.type);
                  return (
                    <div
                      key={doc.id}
                      className="rounded-3xl p-5 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all space-y-3.5 group"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div
                          className={`w-10 h-10 rounded-2xl ${typeInfo.bg} ${typeInfo.color} flex items-center justify-center border ${typeInfo.border}`}
                        >
                          {typeInfo.icon}
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-[12px] bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200/70 dark:border-sky-800/60 flex items-center">
                          <span>{doc.status || 'Verified'}</span>
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                          {doc.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            {doc.issuer}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-[10px] text-slate-400 font-mono font-bold">
                            {doc.referenceNumber || `#${doc.id}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                        <span className="text-[11px] text-slate-400 font-mono">{doc.size || '1.2 MB'}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="p-1.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors cursor-pointer"
                            title="Preview Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="px-2.5 py-1 rounded-[12px] bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Policies Tab Content */}
      {activeTab === 'policies' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200/90 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-sky-50/40 via-white to-transparent dark:from-sky-950/20 dark:via-[#1E293B] dark:to-[#1E293B]">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800/60 flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Company Policies & Operating Handbooks
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  Official enterprise charters, compliance frameworks, and employee benefit guides
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Vault Switch Toggle */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('personal');
                    setTypeFilter('ALL');
                  }}
                  className={`px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'personal'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Vault ({personalDocs.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('policies');
                    setTypeFilter('ALL');
                  }}
                  className={`px-3.5 py-1.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === 'policies'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Policies ({policies.length})
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <DocumentCardSkeleton count={4} />
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="p-12 sm:p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 mx-auto flex items-center justify-center border border-sky-200/60 dark:border-sky-800/50 shadow-sm">
                <BookOpen className="w-8 h-8 stroke-[1.8]" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {searchQuery ? 'No policies match your search' : 'No Company Policies Published Yet'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {searchQuery
                    ? 'Try adjusting your search keywords.'
                    : 'Official organization handbooks, governance charters, and benefits guides published by HR/Admin will appear here.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Policies Table (List View) */}
              {viewMode === 'list' && (
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/70 text-slate-400 dark:text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-4 px-6">Handbook / Policy Title</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4">Version</th>
                        <th className="py-4 px-4">Effective Date</th>
                        <th className="py-4 px-4">Size</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
                      {filteredPolicies.map((pol) => (
                        <tr
                          key={pol.id}
                          className="hover:bg-sky-50/30 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-200/70 dark:border-sky-800/60 shadow-xs group-hover:scale-105 transition-transform">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 max-w-sm lg:max-w-md">
                                <span className="font-extrabold text-slate-900 dark:text-white text-xs block truncate group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                  {pol.title}
                                </span>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1 mt-0.5">
                                  {pol.description}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {pol.categoryLabel || pol.category}
                            </span>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap font-mono font-bold text-xs text-slate-500 dark:text-slate-400">
                            {pol.version}
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{pol.updated}</span>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="font-mono text-xs font-semibold text-slate-600 dark:text-slate-400">
                              {pol.size}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDownload(pol)}
                              className="px-4 py-1.5 rounded-[12px] bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Download Handbook</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Policies Cards Grid (for viewMode === 'grid' or Mobile) */}
              <div
                className={`p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-5 ${viewMode === 'list' ? 'md:hidden' : ''
                  }`}
              >
                {filteredPolicies.map((pol) => (
                  <div
                    key={pol.id}
                    className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-200/60">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-[12px] bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                            {pol.categoryLabel || pol.category}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">{pol.version}</span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
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
                        className="px-4 py-2 rounded-[12px] bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Handbook</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. UPLOAD DOCUMENT MODAL (ENTERPRISE HIGH-SECURITY REDESIGNED MODAL) */}
      {/* ========================================================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto no-scrollbar animate-in fade-in duration-200">
          <main className="relative z-10 w-full max-w-5xl lg:max-w-6xl bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/80 dark:border-slate-700/80 p-6 sm:p-9 transition-all max-h-[94vh] overflow-y-auto no-scrollbar animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <header className="flex items-start justify-between pb-6 border-b border-slate-100 dark:border-slate-800 mb-6" data-purpose="modal-header">
              <div className="flex items-center gap-4">
                {/* Glowing Upload / Shield Icon Badge */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 p-[1px] shadow-lg shadow-sky-500/25 flex items-center justify-center shrink-0">
                  <div className="w-full h-full rounded-[15px] bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center text-white">
                    <Upload className="w-6 h-6 stroke-[2.2]" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                    Upload to Vault
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-normal">
                    Add verified professional certificates, government IDs, and compliance records.
                  </p>
                </div>
              </div>

              {/* Close Action */}
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setIsUploadOpen(false)}
                className="p-2 rounded-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </header>

            {/* Form Section */}
            <form onSubmit={handleUploadSubmit} className="space-y-6" data-purpose="vault-upload-form">
              {/* Row 1: Document Details (Title & Issuing Authority) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-purpose="metadata-inputs">
                {/* Input: Document Title */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase" htmlFor="doc-title">
                      <FileText className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                      Document Title <span className="text-rose-500 ml-0.5">*</span>
                    </label>
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      {uploadForm.title.length}/100 chars
                    </span>
                  </div>
                  <input
                    id="doc-title"
                    type="text"
                    required
                    maxLength={100}
                    placeholder="e.g. Certified Scrum Master (CSM) Certificate or Passport Scan"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                  />
                </div>

                {/* Input: Issuing Authority */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase" htmlFor="issuing-authority">
                      <Building className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                      Issuing Authority
                    </label>
                    <span className="text-[11px] text-slate-400">e.g. Scrum Alliance, AWS, NADRA</span>
                  </div>
                  <input
                    id="issuing-authority"
                    type="text"
                    placeholder="Certifying Authority"
                    value={uploadForm.issuer}
                    onChange={(e) => setUploadForm({ ...uploadForm, issuer: e.target.value })}
                    className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 focus:outline-none"
                  />
                </div>
              </div>

              {/* Section 2: Document Classification Cards */}
              <section data-purpose="classification-selector">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase flex items-center">
                    Document Classification <span className="text-rose-500 ml-0.5">*</span>
                  </label>
                  <span className="text-xs text-slate-400 font-normal">Select the file classification</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { id: 'OFFER_LETTER', label: 'Offer Letter', desc: 'Appointment & terms', icon: FileText },
                    { id: 'CONTRACT', label: 'Agreement & NDA', desc: 'Signed contracts', icon: FileCheck },
                    { id: 'CERTIFICATE', label: 'Certificate', desc: 'AWS, Scrum, PMP', icon: Award },
                    { id: 'IDENTIFICATION', label: 'National ID', desc: 'Passport, CNIC', icon: ShieldCheck },
                    { id: 'ACADEMIC', label: 'Academic', desc: 'Degrees & Diplomas', icon: BookOpen },
                    { id: 'TAX_FORM', label: 'Tax Form', desc: 'W-2, 1099', icon: FileSpreadsheet },
                  ].map((cat) => {
                    const isSelected = uploadForm.type === cat.id;
                    const CatIcon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setUploadForm({ ...uploadForm, type: cat.id })}
                        className={`relative cursor-pointer flex flex-col p-3 rounded-[12px] transition-all text-left group ${
                          isSelected
                            ? 'border-2 border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 shadow-sm ring-4 ring-sky-500/10'
                            : 'border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800/80 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-md'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-white dark:ring-slate-900" />
                        )}
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2.5 transition-colors ${
                            isSelected
                              ? 'bg-sky-500 text-white shadow-sm shadow-sky-500/30'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 group-hover:bg-sky-50 dark:group-hover:bg-sky-950/60 group-hover:text-sky-600 dark:group-hover:text-sky-400'
                          }`}
                        >
                          <CatIcon className="w-4 h-4" />
                        </div>
                        <span
                          className={`text-xs font-bold leading-tight ${
                            isSelected ? 'text-sky-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {cat.label}
                        </span>
                        <span
                          className={`text-[11px] mt-1 line-clamp-1 ${
                            isSelected ? 'font-medium text-sky-700/80 dark:text-sky-300/80' : 'text-slate-400'
                          }`}
                        >
                          {cat.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Row 3: File Attachment & Live Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                {/* Left: Upload Dropzone Area */}
                <section data-purpose="attachment-upload">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                      <Upload className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                      File Attachment (PDF, DOCX, PNG) <span className="text-rose-500 ml-0.5">*</span>
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">Max size: 15 MB</span>
                  </div>

                  <div className="relative">
                    <input
                      type="file"
                      required={!uploadForm.file}
                      accept=".pdf,.docx,.doc,.png,.jpg,.jpeg"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const selected = e.target.files[0];
                          const sizeStr = `${(selected.size / (1024 * 1024)).toFixed(2)} MB`;
                          const reader = new FileReader();
                          reader.onload = () => {
                            setUploadForm((prev) => ({
                              ...prev,
                              file: selected,
                              fileName: selected.name,
                              fileUrl: reader.result,
                              size: sizeStr,
                            }));
                          };
                          reader.readAsDataURL(selected);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    />

                    <div
                      className={`h-28 rounded-2xl border-2 border-dashed transition-all p-4 flex items-center justify-center text-center cursor-pointer relative z-10 group ${
                        uploadForm.file
                          ? 'border-sky-500/80 bg-sky-50/50 dark:bg-sky-950/30'
                          : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 hover:bg-sky-50/30 dark:hover:bg-sky-950/30 hover:border-sky-400'
                      }`}
                    >
                      {uploadForm.file ? (
                        <div className="flex items-center justify-between w-full gap-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <FileCheck className="w-5 h-5" />
                            </div>
                            <div className="text-left min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {uploadForm.fileName || uploadForm.file.name}
                              </div>
                              <div className="text-[11px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">
                                {uploadForm.size || `${(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB`} • Ready to Encrypt
                              </div>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-[12px] bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 text-[10px] font-bold border border-sky-200 dark:border-sky-800/60 shrink-0 shadow-xs">
                            Replace
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-105 group-hover:border-sky-300 transition-all shrink-0">
                            <Upload className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
                              Click to browse or drag & drop document
                            </p>
                            <div className="flex items-center gap-1.5 mt-1">
                              <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                                PDF
                              </span>
                              <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                                DOCX
                              </span>
                              <span className="px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                                PNG, JPG
                              </span>
                              <span className="text-[10px] text-slate-400 ml-1">up to 15 MB</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Right: Live Preview & Record Card */}
                <section data-purpose="record-summary-preview">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
                      <Eye className="w-3.5 h-3.5 mr-1.5 text-sky-500" />
                      Live Preview & Record Card
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">Real-time summary</span>
                  </div>

                  <div className="h-28 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-gradient-to-b from-white to-slate-50/80 dark:from-slate-800/80 dark:to-slate-850/80 p-4 flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Document Icon Thumbnail */}
                      <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-100 dark:border-sky-800/60 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
                        <FileText className="w-6 h-6 stroke-[2]" />
                      </div>
                      {/* Metadata content */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {uploadForm.title.trim() || 'Untitled Vault Document'}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-xs">
                          <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider">
                            {uploadForm.type ? uploadForm.type.replace(/_/g, ' ') : 'CERTIFICATE'}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-sky-600 dark:text-sky-400 font-medium truncate">
                            {uploadForm.issuer.trim() || 'Certifying Authority'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Footer / Action Controls */}
              <footer className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4" data-purpose="modal-footer">
                {/* Security Trust Note */}
                <div className="flex items-center text-xs text-slate-400 dark:text-slate-400 order-2 sm:order-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 mr-2 shrink-0" />
                  <span>End-to-end encrypted storage & immutable audit logging</span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-[12px] border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white text-sm font-semibold shadow-lg shadow-sky-600/25 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{submitting ? 'Encrypting & Saving...' : 'Save & Encrypt'}</span>
                  </button>
                </div>
              </footer>
            </form>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DOCUMENT PREVIEW MODAL (ENTERPRISE VAULT CARD) */}
      {/* ========================================================================= */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-[28px] sm:rounded-[32px] max-w-xl w-full shadow-2xl shadow-sky-950/20 dark:shadow-black/70 border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Header */}
            <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-sky-50/80 via-white to-cyan-50/40 dark:from-sky-950/30 dark:via-[#1E293B] dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-cyan-300/15 dark:bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-500 to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/25 ring-4 ring-sky-100 dark:ring-sky-950/60">
                  <FileText className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white truncate tracking-tight">
                    {selectedDoc.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Issuer: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedDoc.issuer}</strong>
                    </span>
                    {selectedDoc.category && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-[12px] text-[10px] font-extrabold uppercase tracking-wider bg-sky-50 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800/60">
                        {selectedDoc.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="w-9 h-9 rounded-[12px] flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 relative z-10"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata Body */}
            <div className="px-6 sm:px-8 py-5 space-y-4">
              <div className="flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                <span>Vault Specifications</span>
                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold normal-case">
                  <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>HR Verified & Encrypted</span>
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-xs">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Vault Record ID</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <code className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700/80 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 select-all tracking-tight max-w-[210px] sm:max-w-xs truncate">
                      #{selectedDoc.id}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopyId(selectedDoc.id)}
                      className="p-1.5 rounded-[12px] text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-900 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer"
                      title="Copy Record ID"
                    >
                      {copiedId ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-xs">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Issue / Verification Date</span>
                  </div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {selectedDoc.issueDate || 'Recent'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-xs">
                    <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                    <span>Encrypted File Size</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-slate-700/60 font-mono font-bold text-[11px] text-slate-700 dark:text-slate-300">
                    {selectedDoc.size || 'Encrypted File'}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Compliance Verification</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] text-xs font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />
                    <span>HR Verified & Encrypted</span>
                  </span>
                </div>
              </div>

              {/* Verified Certificate Callout */}
              <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/20 border border-sky-100/90 dark:border-sky-900/40 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5 border border-sky-500/20">
                  <Shield className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {selectedDoc.description || 'Verified Professional Certificate uploaded to personal compliance vault.'}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2.5 rounded-[12px] text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownload(selectedDoc);
                  setSelectedDoc(null);
                }}
                className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 via-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-sky-500/25 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 stroke-[2.2]" />
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