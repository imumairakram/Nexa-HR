import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import {
  FileText,
  Search,
  Filter,
  Download,
  Star,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  Eye,
  X,
} from 'lucide-react';

const INITIAL_APPLICATIONS = [
  { id: 'APP-901', name: 'Maya Lin', role: 'Staff Distributed Systems Engineer', email: 'maya.lin@gmail.com', phone: '+1 (555) 234-8901', rating: 4.8, stage: 'APPLIED', date: 'Aug 06, 2026', resume: 'maya_lin_resume.pdf' },
  { id: 'APP-902', name: 'James Wilson', role: 'Senior Product Designer', email: 'j.wilson@design.io', phone: '+1 (555) 789-0123', rating: 4.5, stage: 'SCREENING', date: 'Aug 04, 2026', resume: 'james_wilson_portfolio.pdf' },
  { id: 'APP-903', name: 'Elena Rostova', role: 'DevOps & Security Lead', email: 'elena.rostova@cloud.com', phone: '+1 (555) 456-7890', rating: 5.0, stage: 'INTERVIEWING', date: 'Aug 02, 2026', resume: 'elena_rostova_cv.pdf' },
  { id: 'APP-904', name: 'Devon Vance', role: 'IoT & Firmware Specialist', email: 'devon.v@hardware.dev', phone: '+1 (555) 321-6549', rating: 4.9, stage: 'INTERVIEWING', date: 'Jul 29, 2026', resume: 'devon_firmware_cv.pdf' },
  { id: 'APP-905', name: 'Lucas Scott', role: 'Full-Stack Developer', email: 'lucas.scott@code.org', phone: '+1 (555) 654-9870', rating: 5.0, stage: 'OFFER', date: 'Jul 25, 2026', resume: 'lucas_scott_resume.pdf' },
];

const JobApplication = () => {
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const filtered = applications.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Candidate Application Roster & Resumes"
        subtitle="Review inbound candidate resumes, stage progression, ATS match scores, and interview evaluations."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate applications by name, position, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-4">Applied Position</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Pipeline Stage</th>
                <th className="py-3.5 px-4">Applied On</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-extrabold text-slate-900 dark:text-white">
                    <div>{a.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{a.id}</div>
                  </td>
                  <td className="py-4 px-4 font-semibold text-blue-600 dark:text-blue-400">{a.role}</td>
                  <td className="py-4 px-4 font-medium text-slate-600 dark:text-slate-300">
                    <div>{a.email}</div>
                    <div className="text-[10px] text-slate-400">{a.phone}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center gap-1 font-black text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-current" /> {a.rating}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {a.stage}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-slate-500">{a.date}</td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => {
                        setToastMsg(`Downloading resume for ${a.name}...`);
                        setTimeout(() => setToastMsg(''), 2500);
                      }}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-600 dark:text-slate-300 transition-all cursor-pointer ml-auto"
                      title="Download Resume"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JobApplication;
