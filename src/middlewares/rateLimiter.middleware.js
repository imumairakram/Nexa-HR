const rateLimit = require('express-rate-limit');

/**
 * Strict Rate Limiter for Authentication Attempts (Login)
 * 10 attempts per 15-minute window per IP in production (100 in dev)
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 100,
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
 * 15 requests per 15-minute window per IP in production (100 in dev)
 */
const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 15 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many password recovery requests. Please wait before trying again.',
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
