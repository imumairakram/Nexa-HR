/**
 * Single-Tenant Architectural Notice:
 * 
 * NexaHR operates strictly in a Dedicated Single-Tenant deployment model.
 * Each organization / client runs in an isolated infrastructure instance with its own
 * dedicated database and environment configurations.
 * 
 * Row-level multi-tenancy (tenantId column partitioning) was deprecated in favor of 
 * strict database-level physical isolation. This middleware remains solely for backwards
 * compatibility and explicit architectural documentation.
 */

const requireTenant = (req, res, next) => {
  // Pass-through: Database-level physical isolation in single-tenant mode
  next();
};

module.exports = {
  requireTenant,
};
