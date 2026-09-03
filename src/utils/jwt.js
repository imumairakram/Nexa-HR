const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexahr_saas_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '24h'; // Strict 24-hour session lifespan

/**
 * Standard Auth Token for logged-in sessions (24 Hours lifespan)
 */
const generateToken = (payload) => {
  return jwt.sign(
    {
      userId: payload.userId,
      role: payload.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
      algorithm: 'HS256',
    }
  );
};

/**
 * Verify Auth Token
 */
const verifyJwtToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
  });
};

module.exports = {
  generateToken,
  verifyJwtToken,
  JWT_EXPIRES_IN,
};
