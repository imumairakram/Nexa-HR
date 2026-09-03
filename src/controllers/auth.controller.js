const crypto = require('crypto');
const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');
const {
  sendPasswordResetEmail,
  maskEmail,
  maskPhone,
} = require('../services/notification.service');

/**
 * Cookie security options helper
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true, // Mitigates XSS token theft
    secure: isProduction, // HTTPS only in production
    sameSite: isProduction ? 'strict' : 'lax', // Mitigates CSRF
    maxAge: 24 * 60 * 60 * 1000, // Strict 24 Hours
    path: '/',
  };
};

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

    // Set secure HttpOnly cookie
    res.cookie('token', token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: 'System Administrator registered successfully.',
      data: {
        token, // Provided for API/mobile interoperability
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

    // Generate hardened 24-hour JWT
    const token = generateToken({
      userId: user.id,
      role: user.role,
    });

    // Attach HttpOnly, Secure, SameSite Cookie
    res.cookie('token', token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token, // Included for backward compatibility with clients passing Authorization header
        user: {
          id: user.id,
          employeeCode: user.employeeCode,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          mustChangePassword: user.mustChangePassword ?? false,
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
    console.error('[AUTH ERROR] in getMe:', error);
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

    const isHrOrAdmin = user.role === 'ADMIN' || user.role === 'HR_MANAGER';

    return res.status(200).json({
      success: true,
      data: {
        email: user.email,
        employeeCode: user.employeeCode,
        fullName: `${user.firstName} ${user.lastName}`,
        role: user.role,
        isHrOrAdmin,
        allowedChannels: ['EMAIL'],
        phone: user.phone,
        maskedEmail: maskEmail(user.email),
        maskedPhone: maskPhone(user.phone),
        hasPhone: Boolean(user.phone && user.phone.trim().length > 0),
        policyNotice: 'Enterprise Security Policy: Ephemeral cryptographic token cycles are sent via Corporate Email.',
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
 * POST /api/auth/forgot-password
 * POST /api/auth/forgot-password/initiate
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered email address.',
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

    // Timing attack & enumeration safe: Always return uniform response
    if (!user || !user.isActive) {
      return res.status(200).json({
        success: true,
        message: 'If an active account with that email exists, password reset instructions have been dispatched.',
      });
    }

    // Invalidate existing unused tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    // 1. Generate 20-byte random hex token (40 hex characters)
    const rawResetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash raw token with SHA-256 for persistent database storage
    const tokenHash = crypto.createHash('sha256').update(rawResetToken).digest('hex');

    // 3. Enforce strict 1-hour expiration window
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // 4. Save hashed token in database
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
        isUsed: false,
        ipAddress: req.ip || req.connection.remoteAddress || 'UNKNOWN',
        userAgent: req.headers['user-agent'] || 'UNKNOWN',
      },
    });

    // 5. Dispatch reset link with unhashed raw token
    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${clientUrl}/reset-password?token=${rawResetToken}`;

    await sendPasswordResetEmail({
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
      resetUrl,
      expiresInHours: 1,
    });

    return res.status(200).json({
      success: true,
      message: 'If an active account with that email exists, password reset instructions have been dispatched.',
      data: {
        email: maskEmail(user.email),
        expiresInHours: 1,
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
 * Reset Password with Ephemeral Cryptographic Token
 * POST /api/auth/reset-password
 * POST /api/auth/forgot-password/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token: bodyToken, newPassword, confirmPassword } = req.body;

    const token = bodyToken || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

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

    // 1. Hash incoming plain token with SHA-256 to query database
    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');

    // 2. Find active, non-expired, unused token
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.isUsed || new Date() > resetRecord.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired (1-hour window exceeded). Please request a new link.',
      });
    }

    if (!resetRecord.user || !resetRecord.user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Associated user account is deactivated or unavailable.',
      });
    }

    // 3. Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // 4. Update password and invalidate tokens in an atomic transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: {
          password: hashedPassword,
          mustChangePassword: false,
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: {
          isUsed: true,
          usedAt: new Date(),
        },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetRecord.userId,
          isUsed: false,
        },
        data: {
          isUsed: true,
        },
      }),
    ]);

    console.log(`[PASSWORD RESET SUCCESS] User ${resetRecord.user.email} (${resetRecord.user.role}) reset password.`);

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

      // 2. Update or Create EmployeeProfile
      const profileUpdates = {};
      if (address !== undefined) profileUpdates.address = address ? address.trim() : null;
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
          profile: {
            include: {
              department: true,
              designation: true,
            },
          },
        },
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Profile information updated successfully.',
      data: { user: updatedUser },
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

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
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

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password. Please try again.',
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
  registerAdmin,
  login,
  logout,
  getMe,
  checkRecoveryUser,
  forgotPassword,
  resetPassword,
  updateMyProfile,
  changeMyPassword,
};
