const { verifyJwtToken } = require('../utils/jwt');
const prisma = require('../config/prisma');

const verifyToken = async (req, res, next) => {
  try {
    let token = null;

    // 1. Primary Vector: Secure HttpOnly Cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Secondary Vector: Standard Authorization Bearer Header (for mobile/API clients)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authentication session or token provided.',
      });
    }

    // 3. Cryptographic Verification of JWT
    const decoded = verifyJwtToken(token);

    // 4. Verify user exists and is active in database (revocation check)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session or user account is deactivated.',
      });
    }

    // 5. Attach authenticated user context to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      fullName: `${user.firstName} ${user.lastName}`,
    };

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

module.exports = {
  verifyToken,
};
