const { verifyJwtToken } = require('../utils/jwt');
const prisma = require('../config/prisma');
const cacheService = require('../services/cache.service');
const { isGuestDemoActive } = require('../services/demoGuard.service');

const verifyToken = async (req, res, next) => {
  try {
    if (req.user && (req.user.id || req.user.userId)) {
      return next();
    }

    let token = null;

    // Strict Authorization: Bearer <token> validation.
    // Bearer-only token authentication eliminates CSRF vulnerabilities by design,
    // as web browsers never attach custom Authorization headers to cross-site requests automatically.
    // Cookies are explicitly ignored for API authentication.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication session or token provided.',
      });
    }

    // Cryptographic Verification of JWT
    const decoded = verifyJwtToken(token);
    const decodedUserId = decoded.userId || decoded.id;

    // Verify user exists and is active (Fast in-memory cache lookup)
    let user = cacheService.getCachedUser(decodedUserId);
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: decodedUserId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          employeeCode: true,
          isDemo: true,
          mustChangePassword: true,
        },
      });
      if (user && user.isActive) {
        cacheService.setCachedUser(decodedUserId, user);
      }
    }

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user account is deactivated.',
      });
    }

    const isTokenDemo = decoded.isDemo === true;
    const isUserDemo = user.isDemo === true;

    // Requirement A:
    // 1. Reject (401) any token carrying isDemo: true when demo guard is inactive
    if (isTokenDemo && !isGuestDemoActive()) {
      return res.status(401).json({
        success: false,
        code: 'DEMO_TOKEN_INVALID',
        message: 'Invalid authorization token: Demo environment is inactive.',
      });
    }

    // 2. Reject (401) if token's isDemo claim differs from the user's DB flag
    // (Guarantees tokens previously minted for real accounts are immediately invalidated)
    if (isTokenDemo !== isUserDemo) {
      return res.status(401).json({
        success: false,
        code: 'TOKEN_CLAIM_MISMATCH',
        message: 'Invalid authorization token: Token claims do not match account profile.',
      });
    }

    // 3. Reject (401) any isDemo: true token when the loaded DB user is not flagged isDemo
    if (isTokenDemo && !isUserDemo) {
      return res.status(401).json({
        success: false,
        code: 'DEMO_USER_REQUIRED',
        message: 'Invalid authorization token: User account is not flagged as a demo user.',
      });
    }

    // Attach authenticated user context to request
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
      employeeCode: user.employeeCode || null,
      isDemo: isUserDemo && isTokenDemo,
      mustChangePassword: Boolean(user.mustChangePassword),
    };

    // Global mutation guard for Guest / Demo sessions:
    // All non-GET requests (except /logout) are strictly blocked for demo users
    if (req.user.isDemo && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const isLogout = req.path.endsWith('/logout') || req.originalUrl?.includes('/logout');
      if (!isLogout) {
        return res.status(403).json({
          success: false,
          code: 'DEMO_MODE',
          message: 'Guest / Demo mode is view-only. Modifying data is disabled to ensure uninterrupted access.',
        });
      }
    }

    return enforcePasswordChange(req, res, next);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired authorization token.',
      error: error.message,
    });
  }
};

/**
 * Global default-deny middleware for demo sessions.
 * Intercepts any mutating HTTP method (POST, PUT, PATCH, DELETE) for demo users.
 * Allows only GET, HEAD, OPTIONS, and the logout endpoint.
 */
const enforceDemoReadonly = (req, res, next) => {
  const method = req.method.toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    return next();
  }

  const isLogout = req.path.endsWith('/logout') || req.originalUrl?.includes('/logout');
  if (isLogout) {
    return next();
  }

  if (req.user && req.user.isDemo) {
    return res.status(403).json({
      success: false,
      code: 'DEMO_MODE',
      message: 'Guest / Demo mode is view-only. Modifying data is disabled to ensure uninterrupted access.',
    });
  }

  // Pre-parse Authorization header if verifyToken hasn't run yet
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = verifyJwtToken(token);
      if (decoded && decoded.isDemo === true) {
        return res.status(403).json({
          success: false,
          code: 'DEMO_MODE',
          message: 'Guest / Demo mode is view-only. Modifying data is disabled to ensure uninterrupted access.',
        });
      }
    } catch {}
  }

  return next();
};

/**
 * Defense-in-depth middleware to block demo sessions from mutating data or accessing sensitive resources
 */
const blockDemo = (req, res, next) => {
  if (req.user?.isDemo === true) {
    return res.status(403).json({
      success: false,
      code: 'DEMO_MODE',
      message: 'Guest / Demo mode is view-only. Modifying data is disabled to ensure uninterrupted access.',
    });
  }
  next();
};

/**
 * Defense-in-depth middleware to enforce password change on first login.
 * If user.mustChangePassword === true, blocks all routes except the allowlist:
 * - POST /api/auth/change-password (or PUT)
 * - GET /api/auth/me
 * - POST /api/auth/logout
 * - GET /api/auth/config
 * Demo sessions are unaffected (they are never mustChangePassword).
 */
const enforcePasswordChange = (req, res, next) => {
  // Demo users and unauthenticated requests bypass
  if (!req.user || req.user.isDemo) {
    return next();
  }

  if (req.user.mustChangePassword !== true) {
    return next();
  }

  const method = req.method.toUpperCase();
  const rawUrl = (req.originalUrl || (req.baseUrl + req.path) || req.url || '').split('?')[0].toLowerCase().replace(/\/+$/, '');

  const isAllowed =
    ((method === 'POST' || method === 'PUT') && rawUrl.endsWith('/auth/change-password')) ||
    (method === 'GET' && rawUrl.endsWith('/auth/me')) ||
    (method === 'POST' && rawUrl.endsWith('/auth/logout')) ||
    (method === 'GET' && rawUrl.endsWith('/auth/config'));

  if (isAllowed) {
    return next();
  }

  return res.status(403).json({
    success: false,
    code: 'PASSWORD_CHANGE_REQUIRED',
    message: 'Password change is required before accessing application resources.',
  });
};

module.exports = {
  verifyToken,
  blockDemo,
  enforceDemoReadonly,
  enforcePasswordChange,
};
