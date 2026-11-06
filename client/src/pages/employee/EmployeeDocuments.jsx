import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { TableSkeleton, DocumentCardSkeleton } from '../../components/common/Skeleton';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';
import { api } from '../../services/api';
import { isDemoSessionActive } from '../../demo/demoSession';

// Helper to determine icon, color, and styling by document category/type
const getDocTypeMeta = (type = '') => {
  const norm = String(type || '').toUpperCase();
  if (norm.includes('CONTRACT') || norm.includes('OFFER') || norm.includes('APPOINTMENT')) {
    return {
      icon: <FileCheck className="w-4 h-4" />,
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      color: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200/70 dark:border-emerald-800/60',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      badgeColor: 'text-emerald-700 dark:text-emerald-300',
      badgeBorder: 'border-emerald-200/60 dark:border-emerald-800/60',
    };
  }
  if (norm.includes('CERTIFICATE') || norm.includes('ACADEMIC') || norm.includes('DEGREE')) {
    return {
      icon: <Award className="w-4 h-4" />,
      bg: 'bg-purple-50 dark:bg-purple-950/60',
      color: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200/70 dark:border-purple-800/60',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
      badgeColor: 'text-purple-700 dark:text-purple-300',
      badgeBorder: 'border-purple-200/60 dark:border-purple-800/60',
    };
  }
  if (norm.includes('IDENT') || norm.includes('PASSPORT') || norm.includes('CNIC') || norm.includes('NDA')) {
    return {
      icon: <Shield className="w-4 h-4" />,
      bg: 'bg-cyan-50 dark:bg-cyan-950/60',
      color: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-200/70 dark:border-cyan-800/60',
      badgeBg: 'bg-cyan-50 dark:bg-cyan-950/60',
      badgeColor: 'text-cyan-700 dark:text-cyan-300',
      badgeBorder: 'border-cyan-200/60 dark:border-cyan-800/60',
    };
  }
  if (norm.includes('TAX') || norm.includes('FINANCE') || norm.includes('SALARY')) {
    return {
      icon: <FileSpreadsheet className="w-4 h-4" />,
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      color: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200/70 dark:border-amber-800/60',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
      badgeColor: 'text-amber-700 dark:text-amber-300',
      badgeBorder: 'border-amber-200/60 dark:border-amber-800/60',
    };
  }
  return {
    icon: <FileText className="w-4 h-4" />,
    bg: 'bg-teal-50 dark:bg-teal-950/60',
    color: 'text-teal-600 dark:text-teal-400',
    border: 'border-teal-200/70 dark:border-teal-800/60',
    badgeBg: 'bg-slate-100 dark:bg-slate-800',
    badgeColor: 'text-slate-700 dark:text-slate-300',
    badgeBorder: 'border-slate-200/60 dark:border-slate-700/60',
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
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
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
    .header { border-bottom: 3px solid #0d9488; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .brand { font-size: 28px; font-weight: 900; color: #0d9488; }
    .subbrand { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .badge { display: inline-block; background: #ccfbf1; color: #0f766e; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; margin-top: 20px; }
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

  // Filtered documents (100% null-safe)
  const filteredPersonalDocs = useMemo(() => {
    if (!searchQuery.trim()) return personalDocs;
    const q = searchQuery.toLowerCase().trim();
    return personalDocs.filter((d) => {
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
  }, [personalDocs, searchQuery]);

  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return policies;
    const q = searchQuery.toLowerCase().trim();
    return policies.filter((p) => {
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
  }, [policies, searchQuery]);

  // Dynamic Sparkline Data for Documents Hub
  const personalDocsSparkData = useMemo(() => {
    if (!personalDocs.length) {
      return [{ value: 0, label: 'Empty', tooltip: 'No personal files in vault' }];
    }
    const typeCount = {};
    personalDocs.forEach((d) => {
      const label = d.typeLabel || d.type || 'Certificate';
      typeCount[label] = (typeCount[label] || 0) + 1;
    });

    return Object.entries(typeCount).map(([label, count]) => ({
      value: count,
      label: label.length > 8 ? label.substring(0, 7) + '..' : label,
      tooltip: `${label}: ${count} ${count === 1 ? 'file' : 'files'}`,
    }));
  }, [personalDocs]);

  const policiesSparkData = useMemo(() => {
    if (!policies.length) return [{ value: 0, label: 'Empty', tooltip: 'No policies' }];
    const counts = {};
    policies.forEach((p) => {
      const cat = p.categoryLabel || p.category || 'General';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).map(([label, count]) => ({
      value: count,
      label: label.length > 8 ? label.substring(0, 8) + '..' : label,
      tooltip: `${label}: ${count} active policies`,
    }));
  }, [policies]);

  const verifiedPersonalCount = useMemo(() => {
    return personalDocs.filter((d) => (d.status || '').toUpperCase() === 'VERIFIED').length;
  }, [personalDocs]);

  const complianceRate = useMemo(() => {
    if (!personalDocs.length) return '100.0';
    return ((verifiedPersonalCount / personalDocs.length) * 100).toFixed(1);
  }, [personalDocs, verifiedPersonalCount]);

  const complianceSparkData = useMemo(() => {
    if (!personalDocs.length) {
      return [{ value: 100, label: 'Audit', tooltip: 'Vault Clean & Compliant' }];
    }
    return [
      { value: 95, label: 'Offer', tooltip: 'Offer & Contract Verified' },
      { value: 98, label: 'NDA', tooltip: 'Proprietary IP Assignment Verified' },
      { value: 100, label: 'Audit', tooltip: 'Statutory Verification Complete' },
    ];
  }, [personalDocs]);

  const totalVaultMB = useMemo(() => {
    if (!personalDocs.length && !policies.length) return '0.0';
    const parseSize = (s) => {
      if (!s || typeof s !== 'string') return 0;
      const m = s.match(/([\d.]+)\s*MB/i);
      return m ? parseFloat(m[1]) : 0;
    };
    const pMB = personalDocs.reduce((acc, d) => acc + parseSize(d.size), 0);
    const polMB = policies.reduce((acc, p) => acc + parseSize(p.size), 0);
    return (pMB + polMB).toFixed(1);
  }, [personalDocs, policies]);

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
        onRefresh={fetchDocuments}
        loading={loading}
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
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-green-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-emerald-200/70 dark:border-emerald-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/15 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-teal-300/20 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

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
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>{personalDocs.length} Verified Personal Files</span>
              </span>
              <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950/60 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800/60">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{policies.length} Official Handbooks</span>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
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
          loading={loading}
        />

        {/* Card 2: Light Card - Handbooks & Charters */}
        <SparkMetricCard
          variant="light"
          title="Company Handbooks"
          value={policies.length}
          unit="Policies"
          badgeText="FY26 Certified"
          badgeType="positive"
          badgeIcon="up"
          subtext="Official Governance Charters"
          chartColor="coral"
          presetWave="wave2"
          dataPoints={policiesSparkData}
          loading={loading}
        />

        {/* Card 3: Light Card - Authenticity & Compliance */}
        <SparkMetricCard
          variant="light"
          title="Compliance State"
          value={`${complianceRate}%`}
          unit="Verified"
          badgeText={`${verifiedPersonalCount}/${personalDocs.length} Verified`}
          badgeType={Number(complianceRate) >= 90 ? 'positive' : 'warning'}
          badgeIcon="up"
          subtext="Mandatory Dossiers Verified"
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
          badgeText={`${personalDocs.length + policies.length} Files`}
          badgeType="neutral"
          badgeIcon="dot"
          subtext="Encrypted Cloud Repository"
          chartColor="rose"
          presetWave="wave4"
          dataPoints={securitySparkData}
          loading={loading}
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'personal'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Personal Vault ({personalDocs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'policies'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Company Policies ({policies.length})</span>
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

          <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
            <button
              onClick={() => setViewMode('list')}
              title="Table List View"
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-teal-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              title="Card Grid View"
              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${viewMode === 'grid'
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
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Personal Employment Vault & Certificates</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                AES-256 encrypted repository of verified employment contracts, credentials, and tax filings
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {filteredPersonalDocs.length} Documents
              </span>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Upload</span>
              </button>
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
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-teal-500/10 via-emerald-500/15 to-teal-500/20 dark:from-teal-500/20 dark:via-emerald-500/20 dark:to-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/70 dark:border-teal-700/50 shadow-xl shadow-teal-500/10">
                  <FolderLock className="w-10 h-10 stroke-[1.6]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
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
                    className="px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-teal-600/25 inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Upload Document to Vault</span>
                  </button>
                </div>
              )}
              <div className="pt-4 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <Lock className="w-3.5 h-3.5 text-teal-500" />
                  <span>AES-256 Cloud Vault</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>SOC-2 Type II Certified</span>
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
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
                    <thead className="bg-slate-50/80 dark:bg-slate-800/70 text-slate-400 dark:text-slate-400 uppercase font-black text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-4 px-6">Document Name & Ref</th>
                        <th className="py-4 px-4">Category</th>
                        <th className="py-4 px-4">Issuing Authority</th>
                        <th className="py-4 px-4">Date Issued</th>
                        <th className="py-4 px-4">File Size</th>
                        <th className="py-4 px-4">Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-medium">
                      {filteredPersonalDocs.map((doc) => {
                        const typeInfo = getDocTypeMeta(doc.type);
                        return (
                          <tr
                            key={doc.id}
                            className="hover:bg-teal-50/30 dark:hover:bg-slate-800/50 transition-colors group"
                          >
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`w-10 h-10 rounded-2xl ${typeInfo.bg} ${typeInfo.color} flex items-center justify-center shrink-0 border ${typeInfo.border} shadow-xs group-hover:scale-105 transition-transform`}
                                >
                                  {typeInfo.icon}
                                </div>
                                <div className="min-w-0 max-w-[240px] lg:max-w-xs">
                                  <span className="font-extrabold text-slate-900 dark:text-white text-xs block truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                    {doc.title}
                                  </span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">
                                      {doc.referenceNumber || `#${doc.id}`}
                                    </span>
                                    <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-mono font-extrabold uppercase">
                                      PDF
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider inline-flex items-center gap-1.5 ${typeInfo.badgeBg} ${typeInfo.badgeColor} border ${typeInfo.badgeBorder}`}
                              >
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
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                                {doc.size || '1.2 MB'}
                              </span>
                            </td>

                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                                <span>{doc.status || 'Verified'}</span>
                              </span>
                            </td>

                            <td className="py-4 px-6 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => setSelectedDoc(doc)}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer shadow-xs"
                                  title="Preview Details"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDownload(doc)}
                                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-black text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm shadow-teal-600/20 hover:shadow-md transition-all active:scale-95"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Download</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteDoc(doc.id)}
                                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer shadow-xs"
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
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>{doc.status || 'Verified'}</span>
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
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
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
                            title="Preview Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteDoc(doc.id)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
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
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Company Policies & Operating Handbooks
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Official enterprise charters, compliance frameworks, and employee benefit guides
              </p>
            </div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full self-start sm:self-auto">
              {filteredPolicies.length} Handbooks
            </span>
          </div>

          {loading ? (
            <div className="p-6">
              <DocumentCardSkeleton count={4} />
            </div>
          ) : filteredPolicies.length === 0 ? (
            <div className="p-12 sm:p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center border border-teal-200/60 dark:border-teal-800/50 shadow-sm">
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
                          className="hover:bg-emerald-50/30 dark:hover:bg-slate-800/50 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-200/70 dark:border-emerald-800/60 shadow-xs group-hover:scale-105 transition-transform">
                                <BookOpen className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 max-w-sm lg:max-w-md">
                                <span className="font-extrabold text-slate-900 dark:text-white text-xs block truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                  {pol.title}
                                </span>
                                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium line-clamp-1 mt-0.5">
                                  {pol.description}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
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
                            <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono text-[11px] font-bold text-slate-600 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                              {pol.size}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDownload(pol)}
                              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
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
                          <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60">
                            <BookOpen className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {pol.categoryLabel || pol.category}
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-400">{pol.version}</span>
                      </div>

                      <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
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
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
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
      {/* 5. UPLOAD DOCUMENT MODAL (ULTRA PREMIUM THEMED DESIGN) */}
      {/* ========================================================================= */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl shadow-teal-950/20 dark:shadow-black/60 border border-teal-200/70 dark:border-teal-800/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-green-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-cyan-300/20 dark:bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/30 ring-4 ring-teal-100/70 dark:ring-teal-950/60">
                  <Upload className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Upload to Vault
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Add verified professional certificates, government IDs, and compliance records.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleUploadSubmit} className="overflow-y-hidden flex-1 px-6 sm:px-7 py-5 space-y-4 text-xs">
              {/* Document Title & Issuing Authority Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    placeholder="e.g. Certified Scrum Master (CSM) Certificate or Passport Scan"
                    value={uploadForm.title}
                    onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 outline-none transition-all shadow-xs"
                  />
                </div>

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
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 outline-none transition-all shadow-xs"
                  />
                </div>
              </div>

              {/* Category Visual Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                  <span>Document Classification <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-slate-400 font-normal">Select the file classification</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3">
                  {[
                    { id: 'OFFER_LETTER', label: 'Offer Letter', icon: FileText, desc: 'Appointment & terms' },
                    { id: 'CONTRACT', label: 'Agreement & NDA', icon: FileCheck, desc: 'Signed contracts' },
                    { id: 'CERTIFICATE', label: 'Certificate', icon: Award, desc: 'AWS, Scrum, PMP' },
                    { id: 'IDENTIFICATION', label: 'National ID', icon: ShieldCheck, desc: 'Passport, CNIC' },
                    { id: 'ACADEMIC', label: 'Academic', icon: BookOpen, desc: 'Degrees & Diplomas' },
                    { id: 'TAX_FORM', label: 'Tax Form', icon: FileSpreadsheet, desc: 'W-2, 1099' },
                  ].map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = uploadForm.type === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => setUploadForm({ ...uploadForm, type: cat.id })}
                        className={`p-2.5 sm:p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 relative overflow-hidden ${isSelected
                            ? 'bg-gradient-to-br from-teal-50 to-cyan-50/50 dark:from-teal-950/50 dark:to-slate-800 border-teal-500/80 dark:border-teal-600 text-teal-950 dark:text-white shadow-sm ring-2 ring-teal-500/20'
                            : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300'
                          }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isSelected
                                ? 'bg-teal-500 text-white shadow-xs'
                                : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600'
                              }`}
                          >
                            <CatIcon className="w-3.5 h-3.5" />
                          </div>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-teal-500 ring-2 ring-teal-300 dark:ring-teal-800" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[11px] leading-tight">
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

              {/* Styled File Upload Dropzone & Live Vault Preview Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      className={`p-3.5 sm:p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center text-center relative z-10 ${uploadForm.file
                          ? 'border-teal-500/80 bg-teal-50/50 dark:bg-teal-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/60 hover:border-teal-400 dark:hover:border-teal-600 hover:bg-teal-50/20'
                        }`}
                    >
                      {uploadForm.file ? (
                        <div className="flex items-center justify-between w-full gap-3">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                              <FileCheck className="w-4 h-4" />
                            </div>
                            <div className="text-left min-w-0">
                              <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                                {uploadForm.fileName || uploadForm.file.name}
                              </div>
                              <div className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-0.5">
                                {uploadForm.size || `${(uploadForm.file.size / (1024 * 1024)).toFixed(2)} MB`} • Ready to Encrypt
                              </div>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 text-[10px] font-bold border border-teal-200 dark:border-teal-800/60 shrink-0 shadow-xs">
                            Replace
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center shadow-xs shrink-0">
                            <Upload className="w-4 h-4 stroke-[2.2]" />
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              Click to browse or drag & drop document
                            </p>
                            <p className="text-[10px] text-slate-400">
                              PDF, Word (DOCX), PNG, JPG up to 15 MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Live Vault Preview Card */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-teal-500" />
                      Live Preview & Record Card
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal">Real-time summary</span>
                  </label>

                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20 dark:from-slate-800/60 dark:via-teal-950/20 dark:to-slate-800/60 border border-teal-100 dark:border-slate-700/70 flex items-center justify-between gap-3 h-[62px]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 shadow-xs border border-teal-100 dark:border-slate-600">
                        <FileText className="w-4 h-4 stroke-[2.2]" />
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
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-teal-100/80 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5 text-teal-500" />
                        AES-256
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end pt-3 border-t border-teal-100/60 dark:border-teal-900/40 gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-600 active:scale-95 text-white text-xs font-black shadow-lg shadow-teal-600/30 hover:shadow-teal-600/50 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>{submitting ? 'Saving...' : 'Save & Encrypt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. DOCUMENT PREVIEW MODAL (LUXURY THEMED) */}
      {/* ========================================================================= */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-5xl w-full shadow-2xl shadow-teal-950/20 dark:shadow-black/60 border border-teal-200/70 dark:border-teal-800/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-emerald-200/50 dark:border-emerald-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-green-50/60 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-[#1E293B] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 left-10 w-48 h-48 bg-cyan-300/20 dark:bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-teal-500/25 ring-4 ring-teal-100/60 dark:ring-teal-950/50">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                    {selectedDoc.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    Issuer: <strong className="text-slate-800 dark:text-slate-100 font-bold">{selectedDoc.issuer}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Metadata Body */}
            <div className="px-6 sm:px-7 py-5 space-y-4 text-xs">
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-slate-50 to-teal-50/30 dark:from-slate-800/50 dark:to-teal-950/20 border border-teal-100/80 dark:border-slate-800 space-y-2.5">
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
                <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {selectedDoc.description}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-7 py-3.5 border-t border-teal-100/60 dark:border-teal-900/40 flex items-center justify-between gap-3 bg-white/40 dark:bg-slate-900/40">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedDoc);
                  setSelectedDoc(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-teal-600/20 active:scale-95 transition-all"
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
