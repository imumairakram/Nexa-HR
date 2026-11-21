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
const { checkRole } = require('../middlewares/rbac.middleware');
const cacheService = require('../services/cache.service');

router.use(verifyToken);

const canManageAccounts = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN');
const adminOrSuperAdmin = checkRole('ADMIN', 'SUPER_ADMIN');

// Account Transactions & Financial Statistics
router.get('/stats', canManageAccounts, cacheService.middleware({ ttlSeconds: 60, tags: ['accounts'] }), getTransactionStats);
router.get('/transactions', canManageAccounts, cacheService.middleware({ ttlSeconds: 60, tags: ['accounts'] }), getTransactions);
router.post('/transactions', blockDemo, canManageAccounts, createTransaction);
router.put('/transactions/:id', blockDemo, canManageAccounts, updateTransaction);
router.patch('/transactions/:id', blockDemo, canManageAccounts, updateTransaction);
router.delete('/transactions/:id', blockDemo, canManageAccounts, deleteTransaction);

// Clear All Transactions (Disabled in production; requires SUPER_ADMIN + ALLOW_ACCOUNTS_CLEAR=true elsewhere)
router.post('/clear', blockDemo, adminOrSuperAdmin, clearAllTransactions);
router.delete('/clear', blockDemo, adminOrSuperAdmin, clearAllTransactions);

// Batch Operations (Admin Only)
router.post('/batch-delete', blockDemo, adminOrSuperAdmin, batchDeleteTransactions);
router.post('/batch-status', blockDemo, adminOrSuperAdmin, batchUpdateStatus);

// Seeding endpoint (Disabled in production; requires SUPER_ADMIN + ALLOW_ACCOUNTS_SEED=true elsewhere)
router.post('/seed', blockDemo, adminOrSuperAdmin, seedDefaultTransactions);

module.exports = router;
