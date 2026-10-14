const express = require('express');
const router = express.Router();
const {
  onboardEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  uploadProfilePicture,
  removeProfilePicture,
} = require('../controllers/employee.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const { handleUploadMiddleware } = require('../middlewares/upload.middleware');
const cacheService = require('../services/cache.service');

router.use(verifyToken, requireTenant);

// Secured Profile Picture Upload & Delete Endpoints (Available to any authenticated user)
router.post('/profile-picture', handleUploadMiddleware('avatar'), uploadProfilePicture);
router.delete('/profile-picture', removeProfilePicture);

const canManageEmployees = checkRole('ADMIN', 'HR_MANAGER');

router.post('/', canManageEmployees, onboardEmployee);
router.post('/onboard', canManageEmployees, onboardEmployee);
router.get('/', canManageEmployees, cacheService.middleware({ ttlSeconds: 60, tags: ['employees'] }), getEmployees);
router.get('/:id', verifyToken, cacheService.middleware({ ttlSeconds: 60, tags: ['employees'] }), getEmployeeById);
router.put('/:id', canManageEmployees, updateEmployee);
router.patch('/:id', canManageEmployees, updateEmployee);
router.delete('/:id', canManageEmployees, deleteEmployee);

module.exports = router;

