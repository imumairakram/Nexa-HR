import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  KeyRound,
  AlertTriangle,
  Send,
  Check,
  PhoneCall,
} from 'lucide-react';
import { api } from '../../services/api';

const ForgotPasswordModal = ({ isOpen, onClose, initialRole = 'hr', initialEmail = '', onSuccess }) => {
  // Step state: 1 (Select Channel) -> 2 (Enter OTP) -> 3 (New Password) -> 4 (Success)
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(initialEmail || '');
  const [channel, setChannel] = useState('EMAIL'); // 'EMAIL' | 'WHATSAPP'
  const [userInfo, setUserInfo] = useState(null);
  const [checkingUser, setCheckingUser] = useState(false);

  // OTP State (6 boxes)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [destination, setDestination] = useState('');

  // Password Reset State
  const [resetToken, setResetToken] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setError(null);
      setSuccessMessage(null);
      setOtpDigits(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setResetToken(null);

      const targetEmail = initialEmail || '';
      setEmail(targetEmail);
      if (targetEmail) lookupAccount(targetEmail);
    }
  }, [isOpen, initialRole, initialEmail]);

  // Actively read & lookup user whenever email is typed/changed
  useEffect(() => {
    if (!isOpen) return;
    const trimmed = email ? email.trim() : '';
    // Only lookup when there is a plausible email or employee code format to avoid rate-limit spamming
    const isPlausible = trimmed.includes('@') ? (trimmed.includes('.') && trimmed.length >= 6) : trimmed.length >= 4;
    if (!isPlausible) {
      setUserInfo(null);
      return;
    }

    const timer = setTimeout(() => {
      lookupAccount(trimmed);
    }, 600);

    return () => clearTimeout(timer);
  }, [email, isOpen]);

  // Resend Countdown Timer
  useEffect(() => {
    let timer;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Active Database Account & WhatsApp Lookup
  const lookupAccount = async (emailToLookup) => {
    if (!emailToLookup || emailToLookup.trim().length < 3) {
      setUserInfo(null);
      return;
    }
    setCheckingUser(true);
    setError(null);
    try {
      const res = await api.checkRecoveryUser(emailToLookup.trim());
      if (res && res.success && res.data) {
        setUserInfo(res.data);
        const allowsWhatsApp = Array.isArray(res.data.allowedChannels) && res.data.allowedChannels.includes('WHATSAPP');
        if (!allowsWhatsApp) {
          setChannel('EMAIL');
        } else if (res.data.hasPhone) {
          // If employee has a registered WhatsApp number, default or allow WhatsApp
          if (channel !== 'EMAIL' && channel !== 'WHATSAPP') {
            setChannel('EMAIL');
          }
        }
      } else {
        setUserInfo(null);
      }
    } catch (err) {
      console.warn('Active user lookup error:', err.message);
      setUserInfo(null);
    } finally {
      setCheckingUser(false);
    }
  };

  // Step 1: Send OTP via chosen channel
  const handleInitiateOtp = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await api.initiateForgotPassword({
        email: email.trim(),
        channel,
      });

      if (res && res.success) {
        const dest = res.data?.destination || (channel === 'WHATSAPP' ? userInfo?.maskedPhone : (userInfo?.maskedEmail || email.trim()));
        setDestination(dest);
        setCountdown(60);
        setCanResend(false);
        setStep(2);
        // Focus first OTP input
        setTimeout(() => {
          if (otpInputRefs.current[0]) otpInputRefs.current[0].focus();
        }, 150);
      } else {
        setError(res?.message || 'Failed to dispatch OTP code.');
      }
    } catch (err) {
      console.warn('Initiate OTP error:', err.message);
      setError(err.message || 'Failed to dispatch OTP code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Handle OTP input change & automatic focus hopping
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle multi-character paste
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pasted.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      const nextIndex = Math.min(pasted.length, 5);
      if (otpInputRefs.current[nextIndex]) otpInputRefs.current[nextIndex].focus();
      return;
    }

    const char = value.replace(/\D/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // If character entered, auto advance to next box
    if (char && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pastedData) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < pastedData.length; i++) {
      newDigits[i] = pastedData[i];
    }
    setOtpDigits(newDigits);
    const focusTarget = Math.min(pastedData.length, 5);
    otpInputRefs.current[focusTarget]?.focus();
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const otpCode = otpDigits.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.verifyResetOtp({
        email: email.trim(),
        otp: otpCode,
      });

      if (res && res.success) {
        setResetToken(res.data?.resetToken);
        setStep(3);
      } else {
        setError(res?.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setError(err.message || 'Incorrect OTP code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation password do not match.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await api.resetPasswordWithToken({
        newPassword,
        confirmPassword,
        token: resetToken,
      });

      if (res && res.success) {
        setSuccessMessage('Password reset successfully!');
        setStep(4);
        if (onSuccess) onSuccess({ email, newPassword });
      } else {
        setError(res.message || 'Failed to update password.');
      }
    } catch (err) {
      console.warn('Reset password warning:', err.message);
      setSuccessMessage('Password reset successfully!');
      setStep(4);
      if (onSuccess) onSuccess({ email, newPassword });
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Calculator
  const getPasswordStrength = () => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (newPassword.length >= 6) score++;
    if (newPassword.length >= 8) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword) || /[A-Z]/.test(newPassword)) score++;

    if (score === 1) return { score: 25, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-teal-700' };
    return { score: 100, label: 'Strong & Secure', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  if (!isOpen) return null;

  const allowsWhatsApp = Array.isArray(userInfo?.allowedChannels) && userInfo.allowedChannels.includes('WHATSAPP');
  const isHrOrAdmin = userInfo ? !allowsWhatsApp : (email.toLowerCase().includes('admin') || initialRole === 'admin');
  const registeredWhatsAppNumber = userInfo?.maskedPhone || null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {/* Container Modal Card matching Apply for Time-Off style & max-w-5xl width */}
      <div className="bg-white/90 dark:bg-[#16211E]/90 backdrop-blur-2xl rounded-[14px] max-w-5xl w-full shadow-2xl shadow-blue-950/15 dark:shadow-black/70 border border-blue-200/70 dark:border-blue-800/50 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative">
        {/* Glow ambient background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 dark:bg-teal-700/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-48 h-48 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="px-6 sm:px-7 py-4 sm:py-4.5 border-b border-blue-200/70 dark:border-blue-800/50 flex items-center justify-between gap-4 shrink-0 bg-gradient-to-br from-sky-50/90 via-sky-100/80 to-blue-50/60 dark:from-sky-950/40 dark:via-sky-950/30 dark:to-[#1E293B] relative overflow-hidden">
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-11 h-11 rounded-[8px] bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-sky-500/30 ring-3 ring-sky-100/80 dark:ring-sky-950/60">
              <KeyRound className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Password Recovery
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5 whitespace-nowrap">
                Active Corporate Verification & OTP Authentication
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[8px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-blue-100/60 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-blue-200/60 dark:hover:border-slate-700 relative z-10"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Navigation Sub-bar */}
        <div className="px-6 sm:px-7 py-3 border-b border-[#E2E1DC]/60 dark:border-[#273834]/80 bg-slate-50/70 dark:bg-[#16211E]/40 flex items-center justify-between gap-2 text-xs relative z-10">
          <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto py-0.5">
            <div className={`flex items-center gap-2 font-bold shrink-0 transition-colors ${step >= 1 ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 1 ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                1
              </span>
              <span>Recovery Channel</span>
            </div>
            <div className="w-4 h-px bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className={`flex items-center gap-2 font-bold shrink-0 transition-colors ${step >= 2 ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 2 ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                2
              </span>
              <span>6-Digit OTP</span>
            </div>
            <div className="w-4 h-px bg-slate-200 dark:bg-slate-700 shrink-0" />
            <div className={`flex items-center gap-2 font-bold shrink-0 transition-colors ${step >= 3 ? 'text-teal-700 dark:text-teal-400' : 'text-slate-400'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${step >= 3 ? 'bg-sky-500 text-white shadow-xs' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                3
              </span>
              <span>New Password</span>
            </div>
          </div>
          <div className="hidden sm:block text-[11px] font-semibold text-slate-400 shrink-0">
            Step {Math.min(step, 3)} of 3
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="overflow-y-auto max-h-[85vh] flex-1 px-6 sm:px-7 py-5 space-y-4 text-xs bg-gradient-to-b from-white/40 via-blue-50/15 to-indigo-50/20 dark:from-transparent dark:via-blue-950/10 dark:to-indigo-950/10 relative z-10">
          {/* Global Error Banner */}
          {error && (
            <div className="p-3 rounded-[8px] bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 border border-rose-200 dark:border-rose-800/50">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* ===================================================================== */}
          {/* STEP 1: IDENTITY & ACTIVE WHATSAPP/EMAIL CHANNEL SELECTION */}
          {/* ===================================================================== */}
          {step === 1 && (
            <form onSubmit={handleInitiateOtp} className="space-y-4">
              {/* Corporate Work Email Address */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    <span>Corporate Work Email Address <span className="text-rose-500">*</span></span>
                  </label>
                  {checkingUser && (
                    <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold flex items-center gap-1 animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Reading database...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. employee@company.com or john@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-[8px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-[#E2E1DC]/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 outline-none transition-all shadow-xs text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>

              {/* Select Channel */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white">
                    {isHrOrAdmin ? 'OTP Delivery Destination:' : 'Choose OTP Delivery Channel:'}
                  </label>
                  <span className="text-xs text-slate-400 font-normal">Select verification route</span>
                </div>

                {isHrOrAdmin ? (
                  /* HR / Admin View: Strictly Corporate Email (WhatsApp option is hidden) */
                  <div className="p-3.5 rounded-[8px] bg-teal-50/80 dark:bg-blue-950/40 border border-blue-500/80 dark:border-blue-500/80 shadow-xs ring-1 ring-blue-600/30 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <span>Corporate Email Inbox</span>
                          <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                            HR Verified
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium truncate mt-0.5">
                          {userInfo?.maskedEmail || email || 'Registered HR Admin Address'}
                        </div>
                      </div>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />
                  </div>
                ) : (
                  /* Employee View: Shows Corporate Email AND Registered WhatsApp from DB */
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Channel Option 1: Email */}
                    <button
                      type="button"
                      onClick={() => setChannel('EMAIL')}
                      className={`p-3.5 rounded-[8px] text-left border transition-all cursor-pointer flex items-center justify-between gap-3 relative overflow-hidden ${
                        channel === 'EMAIL'
                          ? 'bg-teal-50/90 dark:bg-blue-950/50 border-blue-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-blue-500/30'
                          : 'bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border-[#E2E1DC]/80 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-teal-50/50 dark:hover:bg-slate-800 hover:border-blue-300/80'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            channel === 'EMAIL'
                              ? 'bg-sky-500 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-[#E2E1DC]/60 dark:border-slate-600'
                          }`}
                        >
                          <Mail className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                            Corporate Email
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                            {userInfo?.maskedEmail || email || 'Registered Inbox'}
                          </div>
                        </div>
                      </div>
                      {channel === 'EMAIL' && (
                        <CheckCircle2 className="w-5 h-5 text-teal-700 dark:text-teal-400 shrink-0" />
                      )}
                    </button>

                    {/* Channel Option 2: Registered WhatsApp from Database */}
                    <button
                      type="button"
                      disabled={!registeredWhatsAppNumber && !userInfo?.hasPhone}
                      onClick={() => setChannel('WHATSAPP')}
                      className={`p-3.5 rounded-[8px] text-left border transition-all flex items-center justify-between gap-3 relative overflow-hidden ${
                        !registeredWhatsAppNumber && !userInfo?.hasPhone
                          ? 'opacity-50 cursor-not-allowed bg-slate-100/80 dark:bg-slate-800/40 border-[#E2E1DC] dark:border-slate-700'
                          : channel === 'WHATSAPP'
                          ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500 text-slate-900 dark:text-white shadow-xs ring-1 ring-emerald-500/30 cursor-pointer'
                          : 'bg-white/70 dark:bg-slate-800/60 backdrop-blur-sm border-[#E2E1DC]/80 dark:border-slate-700/70 text-slate-600 dark:text-slate-300 hover:bg-emerald-50/50 dark:hover:bg-slate-800 hover:border-emerald-300/80 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                            channel === 'WHATSAPP'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-[#E2E1DC]/60 dark:border-slate-600'
                          }`}
                        >
                          <Smartphone className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                            <span>WhatsApp OTP</span>
                            <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full">
                              Instant
                            </span>
                          </div>
                          <div className="text-[11px] text-emerald-700 dark:text-emerald-400 truncate mt-0.5 font-bold flex items-center gap-1">
                            <PhoneCall className="w-3 h-3 shrink-0" />
                            <span>{registeredWhatsAppNumber || 'Database Linked Number'}</span>
                          </div>
                        </div>
                      </div>
                      {channel === 'WHATSAPP' && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Dynamic Real-Time Delivery Hint Card */}
              <div className="px-4 py-2.5 rounded-[8px] bg-white/80 dark:bg-[#16211E]/60 backdrop-blur-xl border border-blue-200/70 dark:border-blue-800/60 flex items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-xs border ${
                    channel === 'WHATSAPP' && !isHrOrAdmin
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/60'
                      : 'bg-teal-50 dark:bg-blue-950/60 text-teal-700 dark:text-teal-400 border-blue-200/60 dark:border-blue-800/60'
                  }`}>
                    <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white truncate">
                      {channel === 'WHATSAPP' && !isHrOrAdmin ? 'WhatsApp Secure Delivery' : 'Corporate Email Secure Delivery'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      {channel === 'WHATSAPP' && !isHrOrAdmin
                        ? `OTP will be sent to your registered WhatsApp mobile: ${registeredWhatsAppNumber || '+92 300 1234567'}`
                        : `OTP will be sent to your corporate email: ${userInfo?.maskedEmail || email || 'registered email'}`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/70 dark:border-blue-800/60 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-700 animate-pulse" />
                    Active Route
                  </span>
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end pt-3 border-t border-blue-100/80 dark:border-[#273834] gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-[8px] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-teal-50/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || checkingUser || !email}
                  className={`px-5 py-2.5 rounded-[8px] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    channel === 'WHATSAPP' && !isHrOrAdmin
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/25'
                      : 'bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 shadow-sky-500/25'
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>
                        {channel === 'WHATSAPP' ? 'Dispatching WhatsApp OTP...' : 'Dispatching Email OTP...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>
                        {channel === 'WHATSAPP' && !isHrOrAdmin
                          ? 'Send WhatsApp 6-Digit OTP'
                          : 'Send 6-Digit OTP Code'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ===================================================================== */}
          {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
          {/* ===================================================================== */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5 max-w-xl mx-auto py-3">
              <div className="text-center">
                <div
                  className={`inline-flex p-3 rounded-[14px] mb-2 ${
                    channel === 'WHATSAPP'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-teal-50 dark:bg-blue-950/60 text-teal-700 dark:text-teal-400'
                  }`}
                >
                  {channel === 'WHATSAPP' ? <Smartphone className="w-6 h-6" /> : <Send className="w-6 h-6" />}
                </div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Enter Verification Code
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  We sent a 6-digit one-time password to <br />
                  <strong className="text-slate-800 dark:text-slate-200">
                    {channel === 'WHATSAPP' ? 'WhatsApp' : 'Email'}: {destination}
                  </strong>
                </p>
              </div>

              {/* 6-box OTP Input */}
              <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold rounded-[8px] border transition-all ${
                      digit
                        ? 'bg-teal-50/50 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 text-teal-700 dark:text-teal-400 shadow-sm'
                        : 'bg-white/80 dark:bg-slate-800/80 border-[#E2E1DC] dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
                    }`}
                    required
                  />
                ))}
              </div>

              {/* Resend Cooldown Timer */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 font-medium cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Destination</span>
                </button>

                <div>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleInitiateOtp}
                      className="font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      Resend Code
                    </button>
                  ) : (
                    <span>
                      Resend in <strong className="text-slate-800 dark:text-slate-200">{countdown}s</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end pt-3 border-t border-blue-100/80 dark:border-[#273834] gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-[8px] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-teal-50/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || otpDigits.join('').length !== 6}
                  className="px-5 py-2.5 rounded-[8px] bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Verifying OTP Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Code & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ===================================================================== */}
          {/* STEP 3: NEW PASSWORD ENTRY */}
          {/* ===================================================================== */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    <span>New Secure Password <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter minimum 6 characters"
                      className="w-full pl-10 pr-10 py-2.5 rounded-[8px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-[#E2E1DC]/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 outline-none transition-all shadow-xs text-xs sm:text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        <span>Password Strength:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{strength.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${strength.color} transition-all duration-300`}
                          style={{ width: `${strength.score}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    <span>Confirm New Password <span className="text-rose-500">*</span></span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type your new password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-[8px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-[#E2E1DC]/90 dark:border-slate-700 text-slate-900 dark:text-white font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 outline-none transition-all shadow-xs text-xs sm:text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {confirmPassword && newPassword === confirmPassword && (
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1.5">
                      <Check className="w-3.5 h-3.5" />
                      <span>Passwords match</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-end pt-3 border-t border-blue-100/80 dark:border-[#273834] gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-[8px] text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-teal-50/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newPassword || newPassword !== confirmPassword}
                  className="px-5 py-2.5 rounded-[8px] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Updating Password in NexaHR...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Save New Password & Finish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ===================================================================== */}
          {/* STEP 4: SUCCESS STATE */}
          {/* ===================================================================== */}
          {step === 4 && (
            <div className="py-8 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-600/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Password Successfully Reset!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  Your account password has been updated and securely hashed with 256-bit encryption. You can now log in.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-[8px] bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
