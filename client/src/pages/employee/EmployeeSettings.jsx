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

  const [formState, setFormState] = useState({
    timezone,
    timeFormat,
    dateFormat,
    currency,
    emailLeaves: true,
    emailPayslip: true,
    emailAnnouncements: true,
    emailReminders: true,
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
    e.preventDefault();
    updateSettings({
      timezone: formState.timezone,
      timeFormat: formState.timeFormat,
      dateFormat: formState.dateFormat,
      currency: formState.currency,
    });
    setToastMsg('Pakistan Timezone & Regional preferences saved and updated across the portal!');
    setTimeout(() => setToastMsg(''), 3500);
  };

  // Quick preset button for Pakistan Standards
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
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Settings & Workspace Preferences"
        subtitle="Customize your regional localization, timezones, notification channels, and color themes."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* ========================================================================= */}
        {/* 1. TIMEZONE & REGIONAL FORMAT (100% FUNCTIONAL) */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Timezone & Regional Format (Pakistan & Global)</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Accurately localize biometric punch clocks, attendance charts, and currency symbols
              </p>
            </div>

            <button
              type="button"
              onClick={applyPakistanPreset}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer self-start sm:self-auto shrink-0 border border-emerald-200 dark:border-emerald-800/60"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Set Pakistan Standard</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Timezone</span>
              </label>
              <select
                value={formState.timezone}
                onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.id} value={tz.id}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time Display Format</span>
              </label>
              <select
                value={formState.timeFormat}
                onChange={(e) => setFormState({ ...formState, timeFormat: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer"
              >
                <option value="12h">12-Hour Format (e.g. 09:30 AM / 05:35 PM)</option>
                <option value="24h">24-Hour Format (e.g. 09:30 / 17:35)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date Display Format</span>
              </label>
              <select
                value={formState.dateFormat}
                onChange={(e) => setFormState({ ...formState, dateFormat: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer"
              >
                {DATE_FORMAT_OPTIONS.map((df) => (
                  <option key={df.id} value={df.id}>
                    {df.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Currency Display</span>
              </label>
              <select
                value={formState.currency}
                onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Real-time Dynamic Format Preview Bar */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-emerald-900 dark:text-emerald-300">Live Format Preview:</span>
              <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
                Timezone: <span className="font-mono font-bold">{formState.timezone}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {formatDate(new Date(), formState.dateFormat, formState.timezone)} •{' '}
                {formatTime(new Date(), true, formState.timezone, formState.timeFormat)}
              </span>
              <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {formatCurrency(150000, formState.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. APPEARANCE & THEME */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Theme & Interface Appearance</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Choose your preferred visual mode for NexaHR
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            {[
              { id: 'light', label: 'Light Mode', icon: Sun, desc: 'Clean high-contrast theme' },
              { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Eye-comfort dark aesthetics' },
              { id: 'system', label: 'System Default', icon: Laptop, desc: 'Syncs with OS preferences' },
            ].map((opt) => {
              const Icon = opt.icon;
              const isSelected = theme === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setTheme(opt.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{opt.label}</div>
                    <div className="text-[10px] text-slate-400">{opt.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. NOTIFICATIONS PREFERENCES */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Email & Push Notifications</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Select which notifications you would like to receive
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { key: 'emailLeaves', label: 'Leave Request Status Updates', desc: 'Receive instant notifications when HR reviews your leave requests' },
              { key: 'emailPayslip', label: 'Monthly Payslip Ready Alert', desc: 'Notified on the final day of the month when your salary voucher is processed' },
              { key: 'emailAnnouncements', label: 'Company Announcements & Bulletins', desc: 'Direct digests when executive circulars or retreat notices are published' },
              { key: 'emailReminders', label: 'Daily Shift Punch-In Reminder', desc: 'Gentle reminder at 8:50 AM if you have not registered your morning punch' },
            ].map((n) => (
              <div
                key={n.key}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{n.label}</div>
                  <div className="text-[11px] text-slate-400">{n.desc}</div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState[n.key]}
                    onChange={(e) => setFormState({ ...formState, [n.key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeSettings;
