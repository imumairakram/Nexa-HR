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
const { verifyToken } = require('../middlewares/auth.middleware');
const { requireTenant } = require('../middlewares/tenant.middleware');
const { checkRole } = require('../middlewares/rbac.middleware');

router.use(verifyToken, requireTenant);

const canManageAccounts = checkRole('ADMIN', 'HR_MANAGER', 'SUPER_ADMIN', 'COMPANY_ADMIN');

// Account Transactions & Financial Statistics
router.get('/stats', canManageAccounts, getTransactionStats);
router.get('/transactions', canManageAccounts, getTransactions);
router.post('/transactions', canManageAccounts, createTransaction);
router.put('/transactions/:id', canManageAccounts, updateTransaction);
router.patch('/transactions/:id', canManageAccounts, updateTransaction);
router.delete('/transactions/:id', canManageAccounts, deleteTransaction);

// Clear All Transactions
router.post('/clear', canManageAccounts, clearAllTransactions);
router.delete('/clear', canManageAccounts, clearAllTransactions);

// Batch Operations
router.post('/batch-delete', canManageAccounts, batchDeleteTransactions);
router.post('/batch-status', canManageAccounts, batchUpdateStatus);

// Seeding endpoint
router.post('/seed', canManageAccounts, seedDefaultTransactions);

module.exports = router;
