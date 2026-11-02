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
 * Dedicated Rate Limiter for Biometric Hardware Device Punch Ingest
 * 120 requests per 1-minute window per IP in production (300 in dev)
 */
const hardwareSyncRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 120 : 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many biometric hardware sync requests from this IP address. Please slow down.',
    code: 'HARDWARE_RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Strict Rate Limiter for Recovery Account Lookups (Per IP)
 * Max 10 requests per 1-minute window
 */
const recoveryCheckRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many recovery account lookups from this IP. Please wait before trying again.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});

/**
 * Strict Rate Limiter for Recovery Account Lookups (Per Identifier)
 * Max 10 requests per 1-minute window
 */
const recoveryCheckIdentifierLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  keyGenerator: (req) => {
    return req.body && req.body.email ? String(req.body.email).toLowerCase().trim() : 'no-identifier';
  },
  skip: (req) => !req.body || !req.body.email,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many recovery account lookups for this account. Please wait before trying again.',
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
  hardwareSyncRateLimiter,
  recoveryCheckRateLimiter,
  recoveryCheckIdentifierLimiter,
  generalApiLimiter,
};
