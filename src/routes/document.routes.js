const express = require('express');
const router = express.Router();
const {
  getIssuedDocuments,
  issueDocument,
  deleteIssuedDocument,
  getCompanyPolicies,
  publishCompanyPolicy,
  deleteCompanyPolicy,
} = require('../controllers/document.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

router.use(verifyToken, requireTenant);

const canManageDocuments = checkRole('ADMIN', 'HR_MANAGER');

// Issued Documents Endpoints
router.get('/issued', getIssuedDocuments);
router.post('/issue', canManageDocuments, issueDocument);
router.delete('/issued/:id', canManageDocuments, deleteIssuedDocument);

// Company Policies Endpoints
router.get('/policies', getCompanyPolicies);
router.post('/policies', canManageDocuments, publishCompanyPolicy);
router.delete('/policies/:id', canManageDocuments, deleteCompanyPolicy);

module.exports = router;
