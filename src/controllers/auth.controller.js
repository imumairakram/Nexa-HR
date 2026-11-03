const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { hashPassword, comparePassword, validatePasswordStrength } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const { isGuestDemoActive } = require('../services/demoGuard.service');
const {
  sendEmailOTP,
  sendWhatsAppOTP,
  sendPasswordResetEmail,
  sendOtpEmail,
  sendOtpWhatsApp,
  maskEmail,
  maskPhone,
  formatE164,
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
        mustChangePassword: false,
      },
    });

    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    // Bearer token returned in response body (cookies not set)

    return res.status(201).json({
      success: true,
      message: 'System Administrator registered successfully.',
      data: {
        token, // Provided for API/mobile interoperability
        expiresIn: 3600, // Strict 1-hour validity window (seconds)
        user: {
          id: user.id,
          employeeCode: user.employeeCode,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          mustChangePassword: false,
        },
      },
    });
  } catch (error) {
    console.error('[AUTH ERROR] in registerAdmin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register administrator.',
      error: error.message,
    });
  }
};

/**
 * User Login (HR Admin & Employee)
 * System Admin signs in via HR Admin using hardcoded credentials
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password, portalRole, role, loginRole } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const requestedRole = (portalRole || role || loginRole || '').toString().toLowerCase().trim();

    // Standard database authentication flow for HR managers & Staff Employees
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

    if (user.isDemo === true) {
      return res.status(403).json({
        success: false,
        message: 'Demo accounts cannot authenticate via standard login. Please use the guest experience portal.',
      });
    }

    // Role-based portal restriction enforcement
    if (requestedRole) {
      if (['hr', 'admin', 'hr_admin', 'hr_manager'].includes(requestedRole)) {
        if (user.role === 'EMPLOYEE') {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Employee accounts cannot sign in through the HR Admin portal. Please switch to the Employee tab.',
          });
        }
      } else if (['employee', 'staff', 'user'].includes(requestedRole)) {
        if (user.role === 'ADMIN' || user.role === 'HR_MANAGER') {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Administrator accounts cannot sign in through the Employee portal. Please switch to the HR Admin tab.',
          });
        }
      }
    }

    // Generate hardened 1-hour JWT
    const token = generateToken({
      userId: user.id,
      role: user.role,
      isDemo: false,
    });

    // Bearer token returned in response body; cookies explicitly not set to eliminate CSRF risk
    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        expiresIn: 3600, // Strict 1-hour validity window (seconds)
        user: {
          id: user.id,
          employeeCode: user.employeeCode,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          mustChangePassword: user.mustChangePassword ?? false,
          isGuest: false,
          isDemo: false,
        },
      },
    });
  } catch (error) {
    console.error('[AUTH ERROR] in login:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed.',
      error: error.message,
    });
  }
};

/**
 * Public Authentication Configuration Endpoint
 * GET /api/auth/config
 */
const getAuthConfig = (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      guestDemoEnabled: true,
    },
  });
};

/**
 * 1-Click Demo / Guest Session Initialization
 * POST /api/auth/guest-login & POST /api/auth/demo-login
 * HR logs in as umairdevelop@gmail.com (ADMIN)
 * Employee logs in as umaaiirakram@gmail.com (EMPLOYEE)
 * Both receive an isDemo: true token that enforces strict view-only mode across all endpoints.
 */
const demoLogin = async (req, res) => {
  try {
    const { role, type } = req.body || {};
    const requestedRole = String(type || role || 'hr').toLowerCase().trim();

    let targetEmail;
    let targetRole;
    if (['hr', 'admin', 'hr_manager', 'hr_admin'].includes(requestedRole)) {
      targetEmail = 'umairdevelop@gmail.com';
      targetRole = 'ADMIN';
    } else if (['employee', 'staff', 'user'].includes(requestedRole)) {
      targetEmail = 'umaaiirakram@gmail.com';
      targetRole = 'EMPLOYEE';
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid demo type. Must be 'HR' or 'EMPLOYEE'.",
      });
    }

    let user = await prisma.user.findFirst({
      where: {
        email: targetEmail,
        isActive: true,
      },
    });

    // Fallback if specific email is missing in a staging or dev DB
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          role: targetRole,
          isActive: true,
        },
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Account for role '${requestedRole}' not found or inactive.`,
      });
    }

    // Generate hardened 1-hour JWT token with isDemo: true flag
    const token = generateToken({
      userId: user.id,
      role: user.role,
      isDemo: true,
    });

    return res.status(200).json({
      success: true,
      message: 'Demo session initialized successfully.',
      data: {
        token,
        expiresIn: 3600,
        user: {
          id: user.id,
          employeeCode: user.employeeCode,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          mustChangePassword: false,
          isGuest: true,
          isDemo: true,
        },
      },
    });
  } catch (error) {
    console.error('[AUTH ERROR] in demoLogin:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize demo session.',
      error: error.message,
    });
  }
};

/**
 * User Logout
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
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
        mustChangePassword: true,
        isDemo: true,
        createdAt: true,
        salaryStructure: true,
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

    // Resolve Reporting Manager dynamically from DB
    let reportingManager = 'People Operations & HR Team';
    try {
      // Look for HR Manager or Admin in DB as reporting manager
      const managerUser = await prisma.user.findFirst({
        where: {
          OR: [
            { role: 'HR_MANAGER' },
            { role: 'ADMIN' },
          ],
          NOT: { id: user.id },
          isActive: true,
        },
        include: {
          profile: {
            include: { designation: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (managerUser) {
        const desig = managerUser.profile?.designation?.title || (managerUser.role === 'ADMIN' ? 'Head of Operations' : 'HR Manager');
        reportingManager = `${managerUser.firstName} ${managerUser.lastName} (${desig})`;
      }
    } catch (mgrErr) {
      console.warn('Reporting manager dynamic resolution notice:', mgrErr.message);
    }

    // Generate dynamic Corporate Bank & Payroll details for employee
    const empNumDigits = (user.employeeCode || '101').replace(/[^0-9]/g, '').padStart(6, '0');
    const bankDetails = {
      bankName: 'Standard Chartered Bank (Corporate Wing)',
      accountTitle: `${user.firstName} ${user.lastName}`,
      accountNumber: `PK72SCBL000000${empNumDigits}01`,
      branchCode: '0142 (Corporate Wing)',
      payoutMethod: 'Direct Bank Transfer',
      taxStatus: 'Verified Active Filer',
      ntnNumber: `NTN-9842${empNumDigits.slice(-3)}-7`,
      providentFund: 'Enrolled (8.33% Tier)',
    };

    return res.status(200).json({
      success: true,
      data: {
        user: {
          ...user,
          isDemo: req.user?.isDemo === true || user.isDemo === true,
          isGuest: req.user?.isDemo === true || user.isDemo === true,
          reportingManager,
          bankDetails,
        },
      },
    });
  } catch (error) {
    console.error('[AUTH ERROR] in getMe:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch profile.',
      error: error.message,
    });
  }
};

// In-memory 60-second cooldown tracker for OTP dispatches (Map<identifier, timestampMs>)
const otpCooldownMap = new Map();

const isOtpCooldownActive = (identifier) => {
  const now = Date.now();
  const lastTime = otpCooldownMap.get(identifier);
  if (lastTime && now - lastTime < 60 * 1000) {
    return true;
  }
  otpCooldownMap.set(identifier, now);
  // Periodic cleanup
  if (otpCooldownMap.size > 2000) {
    for (const [key, ts] of otpCooldownMap.entries()) {
      if (now - ts > 5 * 60 * 1000) {
        otpCooldownMap.delete(key);
      }
    }
  }
  return false;
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

    const identifier = String(email).toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { employeeCode: identifier.toUpperCase() },
        ],
      },
    });

    // Constant-structure & timing safe: Always return 200 with identical shape and plausible fake hints
    if (!user || !user.isActive || user.isDemo) {
      crypto.createHash('sha256').update(identifier).digest('hex');
      const fakeMaskedEmail = maskEmail(identifier.includes('@') ? identifier : `${identifier}@corporate.local`);
      return res.status(200).json({
        success: true,
        message: 'If an active account exists, recovery instructions can be delivered.',
        data: {
          allowedChannels: ['EMAIL', 'WHATSAPP'],
          maskedEmail: fakeMaskedEmail,
          maskedPhone: '+** *** ****',
          hasPhone: true,
        },
      });
    }

    const isHrOrAdmin = user.role === 'ADMIN' || user.role === 'HR_MANAGER';
    const hasPhone = Boolean(user.phone && user.phone.trim().length > 0 && !isHrOrAdmin);
    const allowedChannels = hasPhone ? ['EMAIL', 'WHATSAPP'] : ['EMAIL'];

    return res.status(200).json({
      success: true,
      message: 'If an active account exists, recovery instructions can be delivered.',
      data: {
        allowedChannels,
        maskedEmail: maskEmail(user.email),
        maskedPhone: hasPhone ? maskPhone(user.phone) : '+** *** ****',
        hasPhone,
      },
    });
  } catch (error) {
    console.error('[AUTH ERROR] in checkRecoveryUser:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to lookup recovery account.',
      error: error.message,
    });
  }
};

/**
 * Initiate Ephemeral Password Recovery
 * Extracts channel ('EMAIL' or 'WHATSAPP') and dispatches 6-digit OTP
 * POST /api/auth/forgot-password
 * POST /api/auth/forgot-password/initiate
 */
const forgotPassword = async (req, res) => {
  try {
    const { email, channel = 'EMAIL' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered corporate email address or employee code.',
      });
    }

    const identifier = email.toLowerCase().trim();
    const deliveryChannel = String(channel || 'EMAIL').toUpperCase().trim();

    if (deliveryChannel !== 'EMAIL' && deliveryChannel !== 'WHATSAPP') {
      return res.status(400).json({
        success: false,
        message: `Invalid delivery channel '${deliveryChannel}'. Must be either 'EMAIL' or 'WHATSAPP'.`,
      });
    }

    // Enforce 60-second cooldown between OTP requests for the same identifier
    if (isOtpCooldownActive(identifier)) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another code.',
        code: 'OTP_COOLDOWN_ACTIVE',
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

    // Timing attack & enumeration safe: Always return uniform response
    if (!user || !user.isActive) {
      const fakeDestination = deliveryChannel === 'WHATSAPP' ? '+** *** ****' : maskEmail(identifier.includes('@') ? identifier : `${identifier}@corporate.local`);
      return res.status(200).json({
        success: true,
        message: `If an active account exists, a 6-digit recovery code has been dispatched via ${deliveryChannel} to ${fakeDestination}.`,
        data: {
          destination: fakeDestination,
          channel: deliveryChannel,
          expiresInMinutes: 10,
        },
      });
    }

    // Secondary DB check for cooldown on existing user
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    const recentDbOtp = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        createdAt: { gte: oneMinuteAgo },
      },
    });

    if (recentDbOtp) {
      return res.status(429).json({
        success: false,
        message: 'Please wait before requesting another code.',
        code: 'OTP_COOLDOWN_ACTIVE',
      });
    }

    if (user.isDemo) {
      return res.status(403).json({
        success: false,
        code: 'DEMO_MODE',
        message: 'Password recovery is disabled for demo accounts.',
      });
    }

    // Role-based Security Policy: Restrict ADMIN / HR_MANAGER from WhatsApp channel
    const isHrOrAdmin = user.role === 'ADMIN' || user.role === 'HR_MANAGER';
    if (isHrOrAdmin && deliveryChannel === 'WHATSAPP') {
      return res.status(403).json({
        success: false,
        message: 'Enterprise Security Policy forbids SMS/WhatsApp OTP recovery for Administrator accounts. Please use corporate email.',
      });
    }

    // Validate phone existence for WhatsApp channel
    if (deliveryChannel === 'WHATSAPP' && (!user.phone || !user.phone.trim())) {
      return res.status(400).json({
        success: false,
        message: 'No registered mobile phone number found for this employee profile.',
      });
    }

    // 1. Generate secure 6-digit numeric OTP (100000 - 999999)
    const otp = crypto.randomInt(100000, 999999).toString();

    // 2. Hash raw OTP with SHA-256 for persistent database storage
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // 3. Enforce strict 10-minute expiration window
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 4. Invalidate prior unused OTPs for this user
    await prisma.passwordResetOtp.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // 5. Save hashed OTP to PasswordResetOtp Prisma model
    await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        email: user.email,
        phone: user.phone ? user.phone.trim() : null,
        otpHash,
        channel: deliveryChannel,
        expiresAt,
        isUsed: false,
        attempts: 0,
      },
    });

    // Also invalidate any existing raw passwordResetTokens for security
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // 6. Route dispatch: initiate notification dispatch in background so SMTP latency never blocks UI
    const recipientName = `${user.firstName} ${user.lastName}`;

    const dispatchPromise = (deliveryChannel === 'EMAIL')
      ? sendEmailOTP(user.email, otp, recipientName)
      : sendWhatsAppOTP(user.phone, otp, recipientName);

    dispatchPromise.catch((err) => {
      console.error(`[NOTIFICATION DISPATCH ERROR via ${deliveryChannel}]:`, err.message);
    });

    const destination = deliveryChannel === 'WHATSAPP' ? maskPhone(user.phone) : maskEmail(user.email);

    return res.status(200).json({
      success: true,
      message: `If an active account exists, a 6-digit recovery code has been dispatched via ${deliveryChannel} to ${destination}.`,
      data: {
        destination,
        channel: deliveryChannel,
        expiresInMinutes: 10,
        // Expose preview OTP in non-production environments to support automated test suites and dev diagnostics
        ...(process.env.NODE_ENV === 'production' ? {} : { previewOtp: otp }),
      },
    });
  } catch (error) {
    console.error('[AUTH ERROR] in forgotPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate password recovery cycle.',
      error: error.message,
    });
  }
};

/**
 * Verify 6-Digit OTP Code
 * POST /api/auth/forgot-password/verify-otp
 * POST /api/auth/verify-otp
 */
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both registered email address and the 6-digit OTP code.',
      });
    }

    const identifier = email.toLowerCase().trim();
    const cleanOtp = String(otp).trim();

    if (cleanOtp.length !== 6) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code length. Expected 6 numeric digits.',
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

    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code. Please request a new code.',
      });
    }

    // Retrieve newest active, unexpired, unused OTP record
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        isUsed: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No active OTP recovery session found or code has expired. Please request a new code.',
      });
    }

    // Rate limit incorrect attempts per OTP (max 5)
    if (otpRecord.attempts >= 5) {
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { isUsed: true },
      });
      return res.status(400).json({
        success: false,
        message: 'Maximum verification attempts exceeded. This OTP has been invalidated. Please request a new code.',
      });
    }

    // Compare SHA-256 hash of incoming OTP
    const inputHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');
    if (inputHash !== otpRecord.otpHash) {
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      return res.status(400).json({
        success: false,
        message: `Incorrect OTP code. (${4 - otpRecord.attempts} attempt(s) remaining)`,
      });
    }

    // Mark OTP as used
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    // Issue short-lived Reset JWT token (15-minute validity)
    const resetToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        purpose: 'PASSWORD_RESET',
      },
      process.env.JWT_SECRET,
      { expiresIn: '15m', algorithm: 'HS256' }
    );

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You may now reset your account password.',
      data: {
        resetToken,
        expiresInMinutes: 15,
      },
    });
  } catch (error) {
    console.error('[AUTH ERROR] in verifyResetOtp:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP code.',
      error: error.message,
    });
  }
};

/**
 * Reset Password with Verified Token (JWT or Cryptographic Hex Token)
 * POST /api/auth/reset-password
 * POST /api/auth/forgot-password/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token: bodyToken, newPassword, confirmPassword } = req.body;

    let token = bodyToken;
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.',
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

    let targetUserId = null;

    // 1. Try verifying as JWT Reset Token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      if (decoded && decoded.purpose === 'PASSWORD_RESET' && decoded.userId) {
        targetUserId = decoded.userId;
      }
    } catch (jwtErr) {
      // If not valid JWT, continue to check raw PasswordResetToken table
    }

    // 2. Fallback to checking PasswordResetToken table for hexadecimal tokens
    if (!targetUserId) {
      const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
      const resetRecord = await prisma.passwordResetToken.findUnique({
        where: { tokenHash },
        include: { user: true },
      });

      if (resetRecord && !resetRecord.isUsed && new Date() <= resetRecord.expiresAt) {
        targetUserId = resetRecord.userId;
      }
    }

    if (!targetUserId) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired. Please request a new reset code.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Associated user account is deactivated or unavailable.',
      });
    }

    if (user.isDemo) {
      return res.status(403).json({
        success: false,
        code: 'DEMO_MODE',
        message: 'Password reset is disabled for demo accounts.',
      });
    }

    const strength = validatePasswordStrength(newPassword, {
      email: user.email,
    });

    if (!strength.isValid) {
      return res.status(400).json({
        success: false,
        message: strength.errors[0],
        errors: strength.errors,
      });
    }

    // 3. Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // 4. Update password and invalidate all active tokens and OTPs in an atomic transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: targetUserId },
        data: {
          password: hashedPassword,
          mustChangePassword: false,
        },
      }),
      prisma.passwordResetOtp.updateMany({
        where: {
          userId: targetUserId,
          isUsed: false,
        },
        data: {
          isUsed: true,
        },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: targetUserId,
          isUsed: false,
        },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      }),
    ]);

    console.log(`[PASSWORD RESET SUCCESS] User ${maskEmail(user.email)} (${user.role}) reset password.`);

    return res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset. You can now sign in with your new credentials.',
    });
  } catch (error) {
    console.error('[AUTH ERROR] in resetPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: error.message,
    });
  }
};

/**
 * Update Current Authenticated User Profile
 * PUT /api/auth/profile
 */
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      firstName,
      lastName,
      phone,
      email,
      address,
      workLocation,
      emergencyContact,
      gender,
      dateOfBirth,
      departmentId,
      designationId,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (user.isDemo === true || req.user?.isDemo === true) {
      return res.status(403).json({
        success: false,
        code: 'DEMO_MODE',
        message: 'Profile updates are not available in demo mode.',
      });
    }

    // Check if new email is already taken by another user
    if (email && email.toLowerCase().trim() !== user.email.toLowerCase().trim()) {
      const cleanEmail = email.toLowerCase().trim();
      const emailExists = await prisma.user.findFirst({
        where: {
          email: cleanEmail,
          NOT: { id: userId },
        },
      });
      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'This email address is already in use by another account.',
        });
      }
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      // 1. Update User basic fields
      const userUpdates = {};
      if (firstName !== undefined && firstName.trim()) userUpdates.firstName = firstName.trim();
      if (lastName !== undefined && lastName.trim()) userUpdates.lastName = lastName.trim();
      if (phone !== undefined) userUpdates.phone = phone ? phone.trim() : null;
      if (email !== undefined && email.trim()) userUpdates.email = email.toLowerCase().trim();

      await tx.user.update({
        where: { id: userId },
        data: userUpdates,
      });

      // 2. Update or Create EmployeeProfile (separating residential address and office work location)
      const profileUpdates = {};
      if (address !== undefined) profileUpdates.address = address ? address.trim() : null;
      if (workLocation !== undefined) profileUpdates.workLocation = workLocation ? workLocation.trim() : null;
      if (emergencyContact !== undefined) profileUpdates.emergencyContact = emergencyContact ? emergencyContact.trim() : null;
      if (gender !== undefined) profileUpdates.gender = gender ? gender.trim() : null;
      if (dateOfBirth !== undefined) profileUpdates.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      if (departmentId !== undefined) profileUpdates.departmentId = departmentId || null;
      if (designationId !== undefined) profileUpdates.designationId = designationId || null;

      if (user.profile) {
        await tx.employeeProfile.update({
          where: { userId },
          data: profileUpdates,
        });
      } else {
        await tx.employeeProfile.create({
          data: {
            userId,
            ...profileUpdates,
          },
        });
      }

      return await tx.user.findUnique({
        where: { id: userId },
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
          salaryStructure: true,
          profile: {
            include: {
              department: true,
              designation: true,
            },
          },
        },
      });
    });

    // Resolve Reporting Manager dynamically from DB
    let reportingManager = 'People Operations & HR Team';
    try {
      const managerUser = await prisma.user.findFirst({
        where: {
          OR: [
            { role: 'HR_MANAGER' },
            { role: 'ADMIN' },
          ],
          NOT: { id: updatedUser.id },
          isActive: true,
        },
        include: {
          profile: {
            include: { designation: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      });

      if (managerUser) {
        const desig = managerUser.profile?.designation?.title || (managerUser.role === 'ADMIN' ? 'Head of Operations' : 'HR Manager');
        reportingManager = `${managerUser.firstName} ${managerUser.lastName} (${desig})`;
      }
    } catch (mgrErr) {
      console.warn('Reporting manager dynamic resolution notice:', mgrErr.message);
    }

    const empNumDigits = (updatedUser.employeeCode || '101').replace(/[^0-9]/g, '').padStart(6, '0');
    const bankDetails = {
      bankName: 'Standard Chartered Bank (Corporate Wing)',
      accountTitle: `${updatedUser.firstName} ${updatedUser.lastName}`,
      accountNumber: `PK72SCBL000000${empNumDigits}01`,
      branchCode: '0142 (Corporate Wing)',
      payoutMethod: 'Direct Bank Transfer',
      taxStatus: 'Verified Active Filer',
      ntnNumber: `NTN-9842${empNumDigits.slice(-3)}-7`,
      providentFund: 'Enrolled (8.33% Tier)',
    };

    return res.status(200).json({
      success: true,
      message: 'Profile information updated successfully.',
      data: {
        user: {
          ...updatedUser,
          reportingManager,
          bankDetails,
        },
      },
    });
  } catch (error) {
    console.error('[AUTH ERROR] in updateMyProfile:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error.message,
    });
  }
};

/**
 * Change Current Authenticated User Password
 * PUT /api/auth/change-password
 */
const changeMyPassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current password and new password.',
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirmation password do not match.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    if (user.isDemo === true || req.user?.isDemo === true) {
      return res.status(403).json({
        success: false,
        code: 'DEMO_MODE',
        message: 'Password and credential changes are locked for Demo / Guest accounts.',
      });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password. Please try again.',
      });
    }

    const strength = validatePasswordStrength(newPassword, {
      email: user.email,
      currentPassword,
    });

    if (!strength.isValid) {
      return res.status(400).json({
        success: false,
        message: strength.errors[0],
        errors: strength.errors,
      });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Password credentials changed successfully.',
    });
  } catch (error) {
    console.error('[AUTH ERROR] in changeMyPassword:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password.',
      error: error.message,
    });
  }
};

module.exports = {
  getAuthConfig,
  registerAdmin,
  login,
  demoLogin,
  logout,
  getMe,
  checkRecoveryUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  updateMyProfile,
  changeMyPassword,
};
