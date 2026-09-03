/**
 * Strict Role-Based Access Control (RBAC) Middleware
 * Enforces strict boundary isolation across ADMIN, HR_MANAGER, and EMPLOYEE roles.
 */
const checkRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required before evaluating role permissions.',
      });
    }

    const userRole = req.user.role;

    // Strict exact-match verification against allowed role whitelist
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${userRole}' does not have permission to access this resource.`,
        requiredRoles: allowedRoles,
      });
    }

    return next();
  };
};

module.exports = {
  checkRole,
};
