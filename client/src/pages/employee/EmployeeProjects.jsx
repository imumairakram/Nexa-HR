import React, { useState } from 'react';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  Plus,
  X,
  Play,
  Users,
  AlertCircle,
  MoreVertical,
  Calendar,
  Check,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

const INITIAL_PROJECTS = [
  {
    id: 1,
    title: 'NexaHR Mobile App V2',
    role: 'Lead Mobile Engineer',
    progress: 75,
    deadline: 'Aug 28, 2026',
    members: 5,
    tag: 'Mobile & PWA',
  },
  {
    id: 2,
    title: 'Biometric Hardware Gateway API',
    role: 'Backend Architect',
    progress: 90,
    deadline: 'Aug 15, 2026',
    members: 4,
    tag: 'IoT & Webhooks',
  },
  {
    id: 3,
    title: 'Payroll Auto-Tax Engine',
    role: 'Core Contributor',
    progress: 40,
    deadline: 'Sep 10, 2026',
    members: 6,
    tag: 'Finance & Compliance',
  },
];

const INITIAL_TASKS = [
  { id: 't1', title: 'Implement Biometric Webhook Event Handlers', project: 'Biometric Hardware Gateway API', column: 'IN_PROGRESS', priority: 'HIGH', loggedHours: 14.5, estimate: 18 },
  { id: 't2', title: 'Design Employee Self-Service Mobile View', project: 'NexaHR Mobile App V2', column: 'TO_DO', priority: 'MEDIUM', loggedHours: 4.0, estimate: 12 },
  { id: 't3', title: 'Audit YTD Tax Deduction Calculation Rules', project: 'Payroll Auto-Tax Engine', column: 'REVIEW', priority: 'LOW', loggedHours: 8.0, estimate: 8 },
  { id: 't4', title: 'Fix Token Expiration Refresh Interceptor', project: 'NexaHR Mobile App V2', column: 'COMPLETED', priority: 'HIGH', loggedHours: 6.5, estimate: 6 },
];

const EmployeeProjects = () => {
  const [projects] = useState(INITIAL_PROJECTS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [logHours, setLogHours] = useState('2.5');
  const [logNotes, setLogNotes] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const handleStatusChange = (taskId, newCol) => {
    setTasks(tasks.map((t) => (t.id === taskId ? { ...t, column: newCol } : t)));
    setToastMsg('Task status updated successfully!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!selectedTask) return;
    const added = parseFloat(logHours) || 0;
    setTasks(
      tasks.map((t) =>
        t.id === selectedTask.id ? { ...t, loggedHours: t.loggedHours + added } : t
      )
    );
    setIsLogTimeOpen(false);
    setToastMsg(`Logged ${added} hrs to ${selectedTask.title}!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const columns = [
    { key: 'TO_DO', label: 'To Do', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300' },
    { key: 'REVIEW', label: 'In Review', color: 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' },
    { key: 'COMPLETED', label: 'Completed', color: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Projects & Assigned Tasks"
        subtitle="Manage sprint deliverables, track logged hours, and update workflow task progress."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. ACTIVE PROJECTS ROW */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {projects.map((p) => (
          <div
            key={p.id}
            className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 space-y-3"
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300">
                {p.tag}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{p.deadline}</span>
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">{p.title}</h4>
              <p className="text-xs text-slate-400 font-medium">{p.role}</p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-slate-400">Progress</span>
                <span className="text-slate-900 dark:text-white">{p.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{p.members} Collaborators</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active Sprint</span>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* 2. KANBAN TASK BOARD */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              My Task Board
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Move tasks across stages or log hours worked
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.column === col.key);
            return (
              <div
                key={col.key}
                className="bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-4 space-y-3 border border-slate-200/50 dark:border-slate-800 min-h-[360px] flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${col.color}`}>
                      {col.label}
                    </span>
                    <span className="text-xs text-slate-400 font-bold">{colTasks.length}</span>
                  </div>

                  <div className="space-y-2.5">
                    {colTasks.map((t) => (
                      <div
                        key={t.id}
                        className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              t.priority === 'HIGH'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : t.priority === 'MEDIUM'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            }`}
                          >
                            {t.priority} Priority
                          </span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {t.loggedHours} / {t.estimate}h
                          </span>
                        </div>

                        <h5 className="text-xs font-extrabold text-slate-900 dark:text-white leading-snug">
                          {t.title}
                        </h5>

                        <div className="text-[10px] text-slate-400 font-medium truncate">
                          {t.project}
                        </div>

                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                          <select
                            value={t.column}
                            onChange={(e) => handleStatusChange(t.id, e.target.value)}
                            className="bg-slate-50 dark:bg-slate-800 text-[10px] font-bold rounded-xl px-2 py-1 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                          >
                            <option value="TO_DO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="COMPLETED">Done</option>
                          </select>

                          <button
                            onClick={() => {
                              setSelectedTask(t);
                              setIsLogTimeOpen(true);
                            }}
                            className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Clock className="w-3 h-3" />
                            <span>Log Time</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {colTasks.length === 0 && (
                  <div className="text-center py-10 text-xs text-slate-400 font-medium">
                    No tasks in {col.label.toLowerCase()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. LOG TIME MODAL */}
      {/* ========================================================================= */}
      {isLogTimeOpen && selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Log Working Hours
              </h3>
              <button
                onClick={() => setIsLogTimeOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">{selectedTask.title}</div>
              <div className="text-slate-400 text-[11px]">{selectedTask.project}</div>
            </div>

            <form onSubmit={handleLogSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Hours Spent (e.g. 2.5)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="12"
                  value={logHours}
                  onChange={(e) => setLogHours(e.target.value)}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Work Notes & Progress Summary
                </label>
                <textarea
                  rows={3}
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  placeholder="Completed endpoint integration and wrote unit test cases..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLogTimeOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeProjects;
