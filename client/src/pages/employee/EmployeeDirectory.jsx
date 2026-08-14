import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Building,
  Briefcase,
  ExternalLink,
  MessageSquare,
  Shield,
  Sparkles,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { api } from '../../services/api';

const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
];

const getAvatarUrl = (emp, idx = 0) => {
  if (emp.avatar) return emp.avatar;
  const hash = (emp.email || emp.firstName || 'user').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DEFAULT_AVATARS[hash % DEFAULT_AVATARS.length];
};

const EmployeeDirectory = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 2500);
  };

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.allSettled([
        api.getEmployees(),
        api.getDepartments(),
      ]);

      if (empRes.status === 'fulfilled' && empRes.value?.data?.employees) {
        setEmployees(empRes.value.data.employees);
      }
      if (deptRes.status === 'fulfilled' && deptRes.value?.data?.departments) {
        setDepartments(deptRes.value.data.departments);
      }
    } catch (err) {
      console.error('Error fetching directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const deptList = ['ALL', ...departments.map((d) => d.name)];

  const filteredMembers = employees.filter((m) => {
    const fullName = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
    const desig = (m.profile?.designation?.title || '').toLowerCase();
    const email = (m.email || '').toLowerCase();
    const dept = (m.profile?.department?.name || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = fullName.includes(query) || desig.includes(query) || email.includes(query) || dept.includes(query);
    const matchesDept = selectedDept === 'ALL' || (m.profile?.department?.name && m.profile.department.name.includes(selectedDept));

    return matchesSearch && matchesDept;
  });

  const stats = {
    total: employees.length,
    active: employees.filter((m) => m.isActive !== false).length,
    leadership: employees.filter((m) => m.role === 'ADMIN' || m.role === 'HR_MANAGER').length,
    engineering: employees.filter((m) => (m.profile?.department?.name || '').toLowerCase().includes('eng')).length,
  };

  const copyContact = (text, label) => {
    navigator.clipboard?.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Company Directory & Team Roster"
        subtitle="Search colleagues, find department contacts, view office locations, and connect across teams."
        onRefresh={fetchDirectory}
        loading={loading}
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Colleagues</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.total} Staff</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Active Verified</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.active} Active</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Engineering Unit</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.engineering} Staff</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">HR & Leadership</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.leadership} Leads</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, role, department, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Department Chips */}
        {deptList.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Dept:</span>
            {deptList.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDept(dept)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {dept === 'ALL' ? 'All Departments' : dept}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DIRECTORY GRID */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMembers.map((m, idx) => (
            <div
              key={m.id || idx}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group hover:shadow-lg"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(m, idx)}
                      alt={m.firstName}
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700 shadow-sm"
                    />
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {m.firstName} {m.lastName}
                      </h4>
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                        {m.profile?.designation?.title || 'Staff Member'}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono">{m.employeeCode}</span>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      m.role === 'ADMIN'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : m.role === 'HR_MANAGER'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {m.role || 'EMPLOYEE'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/40">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{m.profile?.department?.name || 'General Dept'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{m.profile?.address || m.profile?.location || 'San Francisco HQ'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-medium truncate">{m.email}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400">
                  Joined {m.profile?.joiningDate ? m.profile.joiningDate.split('T')[0] : '2023'}
                </span>

                <button
                  onClick={() => setSelectedMember(m)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-xs font-bold transition-all cursor-pointer"
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-base font-black text-slate-900 dark:text-white">No Colleagues Found</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            No colleagues matched your search query. Newly onboarded team members will automatically appear here.
          </p>
        </div>
      )}

      {/* MEMBER DETAIL MODAL */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={getAvatarUrl(selectedMember)}
                  alt={selectedMember.firstName}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-blue-500/20"
                />
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    {selectedMember.profile?.designation?.title || 'Staff Member'}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedMember.employeeCode}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex justify-between items-center">
                <span className="text-slate-400">Department</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedMember.profile?.department?.name || 'Engineering'}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex justify-between items-center">
                <span className="text-slate-400">Email</span>
                <button
                  onClick={() => copyContact(selectedMember.email, 'Email')}
                  className="font-bold text-blue-600 hover:underline truncate max-w-[200px]"
                >
                  {selectedMember.email}
                </button>
              </div>
              {selectedMember.phone && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex justify-between items-center">
                  <span className="text-slate-400">Phone</span>
                  <button
                    onClick={() => copyContact(selectedMember.phone, 'Phone')}
                    className="font-bold text-slate-900 dark:text-white hover:underline"
                  >
                    {selectedMember.phone}
                  </button>
                </div>
              )}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 flex justify-between items-center">
                <span className="text-slate-400">Location</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedMember.profile?.address || 'San Francisco HQ'}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
