const express = require('express');
const router = express.Router();
const {
  createDesignation,
  getDesignations,
  updateDesignation,
  deleteDesignation,
} = require('../controllers/designation.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

router.use(verifyToken, requireTenant);

router.post('/', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), createDesignation);
router.get('/', getDesignations);
router.put('/:id', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), updateDesignation);
router.delete('/:id', checkRole('COMPANY_ADMIN', 'HR_MANAGER', 'SUPER_ADMIN'), deleteDesignation);

module.exports = router;
