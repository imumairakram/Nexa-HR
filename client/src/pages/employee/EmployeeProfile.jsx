import React, { useState, useEffect } from 'react';
import {
  Camera,
  User,
  Mail,
  Phone,
  MapPin,
  Shield,
  Key,
  CheckCircle2,
  Save,
  Building,
  Briefcase,
  Calendar,
  Lock,
  FileText,
  CreditCard,
  Download,
  Eye,
} from 'lucide-react';
import EmployeePageHeader from '../../components/navigation/EmployeePageHeader';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

const EmployeeProfile = () => {
  const [activeTab, setActiveTab] = useState('personal');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [avatar, setAvatar] = useState(DEFAULT_AVATAR);

  // Profile Form State
  const [formData, setFormData] = useState({
    firstName: 'Alex',
    lastName: 'Mercer',
    email: 'employee@company.com',
    phone: '+1 (555) 438-9201',
    designation: 'Senior Full-Stack Engineer',
    department: 'Engineering & DevOps',
    location: 'Silicon Valley, CA (HQ)',
    empCode: 'EMP-101',
    joinDate: '2022-03-15',
    employmentType: 'Full-Time / Permanent',
    reportingManager: 'System Administrator (HR)',
    shift: 'General Shift (09:00 AM - 05:30 PM)',
    dob: '1992-06-18',
    gender: 'Male',
    bloodGroup: 'O+ Positive',
    address: '742 Evergreen Terrace, Palo Alto, CA 94301',
    emergencyContact: 'Elena Mercer (Spouse) - +1 (555) 891-2244',
    bankName: 'Chase JPMorgan Enterprise',
    bankAccount: '•••• •••• •••• 4892',
    routingNumber: '021000021',
    taxId: 'XXX-XX-8491',
  });

  // Password state
  const [passwords, setPasswords] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        setFormData((prev) => ({
          ...prev,
          firstName: u.firstName || prev.firstName,
          lastName: u.lastName || prev.lastName,
          email: u.email || prev.email,
        }));
      } catch {}
    }
    const storedAvatar = localStorage.getItem('user_avatar');
    if (storedAvatar) setAvatar(storedAvatar);
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result;
        setAvatar(base64Image);
        localStorage.setItem('user_avatar', base64Image);
        window.dispatchEvent(new Event('user_profile_updated'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSavedSuccess(true);
    const updatedUser = {
      ...formData,
      avatar,
      role: 'EMPLOYEE',
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    window.dispatchEvent(new Event('user_profile_updated'));
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800 dark:text-slate-100">
      <EmployeePageHeader
        title="My Profile & Document Vault"
        subtitle="Manage your personal details, employment data, bank coordinates, and security."
      />

      {savedSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. PROFILE BANNER & AVATAR */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-6">
        <div className="relative group">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden ring-4 ring-emerald-500/20 bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
            <img src={avatar} alt="Profile Avatar" className="w-full h-full object-cover" />
          </div>
          <label className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg cursor-pointer transition-transform group-hover:scale-110">
            <Camera className="w-4 h-4" />
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {formData.firstName} {formData.lastName}
            </h2>
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              {formData.empCode} • Full-Time
            </span>
          </div>

          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {formData.designation} • {formData.department}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{formData.email}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{formData.location}</span>
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TABBED NAVIGATION */}
      {/* ========================================================================= */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        {[
          { key: 'personal', label: 'Personal Information', icon: User },
          { key: 'job', label: 'Employment Details', icon: Briefcase },
          { key: 'bank', label: 'Bank & Payroll', icon: CreditCard },
          { key: 'docs', label: 'Document Vault', icon: FileText },
          { key: 'security', label: 'Password & Security', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === tab.key
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENTS */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 sm:p-8 shadow-soft border border-slate-100 dark:border-slate-800">
        {/* TAB: PERSONAL */}
        {activeTab === 'personal' && (
          <form onSubmit={handleSave} className="space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group
                </label>
                <input
                  type="text"
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Residential Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Emergency Contact
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-medium text-slate-800 dark:text-slate-200"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB: JOB */}
        {activeTab === 'job' && (
          <div className="space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Official Employment Records
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 font-semibold block">Employee ID</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{formData.empCode}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 font-semibold block">Date of Joining</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{formData.joinDate} (4+ yrs)</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 font-semibold block">Designation</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{formData.designation}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 font-semibold block">Department</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{formData.department}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 font-semibold block">Reporting Manager</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{formData.reportingManager}</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-slate-400 font-semibold block">Shift Schedule</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{formData.shift}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: BANK */}
        {activeTab === 'bank' && (
          <div className="space-y-6">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Bank Account & Direct Deposit Info
            </h3>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-4 max-w-lg shadow-lg">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Direct Deposit Verified</span>
                <Shield className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-lg font-mono font-bold tracking-widest">{formData.bankAccount}</div>
              <div className="flex justify-between items-end text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Bank Name</div>
                  <div className="font-bold">{formData.bankName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Routing / IFSC</div>
                  <div className="font-bold font-mono">{formData.routingNumber}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DOCS */}
        {activeTab === 'docs' && (
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Document Vault & Certificates
            </h3>

            <div className="space-y-2.5">
              {[
                { name: 'National ID / Passport Verification.pdf', size: '2.4 MB', date: 'Verified Mar 2022' },
                { name: 'Official Employment Contract & NDA.pdf', size: '1.8 MB', date: 'Signed Mar 2022' },
                { name: 'B.S. in Computer Science Degree Certificate.pdf', size: '3.1 MB', date: 'Verified' },
                { name: 'AWS Certified Solutions Architect Certificate.pdf', size: '1.2 MB', date: 'Verified Jan 2025' },
              ].map((doc, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{doc.name}</div>
                      <div className="text-[10px] text-slate-400">{doc.size} • {doc.date}</div>
                    </div>
                  </div>

                  <button className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 flex items-center gap-1 cursor-pointer">
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: SECURITY */}
        {activeTab === 'security' && (
          <div className="space-y-6 max-w-lg">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Password & Account Security
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSavedSuccess(true);
                setPasswords({ current: '', newPass: '', confirmPass: '' });
                setTimeout(() => setSavedSuccess(false), 3000);
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwords.newPass}
                  onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwords.confirmPass}
                  onChange={(e) => setPasswords({ ...passwords, confirmPass: e.target.value })}
                  required
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeProfile;
