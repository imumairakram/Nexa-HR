const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

/**
 * Enterprise Password Policy Validator
 * Rules:
 * - Minimum 10 characters
 * - At least one uppercase letter [A-Z]
 * - At least one lowercase letter [a-z]
 * - At least one digit [0-9]
 * - At least one symbol [!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]
 * - Cannot match email
 * - Cannot match current password
 */
const validatePasswordStrength = (password, { email = '', currentPassword = '' } = {}) => {
  const errors = [];
  if (!password || typeof password !== 'string') {
    return { isValid: false, errors: ['Password must be provided.'] };
  }
  if (password.length < 10) {
    errors.push('Password must be at least 10 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit.');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    errors.push('Password must contain at least one special symbol.');
  }
  if (email && password.toLowerCase() === email.toLowerCase().trim()) {
    errors.push('Password cannot be identical to your email address.');
  }
  if (currentPassword && password === currentPassword) {
    errors.push('New password cannot be identical to your current password.');
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  hashPassword,
  comparePassword,
  validatePasswordStrength,
};
