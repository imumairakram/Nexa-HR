/**
 * client/src/demo/fixtures/accounts.js
 * Synthetic Accounts & Financial Ledger Transactions
 */

export const DEMO_ACCOUNT_TRANSACTIONS = [
  {
    id: 'txn-01',
    transactionCode: 'TXN-2026-1001',
    description: 'Corporate Monthly Payroll Disbursement - October 2026',
    category: 'PAYROLL',
    type: 'EXPENSE',
    amount: 3850000,
    status: 'COMPLETED',
    date: '2026-10-31',
    reference: 'SALARY-BATCH-10',
    createdAt: '2026-10-31T17:00:00.000Z',
  },
  {
    id: 'txn-02',
    transactionCode: 'TXN-2026-1002',
    description: 'Cloud Infrastructure & AWS Production Reserved Instances',
    category: 'INFRASTRUCTURE',
    type: 'EXPENSE',
    amount: 320000,
    status: 'COMPLETED',
    date: '2026-10-28',
    reference: 'INV-AWS-8829',
    createdAt: '2026-10-28T12:00:00.000Z',
  },
  {
    id: 'txn-03',
    transactionCode: 'TXN-2026-1003',
    description: 'Annual Software License Renewals (Figma, GitHub Enterprise, Zoom)',
    category: 'SOFTWARE',
    type: 'EXPENSE',
    amount: 185000,
    status: 'COMPLETED',
    date: '2026-10-15',
    reference: 'SUB-ENTERPRISE-26',
    createdAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'txn-04',
    transactionCode: 'TXN-2026-1004',
    description: 'Office Maintenance, Cleaning Services & Workspace Utilities',
    category: 'FACILITIES',
    type: 'EXPENSE',
    amount: 95000,
    status: 'COMPLETED',
    date: '2026-10-10',
    reference: 'FAC-OCT-26',
    createdAt: '2026-10-10T09:00:00.000Z',
  },
];

export const DEMO_ACCOUNT_STATS = {
  totalBalance: 12450000,
  monthlyInflow: 6500000,
  monthlyOutflow: 4450000,
  netCashflow: 2050000,
  pendingInvoicesCount: 0,
};

