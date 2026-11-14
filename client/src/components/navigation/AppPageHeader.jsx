import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearSession } from '../../utils/session';
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
  Banknote,
  Sliders,
  LayoutDashboard,
  Megaphone,
  Briefcase,
  Layers,
  ArrowRight,
  Menu,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';

const DEFAULT_AVATAR = '/blank-profile-picture.png';

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
  { label: 'Company Directory & Team', icon: Users, path: '/app/employees', category: 'HR' },
  { label: 'Department Management', icon: Building2, path: '/app/departments', category: 'HR' },
  { label: 'Designations & Roles', icon: Building2, path: '/app/departments', category: 'HR' },
  { label: 'Attendance & Logs', icon: Clock, path: '/app/attendance', category: 'Attendance' },
  { label: 'Employment Status', icon: User, path: '/app/employment-status', category: 'Attendance' },
  { label: 'Leave Requests', icon: FileText, path: '/app/leaves', category: 'Leaves' },
  { label: 'Public Holiday', icon: Clock, path: '/app/holiday/public', category: 'Leaves' },
  { label: 'Leave Policy', icon: FileText, path: '/app/leave-policy', category: 'Leaves' },
  { label: 'Calculate Payroll', icon: Banknote, path: '/app/payroll/calculate', category: 'Payroll' },
  { label: 'Payslip List', icon: FileText, path: '/app/payroll/payslips', category: 'Payroll' },
  { label: 'Payroll Management', icon: Banknote, path: '/app/payroll', category: 'Payroll' },
  { label: 'Announcements', icon: Megaphone, path: '/app/announcement', category: 'Operations' },
  { label: 'Recruitment - Workspace & Jobs', icon: Briefcase, path: '/app/recruitment/workspace', category: 'Recruitment' },
  { label: 'Recruitment - ATS Candidate Pipeline', icon: Users, path: '/app/recruitment/pipeline', category: 'Recruitment' },
  { label: 'Recruitment - Master Settings', icon: Sliders, path: '/app/recruitment/settings', category: 'Recruitment' },
  { label: 'My Profile', icon: User, path: '/app/profile', category: 'System' },
  { label: 'System Settings', icon: Sliders, path: '/app/settings', category: 'System' }
];

const AppPageHeader = ({
  title = 'Admin Dashboard',
  subtitle = null,
  mobileTitle = null,
  hideMobileSubtitle = true,
  hideMobileSearch = true,
  onSearch = null,
  onRefresh = null,
  loading = false,
  action = null,
  children = null,
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

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('nexahr_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleSidebarChange = (e) => {
      if (e.detail?.isCollapsed !== undefined) {
        setIsSidebarCollapsed(e.detail.isCollapsed);
      }
    };
    window.addEventListener('nexahr_sidebar_state_changed', handleSidebarChange);
    return () => window.removeEventListener('nexahr_sidebar_state_changed', handleSidebarChange);
  }, []);

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

  const loadUserData = async () => {
    let activeUser = null;
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        activeUser = JSON.parse(storedUser);
        setCurrentUser(activeUser);
      } catch (e) {
        console.error('Failed to parse user from localStorage', e);
      }
    }

    // Hydrate live from server to guarantee active session dossier
    try {
      const res = await api.getMe();
      if (res?.success && res.data?.user) {
        activeUser = res.data.user;
        setCurrentUser(activeUser);
        const currentStored = JSON.parse(localStorage.getItem('user') || '{}');
        const bankPayload = activeUser.bankDetails || activeUser.profile || {};
        localStorage.setItem('user', JSON.stringify({
          ...currentStored,
          ...activeUser,
          bankName: bankPayload.bankName || currentStored.bankName || '',
          accountTitle: bankPayload.accountTitle || currentStored.accountTitle || '',
          accountNumber: bankPayload.accountNumber || currentStored.accountNumber || '',
          branchCode: bankPayload.branchCode || currentStored.branchCode || '',
          payoutMethod: bankPayload.payoutMethod || currentStored.payoutMethod || 'Direct Bank Transfer',
          ntnNumber: bankPayload.ntnNumber || currentStored.ntnNumber || '',
        }));
      }
    } catch (e) {
      // Offline fallback
    }

    if (!activeUser) {
      setUserAvatar(DEFAULT_AVATAR);
      return;
    }

    // Compute avatar strictly for this active user
    let activeAvatar = DEFAULT_AVATAR;
    if (activeUser.avatar && typeof activeUser.avatar === 'string' && !activeUser.avatar.includes('unsplash') && activeUser.avatar.trim() !== '') {
      activeAvatar = activeUser.avatar;
    } else if (activeUser.profile?.avatarUrl && typeof activeUser.profile.avatarUrl === 'string' && !activeUser.profile.avatarUrl.includes('unsplash')) {
      activeAvatar = activeUser.profile.avatarUrl;
    } else if (activeUser.id) {
      const userSpecificAvatar = localStorage.getItem(`user_avatar_${activeUser.id}`);
      if (userSpecificAvatar && !userSpecificAvatar.includes('unsplash')) {
        activeAvatar = userSpecificAvatar;
      }
    }

    setUserAvatar(activeAvatar || DEFAULT_AVATAR);
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
    api.logout().catch(() => {});
    clearSession();
    setCurrentUser(null);
    setUserAvatar(null);
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

  const userRole = currentUser?.designation || (currentUser?.role === 'ADMIN' ? 'System Administrator' : 'Administrator');

  const userHandle = currentUser ? `@${currentUser.firstName?.toLowerCase()}` : '@system';

  const displayUserEmail = useMemo(() => {
    if (!currentUser?.email) return '';
    if (currentUser?.isDemo || currentUser?.isGuest) {
      return currentUser.role === 'ADMIN' ? 'guest.hr@nexahr.com' : 'guest.employee@nexahr.com';
    }
    return currentUser.email;
  }, [currentUser]);

  // Resolved role-based title for mobile header
  const resolvedMobileTitle = useMemo(() => {
    if (mobileTitle && mobileTitle !== 'auto') return mobileTitle;
    if (mobileTitle === 'auto' || (!mobileTitle && (title.includes('Control Center') || title.includes('Dashboard')))) {
      const role = (currentUser?.role || '').toUpperCase();
      const portalRole = (currentUser?.portalRole || '').toLowerCase();
      const email = (currentUser?.email || '').toLowerCase();
      const designation = (currentUser?.designation || '').toLowerCase();

      if (role === 'ADMIN' || role === 'SUPER_ADMIN' || email.startsWith('admin@')) {
        return 'Admin Dashboard';
      }
      if (
        role === 'HR_MANAGER' ||
        role === 'HR' ||
        role.includes('HR') ||
        portalRole === 'hr' ||
        email.startsWith('hr@') ||
        designation.includes('hr')
      ) {
        return 'HR Dashboard';
      }
      if (
        role === 'EMPLOYEE' ||
        role === 'STAFF' ||
        portalRole === 'employee' ||
        email.startsWith('user@') ||
        email.startsWith('employee@')
      ) {
        return 'Employee Dashboard';
      }
      return 'Admin Dashboard';
    }

    const lower = (title || '').toLowerCase();
    if (lower.includes('attendance')) return 'Attendance';
    if (lower.includes('directory') || lower.includes('workforce') || lower.includes('employee list') || lower.includes('employees')) return 'Employees';
    if (lower.includes('new employee') || lower.includes('onboarding')) return 'New Employee';
    if (lower.includes('employment status')) return 'Employment Status';
    if (lower.includes('leave policy')) return 'Leave Policy';
    if (lower.includes('holiday')) return 'Public Holidays';
    if (lower.includes('leave')) return 'Leaves';
    if (lower.includes('calculate payroll')) return 'Calculate Payroll';
    if (lower.includes('payslip')) return 'Payslips';
    if (lower.includes('payroll')) return 'Payroll';
    if (lower.includes('announcement') || lower.includes('notice')) return 'Announcements';
    if (lower.includes('pipeline') || lower.includes('ats')) return 'ATS Pipeline';
    if (lower.includes('recruitment settings')) return 'Recruitment Settings';
    if (lower.includes('workspace')) return 'Jobs Workspace';
    if (lower.includes('recruitment') || lower.includes('job')) return 'Recruitment';
    if (lower.includes('department')) return 'Departments';
    if (lower.includes('designation')) return 'Departments';
    if (lower.includes('access control') || lower.includes('permission')) return 'Access Control';
    if (lower.includes('setting')) return 'Settings';
    if (lower.includes('profile')) return 'My Profile';

    if (title.includes('&')) return title.split('&')[0].trim();
    if (title.includes('—')) return title.split('—')[0].trim();
    if (title.includes('-')) return title.split('-')[0].trim();
    if (title.includes(':')) return title.split(':')[0].trim();

    return title;
  }, [mobileTitle, title, currentUser]);

  // Filter shortcuts based on searchQuery
  const filteredShortcuts = SEARCH_SHORTCUTS.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mb-6 relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-[0_12px_36px_-6px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_40px_-6px_rgba(0,0,0,0.6)] animate-in slide-in-from-top-3 fade-in duration-200 max-w-md pointer-events-auto">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-xs">
            <CheckCircle2 className="w-4.5 h-4.5 stroke-[2.2]" />
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 pr-1">
            {toastMessage}
          </p>
          <button
            type="button"
            onClick={() => setToastMessage('')}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto -mr-1 cursor-pointer shrink-0"
            aria-label="Dismiss toast"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Header Row: Responsive Grid on Mobile, Flex on Desktop */}
      <div className="grid grid-cols-[1fr_auto] gap-x-2 gap-y-3 sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-4 w-full">
        {/* Left Side Title & Subtitle Date: Row 1 Col 1 on Mobile, Left flex on Desktop */}
        <div className={`col-start-1 row-start-1 min-w-0 sm:flex-1 sm:order-1 flex ${hideMobileSubtitle ? 'items-center' : 'items-start sm:items-center'} gap-2 sm:gap-2.5`}>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('nexahr_open_mobile_sidebar'))}
            title="Open Navigation Menu"
            aria-label="Open Navigation Menu"
            className={`lg:hidden ${hideMobileSubtitle ? '' : 'mt-0.5 sm:mt-0'} w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs border border-slate-200/80 dark:border-slate-800 shrink-0 cursor-pointer active:scale-95 transition-all`}
          >
            <Menu className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300 stroke-[2.2]" />
          </button>
          <div className="min-w-0 flex-1">
            {resolvedMobileTitle ? (
              <>
                <h1 className="sm:hidden text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight leading-tight truncate whitespace-nowrap" title={typeof resolvedMobileTitle === 'string' ? resolvedMobileTitle : undefined}>
                  {resolvedMobileTitle}
                </h1>
                <h1
                  title={typeof title === 'string' ? title : undefined}
                  className={`hidden sm:block font-bold font-heading text-slate-900 dark:text-white tracking-tight leading-tight truncate whitespace-nowrap transition-all ${
                    !isSidebarCollapsed
                      ? 'text-lg sm:text-xl lg:text-[21px] xl:text-2xl'
                      : 'text-xl sm:text-2xl'
                  }`}
                >
                  {title}
                </h1>
              </>
            ) : (
              <h1
                title={typeof title === 'string' ? title : undefined}
                className={`font-bold font-heading text-slate-900 dark:text-white tracking-tight leading-tight truncate whitespace-nowrap transition-all ${
                  !isSidebarCollapsed
                    ? 'text-lg sm:text-xl lg:text-[21px] xl:text-2xl'
                    : 'text-lg sm:text-2xl'
                }`}
              >
                {title}
              </h1>
            )}
            {displaySubtitle && (
              <p
                className={`${
                  hideMobileSubtitle ? 'hidden sm:block' : 'line-clamp-1 sm:line-clamp-none'
                } text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium max-w-xl leading-relaxed mt-0.5 truncate`}
                title={typeof displaySubtitle === 'string' ? displaySubtitle : undefined}
              >
                {displaySubtitle}
              </p>
            )}
          </div>
        </div>

        {/* Search Bar & Custom Action: Row 2 Col-span-2 on Mobile, Center/Right on Desktop */}
        <div
          className={`${
            hideMobileSearch ? 'hidden sm:flex' : 'flex'
          } col-span-2 sm:col-auto w-full sm:w-auto items-center gap-2 sm:gap-3 sm:order-2 shrink-0 sm:self-center`}
        >
          {action || children}
          <div
            className={`relative w-full transition-all duration-300 ${
              !isSidebarCollapsed
                ? 'sm:w-44 md:w-52 lg:w-60 xl:w-68'
                : 'sm:w-52 md:w-60 lg:w-68 xl:w-72'
            }`}
            ref={searchRef}
          >
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={handleSearchChange}
                className="w-full bg-slate-100/70 dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800 rounded-[8px] pl-4 pr-14 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/30 focus:border-sky-600 shadow-inner transition-all"
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {searchQuery ? (
                  <button
                    onClick={clearSearch}
                    className="p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span className="hidden sm:inline-flex items-center text-[10px] font-bold text-slate-400 bg-slate-200/60 dark:bg-slate-700/60 px-1.5 py-0.5 rounded-lg pointer-events-none">
                    ⌘K
                  </span>
                )}
                <Search className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
              </div>
            </div>

            {/* Quick Search Palette Dropdown */}
            {isSearchOpen && (
              <div className="absolute left-0 right-0 sm:right-auto sm:w-80 mt-2 bg-white dark:bg-[#1E293B] rounded-[14px] shadow-drawer border border-[#E2E1DC] dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
                            <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-sky-50 dark:group-hover:bg-sky-950/50 group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors">
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
        </div>

        {/* Utility Action Buttons: Row 1 Col 2 on Mobile, Right side on Desktop */}
        <div className="col-start-2 row-start-1 self-center justify-self-end flex items-center gap-1.5 sm:gap-2.5 shrink-0 flex-nowrap sm:order-3">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={handleRefreshClick}
            title="Refresh Data"
            aria-label="Refresh portal data"
            className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs border border-slate-200/80 dark:border-slate-800 relative transition-all shrink-0 cursor-pointer group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300 stroke-[2] transition-transform duration-300 ${
                isRefreshing || loading ? 'animate-spin text-sky-600 dark:text-sky-400' : 'group-hover:rotate-45'
              }`}
            />
          </button>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs border border-slate-200/80 dark:border-slate-800 relative transition-all shrink-0 cursor-pointer group active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 stroke-[2] transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
            ) : (
              <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300 stroke-[2] transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
            )}
          </button>

          {/* Notification Icon & Dropdown */}
          <div className="relative" ref={notifyRef}>
            <button
              type="button"
              onClick={() => setIsNotifyOpen(!isNotifyOpen)}
              title="Notifications"
              aria-label="View notifications"
              aria-expanded={isNotifyOpen}
              className="w-8.5 h-8.5 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs border border-slate-200/80 dark:border-slate-800 relative transition-all shrink-0 cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700 dark:text-slate-300 stroke-[1.75]" />
              {unreadCount > 0 && (
                <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
              )}
            </button>

            {isNotifyOpen && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-80 bg-white dark:bg-[#1E293B] rounded-[14px] shadow-drawer border border-[#E2E1DC] dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
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
                        className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 rounded-md transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
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
                              : 'bg-sky-50/50 dark:bg-sky-950/30 border-sky-100/60 dark:border-sky-900/40 shadow-xs'
                          }`}
                        >
                          {notif.type === 'success' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          )}
                          {notif.type === 'warning' && (
                            <Bell className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                          )}
                          {(notif.type === 'info' || !notif.type) && (
                            <Bell className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                          )}

                          <div className="flex-1 min-w-0 pr-4">
                            <div className="flex items-center justify-between gap-1">
                              <p className="font-bold text-slate-900 dark:text-white leading-tight truncate">
                                {notif.title}
                              </p>
                              {!isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0"></span>
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

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              aria-label="User profile menu"
              aria-expanded={isProfileOpen}
              className="w-8.5 h-8.5 sm:w-auto sm:h-auto flex items-center gap-2 p-1 sm:pl-2 sm:pr-3 sm:py-1 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl shadow-xs border border-slate-200/80 dark:border-slate-800 cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 shrink-0"
            >
              <div className="w-6.5 h-6.5 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-white text-xs font-bold ring-2 ring-sky-500/20 shrink-0">
                <img
                  src={userAvatar || DEFAULT_AVATAR}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {userFullName}
                </div>
                <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold leading-none">
                  {currentUser?.role === 'ADMIN' ? 'Administrator' : (currentUser?.designation || 'Administrator')}
                </div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-64 bg-white dark:bg-[#1E293B] rounded-[14px] shadow-drawer border border-[#E2E1DC] dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{userFullName}</div>
                  <div className="text-[11px] text-slate-400 truncate">{displayUserEmail || ''}</div>
                  <div className="text-[10px] text-sky-600 dark:text-sky-400 font-semibold mt-0.5">{userRole}</div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      navigate('/app/profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/app/settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>System Settings</span>
                  </button>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
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

