const express = require('express');
const router = express.Router();
const {
  getAuthConfig,
  registerAdmin,
  login,
  demoLogin,
  logout,
  getMe,
  checkRecoveryUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  updateMyProfile,
  changeMyPassword,
} = require('../controllers/auth.controller');
const { verifyToken, blockDemo } = require('../middlewares/auth.middleware');
const {
  authRateLimiter,
  passwordResetRateLimiter,
  recoveryCheckRateLimiter,
  recoveryCheckIdentifierLimiter,
  guestLoginRateLimiter,
} = require('../middlewares/rateLimiter.middleware');
const {
  loginValidationRules,
  forgotPasswordValidationRules,
  verifyOtpValidationRules,
  resetPasswordValidationRules,
  changePasswordValidationRules,
} = require('../middlewares/validator.middleware');

// ====================================================
// CORE AUTHENTICATION ROUTES
// ====================================================
router.get('/config', getAuthConfig);
router.post('/register-admin', registerAdmin);
router.post('/login', authRateLimiter, loginValidationRules, login);
router.post('/demo-login', guestLoginRateLimiter, demoLogin);
router.post('/guest-login', guestLoginRateLimiter, demoLogin);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, blockDemo, updateMyProfile);
router.put('/change-password', verifyToken, blockDemo, changePasswordValidationRules, changeMyPassword);

// ====================================================
// EPHEMERAL CRYPTOGRAPHIC PASSWORD RECOVERY ROUTES
// ====================================================
router.post('/forgot-password', passwordResetRateLimiter, forgotPasswordValidationRules, forgotPassword);
router.post('/verify-otp', passwordResetRateLimiter, verifyOtpValidationRules, verifyResetOtp);
router.post('/reset-password', passwordResetRateLimiter, resetPasswordValidationRules, resetPassword);

// Aliases for seamless backward compatibility
router.post('/forgot-password/check', recoveryCheckRateLimiter, recoveryCheckIdentifierLimiter, checkRecoveryUser);
router.post('/forgot-password/initiate', passwordResetRateLimiter, forgotPasswordValidationRules, forgotPassword);
router.post('/forgot-password/verify-otp', passwordResetRateLimiter, verifyOtpValidationRules, verifyResetOtp);
router.post('/forgot-password/reset-password', passwordResetRateLimiter, resetPasswordValidationRules, resetPassword);

module.exports = router;
