// Deprecated: Tenant middleware is no longer active in single-company mode
const requireTenant = (req, res, next) => {
  next();
};

module.exports = {
  requireTenant,
};
