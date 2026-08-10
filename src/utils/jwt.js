const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'nexahr_saas_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const RESET_TOKEN_EXPIRES_IN = '15m'; // Password reset tokens expire in 15 minutes

/**
 * Standard Auth Token for logged-in sessions
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify Auth Token
 */
const verifyJwtToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Generate Secure One-Time Password Reset JWT
 */
const generateResetToken = (payload) => {
  return jwt.sign(
    {
      ...payload,
      purpose: 'PASSWORD_RESET',
    },
    JWT_SECRET,
    { expiresIn: RESET_TOKEN_EXPIRES_IN }
  );
};

/**
 * Verify Password Reset JWT
 */
const verifyResetToken = (token) => {
  const decoded = jwt.verify(token, JWT_SECRET);
  if (decoded.purpose !== 'PASSWORD_RESET') {
    throw new Error('Invalid token purpose. Expected PASSWORD_RESET token.');
  }
  return decoded;
};

module.exports = {
  generateToken,
  verifyJwtToken,
  generateResetToken,
  verifyResetToken,
};

