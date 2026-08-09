import React, { useState } from 'react';
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
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

const DIRECTORY_DATA = [
  {
    id: 'EMP-101',
    name: 'Alex Mercer (You)',
    role: 'Senior Full-Stack Engineer',
    department: 'Engineering & DevOps',
    location: 'San Francisco HQ (Floor 4)',
    email: 'employee@company.com',
    phone: '+1 (555) 438-9201',
    status: 'IN_OFFICE',
    statusText: 'In Office • Desk 4A',
    manager: 'System Administrator (HR Director)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    skills: ['React.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
    bio: 'Core platform contributor focusing on high-throughput microservices and UI design systems.',
  },
  {
    id: 'EMP-102',
    name: 'Sarah Jenkins',
    role: 'Lead Product Designer',
    department: 'Product & Design',
    location: 'Remote (Seattle, WA)',
    email: 'sarah.j@company.com',
    phone: '+1 (555) 392-1084',
    status: 'REMOTE',
    statusText: 'Working Remote',
    manager: 'Emily Zhang (VP Product)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    skills: ['Figma', 'UX Research', 'Design Tokens', 'Prototyping'],
    bio: 'Crafting intuitive enterprise experiences and leading the NexaHR design token revolution.',
  },
  {
    id: 'EMP-103',
    name: 'David Miller',
    role: 'Staff Backend Architect',
    department: 'Engineering & DevOps',
    location: 'San Francisco HQ (Floor 4)',
    email: 'david.m@company.com',
    phone: '+1 (555) 819-3329',
    status: 'IN_OFFICE',
    statusText: 'In Office • Desk 4C',
    manager: 'Alex Mercer (Tech Lead)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    skills: ['Go', 'Distributed Systems', 'Kafka', 'Kubernetes'],
    bio: 'Architecting biometric event pipelines and real-time streaming engines for workforce tracking.',
  },
  {
    id: 'EMP-104',
    name: 'Marcus Vance',
    role: 'Senior DevOps & Security Lead',
    department: 'Engineering & DevOps',
    location: 'New York Hub (Floor 2)',
    email: 'marcus.v@company.com',
    phone: '+1 (555) 774-2918',
    status: 'IN_OFFICE',
    statusText: 'In Office • NY Hub',
    manager: 'System Administrator (HR Director)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    skills: ['Terraform', 'CI/CD', 'SOC-2 Compliance', 'Security'],
    bio: 'Enforcing cloud infrastructure resilience, automated compliance audits, and zero-trust security.',
  },
  {
    id: 'EMP-105',
    name: 'Emily Zhang',
    role: 'VP of Product Management',
    department: 'Product & Design',
    location: 'San Francisco HQ (Floor 5)',
    email: 'emily.z@company.com',
    phone: '+1 (555) 629-9183',
    status: 'ON_LEAVE',
    statusText: 'On Annual Leave (Back Aug 15)',
    manager: 'Executive Board',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80',
    skills: ['Product Strategy', 'Roadmapping', 'Agile Leadership'],
    bio: 'Leading product vision, cross-functional roadmap execution, and executive customer discovery.',
  },
  {
    id: 'EMP-106',
    name: 'Chloe Bennett',
    role: 'Senior People Operations Partner',
    department: 'People Operations & HR',
    location: 'San Francisco HQ (Floor 3)',
    email: 'chloe.b@company.com',
    phone: '+1 (555) 902-3481',
    status: 'IN_OFFICE',
    statusText: 'In Office • People Ops Hub',
    manager: 'System Administrator (HR Director)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    skills: ['Talent Engagement', 'Benefits Admin', 'Employee Relations'],
    bio: 'Dedicated to fostering an inclusive culture, smooth onboarding, and exceptional benefits programs.',
  },
  {
    id: 'EMP-107',
    name: 'Lucas Morales',
    role: 'Global Payroll Specialist',
    department: 'Finance & Accounts',
    location: 'Austin Office (Floor 1)',
    email: 'lucas.m@company.com',
    phone: '+1 (555) 553-2940',
    status: 'REMOTE',
    statusText: 'Working Remote',
    manager: 'Chief Financial Officer',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80',
    skills: ['Global Payroll', 'Tax Compliance', '401k Audits', 'SAP'],
    bio: 'Managing automated payroll disbursements, tax filings, and multi-state compliance accurately.',
  },
  {
    id: 'EMP-108',
    name: 'Olivia Martinez',
    role: 'Brand & Growth Marketing Lead',
    department: 'Marketing & Sales',
    location: 'New York Hub (Floor 3)',
    email: 'olivia.m@company.com',
    phone: '+1 (555) 441-8973',
    status: 'IN_OFFICE',
    statusText: 'In Office • Marketing Lab',
    manager: 'Chief Marketing Officer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    skills: ['Brand Strategy', 'Product Marketing', 'Demand Gen', 'Content'],
    bio: 'Driving global enterprise market awareness, product launches, and customer case studies.',
  },
];

const EmployeeDirectory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedMember, setSelectedMember] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const departments = [
    'ALL',
    'Engineering & DevOps',
    'Product & Design',
    'People Operations & HR',
    'Finance & Accounts',
    'Marketing & Sales',
  ];

  const filteredMembers = DIRECTORY_DATA.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesDept = selectedDept === 'ALL' || m.department === selectedDept;
    const matchesStatus = selectedStatus === 'ALL' || m.status === selectedStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  const stats = {
    total: DIRECTORY_DATA.length,
    inOffice: DIRECTORY_DATA.filter((m) => m.status === 'IN_OFFICE').length,
    remote: DIRECTORY_DATA.filter((m) => m.status === 'REMOTE').length,
    onLeave: DIRECTORY_DATA.filter((m) => m.status === 'ON_LEAVE').length,
  };

  const copyContact = (text, label) => {
    navigator.clipboard?.writeText(text);
    setToastMsg(`Copied ${label} to clipboard!`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Company Directory & Team Roster"
        subtitle="Search colleagues, find department contacts, view office attendance presence, and connect across teams."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. STATS OVERVIEW CARDS */}
      {/* ========================================================================= */}
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
            <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">In Office Today</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.inOffice} Present</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Working Remote</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.remote} Remote</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 shadow-soft border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">On Leave Today</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats.onLeave} Away</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH & FILTER CONTROLS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 sm:p-6 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, role, email, department, or skill (e.g. React, Figma)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 w-full md:w-auto shrink-0">
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'IN_OFFICE', label: '🟢 In Office' },
              { id: 'REMOTE', label: '🔵 Remote' },
              { id: 'ON_LEAVE', label: '🟡 On Leave' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedStatus(s.id)}
                className={`px-3 py-2.5 rounded-2xl text-[11px] font-bold transition-all cursor-pointer ${
                  selectedStatus === s.id
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Department Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Department:</span>
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedDept === dept
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700'
              }`}
            >
              {dept === 'ALL' ? 'All Departments' : dept}
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. DIRECTORY GRID CARDS */}
      {/* ========================================================================= */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-12 text-center shadow-soft border border-slate-100 dark:border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">No colleagues found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search criteria or changing your department and presence filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMembers.map((member) => {
            const isSelf = member.id === 'EMP-101';
            return (
              <div
                key={member.id}
                className={`bg-white dark:bg-[#1E293B] rounded-3xl p-6 shadow-soft border transition-all duration-300 hover:shadow-lg flex flex-col justify-between group ${
                  isSelf
                    ? 'border-emerald-300 dark:border-emerald-700/70 bg-gradient-to-b from-emerald-50/20 to-transparent'
                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Top Card Row: Avatar, Name, Status Pill */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100 dark:ring-slate-700 shadow-sm"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#1E293B] ${
                            member.status === 'IN_OFFICE'
                              ? 'bg-emerald-500'
                              : member.status === 'REMOTE'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {member.name}
                          </h4>
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[9px] font-extrabold">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Presence Status Banner */}
                  <div
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold inline-flex items-center gap-1.5 mb-3 ${
                      member.status === 'IN_OFFICE'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : member.status === 'REMOTE'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    <span>{member.statusText}</span>
                  </div>

                  {/* Department & Location */}
                  <div className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{member.department}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium truncate">{member.location}</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {member.skills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                    {member.skills.length > 3 && (
                      <span className="px-1.5 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400">
                        +{member.skills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Footer: Quick Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => copyContact(member.email, 'email')}
                      title={`Copy email: ${member.email}`}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950 transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyContact(member.phone, 'phone')}
                      title={`Copy phone: ${member.phone}`}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-950 transition-colors cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedMember(member)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Profile</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. MODAL: MEMBER DETAILS & REPORTING HIERARCHY */}
      {/* ========================================================================= */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={selectedMember.avatar}
                  alt={selectedMember.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-emerald-500/20"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {selectedMember.name}
                  </h3>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {selectedMember.role}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">{selectedMember.id}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bio summary */}
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              "{selectedMember.bio}"
            </p>

            {/* Detailed Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Department</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedMember.department}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Reports To</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedMember.manager}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Work Location</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedMember.location}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Live Presence</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedMember.statusText}</span>
              </div>
            </div>

            {/* Skills & Expertise */}
            <div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block mb-2">
                Technical Skills & Focus Areas:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedMember.skills.map((s) => (
                  <span
                    key={s}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs border border-emerald-200 dark:border-emerald-800/60"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => copyContact(selectedMember.email, 'email')}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Colleague</span>
              </button>
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setToastMsg(`Opening instant chat with ${selectedMember.name}...`);
                  setTimeout(() => setToastMsg(''), 2500);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Send Slack Message</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;
