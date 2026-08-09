import React, { useState } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Building,
  Calendar,
  CheckCircle2,
  Lock,
  Save,
  Camera,
  MapPin,
  Clock,
  ShieldCheck,
  Laptop,
} from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [toastMsg, setToastMsg] = useState('');

  const [profile, setProfile] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@company.com',
    phone: '+1 (555) 019-2831',
    role: 'SUPER_ADMIN',
    department: 'People Operations & Executive Leadership',
    designation: 'Chief Technology Officer & Head of People',
    location: 'San Francisco HQ (Executive Suite)',
    employeeCode: 'NEXA-ADM-001',
    joiningDate: 'Jan 15, 2021',
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: true,
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setToastMsg('Profile information updated successfully!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    setToastMsg('Security credentials updated successfully!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <AppPageHeader
        title="Admin Profile & System Access"
        subtitle="Manage personal administrator details, executive credentials, 2FA authorization, and active sessions."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO PROFILE CARD */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative group">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
            alt="Admin Profile"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-blue-500/20 shadow-md"
          />
          <button className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700 cursor-pointer transition-all">
            <Camera className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {profile.firstName} {profile.lastName}
            </h2>
            <span className="px-3 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-extrabold uppercase">
              {profile.role}
            </span>
          </div>

          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">{profile.designation}</p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-1 font-medium">
            <span className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" />
              <span>{profile.department}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{profile.location}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Member since {profile.joiningDate}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABS NAVIGATION */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-800/80 rounded-2xl w-fit">
        {[
          { id: 'profile', label: 'Personal Information', icon: User },
          { id: 'security', label: 'Security & Password', icon: ShieldCheck },
          { id: 'sessions', label: 'Active Sessions', icon: Laptop },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-[#1E293B] text-blue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">General Information</h3>
            <p className="text-xs text-slate-400">Update administrative details and executive contact information</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">First Name</label>
                <input
                  type="text"
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Primary Email</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Direct Phone</label>
                <input
                  type="text"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Designation Title</label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Office Location</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Security & Password</h3>
            <p className="text-xs text-slate-400">Manage administrator authentication and two-factor verification</p>
          </div>

          <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Current Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Repeat new password"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Two-Factor Authentication (2FA)</div>
                <div className="text-slate-400 text-[11px]">Require authenticator app code on each login</div>
              </div>
              <input
                type="checkbox"
                checked={security.twoFactor}
                onChange={(e) => setSecurity({ ...security, twoFactor: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" />
                <span>Update Credentials</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Authorized Sessions</h3>
            <p className="text-xs text-slate-400">Devices currently logged into this administrator account</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                  <Laptop className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-slate-900 dark:text-white">Current Session (Chrome on Windows 11)</div>
                  <div className="text-slate-400 font-mono text-[10px]">IP: 192.168.1.104 • San Francisco, CA</div>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[10px]">
                ACTIVE NOW
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
