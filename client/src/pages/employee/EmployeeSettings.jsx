import React, { useState, useEffect } from 'react';
import {
  Settings,
  Bell,
  Sun,
  Moon,
  Shield,
  Globe,
  CheckCircle2,
  Save,
  Laptop,
  Clock,
  DollarSign,
  Calendar,
  Sliders,
  Smartphone,
  Mail,
  Lock,
  Layers,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { useTheme } from '../../context/ThemeContext';
import {
  useRegionalSettings,
  TIMEZONE_OPTIONS,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
} from '../../context/RegionalSettingsContext';

const EmployeeSettings = () => {
  const { theme, setTheme } = useTheme();
  const {
    timezone,
    timeFormat,
    dateFormat,
    currency,
    updateSettings,
    formatTime,
    formatDate,
    formatCurrency,
  } = useRegionalSettings();

  const [toastMsg, setToastMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formState, setFormState] = useState({
    timezone,
    timeFormat,
    dateFormat,
    currency,
    language: 'en-US',
    emailLeaves: true,
    emailPayslip: true,
    emailAnnouncements: true,
    emailReminders: true,
    browserPush: true,
  });

  // Sync state if context changes externally
  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      timezone,
      timeFormat,
      dateFormat,
      currency,
    }));
  }, [timezone, timeFormat, dateFormat, currency]);

  const handleSave = (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      updateSettings({
        timezone: formState.timezone,
        timeFormat: formState.timeFormat,
        dateFormat: formState.dateFormat,
        currency: formState.currency,
      });
      setIsSaving(false);
      setToastMsg('Preferences and regional formatting updated successfully!');
      setTimeout(() => setToastMsg(''), 3000);
    }, 400);
  };

  const applyPakistanPreset = () => {
    setFormState((prev) => ({
      ...prev,
      timezone: 'Asia/Karachi',
      timeFormat: '12h',
      dateFormat: 'DD/MM/YYYY',
      currency: 'PKR',
    }));
    updateSettings({
      timezone: 'Asia/Karachi',
      timeFormat: '12h',
      dateFormat: 'DD/MM/YYYY',
      currency: 'PKR',
    });
    setToastMsg('Pakistan Standard defaults applied (PKT UTC+5, PKR Rs., DD/MM/YYYY, 12h)!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <EmployeePageHeader
        title="Settings"
        subtitle="Configure appearance themes, notification channels, and regional formats."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FULL-WIDTH SETTINGS FORM CATEGORIES STACK */}
      {/* ========================================================================= */}
      <div className="w-full space-y-6">
        {/* ========================================================================= */}
        {/* 1. CATEGORY 1: DISPLAY & APPEARANCE (CLICKABLE THEME PREVIEW CARDS) */}
        {/* ========================================================================= */}
        <div className="w-full bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Display & Appearance</h3>
              <p className="text-xs text-slate-400 font-medium">Select your interface theme and visual mode</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full pt-1">
            {/* Light Theme Card */}
            <div
              onClick={() => setTheme('light')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                theme === 'light'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800'
              }`}
            >
              {/* Mini Wireframe Preview */}
              <div className="h-24 w-full rounded-xl bg-slate-100 border border-slate-200 p-2.5 flex gap-2 shadow-inner">
                <div className="w-5 h-full rounded-md bg-slate-200 flex flex-col gap-1.5 p-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                  <div className="w-full h-1 rounded bg-slate-300" />
                  <div className="w-full h-1 rounded bg-slate-300" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-5 w-full rounded-md bg-white border border-slate-200 flex items-center px-2">
                    <div className="w-12 h-1.5 rounded bg-slate-300" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 flex-1">
                    <div className="rounded-md bg-white border border-slate-200" />
                    <div className="rounded-md bg-white border border-slate-200" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Light Mode</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Crisp high-contrast look</div>
                </div>
                {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </div>
            </div>

            {/* Dark Theme Card */}
            <div
              onClick={() => setTheme('dark')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                theme === 'dark'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800'
              }`}
            >
              {/* Mini Wireframe Preview */}
              <div className="h-24 w-full rounded-xl bg-slate-900 border border-slate-800 p-2.5 flex gap-2 shadow-inner">
                <div className="w-5 h-full rounded-md bg-slate-800 flex flex-col gap-1.5 p-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <div className="w-full h-1 rounded bg-slate-700" />
                  <div className="w-full h-1 rounded bg-slate-700" />
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-5 w-full rounded-md bg-slate-800 border border-slate-700 flex items-center px-2">
                    <div className="w-12 h-1.5 rounded bg-slate-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 flex-1">
                    <div className="rounded-md bg-slate-800 border border-slate-700" />
                    <div className="rounded-md bg-slate-800 border border-slate-700" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Dark Mode</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Sleek, low-light aesthetic</div>
                </div>
                {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </div>
            </div>

            {/* System Default Card */}
            <div
              onClick={() => setTheme('system')}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                theme === 'system'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20 shadow-sm'
                  : 'border-slate-200/80 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800'
              }`}
            >
              {/* Mini Wireframe Preview */}
              <div className="h-24 w-full rounded-xl bg-gradient-to-r from-slate-100 via-slate-500 to-slate-900 border border-slate-200 dark:border-slate-700 p-2 flex items-center justify-center shadow-inner">
                <Laptop className="w-8 h-8 text-white drop-shadow-md" />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">System Auto</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Matches OS preferences</div>
                </div>
                {theme === 'system' && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. CATEGORY 2: NOTIFICATIONS (IOS / MACOS STYLE TOGGLE LIST) */}
        {/* ========================================================================= */}
        <div className="w-full bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Notification Channels</h3>
              <p className="text-xs text-slate-400 font-medium">Control email bulletins, approval alerts, and shift reminders</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs w-full">
            {[
              { key: 'emailLeaves', label: 'Leave & Time-Off Approvals', desc: 'Instant email when your manager approves or reviews time-off' },
              { key: 'emailPayslip', label: 'Payslip Generation Alerts', desc: 'Notify immediately when monthly salary voucher is issued' },
              { key: 'emailAnnouncements', label: 'Company Circulars & Notices', desc: 'Receive email digests for company-wide executive broadcasts' },
              { key: 'emailReminders', label: 'Shift Attendance Alerts', desc: 'Gentle notification before 9:00 AM shift punch window begins' },
              { key: 'browserPush', label: 'In-App & Push Notifications', desc: 'Real-time badge toasts on self-service requests and replies' },
            ].map((n) => (
              <div key={n.key} className="py-4 flex justify-between items-center w-full gap-4 first:pt-1 last:pb-1">
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{n.label}</div>
                  <div className="text-[11px] text-slate-400">{n.desc}</div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formState[n.key]}
                    onChange={(e) => setFormState({ ...formState, [n.key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-slate-900 dark:peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. CATEGORY 3: REGIONAL PREFERENCES & LOCALIZATION */}
        {/* ========================================================================= */}
        <div className="w-full bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Regional Localization</h3>
                <p className="text-xs text-slate-400 font-medium">Timezone standards, date formats, and currency units</p>
              </div>
            </div>

            <button
              type="button"
              onClick={applyPakistanPreset}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0 border border-emerald-200 dark:border-emerald-800/60"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Set Pakistan Standard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Primary Timezone</label>
              <select
                value={formState.timezone}
                onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.id} value={tz.id}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Date Display Format</label>
              <select
                value={formState.dateFormat}
                onChange={(e) => setFormState({ ...formState, dateFormat: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
              >
                {DATE_FORMAT_OPTIONS.map((df) => (
                  <option key={df.id} value={df.id}>
                    {df.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Time Format</label>
              <select
                value={formState.timeFormat}
                onChange={(e) => setFormState({ ...formState, timeFormat: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
              >
                <option value="12h">12-Hour Format (e.g. 09:30 AM / 05:30 PM)</option>
                <option value="24h">24-Hour Format (e.g. 09:30 / 17:30)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Currency Unit</label>
              <select
                value={formState.currency}
                onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Format Preview Strip */}
          <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-200">Live Format Preview:</span>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Timezone: <span className="font-mono font-bold text-slate-600 dark:text-slate-300">{formState.timezone}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {formatDate(new Date(), formState.dateFormat, formState.timezone)} •{' '}
                {formatTime(new Date(), true, formState.timezone, formState.timeFormat)}
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {formatCurrency(150000, formState.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. BOTTOM ACTION AREA */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between pt-2 w-full">
          <span className="text-xs text-slate-400">Settings sync automatically with your local session</span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold transition-all hover:scale-105 shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Preferences</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSettings;
