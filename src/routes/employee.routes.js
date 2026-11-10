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
  resendEmployeeCredentials,
} = require('../controllers/employee.controller');
const { verifyToken, blockDemo } = require('../middlewares/auth.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const { handleUploadMiddleware } = require('../middlewares/upload.middleware');
const cacheService = require('../services/cache.service');

router.use(verifyToken);

// Secured Profile Picture Upload & Delete Endpoints (Available to any authenticated user)
router.post('/profile-picture', blockDemo, handleUploadMiddleware('avatar'), uploadProfilePicture);
router.delete('/profile-picture', blockDemo, removeProfilePicture);

const canManageEmployees = checkRole('ADMIN', 'HR_MANAGER');

router.post('/', blockDemo, canManageEmployees, onboardEmployee);
router.post('/onboard', blockDemo, canManageEmployees, onboardEmployee);
router.get('/', canManageEmployees, cacheService.middleware({ ttlSeconds: 60, tags: ['employees'] }), getEmployees);
router.get('/:id', verifyToken, cacheService.middleware({ ttlSeconds: 60, tags: ['employees'] }), getEmployeeById);
router.post('/:id/resend-credentials', blockDemo, canManageEmployees, resendEmployeeCredentials);
router.put('/:id', blockDemo, canManageEmployees, updateEmployee);
router.patch('/:id', blockDemo, canManageEmployees, updateEmployee);
router.delete('/:id', blockDemo, canManageEmployees, deleteEmployee);

module.exports = router;
