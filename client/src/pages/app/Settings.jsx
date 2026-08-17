import React, { useState, useEffect } from 'react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import {
  Sliders,
  Building,
  Globe,
  Bell,
  Shield,
  Cpu,
  Save,
  CheckCircle2,
  Moon,
  Sun,
  Laptop,
  Mail,
  Lock,
  Clock,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import {
  useRegionalSettings,
  TIMEZONE_OPTIONS,
  CURRENCY_OPTIONS,
  DATE_FORMAT_OPTIONS,
} from '../../context/RegionalSettingsContext';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const {
    timezone,
    timeFormat,
    dateFormat,
    currency,
    companySettings: savedCompanySettings,
    updateSettings,
    updateCompanySettings,
    formatTime,
    formatDate,
    formatCurrency,
  } = useRegionalSettings();

  const [toastMsg, setToastMsg] = useState('');

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('nexahr_admin_notification_settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to parse notifications settings:', e);
    }
    return {
      emailOnLeaveRequest: true,
      emailOnPayrollRun: true,
    };
  });

  const [formState, setFormState] = useState({
    companyName: savedCompanySettings?.companyName || 'NexaHR Enterprise Systems Inc. (Pakistan Operations)',
    domain: savedCompanySettings?.domain || 'nexahr.pk',
    fiscalYearStart: savedCompanySettings?.fiscalYearStart || 'July',
    workWeek: savedCompanySettings?.workWeek || 'Monday - Friday (Sat/Sun Off)',
    autoClockoutHours: savedCompanySettings?.autoClockoutHours || '12',
    biometricPort: savedCompanySettings?.biometricPort || '8080',
    biometricSecret: savedCompanySettings?.biometricSecret || 'nexahr_biometric_hardware_secret_2026',
    currency,
    timezone,
    timeFormat,
    dateFormat,
  });

  useEffect(() => {
    setFormState((prev) => ({
      ...prev,
      currency,
      timezone,
      timeFormat,
      dateFormat,
      companyName: savedCompanySettings?.companyName || prev.companyName,
      domain: savedCompanySettings?.domain || prev.domain,
      fiscalYearStart: savedCompanySettings?.fiscalYearStart || prev.fiscalYearStart,
      workWeek: savedCompanySettings?.workWeek || prev.workWeek,
    }));
  }, [currency, timezone, timeFormat, dateFormat, savedCompanySettings]);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      timezone: formState.timezone,
      timeFormat: formState.timeFormat,
      dateFormat: formState.dateFormat,
      currency: formState.currency,
    });
    updateCompanySettings({
      companyName: formState.companyName,
      domain: formState.domain,
      fiscalYearStart: formState.fiscalYearStart,
      workWeek: formState.workWeek,
      autoClockoutHours: formState.autoClockoutHours,
      biometricPort: formState.biometricPort,
      biometricSecret: formState.biometricSecret,
    });
    try {
      localStorage.setItem('nexahr_admin_notification_settings', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Failed to save notification settings:', e);
    }
    setToastMsg('Enterprise Regional Settings and Company Profile updated successfully across the entire system.');
    setTimeout(() => setToastMsg(''), 3500);
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
    setToastMsg('Enterprise parameters set to Pakistan Standards (PKT UTC+5, PKR Rs., DD/MM/YYYY, 12h).');
    setTimeout(() => setToastMsg(''), 3500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100 w-full">
      <AppPageHeader
        title="Enterprise System Settings & Preferences"
        subtitle="Configure company parameters, localization, biometric hardware ports, automated alerts, and theme preferences."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. DYNAMIC SYSTEM SETTINGS HERO BANNER (INDIGO-BLUE LIGHT THEME AESTHETIC) */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-50/90 via-blue-50/80 to-purple-50/60 dark:from-indigo-950/40 dark:via-blue-950/30 dark:to-[#1E293B] p-6 sm:p-8 shadow-soft border border-indigo-200/70 dark:border-indigo-800/50 text-slate-900 dark:text-white">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-400/15 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-300/20 dark:bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Side: System Telemetry */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-extrabold border border-indigo-600/20 dark:border-indigo-500/30">
                <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Global System Configuration Engine</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-600/20 dark:border-emerald-500/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Hardware Biometrics & Timezones Active</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-[28px] xl:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Enterprise System Settings & Environment
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg font-medium">
              Manage corporate domain identities, biometric gateway listening ports, timezone formats, multi-currency localization, and security alerts.
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold bg-indigo-100/60 dark:bg-indigo-950/60 px-3 py-1 rounded-xl border border-indigo-200 dark:border-indigo-800/60">
                <Globe className="w-3.5 h-3.5" />
                <span>{formState.timezone} ({formState.currency})</span>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-100/60 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <Cpu className="w-3.5 h-3.5" />
                <span>Port {formState.biometricPort} Hardware Sync</span>
              </span>
            </div>
          </div>

          {/* Right Side: Action Glassmorphic Card */}
          <div className="bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl p-6 border border-indigo-200/60 dark:border-slate-700/60 shadow-lg flex flex-col items-center text-center min-w-[220px] sm:min-w-[250px] shrink-0 space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Save className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-slate-900 dark:text-white">Save Changes</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Persist configuration</div>
            </div>
            <button
              onClick={handleSave}
              type="button"
              className="w-full px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save System Settings</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Timezone & Regional Localization (100% Functional) */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Timezone & Regional Format (Pakistan & Global)
                </h3>
                <p className="text-xs text-slate-400">
                  Global company timezone, monetary localization, and date/time formatting
                </p>
              </div>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Timezone</span>
              </label>
              <select
                value={formState.timezone}
                onChange={(e) => setFormState({ ...formState, timezone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                {TIMEZONE_OPTIONS.map((tz) => (
                  <option key={tz.id} value={tz.id}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                <span>Base System Currency</span>
              </label>
              <select
                value={formState.currency}
                onChange={(e) => setFormState({ ...formState, currency: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                {CURRENCY_OPTIONS.map((curr) => (
                  <option key={curr.code} value={curr.code}>
                    {curr.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time Display Format</span>
              </label>
              <select
                value={formState.timeFormat}
                onChange={(e) => setFormState({ ...formState, timeFormat: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="12h">12-Hour Format (e.g. 09:30 AM / 05:35 PM)</option>
                <option value="24h">24-Hour Format (e.g. 09:30 / 17:35)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date Display Format</span>
              </label>
              <select
                value={formState.dateFormat}
                onChange={(e) => setFormState({ ...formState, dateFormat: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                {DATE_FORMAT_OPTIONS.map((df) => (
                  <option key={df.id} value={df.id}>
                    {df.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-blue-900 dark:text-blue-300">Live Format Preview:</span>
              <div className="text-[11px] text-blue-700/80 dark:text-blue-400/80 mt-0.5">
                Active Timezone: <span className="font-mono font-bold">{formState.timezone}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-bold text-blue-800 dark:text-blue-200 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800">
                {formatDate(new Date(), formState.dateFormat, formState.timezone)} •{' '}
                {formatTime(new Date(), true, formState.timezone, formState.timeFormat)}
              </span>
              <span className="font-mono font-bold text-blue-800 dark:text-blue-200 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800">
                {formatCurrency(250000, formState.currency)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Organization Profile */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Organization Details</h3>
              <p className="text-xs text-slate-400">Company identity and standard work schedule</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Legal Company Name</label>
              <input
                type="text"
                value={formState.companyName}
                onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Corporate Domain</label>
              <input
                type="text"
                value={formState.domain}
                onChange={(e) => setFormState({ ...formState, domain: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Standard Work Week</label>
              <input
                type="text"
                value={formState.workWeek}
                onChange={(e) => setFormState({ ...formState, workWeek: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Auto Clock-Out Threshold</label>
              <input
                type="text"
                value={`${formState.autoClockoutHours} Hours`}
                onChange={(e) => setFormState({ ...formState, autoClockoutHours: e.target.value.replace(/\D/g, '') })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Biometric Hardware & IoT Gateway Port */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Biometric Hardware Gateway</h3>
              <p className="text-xs text-slate-400">IoT turnstile sync port and webhook secret keys</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Gateway Listener Port</label>
              <input
                type="text"
                value={formState.biometricPort}
                onChange={(e) => setFormState({ ...formState, biometricPort: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Hardware Webhook Secret</label>
              <input
                type="password"
                value={formState.biometricSecret}
                onChange={(e) => setFormState({ ...formState, biometricSecret: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 4. Automated Notifications */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Automated Notifications</h3>
              <p className="text-xs text-slate-400">Trigger automatic emails and Slack webhooks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailOnLeaveRequest}
                onChange={(e) => setNotifications({ ...notifications, emailOnLeaveRequest: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Email notifications on new Leave Requests</span>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.emailOnPayrollRun}
                onChange={(e) => setNotifications({ ...notifications, emailOnPayrollRun: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">Disbursement confirmation on Payroll Batch</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Save System Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
