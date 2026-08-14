import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { MapPin, Plus, CheckCircle2, X, Search, Building2, Globe } from 'lucide-react';

const INITIAL = [
  { id: 1, name: 'San Francisco Global Headquarters (Floor 4-5)', city: 'San Francisco, CA', country: 'United States', timezone: 'PST (UTC-8)', count: 8, status: 'PRIMARY_HQ' },
  { id: 2, name: 'New York Innovation & Sales Hub', city: 'New York, NY', country: 'United States', timezone: 'EST (UTC-5)', count: 4, status: 'REGIONAL_HUB' },
  { id: 3, name: 'Seattle Engineering Distributed Center', city: 'Seattle, WA', country: 'United States', timezone: 'PST (UTC-8)', count: 2, status: 'TECH_HUB' },
  { id: 4, name: 'Fully Distributed Remote (US & Canada)', city: 'Remote / Async', country: 'North America', timezone: 'All US Timezones', count: 4, status: 'REMOTE' },
];

const JobLocation = () => {
  const [locations, setLocations] = useState(INITIAL);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: '', city: '', country: 'United States', timezone: 'PST (UTC-8)' });
  const [toastMsg, setToastMsg] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newLoc.name) return;
    setLocations([...locations, { id: Date.now(), name: newLoc.name, city: newLoc.city, country: newLoc.country, timezone: newLoc.timezone, count: 0, status: 'BRANCH' }]);
    setIsAddOpen(false);
    setNewLoc({ name: '', city: '', country: 'United States', timezone: 'PST (UTC-8)' });
    setToastMsg('Office location registered successfully!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  const filtered = locations.filter((l) =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Office Locations & Regional Hiring Hubs"
        subtitle="Manage geographic workplace campuses, remote hiring zones, timezone mappings, and facility requisitions."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Campuses</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{locations.length} Locations</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Positions</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {locations.reduce((acc, l) => acc + l.count, 0)} Open Roles
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Remote Eligible</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">US & Canada</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Timezone Span</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">PST to EST</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Toolbar & Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search locations by campus name, city, or country..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Campus Location</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Campus / Facility Name</th>
                <th className="py-3.5 px-4">City & State</th>
                <th className="py-3.5 px-4">Operating Timezone</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4 text-right">Active Openings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{l.name}</td>
                  <td className="py-4 px-4 text-slate-700 dark:text-slate-200 font-semibold">{l.city}</td>
                  <td className="py-4 px-4 text-slate-500 font-medium">{l.timezone}</td>
                  <td className="py-4 px-4 text-slate-400">{l.country}</td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white text-sm">{l.count} Roles</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">Register Facility Location</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Campus Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Austin Innovation Center"
                  value={newLoc.name}
                  onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">City & State *</label>
                  <input
                    type="text"
                    required
                    placeholder="Austin, TX"
                    value={newLoc.city}
                    onChange={(e) => setNewLoc({ ...newLoc, city: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1">Country</label>
                  <input
                    type="text"
                    value={newLoc.country}
                    onChange={(e) => setNewLoc({ ...newLoc, country: e.target.value })}
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobLocation;
