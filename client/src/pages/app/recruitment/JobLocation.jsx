import React, { useState } from 'react';
import AppPageHeader from '../../../components/navigation/AppPageHeader';
import { MapPin, Plus, CheckCircle2, X } from 'lucide-react';

const INITIAL = [
  { id: 1, name: 'San Francisco HQ (Floor 4-5)', city: 'San Francisco, CA', country: 'United States', count: 8 },
  { id: 2, name: 'New York Innovation Hub', city: 'New York, NY', country: 'United States', count: 4 },
  { id: 3, name: 'Remote (US & Canada)', city: 'Remote / Distributed', country: 'North America', count: 4 },
];

const JobLocation = () => {
  const [locations, setLocations] = useState(INITIAL);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newLoc, setNewLoc] = useState({ name: '', city: '', country: 'United States' });
  const [toastMsg, setToastMsg] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newLoc.name) return;
    setLocations([...locations, { id: Date.now(), name: newLoc.name, city: newLoc.city, country: newLoc.country, count: 0 }]);
    setIsAddOpen(false);
    setNewLoc({ name: '', city: '', country: 'United States' });
    setToastMsg('Office location registered!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 max-w-4xl mx-auto">
      <AppPageHeader title="Office Locations & Remote Hubs" subtitle="Manage geographic hiring zones and office campuses." />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Hiring Locations</h3>
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Campus / Hub Name</th>
                <th className="py-3.5 px-4">City & Region</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4 text-right">Active Roles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {locations.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">{l.name}</td>
                  <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">{l.city}</td>
                  <td className="py-4 px-4 text-slate-400">{l.country}</td>
                  <td className="py-4 px-4 text-right font-black text-blue-600">{l.count} Roles</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Add Location</h3>
            <form onSubmit={handleAdd} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Hub / Campus Name"
                value={newLoc.name}
                onChange={(e) => setNewLoc({ ...newLoc, name: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                required
                placeholder="City & State"
                value={newLoc.city}
                onChange={(e) => setNewLoc({ ...newLoc, city: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800">Cancel</button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobLocation;
