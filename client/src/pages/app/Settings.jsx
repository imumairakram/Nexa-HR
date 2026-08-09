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
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [toastMsg, setToastMsg] = useState('');

  const [companySettings, setCompanySettings] = useState({
    companyName: 'NexaHR Enterprise Systems Inc.',
    domain: 'nexahr.internal',
    fiscalYearStart: 'January',
    currency: 'USD ($)',
    timezone: 'America/Los_Angeles (PST - UTC-8)',
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
    setToastMsg('System settings saved successfully!');
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
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Organization & Currency</h3>
              <p className="text-xs text-slate-400">Global company naming and monetary localization</p>
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
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Base System Currency</label>
              <select
                value={companySettings.currency}
                onChange={(e) => setCompanySettings({ ...companySettings, currency: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="USD ($)">USD - US Dollar ($)</option>
                <option value="EUR (€)">EUR - Euro (€)</option>
                <option value="GBP (£)">GBP - British Pound (£)</option>
                <option value="CAD ($)">CAD - Canadian Dollar ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Primary Timezone</label>
              <select
                value={companySettings.timezone}
                onChange={(e) => setCompanySettings({ ...companySettings, timezone: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none cursor-pointer"
              >
                <option value="America/Los_Angeles (PST - UTC-8)">America/Los_Angeles (PST - UTC-8)</option>
                <option value="America/New_York (EST - UTC-5)">America/New_York (EST - UTC-5)</option>
                <option value="Europe/London (GMT - UTC+0)">Europe/London (GMT - UTC+0)</option>
                <option value="Asia/Dubai (GST - UTC+4)">Asia/Dubai (GST - UTC+4)</option>
              </select>
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
          </div>
        </div>

        {/* 2. Biometric Hardware & IoT Gateway Port */}
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
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Hardware Socket Port</label>
              <input
                type="text"
                value={companySettings.biometricPort}
                onChange={(e) => setCompanySettings({ ...companySettings, biometricPort: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">Gateway Secret Token</label>
              <input
                type="password"
                value={companySettings.biometricSecret}
                onChange={(e) => setCompanySettings({ ...companySettings, biometricSecret: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Notifications & Alert Triggers */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="w-9 h-9 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Alert Dispatch Triggers</h3>
              <p className="text-xs text-slate-400">Automated notification broadcasts to admins and employees</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Email on New Leave Application</div>
                <div className="text-slate-400 text-[11px]">Send immediate email alert when an employee submits time-off</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailOnLeaveRequest}
                onChange={(e) => setNotifications({ ...notifications, emailOnLeaveRequest: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Email on Payroll Batch Completion</div>
                <div className="text-slate-400 text-[11px]">Notify all employees when monthly payslips are ready for download</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailOnPayrollRun}
                onChange={(e) => setNotifications({ ...notifications, emailOnPayrollRun: e.target.checked })}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-7 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer transition-all hover:scale-105"
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
