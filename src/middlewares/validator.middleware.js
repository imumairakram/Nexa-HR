const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware that aggregates express-validator errors and rejects malformed requests
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed on input payload.',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Validation rules for user login
 */
const loginValidationRules = [
  body('email')
    .isEmail()
    .withMessage('A valid corporate email address is required.')
    .normalizeEmail(),
  body('password')
    .isString()
    .notEmpty()
    .withMessage('Password must be provided.')
    .trim(),
  validateRequest,
];

/**
 * Validation rules for password recovery initiation
 */
const forgotPasswordValidationRules = [
  body('email')
    .notEmpty()
    .withMessage('Corporate email address or employee code is required.')
    .trim(),
  body('channel')
    .optional()
    .isIn(['EMAIL', 'WHATSAPP', 'email', 'whatsapp'])
    .withMessage("Channel must be either 'EMAIL' or 'WHATSAPP'."),
  validateRequest,
];

/**
 * Validation rules for OTP verification
 */
const verifyOtpValidationRules = [
  body('email')
    .notEmpty()
    .withMessage('Corporate email address or employee code is required.')
    .trim(),
  body('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('A valid 6-digit OTP code is required.')
    .trim(),
  validateRequest,
];

/**
 * Validation rules for password reset completion
 */
const resetPasswordValidationRules = [
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long.'),
  validateRequest,
];

module.exports = {
  validateRequest,
  loginValidationRules,
  forgotPasswordValidationRules,
  verifyOtpValidationRules,
  resetPasswordValidationRules,
};

