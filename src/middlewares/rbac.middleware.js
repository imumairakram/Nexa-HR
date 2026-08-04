const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Please log in first.',
      });
    }

    // Support legacy role aliases if requested
    const userRole = req.user.role;
    const isAllowed = allowedRoles.includes(userRole) || 
      (allowedRoles.includes('ADMIN') && ['SUPER_ADMIN', 'COMPANY_ADMIN'].includes(userRole));

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. Role '${userRole}' does not have permission to access this resource.`,
      });
    }

    next();
  };
};

module.exports = {
  checkRole,
};
