const rateLimit = require('express-rate-limit');

/**
 * Strict Rate Limiter for Authentication Attempts (Login)
 * 5 attempts per 15-minute window per IP
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP address. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Rate Limiter for Password Recovery Invocations
 * 3 requests per 30-minute window per IP
 */
const passwordResetRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password recovery requests. Please wait 30 minutes before trying again.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * General API Rate Limiter
 * 300 requests per 15-minute window
 */
const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  authRateLimiter,
  passwordResetRateLimiter,
  generalApiLimiter,
};
