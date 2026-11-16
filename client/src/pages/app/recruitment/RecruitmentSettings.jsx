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
  Banknote,
  Users,
  Bot,
  Sparkles,
} from 'lucide-react';

const TABS = [
  { id: 'categories', label: 'Job Categories', icon: Tag, desc: 'Functional disciplines & requisition taxonomy' },
  { id: 'types', label: 'Contract Types', icon: Briefcase, desc: 'Employment commitments & benefit tracks' },
  { id: 'locations', label: 'Hiring Locations', icon: MapPin, desc: 'Offices, campuses & async remote hubs' },
  { id: 'skills', label: 'Skill Taxonomy', icon: Code, desc: 'Competency frameworks & tech stacks' },
  { id: 'experience', label: 'Seniority Tracks', icon: Clock, desc: 'Career bands, tenure & compensation ranges' },
];

const DEFAULT_CATEGORIES = [];
const DEFAULT_TYPES = [];
const DEFAULT_LOCATIONS = [];
const DEFAULT_SKILLS = [];
const DEFAULT_EXPERIENCE = [];

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
  const [categoryForm, setCategoryForm] = useState({ name: '', code: '', lead: '', status: 'ACTIVE' });
  const [typeForm, setTypeForm] = useState({ name: '', code: '', hours: '', benefits: '' });
  const [locationForm, setLocationForm] = useState({ name: '', city: '', country: '', timezone: '', status: 'BRANCH' });
  const [skillForm, setSkillForm] = useState({ name: '', category: 'General', proficiency: 'Intermediate', weight: 'Mandatory' });
  const [experienceForm, setExperienceForm] = useState({ label: '', code: '', minYears: 1, maxYears: 3, salaryRange: '' });

  // Initial load with Live Backend API Integration
  const loadMasterData = async () => {
    setLoading(true);
    try {
      const [taxRes, deptRes] = await Promise.allSettled([
        api.getRecruitmentTaxonomies('ALL'),
        api.getDepartments(),
      ]);

      if (taxRes.status === 'fulfilled' && taxRes.value?.success && taxRes.value.data?.items) {
        const items = taxRes.value.data.items;
        setCategories(items.filter((i) => i.type === 'CATEGORY'));
        setTypes(items.filter((i) => i.type === 'TYPE'));
        setLocations(items.filter((i) => i.type === 'LOCATION'));
        setSkills(items.filter((i) => i.type === 'SKILL'));
        setExperiences(items.filter((i) => i.type === 'EXPERIENCE'));
      } else {
        setCategories([]);
        setTypes([]);
        setLocations([]);
        setSkills([]);
        setExperiences([]);
      }
    } catch (err) {
      console.error('Failed to load recruitment master data:', err);
      setCategories([]);
      setTypes([]);
      setLocations([]);
      setSkills([]);
      setExperiences([]);
    } finally {
      setLoading(false);
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
    if (activeTab === 'categories') setCategoryForm({ name: '', code: '', lead: '', status: 'ACTIVE' });
    if (activeTab === 'types') setTypeForm({ name: '', code: '', hours: '', benefits: '' });
    if (activeTab === 'locations') setLocationForm({ name: '', city: '', country: '', timezone: '', status: 'BRANCH' });
    if (activeTab === 'skills') setSkillForm({ name: '', category: 'General', proficiency: 'Intermediate', weight: 'Mandatory' });
    if (activeTab === 'experience') setExperienceForm({ label: '', code: '', minYears: 1, maxYears: 3, salaryRange: '' });
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
  // Submit Handler with Live Backend API
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (activeTab === 'categories') {
        if (!categoryForm.name.trim()) return;
        const payload = {
          type: 'CATEGORY',
          name: categoryForm.name.trim(),
          code: categoryForm.code.toUpperCase().trim() || 'CAT',
          lead: categoryForm.lead || 'Department Lead',
          status: categoryForm.status,
          openPositions: 0,
        };

        if (editingItem) {
          const res = await api.updateRecruitmentTaxonomy(editingItem.id, payload);
          if (res?.success && res.data?.item) {
            const updated = categories.map((c) => (c.id === editingItem.id ? res.data.item : c));
            persistCategories(updated);
            showToast('Category updated successfully');
          } else {
            throw new Error(res?.message || 'Failed to update category');
          }
        } else {
          const res = await api.createRecruitmentTaxonomy(payload);
          if (res?.success && res.data?.item) {
            persistCategories([res.data.item, ...categories]);
            showToast('New Job Category saved to database!');
          } else {
            throw new Error(res?.message || 'Failed to save category');
          }
        }
      } else if (activeTab === 'types') {
        if (!typeForm.name.trim()) return;
        const payload = {
          type: 'TYPE',
          name: typeForm.name.trim(),
          code: typeForm.code.toUpperCase().trim() || 'TYPE',
          hours: typeForm.hours,
          benefits: typeForm.benefits,
          count: 0,
        };

        if (editingItem) {
          const res = await api.updateRecruitmentTaxonomy(editingItem.id, payload);
          if (res?.success && res.data?.item) {
            const updated = types.map((t) => (t.id === editingItem.id ? res.data.item : t));
            persistTypes(updated);
            showToast('Contract format updated successfully');
          } else {
            throw new Error(res?.message || 'Failed to update contract format');
          }
        } else {
          const res = await api.createRecruitmentTaxonomy(payload);
          if (res?.success && res.data?.item) {
            persistTypes([res.data.item, ...types]);
            showToast('New Contract Format saved to database!');
          } else {
            throw new Error(res?.message || 'Failed to save contract format');
          }
        }
      } else if (activeTab === 'locations') {
        if (!locationForm.name.trim()) return;
        const payload = {
          type: 'LOCATION',
          name: locationForm.name.trim(),
          city: locationForm.city.trim() || 'HQ',
          country: locationForm.country,
          timezone: locationForm.timezone,
          status: locationForm.status,
          count: 0,
        };

        if (editingItem) {
          const res = await api.updateRecruitmentTaxonomy(editingItem.id, payload);
          if (res?.success && res.data?.item) {
            const updated = locations.map((l) => (l.id === editingItem.id ? res.data.item : l));
            persistLocations(updated);
            showToast('Hiring location updated successfully');
          } else {
            throw new Error(res?.message || 'Failed to update location');
          }
        } else {
          const res = await api.createRecruitmentTaxonomy(payload);
          if (res?.success && res.data?.item) {
            persistLocations([res.data.item, ...locations]);
            showToast('New Hiring Location saved to database!');
          } else {
            throw new Error(res?.message || 'Failed to save location');
          }
        }
      } else if (activeTab === 'skills') {
        if (!skillForm.name.trim()) return;
        const payload = {
          type: 'SKILL',
          name: skillForm.name.trim(),
          category: skillForm.category,
          proficiency: skillForm.proficiency,
          weight: skillForm.weight,
          assessmentsCount: 0,
        };

        if (editingItem) {
          const res = await api.updateRecruitmentTaxonomy(editingItem.id, payload);
          if (res?.success && res.data?.item) {
            const updated = skills.map((s) => (s.id === editingItem.id ? res.data.item : s));
            persistSkills(updated);
            showToast('Skill definition updated');
          } else {
            throw new Error(res?.message || 'Failed to update skill');
          }
        } else {
          const res = await api.createRecruitmentTaxonomy(payload);
          if (res?.success && res.data?.item) {
            persistSkills([res.data.item, ...skills]);
            showToast('New Skill saved to database!');
          } else {
            throw new Error(res?.message || 'Failed to save skill');
          }
        }
      } else if (activeTab === 'experience') {
        if (!experienceForm.label.trim()) return;
        const payload = {
          type: 'EXPERIENCE',
          name: experienceForm.label.trim(),
          label: experienceForm.label.trim(),
          code: experienceForm.code.toUpperCase().trim() || 'EXP',
          minYears: Number(experienceForm.minYears) || 0,
          maxYears: Number(experienceForm.maxYears) || 3,
          salaryRange: experienceForm.salaryRange,
          count: 0,
        };

        if (editingItem) {
          const res = await api.updateRecruitmentTaxonomy(editingItem.id, payload);
          if (res?.success && res.data?.item) {
            const updated = experiences.map((exp) => (exp.id === editingItem.id ? res.data.item : exp));
            persistExperiences(updated);
            showToast('Experience track updated');
          } else {
            throw new Error(res?.message || 'Failed to update experience track');
          }
        } else {
          const res = await api.createRecruitmentTaxonomy(payload);
          if (res?.success && res.data?.item) {
            persistExperiences([res.data.item, ...experiences]);
            showToast('New Experience Track saved to database!');
          } else {
            throw new Error(res?.message || 'Failed to save experience track');
          }
        }
      }
    } catch (err) {
      console.error('Error saving settings entry:', err);
      showToast(`Error: ${err.message || 'Failed to save settings entry'}`);
    } finally {
      setIsModalOpen(false);
    }
  };

  // Delete Handler with Live Backend API
  const handleDelete = async (id) => {
    try {
      await api.deleteRecruitmentTaxonomy(id).catch(() => null);
    } catch (e) {
      console.error(e);
    }

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
        title="Recruitment Master Settings"
        subtitle="Configure requisition categories, contract formats, regional hiring hubs, candidate skill taxonomy, and career seniority tracks."
      />

      {/* Toast Notification */}
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
      {/* 1. DYNAMIC RECRUITMENT SETTINGS HERO BANNER WITH TELEMETRY */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0A8FB5] via-[#087A9B] to-[#07617D] p-6 sm:p-8 shadow-lg shadow-sky-950/15 border border-[#3CC1E6]/30 text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[#3CC1E6]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Recruitment Master Data Hub
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed max-w-xl font-medium">
              Seamlessly manage foundational taxonomy for candidate pipelines, job requisitions, and standardized talent acquisition data models across NexaHR.
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-white/90 font-semibold pt-1">
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                
<span>{categories.length} Categories</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                
<span>{types.length} Contract Types</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                
<span>{locations.length} Locations</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                
<span>{skills.length} Skills</span>
              </span>
              <span className="flex items-center bg-white/15 backdrop-blur-sm text-white px-3 py-1 rounded-xl border border-white/20">
                
<span>{experiences.length} Seniority Tracks</span>
              </span>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
            <button
              onClick={handleOpenAdd}
              className="px-5 py-3 rounded-[12px] bg-white hover:bg-[#E1F4FA] active:bg-[#C8ECF8] text-[#07617D] font-bold text-xs shadow-md shadow-sky-950/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add New Entry</span>
            </button>
            <button
              onClick={loadMasterData}
              className="px-4 py-2.5 rounded-[12px] bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-bold text-xs border border-white/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
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
                    ? 'bg-sky-500 text-white shadow-md shadow-indigo-600/30'
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
            className="w-full bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 transition-all shadow-xs"
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
            className="px-4 py-2.5 rounded-[12px] bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
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
            <>
              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                {filteredCategories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                <Tag className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{cat.name}</span>
                            </div>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                              {cat.code}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-300">
                            <span>Lead: <strong className="text-slate-800 dark:text-slate-200">{cat.lead}</strong></span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[12px] text-[10px] font-bold bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              <span>{cat.status || 'ACTIVE'}</span>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No categories found matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
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
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {cat.code}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{cat.lead}</td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[12px] text-[10px] font-bold bg-emerald-100/70 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
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
            </>
          )}

          {/* TAB 2: CONTRACT TYPES */}
          {activeTab === 'types' && (
            <>
              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                {filteredTypes.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredTypes.map((type) => (
                      <div
                        key={type.id}
                        className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                <Briefcase className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{type.name}</span>
                            </div>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                              {type.code}
                            </span>
                          </div>

                          <div className="text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-slate-600 dark:text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Standard Hours:</span>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{type.hours}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Benefits:</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{type.benefits}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No contract types found matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
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
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
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
            </>
          )}

          {/* TAB 3: LOCATIONS */}
          {activeTab === 'locations' && (
            <>
              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                {filteredLocations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredLocations.map((loc) => (
                      <div
                        key={loc.id}
                        className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                <MapPin className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{loc.name}</span>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                loc.status === 'PRIMARY_HQ'
                                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                                  : loc.status === 'REMOTE'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                              }`}
                            >
                              {loc.status || 'BRANCH'}
                            </span>
                          </div>

                          <div className="text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-slate-600 dark:text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">City, Country:</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">{loc.city}, {loc.country}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Timezone:</span>
                              <span className="font-mono text-[11px] text-slate-500">{loc.timezone}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No locations found matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
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
            </>
          )}

          {/* TAB 4: SKILLS */}
          {activeTab === 'skills' && (
            <>
              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                {filteredSkills.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredSkills.map((skill) => (
                      <div
                        key={skill.id}
                        className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                                <Code className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{skill.name}</span>
                            </div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                                skill.weight === 'Mandatory'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              }`}
                            >
                              {skill.weight}
                            </span>
                          </div>

                          <div className="text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-slate-600 dark:text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Category:</span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">{skill.category}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Proficiency:</span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-[12px] text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                                
<span>{skill.proficiency}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No skills found matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
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
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-[12px] text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                              
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
            </>
          )}

          {/* TAB 5: EXPERIENCE */}
          {activeTab === 'experience' && (
            <>
              {/* Mobile Responsive Grid View (Hidden on Desktop) */}
              <div className="block md:hidden p-3.5 sm:p-4">
                {filteredExperiences.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {filteredExperiences.map((exp) => (
                      <div
                        key={exp.id}
                        className="bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5 shadow-xs flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <Clock className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-900 dark:text-white text-xs">{exp.label}</span>
                            </div>
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                              {exp.code}
                            </span>
                          </div>

                          <div className="text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-1 text-slate-600 dark:text-slate-300">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Tenure:</span>
                              <span className="font-medium text-slate-800 dark:text-slate-200">{exp.minYears} - {exp.maxYears} Years</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400">Salary Benchmark:</span>
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">{exp.salaryRange}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    No experience seniority bands found matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Desktop Table View (Hidden on Mobile) */}
              <div className="hidden md:block overflow-x-auto">
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
                            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-[12px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
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
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. ADD / EDIT MODAL FOR MASTER DATA */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 5. STITCH-INSPIRED LUXURY ADD / EDIT MODAL FOR MASTER DATA */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="bg-white/85 dark:bg-[#1E293B]/85 backdrop-blur-2xl rounded-2xl max-w-2xl sm:max-w-3xl w-full shadow-2xl border border-sky-200/70 dark:border-slate-700/80 flex flex-col max-h-[92vh] overflow-hidden animate-in zoom-in-95 duration-200 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/4 w-60 h-60 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-sky-100 dark:border-slate-800 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-r from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-900/30 dark:to-[#1E293B] relative z-10">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20 ring-4 ring-sky-500/15">
                  <CurrentIcon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight truncate">
                    {editingItem ? 'Edit' : 'Create'} {currentTabObj.label.replace('Master', '').trim()}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                    {currentTabObj.desc}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800 transition-all cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-xs relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 sm:p-7 space-y-4 custom-scrollbar text-xs relative z-10">
              {/* Tab 1 Fields */}
              {activeTab === 'categories' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 dark:text-slate-200 font-bold">
                      Category Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Engineering & DevOps"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Taxonomy Code</label>
                      <div className="relative">
                        <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="ENG"
                          value={categoryForm.code}
                          onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Department Lead</label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="e.g. John"
                          value={categoryForm.lead}
                          onChange={(e) => setCategoryForm({ ...categoryForm, lead: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tab 2 Fields */}
              {activeTab === 'types' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 dark:text-slate-200 font-bold">
                      Contract Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Briefcase className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Full-Time Permanent"
                        value={typeForm.name}
                        onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Contract Code</label>
                      <div className="relative">
                        <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="FT"
                          value={typeForm.code}
                          onChange={(e) => setTypeForm({ ...typeForm, code: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Work Hours</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="40 hrs / week"
                          value={typeForm.hours}
                          onChange={(e) => setTypeForm({ ...typeForm, hours: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 dark:text-slate-200 font-bold">Benefits & Perks Track</label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Health, Equity & Allowances"
                        value={typeForm.benefits}
                        onChange={(e) => setTypeForm({ ...typeForm, benefits: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Tab 3 Fields */}
              {activeTab === 'locations' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 dark:text-slate-200 font-bold">
                      Campus / Hub Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Islamabad HQ & Innovation Campus"
                        value={locationForm.name}
                        onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">City</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Islamabad"
                          value={locationForm.city}
                          onChange={(e) => setLocationForm({ ...locationForm, city: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Country</label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Pakistan"
                          value={locationForm.country}
                          onChange={(e) => setLocationForm({ ...locationForm, country: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Timezone</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="PKT (UTC+5)"
                          value={locationForm.timezone}
                          onChange={(e) => setLocationForm({ ...locationForm, timezone: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Duty Station Classification</label>
                      <div className="relative">
                        <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={locationForm.status}
                          onChange={(e) => setLocationForm({ ...locationForm, status: e.target.value })}
                          className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer appearance-none"
                        >
                          <option value="PRIMARY_HQ">Primary HQ</option>
                          <option value="BRANCH">Regional Branch</option>
                          <option value="REMOTE">Remote Async</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tab 4 Fields */}
              {activeTab === 'skills' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 dark:text-slate-200 font-bold">
                      Skill / Tech Stack Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Code className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. React.js & Tailwind CSS"
                        value={skillForm.name}
                        onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Category</label>
                      <div className="relative">
                        <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Frontend"
                          value={skillForm.category}
                          onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Proficiency</label>
                      <div className="relative">
                        <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={skillForm.proficiency}
                          onChange={(e) => setSkillForm({ ...skillForm, proficiency: e.target.value })}
                          className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer appearance-none"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Expert">Expert</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Weight</label>
                      <div className="relative">
                        <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <select
                          value={skillForm.weight}
                          onChange={(e) => setSkillForm({ ...skillForm, weight: e.target.value })}
                          className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all cursor-pointer appearance-none"
                        >
                          <option value="Mandatory">Mandatory</option>
                          <option value="Preferred">Preferred</option>
                          <option value="Optional">Optional</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Tab 5 Fields */}
              {activeTab === 'experience' && (
                <>
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 dark:text-slate-200 font-bold">
                      Seniority Track Label <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Senior Specialist (5 - 8 Years)"
                        value={experienceForm.label}
                        onChange={(e) => setExperienceForm({ ...experienceForm, label: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Track Code</label>
                      <div className="relative">
                        <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="SENIOR"
                          value={experienceForm.code}
                          onChange={(e) => setExperienceForm({ ...experienceForm, code: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Min Years</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="number"
                          min="0"
                          value={experienceForm.minYears}
                          onChange={(e) => setExperienceForm({ ...experienceForm, minYears: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-slate-800 dark:text-slate-200 font-bold">Max Years</label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="number"
                          min="0"
                          value={experienceForm.maxYears}
                          onChange={(e) => setExperienceForm({ ...experienceForm, maxYears: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-slate-800 dark:text-slate-200 font-bold">Salary Benchmark Range</label>
                    <div className="relative">
                      <Banknote className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="PKR 110k - PKR 150k"
                        value={experienceForm.salaryRange}
                        onChange={(e) => setExperienceForm({ ...experienceForm, salaryRange: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 outline-none transition-all placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Master Data System Automation & Sync Card */}
              <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-slate-50 via-sky-50/30 to-indigo-50/20 dark:from-slate-800/70 dark:via-slate-800/40 dark:to-slate-800/70 border border-slate-200/80 dark:border-slate-700 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/70 dark:border-slate-700/60">
                  <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs">
                    <Bot className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>Master Data & System Automation</span>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-[12px] text-[10px] font-extrabold bg-sky-100/80 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/80 dark:border-sky-800">
                    
<span>Live Sync</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Job Requisition Scope</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Available in job creator & ATS pipeline.</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-[12px] text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">Active</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60">
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-xs">Enterprise Indexing</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Indexed across corporate reports.</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-[12px] text-[10px] font-bold bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300">Synchronized</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-[12px] bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>{editingItem ? 'Save Changes' : 'Create Entry'}</span>
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
