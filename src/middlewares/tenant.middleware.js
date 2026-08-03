const prisma = require('../config/prisma');

const requireTenant = async (req, res, next) => {
  try {
    // SUPER_ADMIN may act across tenants if explicit header or param is provided
    if (req.user.role === 'SUPER_ADMIN') {
      req.tenantId = req.headers['x-tenant-id'] || req.user.tenantId || null;
      return next();
    }

    if (!req.user.tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Tenant context missing. Access denied.',
      });
    }

    // Verify tenant exists and is active
    const tenant = await prisma.tenant.findUnique({
      where: { id: req.user.tenantId },
      select: { id: true, status: true, name: true },
    });

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Associated tenant company not found.',
      });
    }

    if (tenant.status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        message: `Tenant account is currently ${tenant.status}. Access restricted.`,
      });
    }

    // Set tenantId on request object for database query isolation
    req.tenantId = tenant.id;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process tenant context.',
      error: error.message,
    });
  }
};

module.exports = {
  requireTenant,
};
