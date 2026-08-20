import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Building,
  MapPin,
  Shield,
  Briefcase,
  AlertTriangle,
  X,
  Edit2,
  UserCheck,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

const EmploymentStatus = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.getEmployees();
      if (res?.success && res.data?.employees) {
        const mapped = res.data.employees.map((emp) => {
          const isProbation = emp.profile?.joiningDate && (new Date() - new Date(emp.profile.joiningDate)) < 90 * 24 * 60 * 60 * 1000;
          return {
            id: emp.employeeCode || `EMP-${emp.id.slice(0, 4)}`,
            rawId: emp.id,
            name: `${emp.firstName} ${emp.lastName}`,
            role: emp.profile?.designation?.title || 'Staff Specialist',
            department: emp.profile?.department?.name || 'General Operations',
            employmentType: emp.profile?.employmentType || (emp.role === 'ADMIN' ? 'FULL_TIME' : (emp.isActive ? (isProbation ? 'PROBATION' : 'FULL_TIME') : 'CONTRACT')),
            location: emp.profile?.address || 'Anum State Building, Shahrah-e-Faisal, Karachi',
            shift: emp.profile?.shift || 'General Morning (09:00 - 17:30)',
            status: emp.isActive ? 'ACTIVE' : 'INACTIVE',
            joinDate: emp.profile?.joiningDate ? new Date(emp.profile.joiningDate).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : 'Jan 15, 2024',
          };
        });
        setEmployees(mapped);
      }
    } catch (err) {
      console.error('Failed to load employee statuses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedEmp) return;
    setSaving(true);
    try {
      const payload = {
        employmentType: selectedEmp.employmentType,
        shift: selectedEmp.shift,
        address: selectedEmp.location,
      };
      const res = await api.updateEmployee(selectedEmp.rawId, payload);
      if (res?.success) {
        setEmployees(employees.map((emp) => (emp.id === selectedEmp.id ? selectedEmp : emp)));
        setSelectedEmp(null);
        setToastMsg(`Employment record updated for ${selectedEmp.name}!`);
        setTimeout(() => setToastMsg(''), 2500);
      } else {
        alert(res?.message || 'Failed to update employee status.');
      }
    } catch (err) {
      console.error('Failed to update employee status:', err);
      alert('Error updating status. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || emp.employmentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: employees.length,
    fullTime: employees.filter((e) => e.employmentType === 'FULL_TIME').length,
    remote: employees.filter((e) => e.employmentType === 'REMOTE').length,
    probation: employees.filter((e) => e.employmentType === 'PROBATION' || e.employmentType === 'CONTRACT').length,
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Workforce Employment Status & Shifts"
        subtitle="Manage employment classifications, remote work contracts, shift timings, and probation statuses."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC EMPLOYMENT STATUS HERO BANNER (AMBER-ORANGE LIGHT THEME) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/60 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-amber-200/70 dark:border-amber-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-orange-300/20 dark:bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: Employment Status Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Workforce Classifications & Shift Roster
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Manage permanent full-time agreements, remote engineering contracts, shift schedules, and 90-day probationary review milestones.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-bold bg-amber-100/60 dark:bg-amber-950/60 px-3 py-1 rounded-xl border border-amber-200 dark:border-amber-800/60">
                <Users className="w-3.5 h-3.5" />
                <span>{stats.total} Total Active Personnel</span>
              </span>
              <span className="flex items-center gap-1.5 text-orange-700 dark:text-orange-300 font-bold bg-orange-100/60 dark:bg-orange-950/60 px-3 py-1 rounded-xl border border-orange-200 dark:border-orange-800/60">
                <Clock className="w-3.5 h-3.5" />
                <span>{stats.probation} Contracts / Probation</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-amber-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Status Overview</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{stats.fullTime} Permanent • {stats.remote} Remote</div>
            </div>
            <div className="w-full text-center py-2 px-3 bg-amber-50 dark:bg-amber-950/50 rounded-2xl border border-amber-200/60 dark:border-amber-800/40 text-xs font-bold text-amber-700 dark:text-amber-300">
              100% Policy Compliant
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. STITCH-INSPIRED TELEMETRY KPI CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-blue-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Total Headcount</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200/60 dark:border-blue-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.total} <span className="text-base font-bold text-slate-400">Staff</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-blue-600 dark:text-blue-400 font-bold">Active Roster</span>
              <span className="text-slate-400">Global Org</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-emerald-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Full-Time Staff</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.fullTime} <span className="text-base font-bold text-slate-400">Permanent</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Full Benefits</span>
              <span className="text-slate-400">Tenured</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Remote Contracts</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200/60 dark:border-indigo-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">
              {stats.remote} <span className="text-base font-bold text-slate-400">Remote</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">Flexible Hours</span>
              <span className="text-slate-400">Distributed</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="relative overflow-hidden bg-white dark:bg-[#1E293B] rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 dark:border-slate-800/80 hover:border-amber-500/40 group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />

          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Contract / Probation</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/60 dark:border-amber-800/50 group-hover:scale-110 transition-transform shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tight">
              {stats.probation} <span className="text-base font-bold text-slate-400">In Review</span>
            </div>
            <div className="flex items-center justify-between pt-2 text-xs font-semibold">
              <span className="text-amber-600 dark:text-amber-400 font-bold">90-Day Milestone</span>
              <span className="text-slate-400">Evaluation</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOOLBAR & TABLE */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-soft border border-slate-100 dark:border-slate-800 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by employee name, role, ID, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            {['ALL', 'FULL_TIME', 'REMOTE', 'CONTRACT', 'PROBATION'].map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  typeFilter === type
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All' : type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department & Role</th>
                <th className="py-3.5 px-4">Employment Classification</th>
                <th className="py-3.5 px-4">Assigned Shift</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4">
                    <div>
                      <div className="font-extrabold text-slate-900 dark:text-white">{emp.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{emp.id} • Joined {emp.joinDate}</div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{emp.role}</div>
                    <div className="text-[10px] text-slate-400">{emp.department}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${
                        emp.employmentType === 'FULL_TIME'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : emp.employmentType === 'REMOTE'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {emp.employmentType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-semibold text-slate-600 dark:text-slate-300">
                    {emp.shift}
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium">{emp.location}</td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => setSelectedEmp(emp)}
                      className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer"
                      title="Edit Employment Status"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL: UPDATE STATUS */}
      {/* ========================================================================= */}
      {selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono text-slate-400">{selectedEmp.id}</span>
                <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  Update {selectedEmp.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmp(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Employment Classification *
                </label>
                <select
                  value={selectedEmp.employmentType}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, employmentType: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="FULL_TIME">Full-Time Permanent</option>
                  <option value="REMOTE">Full-Time Remote</option>
                  <option value="CONTRACT">Fixed-Term Contract</option>
                  <option value="PROBATION">Probationary Period</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Assigned Shift Schedule *
                </label>
                <select
                  value={selectedEmp.shift}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, shift: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
                >
                  <option value="General Morning (09:00 - 17:30)">General Shift (09:00 AM - 05:30 PM)</option>
                  <option value="Flexible Remote">Flexible Remote (Asynchronous)</option>
                  <option value="Morning Shift (07:00 - 15:30)">Morning Shift (07:00 AM - 03:30 PM)</option>
                  <option value="Night Shift / Escalations">Night Escalations (16:00 - 00:30)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
                  Office Location *
                </label>
                <input
                  type="text"
                  required
                  value={selectedEmp.location}
                  onChange={(e) => setSelectedEmp({ ...selectedEmp, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedEmp(null)}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmploymentStatus;
