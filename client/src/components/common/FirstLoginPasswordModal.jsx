import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, KeyRound, CheckCircle2, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { api } from '../../services/api';

const FirstLoginPasswordModal = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const checkUserStatus = () => {
    try {
      const stored = localStorage.getItem('user');
      const isGuestFlag = localStorage.getItem('isGuest') === 'true';
      if (stored) {
        const u = JSON.parse(stored);
        setUser(u);
        const isDemo = isGuestFlag || u.isGuest || ['hr@nexahr.com', 'user@nexahr.com', 'admin@nexahr.com'].includes(u.email?.toLowerCase());
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

    if (form.newPassword.length < 6) {
      setToastMsg('New password must be at least 6 characters long.');
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
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1E293B] rounded-[32px] max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/25 shrink-0">
            <KeyRound className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-1">
              First-Time Login Security Setup
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
              Password Update Required
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-relaxed">
              Welcome, <strong className="text-slate-800 dark:text-slate-200">{user.firstName}</strong>! Your account was provisioned with a temporary default password. For your security, you must update your password before accessing the system.
            </p>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
              Current Temporary Password *
            </label>
            <div className="relative">
              <input
                type={showCurrentPass ? 'text' : 'password'}
                required
                placeholder="Enter temporary password provided by HR..."
                value={form.currentPassword}
                onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
              New Password * (Min 6 characters)
            </label>
            <div className="relative">
              <input
                type={showNewPass ? 'text' : 'password'}
                required
                placeholder="Choose a strong private password..."
                value={form.newPassword}
                onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-200 font-bold mb-1.5">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              placeholder="Re-enter new password to verify..."
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-semibold focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Credentials...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
                  <span>Set New Password & Access System</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FirstLoginPasswordModal;
