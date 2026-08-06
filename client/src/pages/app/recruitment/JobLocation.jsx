import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { MapPin, Plus, Building2 } from 'lucide-react';

const JobLocation = () => {
  const [locations, setLocations] = useState([
    { id: 1, name: 'Headquarters Office', city: 'San Francisco, CA', country: 'USA', headcount: 95 },
    { id: 2, name: 'Innovation Hub', city: 'Austin, TX', country: 'USA', headcount: 42 },
    { id: 3, name: 'EMEA Regional Office', city: 'London', country: 'United Kingdom', headcount: 28 },
    { id: 4, name: 'Global Remote', city: 'Work from Anywhere', country: 'Worldwide', headcount: 35 },
  ]);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <AppPageHeader title="Job Locations & Workplaces" subtitle="Manage office branches, regional hubs, and remote locations" />

      <div className="flex items-center justify-between bg-white dark:bg-[#1E293B] p-4 rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Active Offices & Locations ({locations.length})</h3>
          <p className="text-xs text-slate-400">Location tags displayed on job applications</p>
        </div>
        <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-2xl flex items-center gap-2 cursor-pointer transition-all">
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {locations.map((loc) => (
          <div key={loc.id} className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <MapPin className="w-4 h-4" />
                <span className="text-xs font-bold">{loc.city}, {loc.country}</span>
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">{loc.name}</h4>
              <span className="text-xs text-slate-400 font-semibold">{loc.headcount} Staff Members</span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobLocation;
