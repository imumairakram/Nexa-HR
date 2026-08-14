import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  CheckCircle2,
  Sun,
  Moon,
  RefreshCw,
  X,
  Check,
  Trash2,
  Clock,
  Users,
  FileText,
  Building2,
  DollarSign,
  Sliders,
  LayoutDashboard,
  Megaphone,
  Award,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSec = Math.floor((now - date) / 1000);
  if (diffInSec < 60) return 'Just now';
  if (diffInSec < 3600) return `${Math.floor(diffInSec / 60)} mins ago`;
  if (diffInSec < 86400) return `${Math.floor(diffInSec / 3600)} hours ago`;
  if (diffInSec < 172800) return 'Yesterday';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Biometric Gateway Active',
    desc: 'Hardware attendance engine is online and syncing live logs.',
    time: '5 mins ago',
    type: 'success',
    read: false,
    link: '/app/attendance'
  },
  {
    id: 2,
    title: 'Pending Leave Approvals',
    desc: '3 employees submitted medical and casual time-off applications.',
    time: '20 mins ago',
    type: 'warning',
    read: false,
    link: '/app/leaves'
  },
  {
    id: 3,
    title: 'Employee Onboarding',
    desc: 'New engineering hire Sarah Jenkins completed tax profile.',
    time: '1 hour ago',
    type: 'info',
    read: true,
    link: '/app/employees'
  }
];

const SEARCH_SHORTCUTS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard', category: 'Pages' },
  { label: 'New Employee Onboarding', icon: User, path: '/app/hr/new-employee', category: 'HR' },
  { label: 'Employees Directory', icon: Users, path: '/app/employees', category: 'HR' },
  { label: 'Role & Permissions', icon: Sliders, path: '/app/hr/roles', category: 'HR' },
  { label: 'Department Management', icon: Building2, path: '/app/departments', category: 'HR' },
  { label: 'Designations', icon: Building2, path: '/app/hr/designation', category: 'HR' },
  { label: 'Attendance & Logs', icon: Clock, path: '/app/attendance', category: 'Attendance' },
  { label: 'Employment Status', icon: User, path: '/app/employment-status', category: 'Attendance' },
  { label: 'Leave Requests', icon: FileText, path: '/app/leaves', category: 'Leaves' },
  { label: 'Weekly Holiday', icon: Clock, path: '/app/holiday/weekly', category: 'Leaves' },
  { label: 'Public Holiday', icon: Clock, path: '/app/holiday/public', category: 'Leaves' },
  { label: 'Leave Policy', icon: FileText, path: '/app/leave-policy', category: 'Leaves' },
  { label: 'Calculate Payroll', icon: DollarSign, path: '/app/payroll/calculate', category: 'Payroll' },
  { label: 'Payslip List', icon: FileText, path: '/app/payroll/payslips', category: 'Payroll' },
  { label: 'Payroll Management', icon: DollarSign, path: '/app/payroll', category: 'Payroll' },
  { label: 'Accounts & Ledger', icon: DollarSign, path: '/app/accounts', category: 'Finance' },
  { label: 'Exportable Reports', icon: FileText, path: '/app/reports', category: 'Analytics' },
  { label: 'Announcements', icon: Megaphone, path: '/app/announcement', category: 'Operations' },
  { label: 'Awards & Recognition', icon: Award, path: '/app/award', category: 'Operations' },
  { label: 'Project Portfolio', icon: Building2, path: '/app/project', category: 'Operations' },
  { label: 'Recruitment - Job Desk', icon: Briefcase, path: '/app/recruitment/desk', category: 'Recruitment' },
  { label: 'Recruitment - Active Jobs', icon: Users, path: '/app/recruitment/jobs', category: 'Recruitment' },
  { label: 'Recruitment - Applications', icon: FileText, path: '/app/recruitment/applications', category: 'Recruitment' },
  { label: 'Recruitment - Job Board', icon: Layers, path: '/app/recruitment/board', category: 'Recruitment' },
  { label: 'My Profile', icon: User, path: '/app/profile', category: 'System' },
  { label: 'System Settings', icon: Sliders, path: '/app/settings', category: 'System' }
];

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userAvatar, setUserAvatar] = useState(DEFAULT_AVATAR);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const searchRef = useRef(null);
  const notifyRef = useRef(null);
  const profileRef = useRef(null);
  const inputRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchLiveNotifications = async () => {
    try {
      const res = await api.getNotifications();
      if (res?.success && res.data?.notifications) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount ?? res.data.notifications.filter((n) => !n.isRead).length);
      }
    } catch (e) {
      // Gracefully maintain current list if token not ready
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 15000);
    window.addEventListener('nexahr_notification_updated', fetchLiveNotifications);
    window.addEventListener('focus', fetchLiveNotifications);
    return () => {
      clearInterval(interval);
      window.removeEventListener('nexahr_notification_updated', fetchLiveNotifications);
      window.removeEventListener('focus', fetchLiveNotifications);
    };
  }, []);

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

  // Click outside & keyboard shortcuts handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(e.target)) {
        setIsNotifyOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K or '/' to focus search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifyOpen(false);
        setIsProfileOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setIsSearchOpen(true);
    if (onSearch) onSearch(val);
  };

  const clearSearch = () => {
    setSearchQuery('');
    if (onSearch) onSearch('');
  };

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    triggerToast('Refreshing data...');
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 700);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      triggerToast('All notifications marked as read');
      window.dispatchEvent(new Event('nexahr_notification_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await api.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      triggerToast('Notifications cleared');
      window.dispatchEvent(new Event('nexahr_notification_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await api.markNotificationRead(notif.id);
        setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        window.dispatchEvent(new Event('nexahr_notification_updated'));
      }
    } catch (err) {
      console.error(err);
    }
    setIsNotifyOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  const dismissNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await api.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new Event('nexahr_notification_updated'));
    } catch (err) {
      console.error(err);
    }
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

  // Filter shortcuts based on searchQuery
  const filteredShortcuts = SEARCH_SHORTCUTS.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-6 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Side Title & Subtitle Date */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {displaySubtitle}
          </p>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Search Bar & Interactive Palette */}
          <div className="relative min-w-[140px] sm:w-56 md:w-64 lg:w-72" ref={searchRef}>
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={handleSearchChange}
                className="w-full bg-slate-100/70 dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800 rounded-full pl-4 pr-14 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700 shadow-inner transition-all"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    onClick={clearSearch}
                    className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded-md pointer-events-none">
                    ⌘K
                  </span>
                )}
                <Search className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
              </div>
            </div>

            {/* Quick Search Palette Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 sm:right-auto sm:w-80 mt-2 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {searchQuery ? 'Search Navigation' : 'Quick Navigation'}
                  </span>
                  <span className="text-[10px] text-slate-400">Esc to close</span>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {filteredShortcuts.length > 0 ? (
                    filteredShortcuts.map((item, idx) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            navigate(item.path);
                            setIsSearchOpen(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-2xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              <IconComp className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
                              {item.label}
                            </span>
                          </div>
                          <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all" />
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium">
                      No matching pages found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefreshClick}
            title="Refresh Data"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-slate-800 relative transition-all shrink-0 cursor-pointer group active:scale-95"
          >
            <RefreshCw
              className={`w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2] transition-transform duration-300 ${
                isRefreshing || loading ? 'animate-spin text-indigo-600 dark:text-indigo-400' : 'group-hover:rotate-45'
              }`}
            />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-slate-800 relative transition-all shrink-0 cursor-pointer group active:scale-95"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 stroke-[2] transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[2] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
            )}
          </button>

          {/* Notification Icon & Dropdown */}
          <div className="relative" ref={notifyRef}>
            <button
              onClick={() => setIsNotifyOpen(!isNotifyOpen)}
              title="Notifications"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-slate-800 relative transition-all shrink-0 cursor-pointer active:scale-95"
            >
              <Bell className="w-4 h-4 text-slate-700 dark:text-slate-300 stroke-[1.75]" />
              {unreadCount > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {isNotifyOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">System Notifications</h4>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold">
                        {unreadCount} New
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        title="Mark all as read"
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-md transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Read All</span>
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        title="Clear all notifications"
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => {
                      const isRead = notif.isRead ?? notif.read ?? false;
                      const msg = notif.message || notif.desc || '';
                      const timeDisplay = notif.createdAt ? formatRelativeTime(notif.createdAt) : (notif.time || 'Just now');

                      return (
                        <div
                          key={notif.id}
                          onClick={() => handleNotificationClick(notif)}
                          className={`group relative flex items-start gap-3 text-xs p-2.5 rounded-2xl cursor-pointer transition-all border ${
                            isRead
                              ? 'bg-slate-50/60 dark:bg-slate-800/40 border-transparent opacity-75 hover:opacity-100'
                              : 'bg-indigo-50/40 dark:bg-indigo-950/30 border-indigo-100/60 dark:border-indigo-900/40 shadow-xs'
                          }`}
                        >
                          {notif.type === 'success' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                          {notif.type === 'warning' && (
                            <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          {(notif.type === 'info' || !notif.type) && (
                            <Bell className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          )}

                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-slate-900 dark:text-white leading-tight truncate">
                                {notif.title}
                              </p>
                              {!isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              {msg}
                            </p>
                            <span className="text-[9px] text-slate-400 mt-1 block">{timeDisplay}</span>
                          </div>

                          <button
                            onClick={(e) => dismissNotification(e, notif.id)}
                            className="opacity-0 group-hover:opacity-100 absolute top-2 right-2 p-0.5 text-slate-400 hover:text-rose-500 rounded-full transition-opacity cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center">
                      <Bell className="w-6 h-6 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-400">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Circular Avatar Button */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              title={userFullName}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all cursor-pointer shrink-0 flex items-center justify-center overflow-hidden active:scale-95"
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
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1E293B] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  {userAvatar ? (
                    <img
                      src={userAvatar}
                      alt="Avatar"
                      className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#0F172A] text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {userInitials}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{userFullName}</p>
                    <p className="text-[10px] font-semibold text-slate-400 truncate">
                      {userHandle} • {currentUser?.email || 'admin@company.com'}
                    </p>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/app/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate('/app/settings');
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2.5 cursor-pointer transition-colors"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>System Settings</span>
                  </button>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5 cursor-pointer transition-colors"
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

