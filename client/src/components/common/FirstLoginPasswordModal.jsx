import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, KeyRound, CheckCircle2, RefreshCw, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { isDemoSessionActive } from '../../demo/demoSession';

const FirstLoginPasswordModal = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const checkUserStatus = () => {
    try {
      if (isDemoSessionActive()) {
        setShowModal(false);
        return;
      }
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        const isDemo = Boolean(u?.isDemo);
        if (!isDemo && u && u.mustChangePassword === true) {
          setShowModal(true);
        } else {
          setShowModal(false);
        }
      }
    } catch (e) {
      console.warn(e);
    }
  };

  useEffect(() => {
    checkUserStatus();

    const handleStorageUpdate = () => checkUserStatus();
    window.addEventListener('user_profile_updated', handleStorageUpdate);
    window.addEventListener('storage', handleStorageUpdate);
    return () => {
      window.removeEventListener('user_profile_updated', handleStorageUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, []);

  if (!showModal || !user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword || !form.newPassword) {
      setToastMsg('Please enter your current temporary password and your new password.');
      return;
    }

    if (form.newPassword.length < 10) {
      setToastMsg('New password must be at least 10 characters long with uppercase, lowercase, digit, and symbol.');
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setToastMsg('New passwords do not match. Please re-confirm.');
      return;
    }

    setSubmitting(true);
    setToastMsg('');

    try {
      const res = await api.changeMyPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });

      if (res?.success) {
        // Update user object in local storage
        const updatedUser = { ...user, mustChangePassword: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('user_profile_updated'));
        window.dispatchEvent(new Event('storage'));

        setShowModal(false);
      } else {
        setToastMsg(res?.message || 'Failed to update password. Please verify current temporary password.');
      }
    } catch (err) {
      console.error('Failed to change password:', err);
      setToastMsg(err.message || 'Incorrect temporary password or network error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8 animate-in fade-in duration-200">
      <div className="bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-2xl rounded-3xl max-w-xl sm:max-w-2xl w-full shadow-2xl border border-sky-200/80 dark:border-sky-800/60 overflow-hidden animate-in zoom-in-95 duration-200 relative">
        
        {/* Light Sky Blue Ambient Glow Orbs */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-sky-400/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-300/20 dark:bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header Banner */}
        <div className="px-6 sm:px-8 py-5 sm:py-6 border-b border-sky-100/80 dark:border-sky-800/60 flex items-start gap-4 sm:gap-5 bg-gradient-to-r from-sky-50/90 via-sky-100/70 to-blue-50/60 dark:from-sky-950/60 dark:via-sky-900/40 dark:to-[#1E293B] relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/25 ring-4 ring-sky-500/15">
            <KeyRound className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider bg-sky-100/90 text-sky-700 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                First-Time Login Security Setup
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Password Update Required
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              Welcome, <strong className="text-slate-900 dark:text-white font-bold">{user.firstName}</strong>! Your account was provisioned with a temporary default password. For your security, you must update your password before accessing the system.
            </p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 relative z-10 space-y-5">
          {toastMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{toastMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Current Temporary Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showCurrentPass ? 'text' : 'password'}
                  required
                  placeholder="Enter temporary password provided by HR..."
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-sky-50/40 dark:bg-slate-800/80 border border-sky-200/70 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm font-semibold placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-xs pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1"
                  aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                New Password <span className="text-rose-500">*</span> <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">(Min 6 characters)</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  placeholder="Choose a strong private password..."
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-sky-50/40 dark:bg-slate-800/80 border border-sky-200/70 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm font-semibold placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-xs pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1"
                  aria-label={showNewPass ? 'Hide password' : 'Show password'}
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPass ? 'text' : 'password'}
                  required
                  placeholder="Re-enter new password to verify..."
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-sky-50/40 dark:bg-slate-800/80 border border-sky-200/70 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-sm font-semibold placeholder:font-sans placeholder:font-normal placeholder:text-slate-400 focus:ring-2 focus:ring-sky-500/25 focus:border-sky-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all shadow-xs pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors p-1"
                  aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-sky-100/80 dark:border-slate-800/80">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 active:from-sky-700 active:to-blue-800 text-white font-extrabold text-sm shadow-md shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Credentials...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 stroke-[2.4]" />
                    <span>Set New Password & Access System</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FirstLoginPasswordModal;
