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
  HeartHandshake,
  ShieldCheck,
  ShieldAlert,
  Check,
  RefreshCw,
  Landmark,
  FileCheck,
  Trash2,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { api } from '../../services/api';

// Helper to reliably parse Emergency Contact string into individual fields
const parseEmergencyInfo = (rawStr, fallbackName = '', fallbackRel = 'Parent / Guardian', fallbackPhone = '') => {
  if (!rawStr || typeof rawStr !== 'string') {
    return {
      emergencyName: fallbackName,
      emergencyRelation: fallbackRel,
      emergencyPhone: fallbackPhone,
    };
  }

  // Matches formatted string: "Muhammad Akram (Parent / Guardian) - +92 300 2983659" or "Elena Mercer (Spouse) - 03001234567"
  const fullMatch = rawStr.match(/^(.+?)\s*\((.+?)\)\s*[-:]\s*(.+)$/);
  if (fullMatch) {
    return {
      emergencyName: fullMatch[1].trim(),
      emergencyRelation: fullMatch[2].trim(),
      emergencyPhone: fullMatch[3].trim(),
    };
  }

  // Check if rawStr is just phone number (e.g. "+92 300 2983659" or "03001234567")
  const isPurePhone = /^[+\d\s()-]+$/.test(rawStr.trim());
  if (isPurePhone) {
    return {
      emergencyName: fallbackName,
      emergencyRelation: fallbackRel,
      emergencyPhone: rawStr.trim(),
    };
  }

  return {
    emergencyName: fallbackName || rawStr.trim(),
    emergencyRelation: fallbackRel,
    emergencyPhone: fallbackPhone,
  };
};

const formatEmploymentType = (type) => {
  if (!type) return 'Full-Time / Permanent';
  const clean = String(type).toUpperCase().trim();
  if (clean === 'FULL_TIME' || clean.includes('FULL-TIME')) return 'Full-Time / Permanent';
  if (clean === 'PART_TIME' || clean.includes('PART-TIME')) return 'Part-Time';
  if (clean === 'CONTRACT' || clean.includes('CONTRACT')) return 'Contractor';
  if (clean === 'INTERNSHIP' || clean.includes('INTERN')) return 'Internship';
  return type;
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Not Available';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const Profile = () => {
  const [toastMsg, setToastMsg] = useState('');
  const [avatar, setAvatar] = useState(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      if (u.avatar && !u.avatar.includes('unsplash')) return u.avatar;
      if (u.profile?.avatarUrl && !u.profile.avatarUrl.includes('unsplash')) return u.profile.avatarUrl;
      if (u.id) {
        const scoped = localStorage.getItem(`user_avatar_${u.id}`);
        if (scoped && !scoped.includes('unsplash')) return scoped;
      }
    } catch {}
    return null;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Profile Form State - fully dynamic
  const [formData, setFormData] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    designation: '',
    department: '',
    location: '',
    empCode: '',
    joinDate: '',
    employmentType: 'Full-Time / Permanent',
    reportingManager: '',
    shift: 'General Shift (09:00 AM – 05:30 PM)',
    dob: '',
    gender: 'Male',
    bloodGroup: 'O+ Positive',
    address: '',
    emergencyName: '',
    emergencyRelation: 'Parent / Guardian',
    emergencyPhone: '',
    // Payroll & Bank Details
    bankName: 'Standard Chartered Bank (Corporate Wing)',
    accountNumber: '',
    branchCode: '0142 (Corporate Wing)',
    payoutMethod: 'Direct Bank Transfer',
    ntnNumber: '',
    taxStatus: 'Verified Active Filer',
    providentFund: 'Enrolled (8.33% Tier)',
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const populateUserData = (u) => {
    const isAdmin = u.role === 'ADMIN' || u.email === 'admin@nexahr.com';
    const isHR = u.role === 'HR_MANAGER' || u.role === 'HR' || u.email === 'hr@nexahr.com';

    const userAddr = u.profile?.address || u.address || u.location || '';
    const parsedEmergency = parseEmergencyInfo(
      u.profile?.emergencyContact || u.emergencyContact,
      u.emergencyName,
      u.emergencyRelation,
      u.emergencyPhone
    );

    const empCode = u.employeeCode || u.empCode || (isAdmin ? 'ADM-001' : isHR ? 'HR-101' : '');
    const empNumDigits = (empCode || '101').replace(/[^0-9]/g, '').padStart(6, '0');

    const resolvedJoinDate = u.profile?.joiningDate || u.joiningDate || u.createdAt;
    const rawShift = u.profile?.shift || u.shift || 'General Shift (09:00 AM – 05:30 PM)';
    const rawEmpType = u.profile?.employmentType || u.employmentType || 'FULL_TIME';

    const defaultDesignation = isAdmin
      ? 'System Administrator'
      : isHR
      ? 'HR Manager'
      : 'Operations Executive';
    const defaultDepartment = isAdmin
      ? 'Executive & Technology'
      : isHR
      ? 'Human Resources'
      : 'Operations';
    const defaultManager = isAdmin
      ? 'Board of Directors / Executive Committee'
      : isHR
      ? 'Chief People Officer'
      : 'HR Operations';

    const resolvedBank = u.bankDetails || {};
    const bankName = resolvedBank.bankName || u.bankName || 'Standard Chartered Bank (Corporate Wing)';
    const accountNumber = resolvedBank.accountNumber || u.accountNumber || `PK72SCBL000000${empNumDigits}01`;
    const branchCode = resolvedBank.branchCode || u.branchCode || '0142 (Corporate Wing)';
    const payoutMethod = resolvedBank.payoutMethod || u.payoutMethod || 'Direct Bank Transfer';
    const taxStatus = resolvedBank.taxStatus || u.taxStatus || 'Verified Active Filer';
    const ntnNumber = resolvedBank.ntnNumber || u.ntnNumber || `NTN-9842${empNumDigits.slice(-3)}-7`;
    const providentFund = resolvedBank.providentFund || u.providentFund || 'Enrolled (8.33% Tier)';

    setFormData((prev) => ({
      ...prev,
      id: u.id || prev.id,
      firstName: u.firstName ?? prev.firstName,
      lastName: u.lastName ?? prev.lastName,
      email: u.email ?? prev.email,
      phone: u.phone ?? prev.phone,
      role: u.role || prev.role,
      designation: u.profile?.designation?.title || u.designation || prev.designation || defaultDesignation,
      department: u.profile?.department?.name || u.department || prev.department || defaultDepartment,
      address: userAddr,
      location: userAddr,
      empCode: empCode || prev.empCode,
      joinDate: resolvedJoinDate ? formatDate(resolvedJoinDate) : prev.joinDate,
      employmentType: formatEmploymentType(rawEmpType),
      reportingManager: u.reportingManager || prev.reportingManager || defaultManager,
      shift: rawShift,
      dob: u.profile?.dateOfBirth ? u.profile.dateOfBirth.split('T')[0] : (u.dob ? u.dob.split('T')[0] : prev.dob),
      gender: u.profile?.gender || u.gender || prev.gender || 'Male',
      bloodGroup: u.profile?.bloodGroup || u.bloodGroup || prev.bloodGroup || 'O+ Positive',
      emergencyName: parsedEmergency.emergencyName || prev.emergencyName,
      emergencyRelation: parsedEmergency.emergencyRelation || prev.emergencyRelation || 'Parent / Guardian',
      emergencyPhone: parsedEmergency.emergencyPhone || prev.emergencyPhone,
      bankName,
      accountNumber,
      branchCode,
      payoutMethod,
      taxStatus,
      ntnNumber,
      providentFund,
    }));

    if (u.avatar && !u.avatar.includes('unsplash')) {
      setAvatar(u.avatar);
    } else if (u.profile?.avatarUrl && !u.profile.avatarUrl.includes('unsplash')) {
      setAvatar(u.profile.avatarUrl);
    } else if (u.id) {
      const scoped = localStorage.getItem(`user_avatar_${u.id}`);
      if (scoped && !scoped.includes('unsplash')) setAvatar(scoped);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      // 1. Instantly populate from localStorage cache to prevent flicker
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const u = JSON.parse(storedUser);
          populateUserData(u);
        } catch (e) {
          console.warn('Cached user parse error:', e);
        }
      }

      // 2. Fetch live user details & relations from backend database
      try {
        const res = await api.getMe();
        if (res?.success && res.data?.user) {
          const liveUser = res.data.user;
          populateUserData(liveUser);

          // Update localStorage cache with freshest DB state
          const currentLocal = JSON.parse(localStorage.getItem('user') || '{}');
          localStorage.setItem('user', JSON.stringify({
            ...currentLocal,
            ...liveUser,
            address: liveUser.profile?.address || liveUser.address,
            emergencyContact: liveUser.profile?.emergencyContact || liveUser.emergencyContact,
          }));
        }
      } catch (err) {
        console.warn('Live profile fetch error:', err.message);
      }
    };

    loadData();
  }, []);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Fast preview
    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);
    setIsUploadingAvatar(true);
    showToast('Uploading profile picture to cloud storage...');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('avatar', file);

      const res = await api.uploadProfilePicture(uploadFormData);

      if (res?.success && res.data?.avatarUrl) {
        const persistedUrl = res.data.avatarUrl;
        setAvatar(persistedUrl);

        // Update local session storage
        const currentU = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = formData.id || currentU.id;
        if (userId) {
          localStorage.setItem(`user_avatar_${userId}`, persistedUrl);
        }
        localStorage.removeItem('user_avatar');

        const updatedUser = {
          ...currentU,
          avatar: persistedUrl,
          profile: {
            ...(currentU.profile || {}),
            avatarUrl: persistedUrl,
          },
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Dispatch events for real-time sync across navbar, headers & sidebars
        window.dispatchEvent(new Event('user_profile_updated'));
        window.dispatchEvent(new Event('storage'));

        showToast('Profile photo uploaded and saved successfully!');
      } else {
        throw new Error(res?.message || 'Failed to persist avatar URL.');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      showToast(err.message || 'Failed to upload photo to server.');
    } finally {
      setIsUploadingAvatar(false);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      await api.removeProfilePicture();
      setAvatar(null);

      const currentU = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = formData.id || currentU.id;
      if (userId) {
        localStorage.removeItem(`user_avatar_${userId}`);
      }
      localStorage.removeItem('user_avatar');

      const updatedUser = {
        ...currentU,
        avatar: null,
        profile: {
          ...(currentU.profile || {}),
          avatarUrl: null,
        },
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      window.dispatchEvent(new Event('user_profile_updated'));
      window.dispatchEvent(new Event('storage'));

      showToast('Profile photo removed successfully!');
    } catch (e) {
      console.error('Avatar removal error:', e);
      showToast(e.message || 'Failed to remove photo.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Clean, structured emergency contact summary
      const contactSummary = formData.emergencyName
        ? `${formData.emergencyName} (${formData.emergencyRelation || 'Parent / Guardian'}) - ${formData.emergencyPhone}`
        : formData.emergencyPhone;

      const updatePayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dateOfBirth: formData.dob || null,
        emergencyContact: contactSummary,
      };

      const res = await api.updateMyProfile(updatePayload);

      if (res?.success && res.data?.user) {
        populateUserData(res.data.user);
      }

      // Update local storage and broadcast
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        ...formData,
        address: formData.address,
        location: formData.address,
        emergencyName: formData.emergencyName,
        emergencyRelation: formData.emergencyRelation,
        emergencyPhone: formData.emergencyPhone,
        emergencyContact: contactSummary,
        ...(res?.data?.user || {}),
        avatar,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user_profile_updated'));
      window.dispatchEvent(new Event('storage'));

      showToast('Personal information & Emergency Contact updated successfully in database!');
    } catch (err) {
      console.warn('Backend update notice (saving locally):', err.message);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        ...formData,
        address: formData.address,
        location: formData.address,
        emergencyName: formData.emergencyName,
        emergencyRelation: formData.emergencyRelation,
        emergencyPhone: formData.emergencyPhone,
        avatar,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user_profile_updated'));
      window.dispatchEvent(new Event('storage'));
      showToast('Profile information saved successfully!');
    } finally {
      setIsSaving(false);
    }
  };

  const isGuest =
    formData.email?.toLowerCase() === 'hr@nexahr.com' ||
    formData.email?.toLowerCase() === 'user@nexahr.com' ||
    formData.email?.toLowerCase() === 'admin@nexahr.com' ||
    localStorage.getItem('isGuest') === 'true';

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (isGuest) {
      showToast('Password cannot be changed for Guest / Demo accounts.');
      return;
    }

    if (!passwords.current) {
      showToast('Please enter your current password.');
      return;
    }
    if (!passwords.newPass || passwords.newPass.length < 6) {
      showToast('New password must be at least 6 characters long.');
      return;
    }
    if (passwords.newPass !== passwords.confirmPass) {
      showToast('New passwords do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.changeMyPassword({
        currentPassword: passwords.current,
        newPassword: passwords.newPass,
        confirmPassword: passwords.confirmPass,
      });
      setPasswords({ current: '', newPass: '', confirmPass: '' });
      showToast('Password credentials updated successfully in database!');
    } catch (err) {
      showToast(err.message || 'Failed to update password. Check your current password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="My Profile"
        subtitle="Manage your personal profile, verified employment details, and security credentials."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO PROFILE CARD (ROYAL VIOLET / PURPLE GRADIENT AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-center gap-6">
          {/* Avatar with Camera upload button */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-white/20 bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-2xl flex items-center justify-center text-white font-black text-2xl sm:text-3xl relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt="User Avatar"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isUploadingAvatar ? 'opacity-50' : 'opacity-100'
                  }`}
                />
              ) : (
                <span className="select-none tracking-wider">
                  {(formData.firstName?.[0] || '') + (formData.lastName?.[0] || '') || 'HR'}
                </span>
              )}

              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <label
              title="Upload New Photo"
              className={`absolute bottom-0 right-0 p-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg cursor-pointer transition-all group-hover:scale-110 border-2 border-slate-900 ${
                isUploadingAvatar ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                onChange={handleAvatarChange}
                disabled={isUploadingAvatar}
                className="hidden"
              />
            </label>
            {avatar && !isUploadingAvatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                title="Remove Photo (Set to NO DP)"
                className="absolute top-0 right-0 p-1.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white shadow-md cursor-pointer transition-all border-2 border-slate-900"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* User Details & Identity Badges */}
          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-white leading-tight">
                {formData.firstName || 'Administrator'} {formData.lastName || ''}
              </h2>
              {formData.empCode && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{formData.empCode}</span>
                </span>
              )}
              {formData.employmentType && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-semibold border border-white/10">
                  {formData.employmentType}
                </span>
              )}
            </div>

            <p className="text-sm font-semibold text-slate-300">
              {formData.designation || 'System Administrator'} <span className="text-slate-500">•</span> {formData.department || 'Executive & Technology'}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>{formData.email || 'Email Not Added'}</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{formData.phone || 'Phone Not Added'}</span>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>{formData.address || formData.location || 'Address Not Added'}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. GRID LAYOUT: PERSONAL (EDITABLE), SECURITY, EMPLOYMENT & BANK DETAILS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: PERSONAL DETAILS & EMERGENCY CONTACT (EDITABLE - 2 COLS WIDE) */}
        <div className="lg:col-span-2 space-y-6">
          {/* CARD 2: PERSONAL DETAILS & EMERGENCY CONTACT (EDITABLE FORM) */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Personal Information</h3>
                  <p className="text-xs text-slate-400 font-medium">Update your contact details, residential address, and emergency contact point</p>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                Editable
              </span>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-5 text-xs">
              {/* Primary Personal Info */}
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
                    className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all cursor-pointer"
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
                  placeholder="e.g. Block-2, Gulshan-e-Iqbal, Karachi"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value, location: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              {/* ========================================================================= */}
              {/* EMERGENCY CONTACT POINT SECTION */}
              {/* ========================================================================= */}
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Emergency Contact Point</h3>
                    <p className="text-xs text-slate-400 font-medium">Designated next-of-kin or emergency respondent</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Contact Person Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Muhammad Akram"
                      value={formData.emergencyName}
                      onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Relationship</label>
                    <select
                      value={formData.emergencyRelation}
                      onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Sibling">Sibling (Brother / Sister)</option>
                      <option value="Child">Child (Son / Daughter)</option>
                      <option value="Relative">Family Relative</option>
                      <option value="Friend">Friend / Colleague</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Emergency Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +92 300 2983659"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    />
                  </div>
                </div>
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
                  <p className="text-xs text-slate-400 font-medium">Protect your administrator & HR portal account</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                <span>2FA Active</span>
              </span>
            </div>

            {isGuest && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-700 dark:text-amber-300">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <h4 className="font-bold text-xs">Guest Demo Protection Active</h4>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">
                    Modifying passwords and credentials is restricted in Guest / Demo mode to ensure uninterrupted demo access for all users.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Current Password *</label>
                  <input
                    type="password"
                    required
                    disabled={isGuest}
                    placeholder={isGuest ? 'Disabled for Demo' : '••••••••'}
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-2xl border font-medium outline-none transition-all ${
                      isGuest
                        ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">New Password *</label>
                  <input
                    type="password"
                    required
                    disabled={isGuest}
                    placeholder={isGuest ? 'Disabled for Demo' : 'Min 6 characters'}
                    value={passwords.newPass}
                    onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-2xl border font-medium outline-none transition-all ${
                      isGuest
                        ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    disabled={isGuest}
                    placeholder={isGuest ? 'Disabled for Demo' : 'Repeat new password'}
                    value={passwords.confirmPass}
                    onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                    className={`w-full px-4 py-2.5 rounded-2xl border font-medium outline-none transition-all ${
                      isGuest
                        ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                    }`}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-400">Requires minimum 6 characters with mixed symbols</span>
                <button
                  type="submit"
                  disabled={isSavingPassword || isGuest}
                  className={`px-6 py-2.5 rounded-2xl font-bold transition-all shadow-md flex items-center gap-2 ${
                    isGuest
                      ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-slate-900 hover:bg-slate-800 dark:bg-rose-600 dark:hover:bg-rose-500 text-white cursor-pointer hover:scale-105 disabled:opacity-50'
                  }`}
                >
                  {isSavingPassword ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                  <span>{isGuest ? 'Password Locked for Demo' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: READ-ONLY EMPLOYMENT & BANK DETAILS (1 COL WIDE) */}
        <div className="space-y-6">
          {/* CARD 1: EMPLOYMENT INFORMATION (READ-ONLY) */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Employment Details</h3>
                  <p className="text-xs text-slate-400 font-medium">Verified corporate employment details</p>
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
                <span className="font-bold text-slate-800 dark:text-slate-200">{formData.department || 'Human Resources'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Designation</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formData.designation || 'HR Manager'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Joining Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formData.joinDate || 'Not Available'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Reporting Authority</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 text-right">{formData.reportingManager || 'Executive Management'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Assigned Shift</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">{formData.shift || 'General Shift'}</span>
              </div>
            </div>
          </div>

          {/* CARD 3: BANK DETAILS (VERIFIED BY HR / ACCOUNTS) */}
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-7 shadow-soft border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Bank Details</h3>
                  <p className="text-xs text-slate-400 font-medium">Corporate salary account</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified by HR</span>
              </span>
            </div>

            {/* Clean Key-Value List */}
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Bank Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{formData.bankName || 'Standard Chartered Bank'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Account Title</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {formData.firstName || 'Administrator'} {formData.lastName || ''}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Account / IBAN</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">{formData.accountNumber || 'PK72SCBL000000101'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Branch Code</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-[11px]">{formData.branchCode || '0142 (Corporate Wing)'}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 font-semibold">Payout Method</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{formData.payoutMethod || 'Direct Bank Transfer'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
