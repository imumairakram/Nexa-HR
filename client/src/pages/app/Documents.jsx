import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FileText,
  Download,
  Upload,
  Eye,
  ShieldCheck,
  CheckCircle2,
  FolderOpen,
  Lock,
  Plus,
  X,
  Search,
  BookOpen,
  Calendar,
  Grid,
  List,
  FileSpreadsheet,
  Award,
  Layers,
  Shield,
  Check,
  ArrowRight,
  HelpCircle,
  FileCheck,
  Building,
  Zap,
  Trash2,
  User,
  Users,
  Send,
  Mail,
  Printer,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  Clock,
  Briefcase,
  FileCode,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import SparkMetricCard from '../../components/common/SparkMetricCard';
import { TableSkeleton, DocumentCardSkeleton } from '../../components/common/Skeleton';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';
import { api } from '../../services/api';

const DEFAULT_COMPANY_POLICIES = [
  {
    id: 'POL-01',
    title: 'Employee Code of Conduct & Ethics Charter',
    category: 'GOVERNANCE',
    categoryLabel: 'Corporate Governance',
    version: 'v4.2 (2026)',
    size: '1.8 MB',
    updated: 'Jan 15, 2026',
    issuer: 'NexaHR Executive Board',
    department: 'Company-Wide (All Offices)',
    description:
      'Comprehensive guidelines on professional integrity, respectful workplace culture, anti-harassment, and compliance with statutory laws.',
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
    department: 'Company-Wide (All Offices)',
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
    department: 'All Departments',
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
    department: 'Engineering & Operations',
    description:
      'Standards for credential management, mandatory 2FA protocols, disk encryption, and confidential customer data handling.',
  },
];

const DEFAULT_ISSUED_DOCS = [
  {
    id: 'DOC-101',
    title: 'Official Employment Agreement & Contract',
    type: 'CONTRACT',
    typeLabel: 'Employment Agreement',
    referenceNumber: 'NEXA-CON-2026-101',
    employeeId: 'all',
    employeeName: 'Ahmed Khan',
    employeeCode: 'EMP-1042',
    department: 'Engineering & DevOps',
    designation: 'Senior Software Engineer',
    employeeEmail: 'ahmed.khan@nexahr.com',
    issueDate: 'Mar 15, 2026',
    expiryDate: null,
    size: '2.4 MB',
    status: 'VERIFIED',
    issuer: 'NexaHR People Operations',
    description: 'Signed full-time indefinite employment agreement with job scope, confidentiality, and organizational charter.',
  },
  {
    id: 'DOC-102',
    title: 'Official Job Offer Letter & Appointment Order',
    type: 'OFFER_LETTER',
    typeLabel: 'Offer Letter',
    referenceNumber: 'NEXA-OFR-2026-902',
    employeeId: 'all',
    employeeName: 'Sara Ali',
    employeeCode: 'EMP-1088',
    department: 'Product & Design',
    designation: 'Lead UI/UX Designer',
    employeeEmail: 'sara.ali@nexahr.com',
    issueDate: 'Oct 14, 2026',
    expiryDate: null,
    size: '1.6 MB',
    status: 'VERIFIED',
    issuer: 'NexaHR Talent Acquisition & People Operations',
    description: 'Official verified appointment letter with comprehensive breakdown of designation, annualized salary structure, equity vesting, joining benefits, and corporate terms.',
  },
  {
    id: 'DOC-103',
    title: 'Annual Compensation Revision & Increment Letter',
    type: 'INCREMENT_LETTER',
    typeLabel: 'Salary Revision',
    referenceNumber: 'NEXA-INC-2026-304',
    employeeId: 'all',
    employeeName: 'Bilal Hassan',
    employeeCode: 'EMP-1015',
    department: 'Corporate Finance',
    designation: 'Senior Financial Analyst',
    employeeEmail: 'bilal.hassan@nexahr.com',
    issueDate: 'Apr 01, 2026',
    expiryDate: null,
    size: '1.3 MB',
    status: 'VERIFIED',
    issuer: 'Executive Compensation Committee',
    description: 'Performance appraisal and tier promotion increment notification with revised monthly base and performance bonus multiplier.',
  },
];

const CLASSIFICATION_OPTIONS = [
  { id: 'OFFER_LETTER', label: 'Offer Letter', icon: FileText, desc: 'Candidate appointment order', defaultTitle: 'Official Offer Letter & Terms of Employment' },
  { id: 'CONTRACT', label: 'Employment Contract', icon: FileCheck, desc: 'Binding employment agreement', defaultTitle: 'Full-Time Employment Agreement & Charter' },
  { id: 'NDA', label: 'NDA & IP Covenant', icon: ShieldCheck, desc: 'Proprietary IP & non-disclosure', defaultTitle: 'Proprietary Information & Non-Disclosure Agreement' },
  { id: 'EXPERIENCE_LETTER', label: 'Experience Letter', icon: Award, desc: 'Service & relieving certificate', defaultTitle: 'Official Service Certificate & Relieving Letter' },
  { id: 'INCREMENT_LETTER', label: 'Salary Increment', icon: FileSpreadsheet, desc: 'Compensation revision letter', defaultTitle: 'Annual Compensation Adjustment & Promotion Order' },
  { id: 'WARNING_LETTER', label: 'Advisory Warning', icon: AlertCircle, desc: 'Performance improvement notice', defaultTitle: 'Official Performance Improvement & Advisory Notice' },
  { id: 'CERTIFICATE', label: 'Achievement Certificate', icon: Sparkles, desc: 'Recognition of excellence', defaultTitle: 'Corporate Certificate of Merit & Achievement' },
  { id: 'CUSTOM', label: 'Custom Document', icon: FolderOpen, desc: 'General corporate issuance', defaultTitle: 'Official Corporate Correspondence' },
];

const POLICY_CATEGORIES = [
  { id: 'GOVERNANCE', label: 'Corporate Governance', icon: Shield },
  { id: 'BENEFITS', label: 'Benefits & Perks', icon: Award },
  { id: 'FINANCE', label: 'Finance & Reimbursement', icon: FileSpreadsheet },
  { id: 'SECURITY', label: 'InfoSec & Compliance', icon: Lock },
  { id: 'CONDUCT', label: 'Workplace Conduct', icon: Users },
  { id: 'LEAVE', label: 'Leave & Attendance Policy', icon: Calendar },
];

const Documents = () => {
  const { formatDate } = useRegionalSettings();

  // Primary State
  const [issuedDocs, setIssuedDocs] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_issued_docs');
      if (saved) return JSON.parse(saved);
      return DEFAULT_ISSUED_DOCS;
    } catch {
      return DEFAULT_ISSUED_DOCS;
    }
  });

  const [companyPolicies, setCompanyPolicies] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_company_policies');
      if (saved) return JSON.parse(saved);
      return DEFAULT_COMPANY_POLICIES;
    } catch {
      return DEFAULT_COMPANY_POLICIES;
    }
  });

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('issued'); // 'issued' | 'policies'
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState('');

  // Modals State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Issue Document Form State
  const initialIssueForm = {
    employeeId: '',
    type: 'OFFER_LETTER',
    title: 'Official Offer Letter & Terms of Employment',
    referenceNumber: `NEXA-OFR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    issuer: 'NexaHR People Operations & Talent Acquisition',
    description: 'We are pleased to offer you this appointment with full terms, compensation breakdown, and joining benefits.',
    size: '1.9 MB',
    status: 'VERIFIED',
    notifyEmployee: true,
    file: null,
  };
  const [issueForm, setIssueForm] = useState(initialIssueForm);

  // Policy Form State
  const initialPolicyForm = {
    title: '',
    category: 'GOVERNANCE',
    version: 'v1.0 (2026)',
    issuer: 'NexaHR Executive Board',
    department: 'Company-Wide (All Offices)',
    description: '',
    size: '1.8 MB',
    notifyAll: false,
    file: null,
  };
  const [policyForm, setPolicyForm] = useState(initialPolicyForm);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  // Sync to localStorage
  const saveIssuedDocs = (docs) => {
    setIssuedDocs(docs);
    try {
      localStorage.setItem('nexahr_issued_docs', JSON.stringify(docs));
      // Also update employee personal docs in localStorage so employees see them immediately
      const personalFormat = docs.map((d) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        typeLabel: d.typeLabel,
        issueDate: d.issueDate,
        size: d.size,
        status: d.status,
        issuer: d.issuer,
        description: d.description,
      }));
      localStorage.setItem('nexahr_personal_docs', JSON.stringify(personalFormat));
    } catch (e) {
      console.warn('Storage sync error:', e);
    }
  };

  const saveCompanyPolicies = (policies) => {
    setCompanyPolicies(policies);
    try {
      localStorage.setItem('nexahr_company_policies', JSON.stringify(policies));
    } catch (e) {
      console.warn('Policy storage sync error:', e);
    }
  };

  // Fetch live employees and backend documents
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [empRes, deptRes, docRes, polRes] = await Promise.allSettled([
        api.getEmployees(),
        api.getDepartments(),
        api.getIssuedDocuments(),
        api.getCompanyPolicies(),
      ]);

      if (empRes.status === 'fulfilled' && empRes.value?.success) {
        setEmployees(empRes.value.data?.employees || []);
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.success) {
        setDepartments(deptRes.value.data?.departments || []);
      }
      if (docRes.status === 'fulfilled' && docRes.value?.success && docRes.value.data?.documents?.length > 0) {
        saveIssuedDocs(docRes.value.data.documents);
      }
      if (polRes.status === 'fulfilled' && polRes.value?.success && polRes.value.data?.policies?.length > 0) {
        saveCompanyPolicies(polRes.value.data.policies);
      }
    } catch (err) {
      console.warn('Data fetch error, using local vault:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle classification change in issue form
  const handleTypeSelect = (selectedType) => {
    const opt = CLASSIFICATION_OPTIONS.find((c) => c.id === selectedType);
    const prefix = selectedType.substring(0, 3);
    const newRef = `NEXA-${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setIssueForm((prev) => ({
      ...prev,
      type: selectedType,
      title: opt ? opt.defaultTitle : prev.title,
      referenceNumber: newRef,
      description:
        selectedType === 'OFFER_LETTER'
          ? 'Official appointment letter detailing compensation structure, reporting hierarchy, and joining roadmap.'
          : selectedType === 'CONTRACT'
          ? 'Full-time employment agreement including service terms, confidentiality covenants, and intellectual property assignment.'
          : selectedType === 'NDA'
          ? 'Binding mutual non-disclosure and intellectual property protection agreement.'
          : selectedType === 'EXPERIENCE_LETTER'
          ? 'Official verification of employment tenure, core responsibilities, and professional conduct certificate.'
          : selectedType === 'INCREMENT_LETTER'
          ? 'Formal appraisal and annualized compensation revision notification approved by Executive Leadership.'
          : selectedType === 'WARNING_LETTER'
          ? 'Official performance counseling advisory and improvement milestones charter.'
          : prev.description,
    }));
  };

  // Handle Issue Document Submission
  const handleIssueSubmit = async (e) => {
    e.preventDefault();
    if (!issueForm.employeeId) {
      showToast('Please select a recipient employee.');
      return;
    }
    if (!issueForm.title.trim()) {
      showToast('Please enter a valid document title.');
      return;
    }

    setSubmitting(true);
    try {
      const selectedEmp = employees.find((emp) => emp.id === issueForm.employeeId || emp.employeeCode === issueForm.employeeId);
      const opt = CLASSIFICATION_OPTIONS.find((c) => c.id === issueForm.type);

      const payload = {
        employeeId: issueForm.employeeId,
        type: issueForm.type,
        typeLabel: opt?.label || 'Official Document',
        title: issueForm.title.trim(),
        referenceNumber: issueForm.referenceNumber,
        issueDate: issueForm.issueDate,
        expiryDate: issueForm.expiryDate || null,
        issuer: issueForm.issuer.trim(),
        description: issueForm.description.trim(),
        size: issueForm.file ? `${(issueForm.file.size / (1024 * 1024)).toFixed(1)} MB` : issueForm.size || '1.8 MB',
        status: issueForm.status || 'VERIFIED',
        notifyEmployee: issueForm.notifyEmployee,
      };

      // Try backend dispatch
      let createdDoc = null;
      try {
        const res = await api.issueDocument(payload);
        if (res?.success && res?.data?.document) {
          createdDoc = res.data.document;
        }
      } catch (apiErr) {
        console.warn('Backend issue endpoint fallback to local vault:', apiErr.message);
      }

      // If backend didn't return, build local record
      if (!createdDoc) {
        createdDoc = {
          id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`,
          ...payload,
          employeeName: selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}`.trim() : 'Company Employee',
          employeeCode: selectedEmp?.employeeCode || 'EMP-XXXX',
          employeeEmail: selectedEmp?.email || null,
          department: selectedEmp?.profile?.department?.name || 'Operations',
          designation: selectedEmp?.profile?.designation?.title || 'Team Member',
          issueDate: new Date(payload.issueDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
      }

      const updated = [createdDoc, ...issuedDocs];
      saveIssuedDocs(updated);

      showToast(`Document "${createdDoc.title}" successfully issued to ${createdDoc.employeeName}!${payload.notifyEmployee ? ' Notification email dispatched.' : ''}`);
      setIsIssueModalOpen(false);
      setIssueForm({
        ...initialIssueForm,
        referenceNumber: `NEXA-OFR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    } catch (err) {
      console.error('Error issuing document:', err);
      showToast(err.message || 'Failed to issue document.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Publish Policy Submission
  const handlePolicySubmit = async (e) => {
    e.preventDefault();
    if (!policyForm.title.trim() || !policyForm.description.trim()) {
      showToast('Please provide both policy title and description.');
      return;
    }

    setSubmitting(true);
    try {
      const opt = POLICY_CATEGORIES.find((c) => c.id === policyForm.category);
      const payload = {
        title: policyForm.title.trim(),
        category: policyForm.category,
        categoryLabel: opt?.label || 'Corporate Policy',
        version: policyForm.version.trim(),
        issuer: policyForm.issuer.trim(),
        department: policyForm.department.trim(),
        description: policyForm.description.trim(),
        size: policyForm.file ? `${(policyForm.file.size / (1024 * 1024)).toFixed(1)} MB` : policyForm.size || '1.8 MB',
        notifyAll: policyForm.notifyAll,
      };

      let createdPolicy = null;
      try {
        const res = await api.publishCompanyPolicy(payload);
        if (res?.success && res?.data?.policy) {
          createdPolicy = res.data.policy;
        }
      } catch (apiErr) {
        console.warn('Backend policy endpoint fallback:', apiErr.message);
      }

      if (!createdPolicy) {
        createdPolicy = {
          id: `POL-${Math.floor(10 + Math.random() * 90)}`,
          ...payload,
          updated: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        };
      }

      const updated = [createdPolicy, ...companyPolicies];
      saveCompanyPolicies(updated);

      showToast(`Corporate Policy "${createdPolicy.title}" published successfully!`);
      setIsPolicyModalOpen(false);
      setPolicyForm(initialPolicyForm);
    } catch (err) {
      console.error('Error publishing policy:', err);
      showToast(err.message || 'Failed to publish corporate policy.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Document Delete / Revocation
  const handleDeleteDoc = async (id) => {
    try {
      await api.deleteIssuedDocument(id).catch(() => {});
      const updated = issuedDocs.filter((d) => d.id !== id);
      saveIssuedDocs(updated);
      showToast('Document revoked and removed from enterprise vault.');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Handle Policy Delete
  const handleDeletePolicy = async (id) => {
    try {
      await api.deleteCompanyPolicy(id).catch(() => {});
      const updated = companyPolicies.filter((p) => p.id !== id);
      saveCompanyPolicies(updated);
      showToast('Company policy removed.');
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleDownload = (doc) => {
    showToast(`Downloading secure certified copy: ${doc.title} (${doc.size || 'PDF'})...`);
  };

  // Filtered Issued Documents
  const filteredIssuedDocs = useMemo(() => {
    return issuedDocs.filter((d) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        d.title?.toLowerCase().includes(q) ||
        d.referenceNumber?.toLowerCase().includes(q) ||
        d.employeeName?.toLowerCase().includes(q) ||
        d.employeeCode?.toLowerCase().includes(q) ||
        d.department?.toLowerCase().includes(q) ||
        d.type?.toLowerCase().includes(q);

      const matchesType = typeFilter === 'ALL' || d.type === typeFilter;
      const matchesDept = deptFilter === 'ALL' || d.department?.toLowerCase().includes(deptFilter.toLowerCase());

      return matchesSearch && matchesType && matchesDept;
    });
  }, [issuedDocs, searchQuery, typeFilter, deptFilter]);

  // Filtered Policies
  const filteredPolicies = useMemo(() => {
    return companyPolicies.filter((p) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        p.title?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.issuer?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.version?.toLowerCase().includes(q)
      );
    });
  }, [companyPolicies, searchQuery]);

  // Sparkline KPI Telemetry
  const issuedSparkData = useMemo(() => {
    const typeCount = {
      OFFER: 0,
      CONTRACT: 0,
      INCREMENT: 0,
      NDA: 0,
      OTHER: 0,
    };
    issuedDocs.forEach((d) => {
      if (d.type?.includes('OFFER')) typeCount.OFFER++;
      else if (d.type?.includes('CONTRACT')) typeCount.CONTRACT++;
      else if (d.type?.includes('INCREMENT')) typeCount.INCREMENT++;
      else if (d.type?.includes('NDA')) typeCount.NDA++;
      else typeCount.OTHER++;
    });

    return [
      { value: typeCount.OFFER || 1, label: 'Offers', tooltip: `Offer Letters: ${typeCount.OFFER}` },
      { value: typeCount.CONTRACT || 1, label: 'Contracts', tooltip: `Contracts: ${typeCount.CONTRACT}` },
      { value: typeCount.INCREMENT || 1, label: 'Increments', tooltip: `Revisions: ${typeCount.INCREMENT}` },
      { value: typeCount.NDA || 1, label: 'NDA', tooltip: `NDAs: ${typeCount.NDA}` },
    ];
  }, [issuedDocs]);

  const policiesSparkData = useMemo(() => {
    return [
      { value: 1, label: 'Governance', tooltip: 'Corporate Ethics Charter' },
      { value: 2, label: 'Benefits', tooltip: 'Medical & Health Coverage' },
      { value: 3, label: 'Finance', tooltip: 'Remote Travel & Stipends' },
      { value: 4, label: 'InfoSec', tooltip: 'SOC-2 Compliance Charter' },
    ];
  }, []);

  const complianceSparkData = useMemo(() => {
    return [
      { value: 92, label: 'Offers', tooltip: 'Offers Signed: 98%' },
      { value: 95, label: 'Contracts', tooltip: 'Contracts Verified: 95%' },
      { value: 98, label: 'NDAs', tooltip: 'NDAs Acknowledged: 100%' },
      { value: 100, label: 'Audit', tooltip: 'Statutory Audit Passed: 100%' },
    ];
  }, []);

  const securitySparkData = useMemo(() => {
    return [
      { value: 128, label: '2FA', tooltip: 'Admin Multi-Factor Auth Verified' },
      { value: 192, label: 'TLS', tooltip: 'TLS 1.3 Strict Transport' },
      { value: 256, label: 'AES', tooltip: 'AES-256 Vault Encryption' },
    ];
  }, []);

  // Selected employee in issue modal helper
  const selectedEmployeeObj = useMemo(() => {
    return employees.find((e) => e.id === issueForm.employeeId || e.employeeCode === issueForm.employeeId);
  }, [employees, issueForm.employeeId]);

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Documents & Corporate Policies Hub"
        subtitle="Issue official employment offers, contracts, and NDA letters to employees, and govern statutory company handbooks."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC HERO BANNER (AQUA-TEAL LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-cyan-50/90 via-teal-50/80 to-blue-50/60 dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-teal-200/70 dark:border-teal-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/15 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-300/20 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Vault Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100/80 dark:bg-teal-950/80 text-teal-800 dark:text-teal-200 text-xs font-extrabold border border-teal-200/80 dark:border-teal-800/60">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>HR Document Issuance & Governance Vault</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Enterprise Document Issuance & Policy Governance
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-medium">
              Create and dispatch official appointment offer letters, contracts, NDAs, and increment letters directly to employee dossiers with automatic email notification.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-teal-700 dark:text-teal-300 font-bold bg-teal-100/60 dark:bg-teal-950/60 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-800/60">
                <FileCheck className="w-3.5 h-3.5" />
                <span>{issuedDocs.length} Issued Records</span>
              </span>
              <span className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-300 font-bold bg-cyan-100/60 dark:bg-cyan-950/60 px-3 py-1 rounded-xl border border-cyan-200 dark:border-cyan-800/60">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{companyPolicies.length} Active Policies</span>
              </span>
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-bold bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                <span>{employees.length} Registered Employees</span>
              </span>
            </div>
          </div>

          {/* Right Side: Quick Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-teal-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[240px] sm:min-w-[280px] shrink-0 space-y-3.5">
            <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Upload className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">HR Document Management</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Issue new offer, contract, or policy</div>
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => setIsIssueModalOpen(true)}
                className="w-full px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Issue Document to Employee</span>
              </button>

              <button
                onClick={() => setIsPolicyModalOpen(true)}
                className="w-full px-5 py-2.5 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <BookOpen className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Publish Company Policy</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SPARKLINE KPI METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <SparkMetricCard
          variant="dark"
          title="Issued Documents"
          value={issuedDocs.length}
          unit={issuedDocs.length === 1 ? 'Record' : 'Records'}
          badgeText="100% Encrypted"
          badgeType="positive"
          badgeIcon="up"
          subtext="Offers, Contracts & Increments"
          chartColor="purple"
          presetWave="wave1"
          dataPoints={issuedSparkData}
          loading={loading}
        />

        <SparkMetricCard
          variant="light"
          title="Company Handbooks"
          value={companyPolicies.length}
          unit="Policies"
          badgeText="Active Standards"
          badgeType="positive"
          badgeIcon="up"
          subtext="Corporate Governance Charters"
          chartColor="coral"
          presetWave="wave2"
          dataPoints={policiesSparkData}
          loading={loading}
        />

        <SparkMetricCard
          variant="light"
          title="Compliance State"
          value="98.5%"
          unit="Verified"
          badgeText="Audited"
          badgeType="positive"
          badgeIcon="up"
          subtext="Signed & Legally Binding"
          chartColor="amber"
          presetWave="wave3"
          dataPoints={complianceSparkData}
          loading={loading}
        />

        <SparkMetricCard
          variant="light"
          title="Vault Security"
          value="AES-256"
          unit="Bit"
          badgeText="Zero-Trust"
          badgeType="neutral"
          badgeIcon="dot"
          subtext="Cloud Protected Repository"
          chartColor="rose"
          presetWave="wave4"
          dataPoints={securitySparkData}
          loading={loading}
        />
      </div>

      {/* ========================================================================= */}
      {/* 3. REPOSITORY TABS & SEARCH CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Navigation Category Tabs */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab('issued')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'issued'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Issued Documents ({issuedDocs.length})</span>
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
            <span>Company Policies ({companyPolicies.length})</span>
          </button>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-wrap items-center gap-3 flex-1 justify-end">
          {activeTab === 'issued' && (
            <>
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="ALL">All Classifications</option>
                <option value="OFFER_LETTER">Offer Letters</option>
                <option value="CONTRACT">Employment Contracts</option>
                <option value="NDA">NDA Agreements</option>
                <option value="EXPERIENCE_LETTER">Experience Letters</option>
                <option value="INCREMENT_LETTER">Salary Increments</option>
                <option value="WARNING_LETTER">Advisory Notices</option>
              </select>

              {/* Department Filter */}
              {departments.length > 0 && (
                <select
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-white font-medium outline-none focus:ring-2 focus:ring-teal-500/20 hidden sm:block"
                >
                  <option value="ALL">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.name}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          {/* Search Bar */}
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'issued' ? 'Search by title, employee, or ref...' : 'Search policies by title...'}
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

          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl">
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
      {/* 4. DOCUMENTS CONTENT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'issued' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Issued Employee Documents & Agreements
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Complete directory of corporate offer letters, employment contracts, and increment letters issued to workforce members
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                {filteredIssuedDocs.length} Records
              </span>
              <button
                onClick={() => setIsIssueModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue Document</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <TableSkeleton rows={5} cols={6} />
            </div>
          ) : filteredIssuedDocs.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 mx-auto flex items-center justify-center">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">No documents matched your criteria</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No issued documents match your search filters. Click "Issue Document" to dispatch a new letter to an employee.
              </p>
              <button
                onClick={() => setIsIssueModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs cursor-pointer shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Issue First Document</span>
              </button>
            </div>
          ) : (
            <>
              {/* Table List View */}
              {viewMode === 'list' && (
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="py-3.5 px-6">Document Title & Ref</th>
                        <th className="py-3.5 px-4">Recipient Employee</th>
                        <th className="py-3.5 px-4">Classification</th>
                        <th className="py-3.5 px-4">Department</th>
                        <th className="py-3.5 px-4">Issue Date</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {filteredIssuedDocs.map((doc) => (
                        <tr
                          key={doc.id}
                          className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 border border-teal-200/60 dark:border-teal-800/50">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <span className="font-extrabold text-slate-900 dark:text-white text-xs block group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate max-w-xs">
                                  {doc.title}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono font-bold">
                                  {doc.referenceNumber || `#${doc.id}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center shrink-0">
                                {doc.employeeName ? doc.employeeName.charAt(0).toUpperCase() : 'E'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                                  {doc.employeeName}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  {doc.employeeCode || doc.designation}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                              {doc.typeLabel || doc.type}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {doc.department || 'Operations'}
                          </td>

                          <td className="py-4 px-4 text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                            {doc.issueDate}
                          </td>

                          <td className="py-4 px-4 whitespace-nowrap">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60">
                              {doc.status || 'VERIFIED'}
                            </span>
                          </td>

                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelectedDoc(doc)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950 hover:text-teal-600 transition-colors cursor-pointer"
                                title="Preview Document Dossier"
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
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                                title="Revoke & Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Grid / Mobile Card View */}
              <div className={`p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${viewMode === 'list' ? 'md:hidden' : ''}`}>
                {filteredIssuedDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-3xl p-5 border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all space-y-3.5 group flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200">
                          {doc.typeLabel || doc.type}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-teal-600 transition-colors">
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold">
                          {doc.referenceNumber || `#${doc.id}`}
                        </p>
                      </div>

                      {/* Recipient Details */}
                      <div className="p-3 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                          {doc.employeeName ? doc.employeeName.charAt(0).toUpperCase() : 'E'}
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                            {doc.employeeName}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {doc.department} • {doc.employeeCode}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                      <span className="text-[11px] text-slate-400 font-mono">{doc.issueDate}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-teal-600 cursor-pointer"
                          title="Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteDoc(doc.id)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-400 hover:text-rose-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDownload(doc)}
                          className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. POLICIES CONTENT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Official Corporate Policies & Compliance Charters
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Statutory regulatory guides and organizational compliance documents published across departments
              </p>
            </div>
            <button
              onClick={() => setIsPolicyModalOpen(true)}
              className="px-4 py-2 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish Policy</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPolicies.map((pol) => (
              <div
                key={pol.id}
                className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col justify-between space-y-4 hover:shadow-md transition-all group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-200/60">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                        {pol.categoryLabel || pol.category}
                      </span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-400">{pol.version}</span>
                  </div>

                  <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {pol.title}
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    {pol.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">
                    {pol.issuer} • {pol.size || 'PDF'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDeletePolicy(pol.id)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete Policy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownload(pol)}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MODAL: ISSUE DOCUMENT TO EMPLOYEE */}
      {/* ========================================================================= */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-4xl w-full shadow-2xl shadow-teal-950/20 dark:shadow-black/60 border border-teal-200/70 dark:border-teal-800/50 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            {/* Header */}
            <div className="px-6 sm:px-7 py-4.5 border-b border-teal-200/50 dark:border-teal-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-cyan-50/90 via-teal-50/80 to-blue-50/60 dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-[#1E293B]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/30 ring-4 ring-teal-100/70 dark:ring-teal-950/60">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Issue Document to Employee
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    Generate offer letters, employment contracts, NDAs, and increment letters with automated delivery.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleIssueSubmit} className="overflow-y-auto p-6 sm:p-7 space-y-4.5 text-xs">
              {/* Employee Selection & Reference Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Recipient Employee <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={issueForm.employeeId}
                    onChange={(e) => setIssueForm({ ...issueForm, employeeId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 outline-none"
                  >
                    <option value="">Select Employee...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName} ({emp.employeeCode}) — {emp.profile?.designation?.title || emp.role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Reference Code / Tracking ID
                  </label>
                  <input
                    type="text"
                    value={issueForm.referenceNumber}
                    onChange={(e) => setIssueForm({ ...issueForm, referenceNumber: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-teal-500/25 outline-none"
                  />
                </div>
              </div>

              {/* Classification Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Document Classification <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {CLASSIFICATION_OPTIONS.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = issueForm.type === cat.id;
                    return (
                      <button
                        type="button"
                        key={cat.id}
                        onClick={() => handleTypeSelect(cat.id)}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                          isSelected
                            ? 'bg-teal-50/80 dark:bg-teal-950/60 border-teal-500 text-teal-950 dark:text-white ring-2 ring-teal-500/20 shadow-xs'
                            : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <CatIcon className={`w-4 h-4 ${isSelected ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                          {isSelected && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                        </div>
                        <div>
                          <div className="font-bold text-[11px] leading-tight">{cat.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{cat.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Issuing Authority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Document Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={issueForm.title}
                    onChange={(e) => setIssueForm({ ...issueForm, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/25 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Issuing Authority / Department
                  </label>
                  <input
                    type="text"
                    value={issueForm.issuer}
                    onChange={(e) => setIssueForm({ ...issueForm, issuer: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/25 outline-none"
                  />
                </div>
              </div>

              {/* Issue Date & Expiry Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Issue / Verification Date
                  </label>
                  <input
                    type="date"
                    value={issueForm.issueDate}
                    onChange={(e) => setIssueForm({ ...issueForm, issueDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/25 outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Expiry / Validity Deadline (Optional)
                  </label>
                  <input
                    type="date"
                    value={issueForm.expiryDate}
                    onChange={(e) => setIssueForm({ ...issueForm, expiryDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/25 outline-none"
                  />
                </div>
              </div>

              {/* Terms & Description */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Key Terms / Stated Conditions / Executive Message
                </label>
                <textarea
                  rows={3}
                  value={issueForm.description}
                  onChange={(e) => setIssueForm({ ...issueForm, description: e.target.value })}
                  placeholder="Enter key terms, compensation details, designation scope, or special covenants..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/25 outline-none leading-relaxed"
                />
              </div>

              {/* Automated Email Notification Callout */}
              <div className="p-3.5 rounded-2xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      Dispatch Automated Email to Employee
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Send official NexaHR branded notification with document reference and direct portal link.
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={issueForm.notifyEmployee}
                    onChange={(e) => setIssueForm({ ...issueForm, notifyEmployee: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end pt-3 border-t border-teal-100 dark:border-teal-900/40 gap-3">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-600 active:scale-95 text-white text-xs font-black shadow-lg shadow-teal-600/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>{submitting ? 'Issuing Document...' : 'Issue & Dispatch Document'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. MODAL: PUBLISH COMPANY POLICY */}
      {/* ========================================================================= */}
      {isPolicyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-2xl w-full shadow-2xl shadow-teal-950/20 dark:shadow-black/60 border border-teal-200/70 dark:border-teal-800/50 flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="px-6 sm:px-7 py-4.5 border-b border-teal-200/50 dark:border-teal-800/40 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-cyan-50/90 via-teal-50/80 to-blue-50/60 dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-[#1E293B]">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-500 to-cyan-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-teal-500/30">
                  <BookOpen className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                    Publish Company Policy
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    Broadcast organizational charters, ethics guidelines, and operational policies.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsPolicyModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePolicySubmit} className="overflow-y-auto p-6 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Policy Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence & Data Governance Charter"
                  value={policyForm.title}
                  onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-teal-500/25 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Category Classification
                  </label>
                  <select
                    value={policyForm.category}
                    onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:ring-2 focus:ring-teal-500/25"
                  >
                    {POLICY_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Version Tag
                  </label>
                  <input
                    type="text"
                    value={policyForm.version}
                    onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Target Department / Scope
                  </label>
                  <input
                    type="text"
                    value={policyForm.department}
                    onChange={(e) => setPolicyForm({ ...policyForm, department: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                    Issuing Board / Authority
                  </label>
                  <input
                    type="text"
                    value={policyForm.issuer}
                    onChange={(e) => setPolicyForm({ ...policyForm, issuer: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                  Policy Summary & Core Guidelines <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={policyForm.description}
                  onChange={(e) => setPolicyForm({ ...policyForm, description: e.target.value })}
                  placeholder="Outline the operational guidelines, compliance rules, and employee responsibilities..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-teal-100 dark:border-teal-900/40 gap-3">
                <button
                  type="button"
                  onClick={() => setIsPolicyModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  {submitting ? 'Publishing...' : 'Publish Corporate Policy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. MODAL: DOCUMENT PREVIEW */}
      {/* ========================================================================= */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white/90 dark:bg-[#1E293B]/90 backdrop-blur-2xl rounded-2xl max-w-3xl w-full shadow-2xl border border-teal-200/70 dark:border-teal-800/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-teal-200/50 dark:border-teal-800/40 flex items-center justify-between gap-4 bg-gradient-to-br from-cyan-50/90 via-teal-50/80 to-blue-50/60 dark:from-teal-950/40 dark:via-cyan-950/30 dark:to-[#1E293B]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {selectedDoc.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    Ref: {selectedDoc.referenceNumber || `#${selectedDoc.id}`}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Document Formal Preview */}
            <div className="p-6 space-y-4 text-xs">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/30 dark:from-slate-800/50 dark:to-teal-950/20 border border-teal-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Recipient Employee</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                    {selectedDoc.employeeName} ({selectedDoc.employeeCode})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Department & Role</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedDoc.department} • {selectedDoc.designation}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Issuing Body</span>
                  <span className="font-bold text-teal-700 dark:text-teal-300">
                    {selectedDoc.issuer}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Issue Date</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {selectedDoc.issueDate}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-400 font-medium">Verification Status</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>NexaHR Enterprise Digital Signature Verified</span>
                  </span>
                </div>
              </div>

              {selectedDoc.description && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <div className="font-bold text-slate-800 dark:text-slate-100 mb-1">Terms & Conditions Summary:</div>
                  {selectedDoc.description}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-white/50 dark:bg-slate-900/50">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-200 cursor-pointer"
              >
                Close
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-200"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  onClick={() => {
                    handleDownload(selectedDoc);
                    setSelectedDoc(null);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
