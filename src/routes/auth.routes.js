const express = require('express');
const router = express.Router();
const {
  registerAdmin,
  login,
  getMe,
  checkRecoveryUser,
  initiateForgotPassword,
  verifyPasswordResetOtp,
  resetPassword,
} = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Standard Auth Routes
router.post('/register-admin', registerAdmin);
router.post('/login', login);
router.get('/me', verifyToken, getMe);

// Password Recovery & OTP Security Routes
router.post('/forgot-password/check', checkRecoveryUser);
router.post('/forgot-password/initiate', initiateForgotPassword);
router.post('/forgot-password/verify-otp', verifyPasswordResetOtp);
router.post('/forgot-password/reset-password', resetPassword);

module.exports = router;

