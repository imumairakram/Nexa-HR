const express = require('express');
const router = express.Router();
const {
  getIssuedDocuments,
  issueDocument,
  uploadEmployeeDocument,
  deleteIssuedDocument,
  getCompanyPolicies,
  publishCompanyPolicy,
  deleteCompanyPolicy,
} = require('../controllers/document.controller');
const { verifyToken, blockDemo } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

router.use(verifyToken, requireTenant);

const canManageDocuments = checkRole('ADMIN', 'HR_MANAGER');

// Issued / Vault Documents Endpoints
router.get('/issued', getIssuedDocuments);
router.post('/issue', blockDemo, canManageDocuments, issueDocument);
router.post('/upload', blockDemo, uploadEmployeeDocument);
router.delete('/issued/:id', blockDemo, deleteIssuedDocument);

// Company Policies Endpoints
router.get('/policies', getCompanyPolicies);
router.post('/policies', blockDemo, canManageDocuments, publishCompanyPolicy);
router.delete('/policies/:id', blockDemo, canManageDocuments, deleteCompanyPolicy);

module.exports = router;
