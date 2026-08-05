import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, User, Settings, LogOut, CheckCircle2, Sun, Moon, RefreshCw } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const AppPageHeader = ({
  title = 'Welcome Back, Admin',
  subtitle = null,
  onSearch = null,
  onRefresh = null,
  loading = false,
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState(DEFAULT_AVATAR);

  const loadUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
        if (u.avatar) setUserAvatar(u.avatar);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }
    const storedAvatar = localStorage.getItem('user_avatar');
    if (storedAvatar) {
      setUserAvatar(storedAvatar);
    }
  };

  useEffect(() => {
    loadUserData();
    window.addEventListener('user_profile_updated', loadUserData);
    return () => window.removeEventListener('user_profile_updated', loadUserData);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (onSearch) onSearch(val);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const displaySubtitle = subtitle || currentDateStr;

  const userInitials = currentUser
    ? `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase()
    : 'SA';

  const userFullName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : 'System Administrator';

  const userHandle = currentUser ? `@${currentUser.firstName?.toLowerCase()}` : '@system';

  return (
    <div className="mb-6">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left Side Title & Subtitle Date */}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
            {title}
          </h1>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-400 mt-0.5 truncate">
            {displaySubtitle}
          </p>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Search Bar */}
          <div className="relative min-w-[140px] sm:w-56 md:w-64 lg:w-72">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-100/70 dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800 rounded-full pl-4 pr-9 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700 shadow-inner transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 stroke-[2]" />
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            title="Refresh Data"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-slate-800 relative transition-all shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2] ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-slate-800 relative transition-all shrink-0 cursor-pointer"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 stroke-[2]" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2]" />
            )}
          </button>

          {/* Notification Icon & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifyOpen(!isNotifyOpen)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-slate-800 relative transition-all shrink-0 cursor-pointer"
            >
              <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.75]" />
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900"></span>
            </button>

            {isNotifyOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">System Notifications</h4>
                  <span className="text-[10px] bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold">2 New</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 text-xs p-2 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white leading-tight">Biometric Auto-Sync</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">124 punch logs verified.</p>
                      <span className="text-[9px] text-slate-400">Just now</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 text-xs p-2 rounded-2xl bg-slate-50 dark:bg-slate-800">
                    <Bell className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white leading-tight">Pending Leave Request</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Alex Mercer requested leave.</p>
                      <span className="text-[9px] text-slate-400">10 mins ago</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Circular Avatar Button (ONLY Circle Avatar Image) */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              title={userFullName}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all cursor-pointer shrink-0 flex items-center justify-center overflow-hidden"
            >
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="User Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#0F172A] dark:bg-slate-100 text-white dark:text-slate-900 font-bold flex items-center justify-center text-xs shadow-sm">
                  {userInitials}
                </div>
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white font-bold flex items-center justify-center text-xs">
                      {userInitials}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userFullName}</p>
                    <p className="text-[10px] font-semibold text-slate-400 truncate">{userHandle} • {currentUser?.email || 'admin@company.com'}</p>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/app/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/app/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>System Settings</span>
                  </button>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPageHeader;
