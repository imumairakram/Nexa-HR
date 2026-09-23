const prisma = require('../config/prisma');

const DEFAULT_SAMPLE_TXNS = [
  {
    voucherNumber: 'TXN-9402',
    title: 'AWS Cloud Compute & Kubernetes Cluster - Q3',
    category: 'INFRASTRUCTURE',
    amount: 14250,
    type: 'EXPENSE',
    department: 'Engineering & DevOps',
    date: new Date('2026-08-26T14:30:00Z'),
    time: '14:30 EST',
    status: 'VERIFIED',
    paymentMethod: 'Corp Visa',
    ref: 'INV-AWS-2026-08',
    taxDeductible: true,
    notes: 'Monthly enterprise hosting and container orchestrations on us-east-1.',
  },
  {
    voucherNumber: 'TXN-9403',
    title: 'Bi-Weekly Company Global Payroll Run',
    category: 'PAYROLL',
    amount: 84000,
    type: 'EXPENSE',
    department: 'Company-Wide',
    date: new Date('2026-08-25T09:00:00Z'),
    time: '09:00 EST',
    status: 'VERIFIED',
    paymentMethod: 'ACH Transfer',
    ref: 'ACH-PR-2026-08',
    taxDeductible: true,
    notes: 'Direct deposit ACH batch for active payroll ledger.',
  },
  {
    voucherNumber: 'TXN-9404',
    title: 'Client Enterprise SLA Retainer - Acme Corp',
    category: 'REVENUE',
    amount: 50000,
    type: 'INCOME',
    department: 'Marketing & Sales',
    date: new Date('2026-08-24T16:45:00Z'),
    time: '16:45 EST',
    status: 'VERIFIED',
    paymentMethod: 'Wire In',
    ref: 'RET-ACME-883',
    taxDeductible: false,
    notes: 'Quarterly enterprise SaaS retainer payment received via wire.',
  },
  {
    voucherNumber: 'TXN-9405',
    title: 'Annual Comprehensive Employee Health & Dental',
    category: 'BENEFITS',
    amount: 12500,
    type: 'EXPENSE',
    department: 'People Operations',
    date: new Date('2026-08-22T11:15:00Z'),
    time: '11:15 EST',
    status: 'VERIFIED',
    paymentMethod: 'Direct Deposit',
    ref: 'BNF-HEALTH-99',
    taxDeductible: true,
    notes: 'Group medical and wellness subsidy for full-time staff.',
  },
  {
    voucherNumber: 'TXN-9406',
    title: 'MacBook Pro M3 Max Engineering Fleet (5 Units)',
    category: 'HARDWARE',
    amount: 17450,
    type: 'EXPENSE',
    department: 'Engineering & DevOps',
    date: new Date('2026-08-20T13:20:00Z'),
    time: '13:20 EST',
    status: 'PENDING',
    paymentMethod: 'Corp Visa',
    ref: 'APL-DEV-889',
    taxDeductible: true,
    notes: 'Workstation hardware provisioning for newly onboarded senior engineers.',
  },
  {
    voucherNumber: 'TXN-9407',
    title: 'Headquarters Facility Lease & Utilities',
    category: 'FACILITIES',
    amount: 9800,
    type: 'EXPENSE',
    department: 'Operations',
    date: new Date('2026-08-18T10:00:00Z'),
    time: '10:00 EST',
    status: 'VERIFIED',
    paymentMethod: 'ACH Transfer',
    ref: 'FAC-HQ-AUG26',
    taxDeductible: true,
    notes: 'Office lease, power, fiber internet and janitorial service package.',
  },
  {
    voucherNumber: 'TXN-9408',
    title: 'GitHub Enterprise & Figma Design System Licenses',
    category: 'INFRASTRUCTURE',
    amount: 3600,
    type: 'EXPENSE',
    department: 'Product & Design',
    date: new Date('2026-08-15T15:10:00Z'),
    time: '15:10 EST',
    status: 'VERIFIED',
    paymentMethod: 'Corp Visa',
    ref: 'LIC-GH-FIG-26',
    taxDeductible: true,
    notes: 'Annual seats for product design and engineering workflow tooling.',
  },
  {
    voucherNumber: 'TXN-9409',
    title: 'Executive Team Offsite & Strategic Travel',
    category: 'OPERATIONS',
    amount: 6200,
    type: 'EXPENSE',
    department: 'Operations',
    date: new Date('2026-08-10T18:00:00Z'),
    time: '18:00 EST',
    status: 'PENDING',
    paymentMethod: 'Corp Visa',
    ref: 'TRV-OFFSITE-Q3',
    taxDeductible: true,
    notes: 'Travel, lodging and workshop facilities for quarterly leadership offsite.',
  },
];

/**
 * Seed initial sample transactions if table is empty
 */
const seedDefaultTransactions = async (req, res) => {
  try {
    const count = await prisma.accountTransaction.count();
    if (count > 0 && !req.query.force) {
      return res.status(200).json({
        success: true,
        message: 'Account transactions already initialized.',
        data: { count },
      });
    }

    if (req.query.force) {
      await prisma.accountTransaction.deleteMany();
    }

    const created = await prisma.$transaction(
      DEFAULT_SAMPLE_TXNS.map((txn) =>
        prisma.accountTransaction.create({
          data: {
            ...txn,
            createdById: req.user?.userId || null,
          },
        })
      )
    );

    return res.status(201).json({
      success: true,
      message: `Successfully seeded ${created.length} initial corporate transactions.`,
      data: { count: created.length, transactions: created },
    });
  } catch (error) {
    console.error('Error seeding default transactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to seed default transactions.',
      error: error.message,
    });
  }
};

/**
 * Get all transactions with flexible filtering, search, and sorting
 */
const getTransactions = async (req, res) => {
  try {
    const {
      search = '',
      category = 'ALL',
      status = 'ALL',
      type = 'ALL',
      department = 'ALL',
      fiscalPeriod = 'ALL_TIME',
      startDate,
      endDate,
      sortBy = 'date_desc',
      page = 1,
      limit = 100,
    } = req.query;

    const where = {};

    // Search query
    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { voucherNumber: { contains: q, mode: 'insensitive' } },
        { title: { contains: q, mode: 'insensitive' } },
        { ref: { contains: q, mode: 'insensitive' } },
        { department: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } },
        { paymentMethod: { contains: q, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (category && category !== 'ALL') {
      if (category === 'INFRASTRUCTURE') {
        where.category = { in: ['INFRASTRUCTURE', 'SAAS'] };
      } else {
        where.category = category;
      }
    }

    // Status filter
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Type filter (EXPENSE / INCOME)
    if (type && type !== 'ALL') {
      where.type = type;
    }

    // Department filter
    if (department && department !== 'ALL') {
      where.department = { contains: department, mode: 'insensitive' };
    }

    // Fiscal period or custom date range filter
    const now = new Date();
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (fiscalPeriod === 'CURRENT_MONTH' || fiscalPeriod === 'AUGUST_2026') {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      where.date = {
        gte: new Date(currentYear, currentMonth, 1),
        lte: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59),
      };
    } else if (fiscalPeriod === 'Q3_2026' || fiscalPeriod === 'CURRENT_QUARTER') {
      const currentYear = now.getFullYear();
      const currentQuarter = Math.floor(now.getMonth() / 3);
      where.date = {
        gte: new Date(currentYear, currentQuarter * 3, 1),
        lte: new Date(currentYear, currentQuarter * 3 + 3, 0, 23, 59, 59),
      };
    } else if (fiscalPeriod === 'YTD') {
      const currentYear = now.getFullYear();
      where.date = {
        gte: new Date(currentYear, 0, 1),
        lte: now,
      };
    }

    // Sorting
    let orderBy = [{ date: 'desc' }, { createdAt: 'desc' }];
    if (sortBy === 'date_asc') orderBy = [{ date: 'asc' }, { createdAt: 'asc' }];
    else if (sortBy === 'date_desc') orderBy = [{ date: 'desc' }, { createdAt: 'desc' }];
    else if (sortBy === 'amount_desc') orderBy = [{ amount: 'desc' }];
    else if (sortBy === 'amount_asc') orderBy = [{ amount: 'asc' }];
    else if (sortBy === 'title_asc') orderBy = [{ title: 'asc' }];
    else if (sortBy === 'voucher_asc') orderBy = [{ voucherNumber: 'asc' }];

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 100);
    const skip = (pageNum - 1) * limitNum;

    const [transactions, filteredCount] = await Promise.all([
      prisma.accountTransaction.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              employeeCode: true,
            },
          },
        },
      }),
      prisma.accountTransaction.count({ where }),
    ]);

    // Format transactions to ensure compatibility with client format
    const formatted = transactions.map((t) => ({
      id: t.voucherNumber || t.id,
      dbId: t.id,
      voucherNumber: t.voucherNumber,
      title: t.title,
      category: t.category,
      amount: Number(t.amount || 0),
      type: t.type,
      department: t.department,
      date: t.date ? new Date(t.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      time: t.time || new Date(t.date || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: t.status,
      paymentMethod: t.paymentMethod,
      ref: t.ref || `REF-${t.id.slice(0, 6)}`,
      taxDeductible: t.taxDeductible,
      notes: t.notes || '',
      createdBy: t.createdBy,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return res.status(200).json({
      success: true,
      data: {
        transactions: formatted,
        pagination: {
          total: filteredCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(filteredCount / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Error in getTransactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve transactions.',
      error: error.message,
    });
  }
};

/**
 * Get aggregated accounts statistics & KPIs
 */
const getTransactionStats = async (req, res) => {
  try {
    const transactions = await prisma.accountTransaction.findMany();

    // Fetch live payslips to check if payroll total differs
    let totalPayslipsNet = 0;
    try {
      const payslips = await prisma.payslip.findMany();
      totalPayslipsNet = payslips.reduce((acc, p) => acc + Number(p.netSalary || 0), 0);
    } catch (e) {
      console.warn('Could not aggregate live payslips:', e.message);
    }

    let totalExpenses = 0;
    let totalIncome = 0;
    const categoryTotals = {};
    const departmentExpenses = {};

    transactions.forEach((t) => {
      const amt = Number(t.amount || 0);
      if (t.type === 'EXPENSE') {
        totalExpenses += amt;
        const cat = t.category || 'OTHER';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;

        const dept = t.department || 'Company-Wide';
        departmentExpenses[dept] = (departmentExpenses[dept] || 0) + amt;
      } else if (t.type === 'INCOME') {
        totalIncome += amt;
        const cat = t.category || 'REVENUE';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
      }
    });

    const netCashFlow = totalIncome - totalExpenses;
    const payrollTotal = categoryTotals['PAYROLL'] || (totalPayslipsNet > 0 ? totalPayslipsNet : 0);
    const infraTotal = (categoryTotals['INFRASTRUCTURE'] || 0) + (categoryTotals['SAAS'] || 0);
    const benefitsTotal = categoryTotals['BENEFITS'] || 0;
    const hardwareTotal = categoryTotals['HARDWARE'] || 0;
    const facilitiesTotal = categoryTotals['FACILITIES'] || 0;
    const operationsTotal = categoryTotals['OPERATIONS'] || 0;

    // Runway calculation based on total cash reserve assumption ($2.5M)
    const monthlyBurn = totalExpenses > 0 ? totalExpenses : 0;
    const runwayMonths = monthlyBurn > 0 ? Number((2500000 / monthlyBurn).toFixed(1)) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalExpenses,
        totalIncome,
        netCashFlow,
        runwayMonths,
        categoryBreakdown: {
          PAYROLL: payrollTotal,
          INFRASTRUCTURE: infraTotal,
          BENEFITS: benefitsTotal,
          HARDWARE: hardwareTotal,
          FACILITIES: facilitiesTotal,
          OPERATIONS: operationsTotal,
          ...categoryTotals,
        },
        departmentExpenses,
        totalCount: transactions.length,
        verifiedCount: transactions.filter((t) => t.status === 'VERIFIED').length,
        pendingCount: transactions.filter((t) => t.status === 'PENDING').length,
        flaggedCount: transactions.filter((t) => t.status === 'FLAGGED').length,
      },
    });
  } catch (error) {
    console.error('Error in getTransactionStats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate account statistics.',
      error: error.message,
    });
  }
};

/**
 * Create a new Transaction / Voucher
 */
const createTransaction = async (req, res) => {
  try {
    const {
      title,
      category = 'OPERATIONS',
      type = 'EXPENSE',
      amount,
      department = 'Company-Wide',
      date,
      time,
      status = 'VERIFIED',
      paymentMethod = 'Corp Visa',
      ref,
      taxDeductible = true,
      notes = '',
    } = req.body;

    if (!title || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Title and amount are required.',
      });
    }

    const amountNum = Math.abs(parseFloat(amount) || 0);

    // Generate unique Voucher Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const voucherNumber = `TXN-${randomSuffix}`;

    const transaction = await prisma.accountTransaction.create({
      data: {
        voucherNumber,
        title: title.trim(),
        category: category.toUpperCase(),
        type: type.toUpperCase(),
        amount: amountNum,
        department: department.trim(),
        date: date ? new Date(date) : new Date(),
        time: time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: status.toUpperCase(),
        paymentMethod: paymentMethod.trim(),
        ref: ref ? ref.trim() : `VCH-${Date.now().toString().slice(-6)}`,
        taxDeductible: Boolean(taxDeductible),
        notes: notes.trim(),
        createdById: req.user?.userId || null,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: `Voucher "${voucherNumber}" recorded successfully.`,
      data: {
        transaction: {
          ...transaction,
          id: transaction.voucherNumber,
          dbId: transaction.id,
        },
      },
    });
  } catch (error) {
    console.error('Error in createTransaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record transaction voucher.',
      error: error.message,
    });
  }
};

/**
 * Update an existing Transaction
 */
const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      category,
      type,
      amount,
      department,
      date,
      time,
      status,
      paymentMethod,
      ref,
      taxDeductible,
      notes,
    } = req.body;

    // Find by id or voucherNumber
    const existing = await prisma.accountTransaction.findFirst({
      where: {
        OR: [{ id }, { voucherNumber: id }],
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction voucher not found.',
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (category !== undefined) updateData.category = category.toUpperCase();
    if (type !== undefined) updateData.type = type.toUpperCase();
    if (amount !== undefined) updateData.amount = Math.abs(parseFloat(amount) || 0);
    if (department !== undefined) updateData.department = department.trim();
    if (date !== undefined) updateData.date = new Date(date);
    if (time !== undefined) updateData.time = time;
    if (status !== undefined) updateData.status = status.toUpperCase();
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod.trim();
    if (ref !== undefined) updateData.ref = ref.trim();
    if (taxDeductible !== undefined) updateData.taxDeductible = Boolean(taxDeductible);
    if (notes !== undefined) updateData.notes = notes.trim();

    const updated = await prisma.accountTransaction.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Voucher "${updated.voucherNumber}" updated successfully.`,
      data: {
        transaction: {
          ...updated,
          id: updated.voucherNumber,
          dbId: updated.id,
        },
      },
    });
  } catch (error) {
    console.error('Error in updateTransaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update transaction voucher.',
      error: error.message,
    });
  }
};

/**
 * Delete a single transaction
 */
const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.accountTransaction.findFirst({
      where: {
        OR: [{ id }, { voucherNumber: id }],
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found.',
      });
    }

    await prisma.accountTransaction.delete({
      where: { id: existing.id },
    });

    return res.status(200).json({
      success: true,
      message: `Voucher "${existing.voucherNumber}" deleted from corporate ledger.`,
    });
  } catch (error) {
    console.error('Error in deleteTransaction:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete transaction.',
      error: error.message,
    });
  }
};

/**
 * Batch delete multiple transactions
 */
const batchDeleteTransactions = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of transaction IDs to delete.',
      });
    }

    const deleted = await prisma.accountTransaction.deleteMany({
      where: {
        OR: [{ id: { in: ids } }, { voucherNumber: { in: ids } }],
      },
    });

    return res.status(200).json({
      success: true,
      message: `Successfully removed ${deleted.count} transactions.`,
      data: { count: deleted.count },
    });
  } catch (error) {
    console.error('Error in batchDeleteTransactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to batch delete transactions.',
      error: error.message,
    });
  }
};

/**
 * Batch update transaction status (VERIFIED, PENDING, FLAGGED)
 */
const batchUpdateStatus = async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide transaction IDs and valid status.',
      });
    }

    const updated = await prisma.accountTransaction.updateMany({
      where: {
        OR: [{ id: { in: ids } }, { voucherNumber: { in: ids } }],
      },
      data: { status: status.toUpperCase() },
    });

    return res.status(200).json({
      success: true,
      message: `Updated status to ${status} for ${updated.count} transactions.`,
      data: { count: updated.count },
    });
  } catch (error) {
    console.error('Error in batchUpdateStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to batch update transaction status.',
      error: error.message,
    });
  }
};

/**
 * Clear / Delete all transactions from the corporate ledger
 */
const clearAllTransactions = async (req, res) => {
  try {
    const deleted = await prisma.accountTransaction.deleteMany();
    return res.status(200).json({
      success: true,
      message: `Cleared all ${deleted.count} corporate ledger transactions.`,
      data: { count: deleted.count },
    });
  } catch (error) {
    console.error('Error in clearAllTransactions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear corporate ledger transactions.',
      error: error.message,
    });
  }
};

module.exports = {
  getTransactions,
  getTransactionStats,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  batchDeleteTransactions,
  batchUpdateStatus,
  seedDefaultTransactions,
  clearAllTransactions,
};
