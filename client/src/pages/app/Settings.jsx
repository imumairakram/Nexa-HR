import React, { useState } from 'react';
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
    updateSettings,
    formatTime,
    formatDate,
  } = useRegionalSettings();

  const [toastMsg, setToastMsg] = useState('');

  const [companySettings, setCompanySettings] = useState({
    companyName: 'NexaHR Enterprise Systems Inc.',
    domain: 'nexahr.internal',
    fiscalYearStart: 'January',
    currency,
    timezone,
    timeFormat,
    dateFormat,
    workWeek: 'Monday - Friday',
    autoClockoutHours: '12',
    biometricPort: '8080',
    biometricSecret: '••••••••••••••••••••••••',
  });

  const [notifications, setNotifications] = useState({
    emailOnLeaveRequest: true,
    emailOnPayrollRun: true,
    slackWebhook: true,
    smsUrgentNotices: false,
  });

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings({
      timezone: companySettings.timezone,
      timeFormat: companySettings.timeFormat,
      dateFormat: companySettings.dateFormat,
      currency: companySettings.currency,
    });
    setToastMsg('🎉 Enterprise settings & Regional formats saved and applied across the entire system!');
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Organization & Localization Profile */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Timezone & Regional Format</h3>
              <p className="text-xs text-slate-400">Global company timezone, monetary localization, and date/time formatting</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Primary Timezone</span>
              </label>
              <select
                value={companySettings.timezone}
                onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })}
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
                value={companySettings.currency}
                onChange={(e) => setCompanySettings({ ...companySettings, currency: e.target.value })}
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
                value={companySettings.timeFormat}
                onChange={(e) => setCompanySettings({ ...companySettings, timeFormat: e.target.value })}
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
                value={companySettings.dateFormat}
                onChange={(e) => setCompanySettings({ ...companySettings, dateFormat: e.target.value })}
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

          <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-blue-900 dark:text-blue-300">Live Format Preview:</span>
            <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
              {formatDate(new Date())} • {formatTime(new Date(), true)} ({companySettings.timezone})
            </span>
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
                value={companySettings.companyName}
                onChange={(e) => setCompanySettings({ ...companySettings, companyName: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Corporate Domain</label>
              <input
                type="text"
                value={companySettings.domain}
                onChange={(e) => setCompanySettings({ ...companySettings, domain: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Standard Work Week</label>
              <input
                type="text"
                value={companySettings.workWeek}
                onChange={(e) => setCompanySettings({ ...companySettings, workWeek: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Auto Clock-Out Threshold</label>
              <input
                type="text"
                value={`${companySettings.autoClockoutHours} Hours`}
                onChange={(e) => setCompanySettings({ ...companySettings, autoClockoutHours: e.target.value.replace(/\D/g, '') })}
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
                value={companySettings.biometricPort}
                onChange={(e) => setCompanySettings({ ...companySettings, biometricPort: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Hardware Webhook Secret</label>
              <input
                type="password"
                value={companySettings.biometricSecret}
                onChange={(e) => setCompanySettings({ ...companySettings, biometricSecret: e.target.value })}
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
