const express = require('express');
const router = express.Router();
const {
  createDesignation,
  getDesignations,
  updateDesignation,
  deleteDesignation,
} = require('../controllers/designation.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');

router.use(verifyToken);

const canManageDesignations = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN');

router.post('/', canManageDesignations, createDesignation);
router.get('/', cacheService.middleware({ ttlSeconds: 120, tags: ['designations'] }), getDesignations);
router.put('/:id', canManageDesignations, updateDesignation);
router.patch('/:id', canManageDesignations, updateDesignation);
router.delete('/:id', canManageDesignations, deleteDesignation);

module.exports = router;

