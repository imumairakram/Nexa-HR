/**
 * Shared recruitment queries & pipeline filter rules
 * Single Source of Truth for counting visible active applications in the ATS pipeline.
 */

// Filter for applications that are visible in the recruitment pipeline & requisition cards
const visibleApplicationsWhere = {
  status: 'ACTIVE',
  NOT: {
    aiStatus: { in: ['SCREENED_OUT', 'UNMATCHED', 'ERROR'] },
  },
};

module.exports = {
  visibleApplicationsWhere,
};

