const { verifyJwtToken } = require('../utils/jwt');
const prisma = require('../config/prisma');
const cacheService = require('../services/cache.service');

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

    // Attach authenticated user context to request
    req.user = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
      employeeCode: user.employeeCode || null,
      isDemo: decoded.isDemo === true || user.isDemo === true,
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

    return next();
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

module.exports = {
  verifyToken,
  blockDemo,
};
