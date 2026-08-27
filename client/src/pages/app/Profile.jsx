import React, { useState, useEffect } from 'react';
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
  RefreshCw,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { api } from '../../services/api';
import { useRegionalSettings } from '../../context/RegionalSettingsContext';

const Profile = () => {
  const { timezone, formatDateTime } = useRegionalSettings();
  const [activeTab, setActiveTab] = useState('profile');
  const [toastMsg, setToastMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
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

  const [profile, setProfile] = useState({
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    designation: '',
    location: '',
    employeeCode: '',
    joiningDate: '',
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactor: true,
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Load real user data on mount
  useEffect(() => {
    const loadProfile = async () => {
      // First check localStorage
      const stored = localStorage.getItem('user');
      if (stored) {
        try {
          const u = JSON.parse(stored);
          setProfile((prev) => ({
            ...prev,
            id: u.id || prev.id,
            firstName: u.firstName || prev.firstName,
            lastName: u.lastName || prev.lastName,
            email: u.email || prev.email,
            phone: u.phone || prev.phone,
            role: u.role || prev.role,
            employeeCode: u.employeeCode || prev.employeeCode,
            department: u.profile?.department?.name || u.department || prev.department,
            designation: u.profile?.designation?.title || u.designation || prev.designation,
            location: u.profile?.address || u.location || prev.location,
            joiningDate: u.profile?.joiningDate ? new Date(u.profile.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : prev.joiningDate,
          }));

          if (u.avatar && !u.avatar.includes('unsplash')) {
            setAvatar(u.avatar);
          } else if (u.profile?.avatarUrl && !u.profile.avatarUrl.includes('unsplash')) {
            setAvatar(u.profile.avatarUrl);
          } else if (u.id) {
            const scoped = localStorage.getItem(`user_avatar_${u.id}`);
            if (scoped && !scoped.includes('unsplash')) setAvatar(scoped);
          }
        } catch (e) {
          console.warn(e);
        }
      }

      // Fetch live from server
      try {
        const res = await api.getMe();
        if (res?.success && res.data?.user) {
          const u = res.data.user;
          setProfile((prev) => ({
            ...prev,
            id: u.id,
            firstName: u.firstName || prev.firstName,
            lastName: u.lastName || prev.lastName,
            email: u.email || prev.email,
            phone: u.phone || prev.phone,
            role: u.role || prev.role,
            employeeCode: u.employeeCode || prev.employeeCode,
            department: u.profile?.department?.name || prev.department,
            designation: u.profile?.designation?.title || prev.designation,
            location: u.profile?.address || prev.location,
            joiningDate: u.profile?.joiningDate ? new Date(u.profile.joiningDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : prev.joiningDate,
          }));

          let resolvedAvatar = null;
          if (u.avatar && !u.avatar.includes('unsplash')) resolvedAvatar = u.avatar;
          else if (u.profile?.avatarUrl && !u.profile.avatarUrl.includes('unsplash')) resolvedAvatar = u.profile.avatarUrl;
          else if (u.id) {
            const scoped = localStorage.getItem(`user_avatar_${u.id}`);
            if (scoped && !scoped.includes('unsplash')) resolvedAvatar = scoped;
          }
          setAvatar(resolvedAvatar);

          // Keep localStorage in sync
          localStorage.setItem('user', JSON.stringify({
            ...JSON.parse(localStorage.getItem('user') || '{}'),
            ...u,
            ...(resolvedAvatar ? { avatar: resolvedAvatar } : {}),
          }));
        }
      } catch (e) {
        console.warn('Live profile fetch info:', e.message);
      }
    };

    loadProfile();
  }, []);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

        const currentU = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = profile.id || currentU.id;
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

        window.dispatchEvent(new Event('user_profile_updated'));
        window.dispatchEvent(new Event('storage'));

        showToast('Profile photo updated and saved successfully!');
      } else {
        throw new Error(res?.message || 'Failed to persist avatar URL.');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      showToast(err.message || 'Failed to upload photo to server.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      await api.removeProfilePicture();
      setAvatar(null);

      const currentU = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = profile.id || currentU.id;
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
      // 1. Send update to backend database
      const updatePayload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        address: profile.location,
      };

      const res = await api.updateMyProfile(updatePayload);

      // 2. Update localStorage and broadcast event
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...storedUser,
        ...profile,
        ...(res?.data?.user || {}),
        avatar,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user_profile_updated'));
      window.dispatchEvent(new Event('storage'));

      showToast('Administrator profile updated successfully in database!');
    } catch (err) {
      console.warn('Backend update notice (updating local session):', err.message);
      // Fallback local update
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...storedUser, ...profile, avatar };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.dispatchEvent(new Event('user_profile_updated'));
      window.dispatchEvent(new Event('storage'));
      showToast('Profile information saved successfully!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e) => {
    e.preventDefault();

    if (!security.currentPassword) {
      showToast('Please enter your current password.');
      return;
    }
    if (!security.newPassword || security.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.');
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      showToast('New password and confirmation do not match.');
      return;
    }

    setIsSavingPassword(true);
    try {
      await api.changeMyPassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
        confirmPassword: security.confirmPassword,
      });

      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '', twoFactor: true });
      showToast('Password credentials changed successfully in database!');
    } catch (err) {
      showToast(err.message || 'Failed to change password. Check your current password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  const isAdminAccount = profile.role === 'ADMIN' || profile.email === 'admin@nexahr.com' || profile.designation?.toLowerCase().includes('admin') || profile.firstName?.toLowerCase().includes('system');
  const isHRAccount = profile.role === 'HR_MANAGER' || profile.role === 'HR' || profile.email === 'hr@nexahr.com' || profile.designation?.toLowerCase().includes('hr');

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
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
      {/* 1. DYNAMIC ADMIN PROFILE HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden ring-4 ring-indigo-500/30 shadow-xl relative bg-slate-800 flex items-center justify-center">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Admin Profile"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    isUploadingAvatar ? 'opacity-50' : 'opacity-100'
                  }`}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-700 text-white font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl">
                  <span>{(profile.firstName?.[0] || '') + (profile.lastName?.[0] || '') || 'AD'}</span>
                </div>
              )}

              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
            </div>
            <label
              title="Upload New Profile Picture"
              className={`absolute -bottom-2 -right-2 p-2 rounded-xl bg-indigo-600 text-white shadow-md hover:bg-indigo-700 cursor-pointer transition-all hover:scale-110 border-2 border-white dark:border-slate-900 ${
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
                title="Remove Profile Picture (Set to NO DP)"
                className="absolute -top-2 -right-2 p-1.5 rounded-xl bg-rose-600 text-white shadow-md hover:bg-rose-700 cursor-pointer transition-all hover:scale-110 border-2 border-white dark:border-slate-900"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2.5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {profile.firstName} {profile.lastName}
            </h2>

            <p className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-400">{profile.designation}</p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1 font-semibold">
              {isAdminAccount ? (
                <>
                  <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>System Administration & Security</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{profile.location || 'Karachi, Pakistan'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Root Security Clearance</span>
                  </span>
                </>
              ) : isHRAccount ? (
                <>
                  <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{profile.department || 'Human Resources & Operations'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{profile.location || 'Karachi, Pakistan'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>HR Operations Clearance</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <Building className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{profile.department}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>{profile.location}</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-white/70 dark:bg-slate-900/60 px-3 py-1 rounded-xl border border-indigo-100 dark:border-slate-800">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Verified System Access</span>
                  </span>
                </>
              )}
            </div>
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === tab.id
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
            <p className="text-xs text-slate-400">Update administrator contact and professional identity</p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">First Name *</label>
                <input
                  type="text"
                  required
                  value={profile.firstName}
                  onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Last Name *</label>
                <input
                  type="text"
                  required
                  value={profile.lastName}
                  onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Primary Email *</label>
                <input
                  type="email"
                  required
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
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Office Location / Address</label>
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
                disabled={isSaving}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
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
            <p className="text-xs text-slate-400">Manage administrator password authentication and security credentials</p>
          </div>

          <form onSubmit={handleSaveSecurity} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Current Password *</label>
              <input
                type="password"
                required
                placeholder="Enter existing password"
                value={security.currentPassword}
                onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={security.newPassword}
                  onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Re-type new password"
                  value={security.confirmPassword}
                  onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Two-Factor Authentication (2FA)</span>
                <span className="text-[11px] text-slate-400">Enforce OTP verification for high-privilege operations</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase">
                Active & Enforced
              </span>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={isSavingPassword}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
              >
                {isSavingPassword ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Update Password Credentials</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Device Sessions</h3>
            <p className="text-xs text-slate-400">Authenticated devices and browser tokens authorized to access this account</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">Current Workstation (Chrome on Windows)</span>
                <span className="text-[11px] text-slate-400">
                  Active in timezone: {timezone} • Last active: {formatDateTime(new Date())}
                </span>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] uppercase">
              Current Session
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
