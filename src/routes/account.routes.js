const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionStats,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  batchDeleteTransactions,
  batchUpdateStatus,
  seedDefaultTransactions,
  clearAllTransactions,
} = require('../controllers/account.controller');
const { verifyToken, blockDemo } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');

router.use(verifyToken, requireTenant);

const canManageAccounts = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN');
const adminOnly = checkRole('ADMIN');

// Account Transactions & Financial Statistics
router.get('/stats', canManageAccounts, cacheService.middleware({ ttlSeconds: 60, tags: ['accounts'] }), getTransactionStats);
router.get('/transactions', canManageAccounts, cacheService.middleware({ ttlSeconds: 60, tags: ['accounts'] }), getTransactions);
router.post('/transactions', blockDemo, canManageAccounts, createTransaction);
router.put('/transactions/:id', blockDemo, canManageAccounts, updateTransaction);
router.patch('/transactions/:id', blockDemo, canManageAccounts, updateTransaction);
router.delete('/transactions/:id', blockDemo, canManageAccounts, deleteTransaction);

// Clear All Transactions (Admin Only)
router.post('/clear', blockDemo, adminOnly, clearAllTransactions);
router.delete('/clear', blockDemo, adminOnly, clearAllTransactions);

// Batch Operations (Admin Only)
router.post('/batch-delete', blockDemo, adminOnly, batchDeleteTransactions);
router.post('/batch-status', blockDemo, adminOnly, batchUpdateStatus);

// Seeding endpoint (Admin Only)
router.post('/seed', blockDemo, adminOnly, seedDefaultTransactions);

module.exports = router;
