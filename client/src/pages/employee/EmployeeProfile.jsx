import React, { useState, useEffect } from 'react';
import {
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Key,
  CheckCircle2,
  Save,
  Building,
  Briefcase,
  Calendar,
  Lock,
  FileText,
  CreditCard,
  Download,
  Eye,
  AlertCircle,
  Clock,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Check,
  RefreshCw,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const EmployeeProfile = () => {
  const [toastMsg, setToastMsg] = useState('');
  const [avatar, setAvatar] = useState(() => localStorage.getItem('user_avatar') || DEFAULT_AVATAR);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Profile Form State
  const [formData, setFormData] = useState({
    firstName: 'Alex',
    lastName: 'Mercer',
    email: 'employee@company.com',
    phone: '+1 (555) 438-9201',
    designation: 'Senior Full-Stack Engineer',
    department: 'Engineering & DevOps',
    location: 'Silicon Valley, CA (HQ)',
    empCode: 'EMP-101',
    joinDate: 'Mar 15, 2022',
    employmentType: 'Full-Time / Permanent',
    reportingManager: 'Sarah Jenkins (VP of Engineering)',
    shift: 'General Shift (09:00 AM – 05:30 PM)',
    dob: '1992-06-18',
    gender: 'Male',
    bloodGroup: 'O+ Positive',
    address: '742 Evergreen Terrace, Palo Alto, CA 94301',
    emergencyName: 'Elena Mercer',
    emergencyRelation: 'Spouse',
    emergencyPhone: '+1 (555) 891-2244',
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          firstName: u.firstName || prev.firstName,
          lastName: u.lastName || prev.lastName,
          email: u.email || prev.email,
          phone: u.phone || prev.phone,
          designation: u.designation || prev.designation,
          department: u.department || prev.department,
          address: u.address || prev.address,
        }));
      } catch (e) {
        console.warn(e);
      }
    }
    const storedAvatar = localStorage.getItem('user_avatar');
    if (storedAvatar) setAvatar(storedAvatar);
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setAvatar(base64Image);
        localStorage.setItem('user_avatar', base64Image);
        window.dispatchEvent(new Event('user_profile_updated'));
        showToast('Profile avatar updated successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      const updatedUser = {
        ...formData,
        avatar,
        role: 'EMPLOYEE',
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user_profile_updated'));
      setIsSaving(false);
      showToast('Personal information updated successfully!');
    }, 400);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwords.current) {
      showToast('Please enter your current password.');
      return;
    }
    if (!passwords.newPass || passwords.newPass.length < 6) {
      showToast('New password must be at least 6 characters.');
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      showToast('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    setTimeout(() => {
      setPasswords({ current: '', newPass: '', confirmPass: '' });
      setIsSavingPassword(false);
      showToast('Password credentials updated successfully!');
    }, 500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Profile"
        subtitle="Manage your personal dossier, verified employment information, and security credentials."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO PROFILE CARD (SLEEK DASHBOARD AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 shadow-2xl border border-slate-700/50">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-6">
          {/* Avatar with Camera upload button */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white/20 bg-slate-800 shadow-2xl flex items-center justify-center text-white text-2xl font-bold">
              <img src={avatar} alt="User Avatar" className="w-full h-full object-cover" />
            </div>
            <label
              title="Upload New Photo"
              className="absolute bottom-0 right-0 p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer transition-all group-hover:scale-110 border-2 border-slate-900"
            >
              <Camera className="w-3.5 h-3.5" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          {/* User Details & Identity Badges */}
          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {formData.firstName} {formData.lastName}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{formData.empCode}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-semibold border border-white/10">
                {formData.employmentType}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-300">
              {formData.designation} <span className="text-slate-500">•</span> {formData.department}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formData.email}</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{formData.phone}</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{formData.location}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRID LAYOUT: EMPLOYMENT, PERSONAL, EMERGENCY & SECURITY */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: PERSONAL DETAILS (EDITABLE - 2 COLS WIDE) */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD 2: PERSONAL DETAILS (EDITABLE FORM) */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Personal Information</h3>
                  <p className="text-xs text-slate-400 font-medium">Update your contact information and residential address</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                Editable
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Work Email (Registered)</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 text-slate-400 font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Primary Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Non-Binary">Non-Binary</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Residential Street Address *</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="flex items-center justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold transition-all hover:scale-105 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* CARD 4: SECURITY / CHANGE PASSWORD */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Security & Password</h3>
                  <p className="text-xs text-slate-400 font-medium">Protect your employee self-service account</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                <span>2FA Active</span>
              </span>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Current Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">New Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min 6 characters"
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Repeat new password"
                    value={passwords.confirmPass}
                    onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Requires minimum 6 characters with mixed symbols</span>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white font-bold transition-all hover:scale-105 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSavingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: READ-ONLY EMPLOYMENT & EMERGENCY CONTACT (1 COL WIDE) */}
        <div className="space-y-6">
          {/* CARD 1: EMPLOYMENT INFORMATION (READ-ONLY DOSSIER) */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Employment Dossier</h3>
                  <p className="text-xs text-slate-400 font-medium">Corporate HR verified data</p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                Read-Only
              </span>
            </div>

            {/* Clean Key-Value List */}
            <div className="space-y-3.5 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Department</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formData.department}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Designation</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formData.designation}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Joining Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formData.joinDate}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Reporting Manager</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-right">{formData.reportingManager}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Assigned Shift</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">{formData.shift}</span>
              </div>
            </div>
          </div>

          {/* CARD 3: EMERGENCY CONTACT (HIGHLIGHTED CARD) */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Emergency Contact</h3>
                <p className="text-xs text-slate-400 font-medium">Designated emergency contact point</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-900 dark:text-white">{formData.emergencyName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200">
                  {formData.emergencyRelation}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-700 dark:text-slate-300 pt-1">
                <Phone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{formData.emergencyPhone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
