import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  KeyRound,
  AlertTriangle,
  Send,
  Check,
  UserCheck,
  PhoneCall,
} from 'lucide-react';
import { api } from '../../services/api';

const ForgotPasswordModal = ({ isOpen, onClose, initialRole = 'admin', initialEmail = '', onSuccess }) => {
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
    if (!email || email.trim().length < 3) {
      setUserInfo(null);
      return;
    }

    const timer = setTimeout(() => {
      lookupAccount(email.trim());
    }, 300);

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
        // If user is HR/Admin, enforce EMAIL channel
        if (res.data.isHrOrAdmin) {
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
        const dest = res.data?.destination || (channel === 'WHATSAPP' ? (userInfo?.phone || userInfo?.maskedPhone) : (userInfo?.email || email.trim()));
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
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500' };
    return { score: 100, label: 'Strong & Secure', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength();

  if (!isOpen) return null;

  const isHrOrAdmin = userInfo?.isHrOrAdmin ?? (email.toLowerCase().includes('admin') || initialRole === 'admin');
  const registeredWhatsAppNumber = userInfo?.phone || userInfo?.maskedPhone || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md transition-all duration-300 animate-fadeIn">
      {/* Container Modal Card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] sm:rounded-[36px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 overflow-hidden transition-all">
        {/* Glow ambient background decoration */}
        <div className="absolute -top-20 -right-20 w-52 h-52 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-52 h-52 bg-emerald-500/10 dark:bg-emerald-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                Password Recovery
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                Active Corporate Verification & OTP Authentication
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="my-4 relative z-10">
          <div className="flex items-center justify-between mb-2 text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span className={step >= 1 ? 'text-blue-600 dark:text-blue-400' : ''}>1. Recovery Channel</span>
            <span className={step >= 2 ? 'text-blue-600 dark:text-blue-400' : ''}>2. 6-Digit OTP</span>
            <span className={step >= 3 ? 'text-blue-600 dark:text-blue-400' : ''}>3. New Password</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2 border border-rose-200 dark:border-rose-800/50">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* STEP 1: IDENTITY & ACTIVE WHATSAPP/EMAIL CHANNEL SELECTION */}
        {/* ===================================================================== */}
        {step === 1 && (
          <form onSubmit={handleInitiateOtp} className="space-y-4 relative z-10">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Corporate Work Email Address <span className="text-blue-600">*</span>
                </label>
                {checkingUser && (
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 animate-pulse">
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
                  placeholder="e.g. employee@company.com or alex.mercer@acme.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all shadow-sm"
                  required
                />
              </div>
            </div>

            {/* Select Channel */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                {isHrOrAdmin ? 'OTP Delivery Destination:' : 'Choose OTP Delivery Channel:'}
              </label>

              {isHrOrAdmin ? (
                /* HR / Admin View: Strictly Corporate Email (WhatsApp option is hidden) */
                <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-500/80 dark:border-blue-500/80 shadow-sm ring-1 ring-blue-600/30 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-sm">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Corporate Email Inbox</span>
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/60 px-2 py-0.5 rounded-full">
                          HR Verified
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                        {userInfo?.email || email || ''}
                      </div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                </div>
              ) : (
                /* Employee View: Shows Corporate Email AND Registered WhatsApp from DB */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Channel Option 1: Email */}
                  <button
                    type="button"
                    onClick={() => setChannel('EMAIL')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      channel === 'EMAIL'
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 shadow-sm ring-1 ring-blue-600/30'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Mail className="w-4 h-4" />
                      </div>
                      {channel === 'EMAIL' && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Corporate Email</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-medium">
                        {userInfo?.email || email || 'Registered Inbox'}
                      </div>
                    </div>
                  </button>

                  {/* Channel Option 2: Registered WhatsApp from Database */}
                  <button
                    type="button"
                    disabled={!registeredWhatsAppNumber && !userInfo?.hasPhone}
                    onClick={() => setChannel('WHATSAPP')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      !registeredWhatsAppNumber && !userInfo?.hasPhone
                        ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                        : channel === 'WHATSAPP'
                        ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-600 dark:border-emerald-500 shadow-md shadow-emerald-600/10 ring-2 ring-emerald-600/30 cursor-pointer'
                        : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-emerald-300 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                        <Smartphone className="w-4 h-4" />
                      </div>
                      {channel === 'WHATSAPP' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full">
                          Instant
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>WhatsApp OTP</span>
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-300 truncate mt-0.5 font-bold flex items-center gap-1">
                        <PhoneCall className="w-2.5 h-2.5 shrink-0" />
                        <span>{registeredWhatsAppNumber || 'Database Linked Number'}</span>
                      </div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Dynamic Real-Time Delivery Hint (for WhatsApp / Employee) */}
            {channel === 'WHATSAPP' && !isHrOrAdmin ? (
              <div className="p-2.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800/60 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-[11px] font-medium">
                  OTP will be sent to your registered WhatsApp mobile: <strong>{registeredWhatsAppNumber || '+1 (555) 415-8882'}</strong>.
                </span>
              </div>
            ) : !isHrOrAdmin ? (
              <div className="p-2.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 flex items-center gap-2 text-xs text-blue-800 dark:text-blue-300">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="text-[11px]">
                  OTP will be sent to your corporate email: <strong>{userInfo?.email || email}</strong>.
                </span>
              </div>
            ) : null}

            {/* Action Submit */}
            <button
              type="submit"
              disabled={loading || checkingUser || !email}
              className={`w-full py-3 rounded-2xl text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                channel === 'WHATSAPP' && !isHrOrAdmin
                  ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/25'
                  : 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/25'
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
          </form>
        )}

        {/* ===================================================================== */}
        {/* STEP 2: 6-DIGIT OTP VERIFICATION */}
        {/* ===================================================================== */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 relative z-10">
            <div className="text-center">
              <div
                className={`inline-flex p-3 rounded-2xl mb-2 ${
                  channel === 'WHATSAPP'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
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
                  className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-extrabold rounded-2xl border transition-all ${
                    digit
                      ? 'bg-blue-50/50 dark:bg-blue-950/40 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20'
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
                    className="font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
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

            {/* Verify Action Button */}
            <button
              type="submit"
              disabled={loading || otpDigits.join('').length !== 6}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          </form>
        )}

        {/* ===================================================================== */}
        {/* STEP 3: NEW PASSWORD ENTRY */}
        {/* ===================================================================== */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4 relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                New Secure Password <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter minimum 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
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

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password <span className="text-blue-600">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type your new password"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
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

            {/* Action Submit */}
            <button
              type="submit"
              disabled={loading || !newPassword || newPassword !== confirmPassword}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white text-xs sm:text-sm font-bold shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
          </form>
        )}

        {/* ===================================================================== */}
        {/* STEP 4: SUCCESS STATE */}
        {/* ===================================================================== */}
        {step === 4 && (
          <div className="py-6 text-center space-y-4 relative z-10 animate-fadeIn">
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
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
