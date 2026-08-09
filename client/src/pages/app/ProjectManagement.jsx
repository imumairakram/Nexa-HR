import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  FolderKanban,
  Plus,
  Clock,
  Users,
  CheckCircle2,
  Search,
  Filter,
  MoreVertical,
  Calendar,
  AlertCircle,
  TrendingUp,
  Briefcase,
  X,
  ChevronRight,
  Layers,
} from 'lucide-react';

const INITIAL_PROJECTS = [
  {
    id: 1,
    name: 'NexaHR Mobile App V2',
    client: 'Internal Enterprise Core',
    category: 'Mobile & PWA',
    progress: 75,
    lead: 'Alex Mercer',
    leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    deadline: 'Aug 28, 2026',
    members: 6,
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    budget: '$45,000',
    spent: '$32,500',
    tasksTotal: 24,
    tasksDone: 18,
  },
  {
    id: 2,
    name: 'Biometric Hardware Gateway API',
    client: 'IoT Infrastructure Division',
    category: 'IoT & Webhooks',
    progress: 100,
    lead: 'Marcus Vance',
    leadAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    deadline: 'Aug 10, 2026',
    members: 4,
    priority: 'HIGH',
    status: 'COMPLETED',
    budget: '$30,000',
    spent: '$28,400',
    tasksTotal: 16,
    tasksDone: 16,
  },
  {
    id: 3,
    name: 'Payroll Auto-Tax Engine FY26',
    client: 'Finance & Compliance Dept',
    category: 'Fintech & Rules',
    progress: 40,
    lead: 'David Miller',
    leadAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    deadline: 'Sep 15, 2026',
    members: 5,
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    budget: '$50,000',
    spent: '$19,800',
    tasksTotal: 30,
    tasksDone: 12,
  },
  {
    id: 4,
    name: 'Executive Talent Careers Portal',
    client: 'Recruitment & People Ops',
    category: 'ATS & Portal',
    progress: 20,
    lead: 'Emily Zhang',
    leadAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    deadline: 'Oct 01, 2026',
    members: 3,
    priority: 'LOW',
    status: 'ON_HOLD',
    budget: '$25,000',
    spent: '$5,200',
    tasksTotal: 18,
    tasksDone: 4,
  },
  {
    id: 5,
    name: 'SOC-2 Compliance & Audit Shield',
    client: 'Information Security Office',
    category: 'Security & Governance',
    progress: 88,
    lead: 'Marcus Vance',
    leadAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    deadline: 'Aug 20, 2026',
    members: 5,
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    budget: '$38,000',
    spent: '$33,000',
    tasksTotal: 22,
    tasksDone: 19,
  },
];

const ProjectManagement = () => {
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Form State
  const [projectForm, setProjectForm] = useState({
    name: '',
    client: '',
    category: 'Software Engineering',
    lead: 'Alex Mercer',
    deadline: '2026-09-30',
    priority: 'MEDIUM',
    budget: '$35,000',
  });

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!projectForm.name.trim()) return;

    const newProj = {
      id: Date.now(),
      name: projectForm.name,
      client: projectForm.client || 'Internal Initiative',
      category: projectForm.category,
      progress: 5,
      lead: projectForm.lead,
      leadAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      deadline: new Date(projectForm.deadline).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      members: 4,
      priority: projectForm.priority,
      status: 'IN_PROGRESS',
      budget: projectForm.budget,
      spent: '$0',
      tasksTotal: 10,
      tasksDone: 0,
    };

    setProjects([newProj, ...projects]);
    setIsNewProjectOpen(false);
    setProjectForm({
      name: '',
      client: '',
      category: 'Software Engineering',
      lead: 'Alex Mercer',
      deadline: '2026-09-30',
      priority: 'MEDIUM',
      budget: '$35,000',
    });
    setToastMsg(`Project "${projectForm.name}" created successfully!`);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.lead.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === 'IN_PROGRESS').length,
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
    onHold: projects.filter((p) => p.status === 'ON_HOLD').length,
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Project Management & Initiatives"
        subtitle="Track cross-functional deliverables, sprint progress, budgets, and engineering lead allocations."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STAT METRIC CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Initiatives</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total} Projects</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FolderKanban className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Active Sprints</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.inProgress} In Progress</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Completed</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.completed} Delivered</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">On Hold</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.onHold} Paused</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOOLBAR & FILTER CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search projects by title, initiative, or lead..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            {['ALL', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st === 'IN_PROGRESS' ? 'Active' : st === 'COMPLETED' ? 'Completed' : 'On Hold'}
              </button>
            ))}

            <button
              onClick={() => setIsNewProjectOpen(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Project</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PROJECT CARDS GRID */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredProjects.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-extrabold uppercase">
                  {p.category}
                </span>

                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider ${
                    p.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                      : p.status === 'IN_PROGRESS'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                  }`}
                >
                  {p.status.replace('_', ' ')}
                </span>
              </div>

              <h4 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {p.name}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{p.client}</p>

              {/* Progress bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-extrabold">
                  <span className="text-slate-400">Sprint Progress</span>
                  <span className="text-slate-900 dark:text-white">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      p.progress === 100
                        ? 'bg-emerald-500'
                        : p.progress > 50
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>

              {/* Stats row: Budget & Tasks */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Deliverables</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {p.tasksDone} / {p.tasksTotal} Tasks
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Budget Spend</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {p.spent} / {p.budget}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer: Lead & Deadline */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={p.leadAvatar}
                  alt={p.lead}
                  className="w-7 h-7 rounded-xl object-cover ring-2 ring-slate-100 dark:ring-slate-700"
                />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold leading-none">LEAD</div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 leading-tight">{p.lead}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400 font-bold leading-none">DUE DATE</div>
                <div className="font-semibold text-slate-700 dark:text-slate-300 leading-tight mt-0.5">
                  {p.deadline}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 4. MODAL: CREATE NEW PROJECT */}
      {/* ========================================================================= */}
      {isNewProjectOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Create New Project Initiative</h3>
              </div>
              <button
                onClick={() => setIsNewProjectOpen(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered Resume Screener V1..."
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Client / Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. People Ops / Engineering"
                    value={projectForm.client}
                    onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Category Tag *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mobile, Backend, IoT"
                    value={projectForm.category}
                    onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Project Lead *
                  </label>
                  <select
                    value={projectForm.lead}
                    onChange={(e) => setProjectForm({ ...projectForm, lead: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="Alex Mercer">Alex Mercer (Lead Engineer)</option>
                    <option value="David Miller">David Miller (Backend Architect)</option>
                    <option value="Marcus Vance">Marcus Vance (DevOps Lead)</option>
                    <option value="Emily Zhang">Emily Zhang (VP Product)</option>
                    <option value="Sarah Jenkins">Sarah Jenkins (Design Lead)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Target Deadline *
                  </label>
                  <input
                    type="date"
                    required
                    value={projectForm.deadline}
                    onChange={(e) => setProjectForm({ ...projectForm, deadline: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Priority Tier *
                  </label>
                  <select
                    value={projectForm.priority}
                    onChange={(e) => setProjectForm({ ...projectForm, priority: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                  >
                    <option value="HIGH">High Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="LOW">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                    Budget Allocation
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. $40,000"
                    value={projectForm.budget}
                    onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewProjectOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
