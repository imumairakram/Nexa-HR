const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateResetToken, verifyResetToken } = require('../utils/jwt');
const {
  sendOtpEmail,
  sendOtpWhatsApp,
  maskEmail,
  maskPhone,
} = require('../services/notification.service');

/**
 * Register System Administrator
 * POST /api/auth/register-admin
 */
const registerAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, employeeCode = 'EMP-ADMIN-001' } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields (email, password, firstName, lastName).',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanEmpCode = employeeCode.trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: cleanEmail }, { employeeCode: cleanEmpCode }],
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address or employee code already exists.',
      });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        employeeCode: cleanEmpCode,
        email: cleanEmail,
        password: hashedPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? phone.trim() : null,
        role: 'ADMIN',
        isActive: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    return res.status(201).json({
      success: true,
      message: 'System Administrator registered successfully.',
      data: {
        token,
        user: {
          id: user.id,
          employeeCode: user.employeeCode,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Error in registerAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register administrator.',
      error: error.message,
    });
  }
};

/**
 * User Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your user account has been deactivated. Please contact your administrator.',
      });
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: user.id,
          employeeCode: user.employeeCode,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message,
    });
  }
};

/**
 * Get Current User Profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        employeeCode: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        profile: {
          include: {
            department: true,
            designation: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile.',
      error: error.message,
    });
  }
};

/**
 * Check Recovery Account & Authorized Channels
 * POST /api/auth/forgot-password/check
 */
const checkRecoveryUser = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered corporate email address or employee code.',
      });
    }

    const identifier = email.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { employeeCode: identifier.toUpperCase() },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found matching this email address or employee code.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact your HR department.',
      });
    }

    // Role-based channel policy
    const isHrOrAdmin = user.role === 'ADMIN' || user.role === 'HR_MANAGER';
    const allowedChannels = isHrOrAdmin ? ['EMAIL'] : ['EMAIL', 'WHATSAPP'];

    return res.status(200).json({
      success: true,
      data: {
        email: user.email,
        employeeCode: user.employeeCode,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        isHrOrAdmin,
        allowedChannels,
        phone: user.phone,
        maskedEmail: maskEmail(user.email),
        maskedPhone: maskPhone(user.phone),
        hasPhone: Boolean(user.phone && user.phone.trim().length > 0),
        policyNotice: isHrOrAdmin
          ? 'Enterprise Security Policy: HR & Administrator accounts are strictly restricted to Email recovery.'
          : 'Employees can recover credentials via Corporate Email or WhatsApp.',
      },
    });
  } catch (error) {
    console.error('Error in checkRecoveryUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to lookup recovery account.',
      error: error.message,
    });
  }
};

/**
 * Initiate Password Recovery (Generate & Dispatch OTP)
 * POST /api/auth/forgot-password/initiate
 */
const initiateForgotPassword = async (req, res) => {
  try {
    const { email, channel = 'EMAIL' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
      });
    }

    const identifier = email.toLowerCase().trim();
    const selectedChannel = String(channel).toUpperCase().trim();

    // Validate channel format
    if (!['EMAIL', 'WHATSAPP'].includes(selectedChannel)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recovery channel. Supported channels are EMAIL and WHATSAPP.',
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { employeeCode: identifier.toUpperCase() },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found matching this email address or employee code.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact your HR administrator.',
      });
    }

    // =========================================================================
    // STRICT SECURITY POLICY ENFORCEMENT:
    // HR & Admin (ADMIN / HR_MANAGER) accounts CANNOT use WhatsApp recovery.
    // =========================================================================
    const isHrOrAdmin = user.role === 'ADMIN' || user.role === 'HR_MANAGER';

    if (isHrOrAdmin && selectedChannel === 'WHATSAPP') {
      return res.status(403).json({
        success: false,
        message:
          'Security Policy Restriction: HR and System Administrator accounts are restricted to Corporate Email verification only to protect administrative access.',
      });
    }

    // If Employee requested WhatsApp, ensure valid phone number exists
    if (selectedChannel === 'WHATSAPP' && (!user.phone || user.phone.trim().length === 0)) {
      return res.status(400).json({
        success: false,
        message:
          'No mobile phone number is registered for this employee account. Please select Email verification or contact HR to update your profile.',
      });
    }

    // Invalidate any existing unused OTPs for this user
    await prisma.passwordResetOtp.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashPassword(otp);
    const expiryMinutes = 10;
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Save hashed OTP in database
    await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone,
        otpHash,
        channel: selectedChannel,
        expiresAt,
        isUsed: false,
        attempts: 0,
      },
    });

    // Dispatch OTP via selected channel
    let dispatchResult;
    const recipientName = `${user.firstName} ${user.lastName}`;

    if (selectedChannel === 'WHATSAPP') {
      dispatchResult = await sendOtpWhatsApp({
        phone: user.phone,
        name: recipientName,
        otp,
        role: user.role,
        expiryMinutes,
      });
    } else {
      dispatchResult = await sendOtpEmail({
        email: user.email,
        name: recipientName,
        otp,
        role: user.role,
        expiryMinutes,
      });
    }

    return res.status(200).json({
      success: true,
      message: dispatchResult.message,
      data: {
        email: user.email,
        channel: selectedChannel,
        destination: dispatchResult.destination,
        expiresInMinutes: expiryMinutes,
        previewOtp: dispatchResult.previewOtp, // Available for development/testing preview
      },
    });
  } catch (error) {
    console.error('Error in initiateForgotPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate password recovery. Please try again.',
      error: error.message,
    });
  }
};

/**
 * Verify OTP Code & Issue Reset JWT
 * POST /api/auth/forgot-password/verify-otp
 */
const verifyPasswordResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and the 6-digit OTP code.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { employeeCode: cleanEmail.toUpperCase() },
        ],
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    // Find the latest active OTP record for this user
    const activeOtp = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activeOtp) {
      return res.status(400).json({
        success: false,
        message: 'Your verification OTP has expired or is invalid. Please request a new code.',
      });
    }

    // Brute-force protection: Max 5 attempts
    if (activeOtp.attempts >= 5) {
      await prisma.passwordResetOtp.update({
        where: { id: activeOtp.id },
        data: { isUsed: true },
      });
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP code.',
      });
    }

    // Verify OTP hash
    const isOtpValid = await comparePassword(cleanOtp, activeOtp.otpHash);

    if (!isOtpValid) {
      // Increment attempt counter
      await prisma.passwordResetOtp.update({
        where: { id: activeOtp.id },
        data: { attempts: activeOtp.attempts + 1 },
      });

      const remainingAttempts = 5 - (activeOtp.attempts + 1);
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP code. ${remainingAttempts} attempt(s) remaining.`,
      });
    }

    // Mark OTP as used
    await prisma.passwordResetOtp.update({
      where: { id: activeOtp.id },
      data: { isUsed: true },
    });

    // Generate cryptographically signed Password Reset JWT (valid 15 minutes)
    const resetToken = generateResetToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You may now create your new password.',
      data: {
        resetToken,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error in verifyPasswordResetOtp:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP code.',
      error: error.message,
    });
  }
};

/**
 * Reset Password with Verified JWT Reset Token
 * POST /api/auth/forgot-password/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, token: bodyToken } = req.body;

    // Retrieve token from Authorization header or body
    let resetToken = bodyToken;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      resetToken = authHeader.split(' ')[1];
    }

    if (!resetToken) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. No password reset token provided.',
      });
    }

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your new password.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters in length.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation password do not match.',
      });
    }

    // Cryptographic validation of JWT Reset Token
    let decoded;
    try {
      decoded = verifyResetToken(resetToken);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Password reset session has expired or is invalid. Please restart the recovery process.',
      });
    }

    // Find target user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User account not found or disabled.',
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Invalidate any remaining OTPs
    await prisma.passwordResetOtp.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    console.log(`✅ [PASSWORD RESET SUCCESS] User: ${user.email} (${user.role}) reset their password.`);

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password. Please try again.',
      error: error.message,
    });
  }
};

module.exports = {
  registerAdmin,
  login,
  getMe,
  checkRecoveryUser,
  initiateForgotPassword,
  verifyPasswordResetOtp,
  resetPassword,
};

