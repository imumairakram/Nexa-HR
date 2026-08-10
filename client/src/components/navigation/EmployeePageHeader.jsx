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
  Clock,
  CalendarDays,
  CreditCard,
  FolderKanban,
  Megaphone,
  Award,
  Calendar,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  Users,
  LifeBuoy,
  BookOpen,
  ArrowRightLeft,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const EMPLOYEE_SEARCH_SHORTCUTS = [
  { label: 'Employee Dashboard', icon: Sparkles, path: '/employee/dashboard', category: 'Overview' },
  { label: 'Clock In / Clock Out & Attendance', icon: Clock, path: '/employee/attendance', category: 'Attendance' },
  { label: 'Apply For Leave', icon: CalendarDays, path: '/employee/leaves', category: 'Leaves' },
  { label: 'My Leave Balances & History', icon: CalendarDays, path: '/employee/leaves', category: 'Leaves' },
  { label: 'View Latest Payslip', icon: CreditCard, path: '/employee/payslips', category: 'Compensation' },
  { label: 'Salary History & Tax Breakdown', icon: CreditCard, path: '/employee/payslips', category: 'Compensation' },
  { label: 'My Assigned Projects & Tasks', icon: FolderKanban, path: '/employee/projects', category: 'Projects' },
  { label: 'Company Team Directory & Roster', icon: Users, path: '/employee/directory', category: 'Company' },
  { label: 'Company Announcements & Notices', icon: Megaphone, path: '/employee/announcements', category: 'Notices' },
  { label: 'Awards & Peer Kudos Wall', icon: Award, path: '/employee/awards', category: 'Recognition' },
  { label: 'Upcoming Public Holidays', icon: Calendar, path: '/employee/holidays', category: 'Calendar' },
  { label: 'Helpdesk & Support Requests', icon: LifeBuoy, path: '/employee/helpdesk', category: 'Support' },
  { label: 'Documents & Company Policies', icon: BookOpen, path: '/employee/documents', category: 'Documents' },
  { label: 'My Profile & Account Details', icon: User, path: '/employee/profile', category: 'Account' },
  { label: 'Settings & Workspace Preferences', icon: Settings, path: '/employee/settings', category: 'Account' },
];

const INITIAL_EMPLOYEE_NOTIFICATIONS = [
  {
    id: 1,
    title: 'Leave Request Approved',
    desc: 'Your 3-day summer vacation has been approved by HR.',
    time: '2 hours ago',
    type: 'success',
    read: false,
    link: '/employee/leaves',
  },
  {
    id: 2,
    title: 'July 2026 Payslip Ready',
    desc: 'Your monthly salary slip is now available for download.',
    time: 'Yesterday',
    type: 'info',
    read: false,
    link: '/employee/payslips',
  },
  {
    id: 3,
    title: 'New Company Notice',
    desc: 'Annual Company Retreat 2026 announcement posted.',
    time: '2 days ago',
    type: 'info',
    read: true,
    link: '/employee/announcements',
  },
];

const EmployeePageHeader = ({
  title = 'Employee Portal',
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
  const [clockedIn, setClockedIn] = useState(false);

  const searchRef = useRef(null);
  const notifyRef = useRef(null);
  const profileRef = useRef(null);
  const inputRef = useRef(null);

  // Load Notifications
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_employee_notifications');
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEE_NOTIFICATIONS;
    } catch {
      return INITIAL_EMPLOYEE_NOTIFICATIONS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('nexahr_employee_notifications', JSON.stringify(notifications));
    } catch (e) {}
  }, [notifications]);

  const loadUserData = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setCurrentUser(u);
        if (u.avatar) setUserAvatar(u.avatar);
      } catch (e) {}
    }
    const storedAvatar = localStorage.getItem('user_avatar');
    if (storedAvatar) {
      setUserAvatar(storedAvatar);
    }
    setClockedIn(localStorage.getItem('nexahr_clocked_in') === 'true');
  };

  useEffect(() => {
    loadUserData();
    window.addEventListener('user_profile_updated', loadUserData);
    window.addEventListener('nexahr_punch_updated', loadUserData);
    return () => {
      window.removeEventListener('user_profile_updated', loadUserData);
      window.removeEventListener('nexahr_punch_updated', loadUserData);
    };
  }, []);

  // Click outside & keyboard shortcuts
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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsSearchOpen(true);
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifyOpen(false);
        setIsProfileOpen(false);
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
    triggerToast('Refreshing your workspace...');
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 700);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    triggerToast('All notifications marked as read');
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    triggerToast('Notifications cleared');
  };

  const handleNotificationClick = (notif) => {
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    setIsNotifyOpen(false);
    if (notif.link) navigate(notif.link);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const displaySubtitle = subtitle || currentDateStr;

  const userInitials = currentUser
    ? `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase()
    : 'AM';

  const userFullName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : 'Alex Mercer';

  const userRole = currentUser?.designation || 'Senior Full-Stack Engineer';

  const filteredShortcuts = EMPLOYEE_SEARCH_SHORTCUTS.filter((s) =>
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
        {/* Left Side Title & Subtitle */}
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
                placeholder="Search self-service..."
                value={searchQuery}
                onFocus={() => setIsSearchOpen(true)}
                onChange={handleSearchChange}
                className="w-full bg-slate-100/70 dark:bg-[#1E293B] border border-slate-200/60 dark:border-slate-800 rounded-full pl-4 pr-14 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-500 shadow-inner transition-all"
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
                    {searchQuery ? 'Quick Search' : 'Self-Service Actions'}
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
                            <div className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 group-hover:bg-emerald-50 dark:group-hover:bg-emerald-950/50 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
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
                isRefreshing || loading ? 'animate-spin text-emerald-600 dark:text-emerald-400' : 'group-hover:rotate-45'
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
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">My Notifications</h4>
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
                        className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-md transition-colors text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Read All</span>
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        title="Clear all"
                        className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors text-[10px] font-bold cursor-pointer"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-2.5 rounded-2xl transition-all cursor-pointer border ${
                          !n.read
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/40'
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />}
                            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{n.title}</h5>
                          </div>
                          <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{n.desc}</p>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">
                      You're all caught up! No notifications.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1 bg-white dark:bg-[#1E293B] hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full shadow-sm border border-slate-200/80 dark:border-slate-800 cursor-pointer transition-all active:scale-95"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-emerald-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-emerald-500/20 shrink-0">
                {userAvatar ? (
                  <img src={userAvatar} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{userInitials}</span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                  {userFullName}
                </div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold leading-none">
                  Employee
                </div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{userFullName}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser?.email || 'employee@company.com'}</div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">{userRole}</div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      navigate('/employee/profile');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>My Profile & Docs</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/employee/attendance');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>My Attendance & Logs</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/employee/helpdesk');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <LifeBuoy className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Helpdesk & Support</span>
                  </button>

                  <button
                    onClick={() => {
                      navigate('/employee/settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>Preferences & Security</span>
                  </button>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
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

export default EmployeePageHeader;
