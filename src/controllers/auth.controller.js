const prisma = require('../config/prisma');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken } = require('../utils/jwt');

/**
 * Register a new Tenant (Company) and its primary Company Admin user
 * POST /api/auth/register-tenant
 */
const registerTenant = async (req, res) => {
  try {
    const { companyName, slug, companyEmail, adminEmail, password, firstName, lastName, phone, address } = req.body;

    // Validation
    if (!companyName || !slug || !companyEmail || !adminEmail || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (companyName, slug, companyEmail, adminEmail, password, firstName, lastName).',
      });
    }

    const formattedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    // Check if slug or companyEmail already exists
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ slug: formattedSlug }, { companyEmail }],
      },
    });

    if (existingTenant) {
      return res.status(409).json({
        success: false,
        message: 'A company with this domain slug or email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Execute atomic transaction to create Tenant and Admin User
    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: companyName,
          slug: formattedSlug,
          companyEmail,
          phone,
          address,
          status: 'ACTIVE',
        },
      });

      const adminUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: adminEmail.toLowerCase().trim(),
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role: 'COMPANY_ADMIN',
          isActive: true,
        },
      });

      return { tenant, adminUser };
    });

    // Generate JWT token
    const token = generateToken({
      userId: result.adminUser.id,
      tenantId: result.tenant.id,
      role: result.adminUser.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Tenant company and Company Admin registered successfully.',
      data: {
        token,
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          slug: result.tenant.slug,
          companyEmail: result.tenant.companyEmail,
          status: result.tenant.status,
        },
        user: {
          id: result.adminUser.id,
          email: result.adminUser.email,
          firstName: result.adminUser.firstName,
          lastName: result.adminUser.lastName,
          role: result.adminUser.role,
        },
      },
    });
  } catch (error) {
    console.error('Error in registerTenant:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register tenant.',
      error: error.message,
    });
  }
};

/**
 * User Login (All roles)
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password, slug } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find users by email
    const users = await prisma.user.findMany({
      where: { email: cleanEmail },
      include: {
        tenant: true,
      },
    });

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    let targetUser = null;

    if (users.length === 1) {
      targetUser = users[0];
    } else if (slug) {
      targetUser = users.find((u) => u.tenant && u.tenant.slug === slug.toLowerCase().trim());
    } else {
      return res.status(400).json({
        success: false,
        message: 'Multiple company accounts found for this email. Please specify tenant domain slug.',
      });
    }

    if (!targetUser) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Verify User Status
    if (!targetUser.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your user account has been deactivated. Please contact your company HR/Admin.',
      });
    }

    // Verify Tenant Status for tenant users
    if (targetUser.role !== 'SUPER_ADMIN') {
      if (!targetUser.tenant) {
        return res.status(403).json({
          success: false,
          message: 'No active company tenant associated with this user account.',
        });
      }

      if (targetUser.tenant.status !== 'ACTIVE') {
        return res.status(403).json({
          success: false,
          message: `Company account is ${targetUser.tenant.status}. Access restricted.`,
        });
      }
    }

    // Verify Password
    const isPasswordValid = await comparePassword(password, targetUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    // Generate Token
    const token = generateToken({
      userId: targetUser.id,
      tenantId: targetUser.tenantId,
      role: targetUser.role,
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        user: {
          id: targetUser.id,
          email: targetUser.email,
          firstName: targetUser.firstName,
          lastName: targetUser.lastName,
          role: targetUser.role,
        },
        tenant: targetUser.tenant
          ? {
              id: targetUser.tenant.id,
              name: targetUser.tenant.name,
              slug: targetUser.tenant.slug,
              status: targetUser.tenant.status,
            }
          : null,
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
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            companyEmail: true,
            status: true,
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
      message: 'Failed to fetch user profile.',
      error: error.message,
    });
  }
};

module.exports = {
  registerTenant,
  login,
  getMe,
};
