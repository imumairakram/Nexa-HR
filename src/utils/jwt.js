const jwt = require('jsonwebtoken');

// Ensure environment variables are loaded if module is required standalone
if (!process.env.JWT_SECRET) {
  try {
    require('dotenv').config();
  } catch (e) {
    // ignore
  }
}

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET || JWT_SECRET.trim().length < 32) {
  throw new Error(
    'FATAL SECURITY CONFIGURATION ERROR: JWT_SECRET environment variable is missing or shorter than 32 characters. ' +
    'NexaHR enforces a minimum 256-bit (32+ character) cryptographic secret key. ' +
    'Generate a strong key using: `node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"`'
  );
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h'; // Strict 1-hour session lifespan

/**
 * Standard Auth Token for logged-in sessions (1 Hour lifespan)
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
