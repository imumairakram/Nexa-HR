import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { Briefcase, Plus, Search, Users, MapPin, DollarSign } from 'lucide-react';

const Jobs = () => {
  const [jobs, setJobs] = useState([
    { id: 1, title: 'Senior Full Stack Engineer', department: 'Engineering', location: 'San Francisco, CA (Hybrid)', type: 'Full-Time', salary: '$130k - $160k', applicants: 42, status: 'OPEN' },
    { id: 2, title: 'Lead Product Designer', department: 'Product & Design', location: 'Global Remote', type: 'Full-Time', salary: '$120k - $145k', applicants: 28, status: 'OPEN' },
    { id: 3, title: 'HR Generalist', department: 'Human Resources', location: 'Austin, TX', type: 'Full-Time', salary: '$65k - $80k', applicants: 19, status: 'OPEN' },
    { id: 4, title: 'Financial Analyst', department: 'Finance & Accounts', location: 'London, UK', type: 'Full-Time', salary: '£55k - £70k', applicants: 14, status: 'DRAFT' },
  ]);

  const [search, setSearch] = useState('');

  const filtered = jobs.filter(j =>
    j.title.toLowerCase().includes(search.toLowerCase()) || j.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Job Openings Requisitions" subtitle="Manage active recruitment listings, applicant counts, and status" />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-4 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search job requisitions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((j) => (
          <div key={j.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  j.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'
                }`}>
                  {j.status}
                </span>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white mt-1.5">{j.title}</h4>
                <p className="text-xs text-slate-400 font-medium">{j.department} • {j.type}</p>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1.5 rounded-2xl">
                <Users className="w-4 h-4" />
                <span>{j.applicants} Applicants</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 font-medium">{j.location}</span>
              <span className="font-bold text-slate-900 dark:text-white">{j.salary}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Jobs;
