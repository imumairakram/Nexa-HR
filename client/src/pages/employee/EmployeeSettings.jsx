import React, { useState } from 'react';
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
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';
import { useTheme } from '../../context/ThemeContext';

const EmployeeSettings = () => {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [toastMsg, setToastMsg] = useState('');

  const [settings, setSettings] = useState({
    emailLeaves: true,
    emailPayslip: true,
    emailAnnouncements: true,
    emailReminders: true,
    twoFactor: false,
    timezone: 'America/Los_Angeles (PST)',
    timeFormat: '12h',
  });

  const handleSave = (e) => {
    e.preventDefault();
    setToastMsg('Preferences updated successfully!');
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="Settings & Workspace Preferences"
        subtitle="Customize your notification channels, color themes, and timezone preferences."
      />

      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        {/* ========================================================================= */}
        {/* 1. APPEARANCE & THEME */}
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
        {/* 2. NOTIFICATIONS PREFERENCES */}
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
                    checked={settings[n.key]}
                    onChange={(e) => setSettings({ ...settings, [n.key]: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. LOCALIZATION & SECURITY */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-500" />
              <span>Timezone & Regional Format</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Ensure timestamps match your work location
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Timezone
              </label>
              <select
                value={settings.timezone}
                onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="America/Los_Angeles (PST)">Pacific Time (US & Canada) - PST</option>
                <option value="America/New_York (EST)">Eastern Time (US & Canada) - EST</option>
                <option value="Europe/London (GMT)">London - GMT</option>
                <option value="Asia/Karachi (PKT)">Islamabad, Karachi - PKT</option>
                <option value="Asia/Dubai (GST)">Dubai - GST</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Time Display Format
              </label>
              <select
                value={settings.timeFormat}
                onChange={(e) => setSettings({ ...settings, timeFormat: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
              >
                <option value="12h">12-Hour Format (e.g. 09:30 AM)</option>
                <option value="24h">24-Hour Format (e.g. 09:30)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
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
