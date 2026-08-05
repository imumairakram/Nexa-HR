import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Cpu,
  Shield,
  Bell,
  Save,
  CheckCircle,
  RefreshCw,
  Lock,
  Globe,
  Radio,
  Sun,
  Moon,
  Monitor,
  Check,
} from 'lucide-react';
import AppPageHeader from '../../components/navigation/AppPageHeader';
import { useTheme } from '../../context/ThemeContext';

const Settings = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('company');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form states
  const [companyInfo, setCompanyInfo] = useState({
    name: 'Acme Enterprise Corporation',
    code: 'ACME-2026',
    address: '742 Evergreen Terrace, Silicon Valley, CA 94025',
    currency: 'USD ($)',
    timeZone: 'UTC-08:00 (Pacific Time)',
    supportEmail: 'hr-support@acme.com',
  });

  const [hardwareConfig, setHardwareConfig] = useState({
    deviceIp: '192.168.1.200',
    port: '4370',
    protocol: 'TCP/IP (ZKTeco Native)',
    secretKey: 'nexahr_biometric_hardware_secret_2026',
    autoSyncMinutes: '5',
    isAutoSyncEnabled: true,
  });

  const [permissions, setPermissions] = useState({
    adminPim: true,
    adminAtt: true,
    adminPayroll: true,
    hrPim: true,
    hrAtt: true,
    hrPayroll: true,
    empSelfAtt: true,
    empSelfLeave: true,
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 800);
  };

  return (
    <div className="space-y-6 text-slate-800">
      {/* Top Header matching exact reference screenshot */}
      <AppPageHeader title="System Controls & Preferences" />

      {savedSuccess && (
        <div className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>Settings saved successfully in system!</span>
        </div>
      )}

      {/* Settings Tab Bar */}
      <div className="bg-white p-2 rounded-3xl shadow-soft border border-slate-100/80 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'company', label: 'Company Profile', icon: Building },
          { id: 'appearance', label: 'Appearance & Theme', icon: Sun },
          { id: 'biometric', label: 'Biometric Hardware', icon: Cpu },
          { id: 'rbac', label: 'Roles & Permissions', icon: Shield },
          { id: 'security', label: 'Security & Alerts', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100/80">
        {activeTab === 'company' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Organization Profile</h3>
              <p className="text-xs text-slate-500">General company details displayed across payslips and headers.</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Legal Name</label>
                <input
                  type="text"
                  value={companyInfo.name}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company Code / Tax ID</label>
                <input
                  type="text"
                  value={companyInfo.code}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, code: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Official Address</label>
              <input
                type="text"
                value={companyInfo.address}
                onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Default Currency</label>
                <input
                  type="text"
                  value={companyInfo.currency}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, currency: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Time Zone</label>
                <input
                  type="text"
                  value={companyInfo.timeZone}
                  onChange={(e) => setCompanyInfo({ ...companyInfo, timeZone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Appearance & Interface Theme</h3>
              <p className="text-xs text-slate-500">Choose your preferred visual theme for the NexaHR web application dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Light Mode Card */}
              <div
                onClick={() => setTheme('light')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 ${
                  theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  {theme === 'light' && (
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Light Mode</h4>
                  <p className="text-xs text-slate-500 mt-1">Clean, bright minimalist aesthetics with soft pastel accents.</p>
                </div>
                <div className="h-16 rounded-xl border border-slate-200 bg-white p-2.5 space-y-1.5 shadow-inner">
                  <div className="h-2 w-16 bg-slate-200 rounded-full"></div>
                  <div className="h-2 w-24 bg-indigo-200 rounded-full"></div>
                  <div className="h-2 w-12 bg-slate-100 rounded-full"></div>
                </div>
              </div>

              {/* Dark Mode Card */}
              <div
                onClick={() => setTheme('dark')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 ${
                  theme === 'dark'
                    ? 'border-indigo-600 bg-slate-900/10 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center">
                    <Moon className="w-5 h-5" />
                  </div>
                  {theme === 'dark' && (
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Dark Mode</h4>
                  <p className="text-xs text-slate-500 mt-1">Sleek, high-contrast dark palette designed for reduced eye strain.</p>
                </div>
                <div className="h-16 rounded-xl border border-slate-700 bg-slate-900 p-2.5 space-y-1.5 shadow-inner">
                  <div className="h-2 w-16 bg-slate-700 rounded-full"></div>
                  <div className="h-2 w-24 bg-indigo-500/50 rounded-full"></div>
                  <div className="h-2 w-12 bg-slate-800 rounded-full"></div>
                </div>
              </div>

              {/* System Preference Card */}
              <div
                onClick={() => setTheme('system')}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all flex flex-col justify-between space-y-4 ${
                  theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Monitor className="w-5 h-5" />
                  </div>
                  {theme === 'system' && (
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">System Auto</h4>
                  <p className="text-xs text-slate-500 mt-1">Automatically match your operating system theme settings.</p>
                </div>
                <div className="h-16 rounded-xl border border-slate-200 bg-gradient-to-r from-white to-slate-900 p-2.5 flex items-center justify-between shadow-inner">
                  <div className="h-2 w-10 bg-slate-300 rounded-full"></div>
                  <div className="h-2 w-10 bg-slate-600 rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Currently Active Theme:</span>
                <span className="capitalize px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold">
                  {theme === 'system' ? `System (${resolvedTheme} mode active)` : `${theme} mode`}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'biometric' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Biometric Hardware Gateway Config</h3>
              <p className="text-xs text-slate-500">Configure TCP/IP device listener for ZKTeco and real-time punch clock devices.</p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <Radio className="w-5 h-5 text-emerald-600 animate-pulse" />
                <div>
                  <p className="font-bold">Hardware Listener Active</p>
                  <p className="text-emerald-700">Listening on port 4370 for incoming attendance logs.</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-600 text-white rounded-full font-bold text-[10px]">Connected</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Device IP Address</label>
                <input
                  type="text"
                  value={hardwareConfig.deviceIp}
                  onChange={(e) => setHardwareConfig({ ...hardwareConfig, deviceIp: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Listening Port</label>
                <input
                  type="text"
                  value={hardwareConfig.port}
                  onChange={(e) => setHardwareConfig({ ...hardwareConfig, port: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hardware Secret Auth Key</label>
              <input
                type="password"
                value={hardwareConfig.secretKey}
                onChange={(e) => setHardwareConfig({ ...hardwareConfig, secretKey: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium font-mono"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoSync"
                checked={hardwareConfig.isAutoSyncEnabled}
                onChange={(e) => setHardwareConfig({ ...hardwareConfig, isAutoSyncEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-400 cursor-pointer"
              />
              <label htmlFor="autoSync" className="text-xs font-bold text-slate-800 cursor-pointer">
                Enable 5-minute automated polling & biometric data sync
              </label>
            </div>
          </div>
        )}

        {activeTab === 'rbac' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Role-Based Access Control (RBAC) Matrix</h3>
              <p className="text-xs text-slate-500">Manage operational permissions for ADMIN, HR_MANAGER, and EMPLOYEE roles.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-bold text-slate-400 border-b border-slate-100 uppercase">
                    <th className="pb-3 px-3">Module / Permission</th>
                    <th className="pb-3 px-3 text-center">ADMIN</th>
                    <th className="pb-3 px-3 text-center">HR MANAGER</th>
                    <th className="pb-3 px-3 text-center">EMPLOYEE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Personnel Information (PIM) Full Edit</td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked disabled /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" disabled /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Attendance Log Manual Overrides</td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked disabled /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" disabled /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Approve & Reject Leave Applications</td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked disabled /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" disabled /></td>
                  </tr>
                  <tr>
                    <td className="py-3 px-3 font-bold text-slate-900">Payroll Run Execution & Payslips</td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked disabled /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" defaultChecked /></td>
                    <td className="py-3 px-3 text-center"><input type="checkbox" disabled /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Security & Token Authentication</h3>
              <p className="text-xs text-slate-500">Configure JWT token expiration, password strength, and audit logs.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">JWT Session Token Lifetime</label>
                <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium">
                  <option value="7d">7 Days (Recommended)</option>
                  <option value="24h">24 Hours</option>
                  <option value="30d">30 Days</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input type="checkbox" id="mfa" defaultChecked className="w-4 h-4 rounded text-slate-900" />
                <label htmlFor="mfa" className="text-xs font-bold text-slate-800 cursor-pointer">
                  Require strong password hashing (bcrypt salt factor 10)
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Form Footer Save Button */}
        <div className="pt-6 border-t border-slate-100 mt-8 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;
