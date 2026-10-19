import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { TableSkeleton } from '../../../components/common/Skeleton';
import { api } from '../../../services/api';
import {
  Tag,
  Briefcase,
  MapPin,
  Code,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  Building2,
  Globe,
  Layers,
  ShieldCheck,
  Award,
  RefreshCw,
  ArrowRight,
  ChevronRight,
  Filter,
} from 'lucide-react';

const TABS = [
  { id: 'categories', label: 'Job Categories', icon: Tag, desc: 'Functional disciplines & requisition taxonomy' },
  { id: 'types', label: 'Contract Types', icon: Briefcase, desc: 'Employment commitments & benefit tracks' },
  { id: 'locations', label: 'Hiring Locations', icon: MapPin, desc: 'Offices, campuses & async remote hubs' },
  { id: 'skills', label: 'Skill Taxonomy', icon: Code, desc: 'Competency frameworks & tech stacks' },
  { id: 'experience', label: 'Seniority Tracks', icon: Clock, desc: 'Career bands, tenure & compensation ranges' },
];

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Engineering & DevOps', code: 'ENG', count: 6, lead: 'Sarah Jenkins', status: 'ACTIVE' },
  { id: 2, name: 'Product Management & Design', code: 'PMD', count: 3, lead: 'Ayesha Tariq', status: 'ACTIVE' },
  { id: 3, name: 'People Operations & HR', code: 'HRM', count: 2, lead: 'Fatima Noor', status: 'ACTIVE' },
  { id: 4, name: 'Finance & Enterprise Risk', code: 'FIN', count: 2, lead: 'Zainab Qureshi', status: 'ACTIVE' },
  { id: 5, name: 'Growth, Marketing & Sales', code: 'MKT', count: 1, lead: 'Alex Mercer', status: 'ACTIVE' },
];

const DEFAULT_TYPES = [
  { id: 1, name: 'Full-Time Permanent', code: 'FT', hours: '40 hrs / week', benefits: 'Full Health, Equity & Annual Leave', count: 8 },
  { id: 2, name: 'Fixed-Term Contract', code: 'CON', hours: 'Project Scope Based', benefits: 'Standard Hourly Stipend & Equipment', count: 2 },
  { id: 3, name: 'Full-Time Remote', code: 'REM', hours: '40 hrs / week (Async)', benefits: 'Home Office Allowance & Healthcare', count: 4 },
  { id: 4, name: 'Internship / Graduate Fellow', code: 'INT', hours: '20 - 40 hrs / week', benefits: 'Learning Stipend & 1:1 Mentorship', count: 1 },
];

const DEFAULT_LOCATIONS = [
  { id: 1, name: 'Islamabad HQ & Innovation Campus', city: 'Islamabad', country: 'Pakistan', timezone: 'PKT (UTC+5)', count: 7, status: 'PRIMARY_HQ' },
  { id: 2, name: 'Remote & Distributed Async', city: 'Remote', country: 'Global', timezone: 'Flexible Timezones', count: 5, status: 'REMOTE' },
  { id: 3, name: 'Karachi Regional Hub', city: 'Karachi', country: 'Pakistan', timezone: 'PKT (UTC+5)', count: 2, status: 'BRANCH' },
  { id: 4, name: 'Lahore Regional Tech Center', city: 'Lahore', country: 'Pakistan', timezone: 'PKT (UTC+5)', count: 1, status: 'BRANCH' },
];

const DEFAULT_SKILLS = [
  { id: 1, name: 'React.js & Tailwind CSS', category: 'Frontend', assessmentsCount: 14, proficiency: 'Advanced', weight: 'Mandatory' },
  { id: 2, name: 'Node.js & Express Architecture', category: 'Backend', assessmentsCount: 12, proficiency: 'Advanced', weight: 'Mandatory' },
  { id: 3, name: 'PostgreSQL & Relational Data Modeling', category: 'Databases', assessmentsCount: 9, proficiency: 'Intermediate', weight: 'Preferred' },
  { id: 4, name: 'Docker & Kubernetes Orchestration', category: 'DevOps', assessmentsCount: 7, proficiency: 'Intermediate', weight: 'Preferred' },
  { id: 5, name: 'Figma Systems & Interaction Design', category: 'Design', assessmentsCount: 8, proficiency: 'Expert', weight: 'Mandatory' },
  { id: 6, name: 'TypeScript & Next.js Ecosystem', category: 'Frontend', assessmentsCount: 11, proficiency: 'Advanced', weight: 'Mandatory' },
];

const DEFAULT_EXPERIENCE = [
  { id: 1, label: 'Entry Level (0 - 2 Years)', code: 'ENTRY', minYears: 0, maxYears: 2, salaryRange: '$40k - $65k', count: 2 },
  { id: 2, label: 'Mid-Level Professional (2 - 5 Years)', code: 'MID', minYears: 2, maxYears: 5, salaryRange: '$70k - $100k', count: 6 },
  { id: 3, label: 'Senior Specialist (5 - 8 Years)', code: 'SENIOR', minYears: 5, maxYears: 8, salaryRange: '$110k - $150k', count: 5 },
  { id: 4, label: 'Staff / Principal / Director (8+ Years)', code: 'LEAD', minYears: 8, maxYears: 15, salaryRange: '$160k - $220k', count: 2 },
];

const RecruitmentSettings = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // 5 Master Collections
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);

  // Forms state
  const [categoryForm, setCategoryForm] = useState({ name: '', code: '', lead: 'Department Lead', status: 'ACTIVE' });
  const [typeForm, setTypeForm] = useState({ name: '', code: '', hours: '40 hrs / week', benefits: 'Standard Health & Leave' });
  const [locationForm, setLocationForm] = useState({ name: '', city: '', country: 'Pakistan', timezone: 'PKT (UTC+5)', status: 'BRANCH' });
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Frontend', proficiency: 'Advanced', weight: 'Mandatory' });
  const [experienceForm, setExperienceForm] = useState({ label: '', code: '', minYears: 1, maxYears: 3, salaryRange: '$80k - $110k' });

  // Initial load
  const loadMasterData = async () => {
    setLoading(true);
    try {
      // 1. Categories
      let catData = [];
      try {
        const local = localStorage.getItem('nexahr_job_categories');
        if (local) catData = JSON.parse(local);
      } catch (e) {
        console.warn(e);
      }
      if (!catData || catData.length === 0) {
        const res = await api.getDepartments();
        if (res?.success && res.data?.departments && res.data.departments.length > 0) {
          catData = res.data.departments.map((d, idx) => ({
            id: d.id || idx + 1,
            name: d.name,
            code: (d.code || d.name.substring(0, 3)).toUpperCase(),
            count: 0,
            lead: 'Department Head',
            status: 'ACTIVE',
          }));
        } else {
          catData = DEFAULT_CATEGORIES;
        }
      }
      setCategories(catData);

      // 2. Types
      let typeData = DEFAULT_TYPES;
      try {
        const local = localStorage.getItem('nexahr_job_types');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.length > 0) typeData = parsed;
        }
      } catch (e) {
        console.warn(e);
      }
      setTypes(typeData);

      // 3. Locations
      let locData = DEFAULT_LOCATIONS;
      try {
        const local = localStorage.getItem('nexahr_job_locations');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.length > 0) locData = parsed;
        }
      } catch (e) {
        console.warn(e);
      }
      setLocations(locData);

      // 4. Skills
      let skillData = DEFAULT_SKILLS;
      try {
        const local = localStorage.getItem('nexahr_job_skills');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.length > 0) skillData = parsed;
        }
      } catch (e) {
        console.warn(e);
      }
      setSkills(skillData);

      // 5. Experience
      let expData = DEFAULT_EXPERIENCE;
      try {
        const local = localStorage.getItem('nexahr_job_experiences');
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed && parsed.length > 0) expData = parsed;
        }
      } catch (e) {
        console.warn(e);
      }
      setExperiences(expData);
    } catch (err) {
      console.error('Failed to load recruitment master data:', err);
    } finally {
      setTimeout(() => setLoading(false), 200);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  // Save helpers
  const persistCategories = (list) => {
    setCategories(list);
    try {
      localStorage.setItem('nexahr_job_categories', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const persistTypes = (list) => {
    setTypes(list);
    try {
      localStorage.setItem('nexahr_job_types', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const persistLocations = (list) => {
    setLocations(list);
    try {
      localStorage.setItem('nexahr_job_locations', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const persistSkills = (list) => {
    setSkills(list);
    try {
      localStorage.setItem('nexahr_job_skills', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  const persistExperiences = (list) => {
    setExperiences(list);
    try {
      localStorage.setItem('nexahr_job_experiences', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
  };

  // Open Add/Edit Modal
  const handleOpenAdd = () => {
    setEditingItem(null);
    if (activeTab === 'categories') setCategoryForm({ name: '', code: '', lead: 'Department Lead', status: 'ACTIVE' });
    if (activeTab === 'types') setTypeForm({ name: '', code: '', hours: '40 hrs / week', benefits: 'Full Health & Leave' });
    if (activeTab === 'locations') setLocationForm({ name: '', city: '', country: 'Pakistan', timezone: 'PKT (UTC+5)', status: 'BRANCH' });
    if (activeTab === 'skills') setSkillForm({ name: '', category: 'Frontend', proficiency: 'Advanced', weight: 'Mandatory' });
    if (activeTab === 'experience') setExperienceForm({ label: '', code: '', minYears: 1, maxYears: 3, salaryRange: '$80k - $110k' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    if (activeTab === 'categories') setCategoryForm({ name: item.name, code: item.code, lead: item.lead, status: item.status });
    if (activeTab === 'types') setTypeForm({ name: item.name, code: item.code, hours: item.hours, benefits: item.benefits });
    if (activeTab === 'locations') setLocationForm({ name: item.name, city: item.city, country: item.country, timezone: item.timezone, status: item.status });
    if (activeTab === 'skills') setSkillForm({ name: item.name, category: item.category, proficiency: item.proficiency, weight: item.weight });
    if (activeTab === 'experience') setExperienceForm({ label: item.label, code: item.code, minYears: item.minYears, maxYears: item.maxYears, salaryRange: item.salaryRange });
    setIsModalOpen(true);
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (activeTab === 'categories') {
      if (!categoryForm.name.trim()) return;
      if (editingItem) {
        const updated = categories.map((c) => (c.id === editingItem.id ? { ...c, ...categoryForm, code: categoryForm.code.toUpperCase().trim() } : c));
        persistCategories(updated);
        showToast('Category updated successfully');
      } else {
        const item = {
          id: Date.now(),
          name: categoryForm.name.trim(),
          code: categoryForm.code.toUpperCase().trim() || 'CAT',
          lead: categoryForm.lead || 'Department Lead',
          status: categoryForm.status,
          count: 0,
        };
        persistCategories([item, ...categories]);
        showToast('New Job Category created');
      }
    } else if (activeTab === 'types') {
      if (!typeForm.name.trim()) return;
      if (editingItem) {
        const updated = types.map((t) => (t.id === editingItem.id ? { ...t, ...typeForm, code: typeForm.code.toUpperCase().trim() } : t));
        persistTypes(updated);
        showToast('Contract type updated successfully');
      } else {
        const item = {
          id: Date.now(),
          name: typeForm.name.trim(),
          code: typeForm.code.toUpperCase().trim() || 'TYPE',
          hours: typeForm.hours,
          benefits: typeForm.benefits,
          count: 0,
        };
        persistTypes([item, ...types]);
        showToast('New Contract Type created');
      }
    } else if (activeTab === 'locations') {
      if (!locationForm.name.trim()) return;
      if (editingItem) {
        const updated = locations.map((l) => (l.id === editingItem.id ? { ...l, ...locationForm } : l));
        persistLocations(updated);
        showToast('Location updated successfully');
      } else {
        const item = {
          id: Date.now(),
          name: locationForm.name.trim(),
          city: locationForm.city.trim() || 'HQ',
          country: locationForm.country,
          timezone: locationForm.timezone,
          status: locationForm.status,
          count: 0,
        };
        persistLocations([item, ...locations]);
        showToast('New Hiring Location added');
      }
    } else if (activeTab === 'skills') {
      if (!skillForm.name.trim()) return;
      if (editingItem) {
        const updated = skills.map((s) => (s.id === editingItem.id ? { ...s, ...skillForm } : s));
        persistSkills(updated);
        showToast('Skill definition updated');
      } else {
        const item = {
          id: Date.now(),
          name: skillForm.name.trim(),
          category: skillForm.category,
          proficiency: skillForm.proficiency,
          weight: skillForm.weight,
          assessmentsCount: 0,
        };
        persistSkills([item, ...skills]);
        showToast('New Skill added to taxonomy');
      }
    } else if (activeTab === 'experience') {
      if (!experienceForm.label.trim()) return;
      if (editingItem) {
        const updated = experiences.map((exp) => (exp.id === editingItem.id ? { ...exp, ...experienceForm, code: experienceForm.code.toUpperCase().trim() } : exp));
        persistExperiences(updated);
        showToast('Experience track updated');
      } else {
        const item = {
          id: Date.now(),
          label: experienceForm.label.trim(),
          code: experienceForm.code.toUpperCase().trim() || 'EXP',
          minYears: Number(experienceForm.minYears) || 0,
          maxYears: Number(experienceForm.maxYears) || 3,
          salaryRange: experienceForm.salaryRange,
          count: 0,
        };
        persistExperiences([item, ...experiences]);
        showToast('New Experience Track created');
      }
    }

    setIsModalOpen(false);
  };

  // Delete Handler
  const handleDelete = (id) => {
    if (activeTab === 'categories') {
      persistCategories(categories.filter((c) => c.id !== id));
      showToast('Category deleted');
    } else if (activeTab === 'types') {
      persistTypes(types.filter((t) => t.id !== id));
      showToast('Contract type deleted');
    } else if (activeTab === 'locations') {
      persistLocations(locations.filter((l) => l.id !== id));
      showToast('Location deleted');
    } else if (activeTab === 'skills') {
      persistSkills(skills.filter((s) => s.id !== id));
      showToast('Skill deleted');
    } else if (activeTab === 'experience') {
      persistExperiences(experiences.filter((e) => e.id !== id));
      showToast('Experience track deleted');
    }
  };

  // Filter items
  const q = searchQuery.toLowerCase();
  const filteredCategories = categories.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || c.lead.toLowerCase().includes(q));
  const filteredTypes = types.filter((t) => t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q) || t.benefits.toLowerCase().includes(q));
  const filteredLocations = locations.filter((l) => l.name.toLowerCase().includes(q) || l.city.toLowerCase().includes(q) || l.country.toLowerCase().includes(q));
  const filteredSkills = skills.filter((s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q) || s.proficiency.toLowerCase().includes(q));
  const filteredExperiences = experiences.filter((e) => e.label.toLowerCase().includes(q) || e.code.toLowerCase().includes(q) || e.salaryRange.toLowerCase().includes(q));

  const currentTabObj = TABS.find((t) => t.id === activeTab) || TABS[0];
  const CurrentIcon = currentTabObj.icon;

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Recruitment Master Data & Taxonomy Settings"
        subtitle="Configure requisition categories, contract formats, regional hiring hubs, candidate skill taxonomy, and career seniority tracks."
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC RECRUITMENT SETTINGS HERO BANNER WITH TELEMETRY */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Recruitment Master Data Hub
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-medium">
              Seamlessly manage foundational taxonomy for candidate pipelines, job requisitions, and standardized talent acquisition data models across NexaHR.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-300 font-semibold pt-1">
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>{categories.length} Categories</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-blue-500" />
                <span>{types.length} Contract Types</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{locations.length} Locations</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <Code className="w-3.5 h-3.5 text-purple-500" />
                <span>{skills.length} Skills</span>
              </span>
              <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-800/70 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>{experiences.length} Seniority Tracks</span>
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Entry</span>
            </button>
            <button
              onClick={loadMasterData}
              className="px-4 py-2.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HORIZONTAL TABBED INTERFACE (TAILWIND STATE-BASED) */}
      {/* ========================================================================= */}
      <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-[28px] p-2 border border-slate-200/70 dark:border-slate-800 shadow-soft">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            let countBadge = 0;
            if (tab.id === 'categories') countBadge = categories.length;
            if (tab.id === 'types') countBadge = types.length;
            if (tab.id === 'locations') countBadge = locations.length;
            if (tab.id === 'skills') countBadge = skills.length;
            if (tab.id === 'experience') countBadge = experiences.length;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'hover:bg-slate-100/80 dark:hover:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="truncate">
                    <p className={`text-xs font-bold leading-tight ${isActive ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                      {tab.label}
                    </p>
                    <p className={`text-[10px] hidden sm:block truncate ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {countBadge} registered
                    </p>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {countBadge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. TOOLBAR: SEARCH & ACTIONS */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder={`Search ${currentTabObj.label.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add {currentTabObj.label.replace('Master', '').trim()}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. ACTIVE CONFIGURATION TABLE (ZERO-LAYOUT-SHIFT SKELETON SUPPORT) */}
      {/* ========================================================================= */}
      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-soft overflow-hidden">
          {/* TAB 1: CATEGORIES */}
          {activeTab === 'categories' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-4 px-6">Category / Requisition Taxonomy</th>
                    <th className="py-4 px-6">Taxonomy Code</th>
                    <th className="py-4 px-6">Functional Department Lead</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Tag className="w-4 h-4" />
                          </div>
                          <span>{cat.name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {cat.code}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{cat.lead}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span>{cat.status || 'ACTIVE'}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(cat)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                              title="Edit Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        No categories found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: CONTRACT TYPES */}
          {activeTab === 'types' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-4 px-6">Contract Model</th>
                    <th className="py-4 px-6">Code</th>
                    <th className="py-4 px-6">Standard Hours</th>
                    <th className="py-4 px-6">Compensation & Benefits Track</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredTypes.length > 0 ? (
                    filteredTypes.map((type) => (
                      <tr key={type.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <span>{type.name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {type.code}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{type.hours}</td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{type.benefits}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(type)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                              title="Edit Type"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(type.id)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete Type"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        No contract types found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 3: LOCATIONS */}
          {activeTab === 'locations' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-4 px-6">Hiring Hub / Office Campus</th>
                    <th className="py-4 px-6">City & Country</th>
                    <th className="py-4 px-6">Timezone</th>
                    <th className="py-4 px-6">Classification</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredLocations.length > 0 ? (
                    filteredLocations.map((loc) => (
                      <tr key={loc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span>{loc.name}</span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                          {loc.city}, {loc.country}
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-500">{loc.timezone}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              loc.status === 'PRIMARY_HQ'
                                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                : loc.status === 'REMOTE'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {loc.status || 'BRANCH'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(loc)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                              title="Edit Location"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(loc.id)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete Location"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        No locations found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: SKILLS */}
          {activeTab === 'skills' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-4 px-6">Skill Name & Framework</th>
                    <th className="py-4 px-6">Domain Category</th>
                    <th className="py-4 px-6">Proficiency Level</th>
                    <th className="py-4 px-6">Evaluation Weight</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredSkills.length > 0 ? (
                    filteredSkills.map((skill) => (
                      <tr key={skill.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                            <Code className="w-4 h-4" />
                          </div>
                          <span>{skill.name}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                            {skill.category}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                            <ShieldCheck className="w-3 h-3 text-indigo-500" />
                            <span>{skill.proficiency}</span>
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              skill.weight === 'Mandatory'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {skill.weight}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(skill)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                              title="Edit Skill"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(skill.id)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete Skill"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        No skills found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 5: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                    <th className="py-4 px-6">Seniority Band & Track</th>
                    <th className="py-4 px-6">Level Code</th>
                    <th className="py-4 px-6">Tenure Bracket</th>
                    <th className="py-4 px-6">Compensation Benchmark Range</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                  {filteredExperiences.length > 0 ? (
                    filteredExperiences.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span>{exp.label}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {exp.code}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                          {exp.minYears} - {exp.maxYears} Years
                        </td>
                        <td className="py-4 px-6 font-semibold text-emerald-600 dark:text-emerald-400">
                          {exp.salaryRange}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(exp)}
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                              title="Edit Experience Band"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                              title="Delete Experience Band"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 text-xs">
                        No experience seniority bands found matching "{searchQuery}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADD / EDIT MODAL FOR MASTER DATA */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <CurrentIcon className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingItem ? 'Edit' : 'Create'} {currentTabObj.label.replace('Master', '').trim()}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{currentTabObj.desc}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tab 1 Fields */}
              {activeTab === 'categories' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Engineering & DevOps"
                      value={categoryForm.name}
                      onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Code</label>
                      <input
                        type="text"
                        placeholder="ENG"
                        value={categoryForm.code}
                        onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Department Lead</label>
                      <input
                        type="text"
                        placeholder="Lead Name"
                        value={categoryForm.lead}
                        onChange={(e) => setCategoryForm({ ...categoryForm, lead: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2 Fields */}
              {activeTab === 'types' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contract Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Full-Time Permanent"
                      value={typeForm.name}
                      onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Code</label>
                      <input
                        type="text"
                        placeholder="FT"
                        value={typeForm.code}
                        onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Work Hours</label>
                      <input
                        type="text"
                        placeholder="40 hrs / week"
                        value={typeForm.hours}
                        onChange={(e) => setTypeForm({ ...typeForm, hours: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Benefits & Perks Track</label>
                    <input
                      type="text"
                      placeholder="Health, Equity & Allowances"
                      value={typeForm.benefits}
                      onChange={(e) => setTypeForm({ ...typeForm, benefits: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </>
              )}

              {/* Tab 3 Fields */}
              {activeTab === 'locations' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Campus / Hub Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Islamabad HQ & Innovation Campus"
                      value={locationForm.name}
                      onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">City</label>
                      <input
                        type="text"
                        placeholder="Islamabad"
                        value={locationForm.city}
                        onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Country</label>
                      <input
                        type="text"
                        placeholder="Pakistan"
                        value={locationForm.country}
                        onChange={(e) => setLocationForm({ ...locationForm, country: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Timezone</label>
                      <input
                        type="text"
                        placeholder="PKT (UTC+5)"
                        value={locationForm.timezone}
                        onChange={(e) => setLocationForm({ ...locationForm, timezone: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Classification</label>
                      <select
                        value={locationForm.status}
                        onChange={(e) => setLocationForm({ ...locationForm, status: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      >
                        <option value="PRIMARY_HQ">Primary HQ</option>
                        <option value="BRANCH">Regional Branch</option>
                        <option value="REMOTE">Remote Async</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Tab 4 Fields */}
              {activeTab === 'skills' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Skill / Tech Stack Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. React.js & Tailwind CSS"
                      value={skillForm.name}
                      onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                      <input
                        type="text"
                        placeholder="Frontend"
                        value={skillForm.category}
                        onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Proficiency</label>
                      <select
                        value={skillForm.proficiency}
                        onChange={(e) => setSkillForm({ ...skillForm, proficiency: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-2 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Weight</label>
                      <select
                        value={skillForm.weight}
                        onChange={(e) => setSkillForm({ ...skillForm, weight: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-2 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none"
                      >
                        <option value="Mandatory">Mandatory</option>
                        <option value="Preferred">Preferred</option>
                        <option value="Optional">Optional</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Tab 5 Fields */}
              {activeTab === 'experience' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Seniority Track Label</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Specialist (5 - 8 Years)"
                      value={experienceForm.label}
                      onChange={(e) => setExperienceForm({ ...experienceForm, label: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Code</label>
                      <input
                        type="text"
                        placeholder="SENIOR"
                        value={experienceForm.code}
                        onChange={(e) => setExperienceForm({ ...experienceForm, code: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Min Years</label>
                      <input
                        type="number"
                        min="0"
                        value={experienceForm.minYears}
                        onChange={(e) => setExperienceForm({ ...experienceForm, minYears: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Max Years</label>
                      <input
                        type="number"
                        min="0"
                        value={experienceForm.maxYears}
                        onChange={(e) => setExperienceForm({ ...experienceForm, maxYears: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-3 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Salary Benchmark Range</label>
                    <input
                      type="text"
                      placeholder="$110k - $150k"
                      value={experienceForm.salaryRange}
                      onChange={(e) => setExperienceForm({ ...experienceForm, salaryRange: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all active:scale-95"
                >
                  {editingItem ? 'Save Changes' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruitmentSettings;
