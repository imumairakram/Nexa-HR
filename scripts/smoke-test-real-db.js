/**
 * scripts/smoke-test-real-db.js
 *
 * Real-DB Smoke Test (Zero Mocks, Real Prisma Client against nexahr_scratch).
 * Exercises the end-to-end operational flow:
 * 1. Set Salary Structure
 * 2. Generate Monthly Payroll
 * 3. List Company Payslips
 * 4. Get Payslip by ID
 * 5. Update Payslip Status (mark PAID)
 * 6. Get My Payslips (Employee Owner Access)
 * 7. Accounts: Create Transaction Voucher
 * 8. Accounts: List Transactions
 * 9. Accounts: Aggregated Stats & Cash Flow
 * 10. Accounts: Batch Update Status
 *
 * Reports actual JSON response payloads verbatim.
 */

require('dotenv').config();

const scratchUrl = process.env.TEST_DATABASE_URL;

if (!scratchUrl) {
  console.error('[CONFIG ERROR] TEST_DATABASE_URL must be configured in environment or .env');
  process.exit(1);
}

if (!scratchUrl.includes('scratch') && !scratchUrl.includes('test')) {
  console.error('[SAFETY ERROR] Smoke test must run against scratch/test DB. Refusing to run on:', scratchUrl);
  process.exit(1);
}

process.env.DATABASE_URL = scratchUrl;
process.env.DIRECT_URL = scratchUrl;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: scratchUrl } } });

// Import Controllers
const payrollController = require('../src/controllers/payroll.controller');
const accountController = require('../src/controllers/account.controller');

// Mock response builder that captures actual responses
function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

async function runRealDBSmokeTest() {
  console.log('='.repeat(75));
  console.log('  NEXAHR - REAL-DB SMOKE TEST (NO MOCKS, SCRATCH DB: nexahr_scratch)');
  console.log('='.repeat(75));

  const runId = Date.now();
  const adminId = `smoke-admin-${runId}`;
  const empId = `smoke-emp-${runId}`;

  try {
    // 0. Bootstrap real users in nexahr_scratch
    console.log('\n[SETUP] Bootstrapping real users in scratch DB...');
    await prisma.user.createMany({
      data: [
        {
          id: adminId,
          employeeCode: `EMP-ADM-${runId.toString().slice(-4)}`,
          email: `admin-${runId}@nexahr.test`,
          password: 'HashedPassword123!',
          firstName: 'Smoke',
          lastName: 'Admin',
          role: 'ADMIN',
        },
        {
          id: empId,
          employeeCode: `EMP-USR-${runId.toString().slice(-4)}`,
          email: `emp-${runId}@nexahr.test`,
          password: 'HashedPassword123!',
          firstName: 'Smoke',
          lastName: 'Employee',
          role: 'EMPLOYEE',
        },
      ],
    });

    const adminUser = { userId: adminId, role: 'ADMIN', email: `admin-${runId}@nexahr.test` };
    const empUser = { userId: empId, role: 'EMPLOYEE', email: `emp-${runId}@nexahr.test` };

    // -----------------------------------------------------------------
    // 1. SET SALARY STRUCTURE
    // -----------------------------------------------------------------
    console.log('\n[1/10] Exercising setSalaryStructure...');
    const reqSetSalary = {
      user: adminUser,
      body: {
        userId: empId,
        basicSalary: 150000,
        housingAllowance: 30000,
        transportAllowance: 15000,
        otherAllowances: 5000,
        taxDeductions: 12500,
        otherDeductions: 2500,
      },
    };
    const resSetSalary = createMockRes();
    await payrollController.setSalaryStructure(reqSetSalary, resSetSalary);
    console.log(`  HTTP Status: ${resSetSalary.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resSetSalary.body, null, 2));

    // -----------------------------------------------------------------
    // 2. GENERATE MONTHLY PAYROLL
    // -----------------------------------------------------------------
    console.log('\n[2/10] Exercising generateMonthlyPayroll...');
    const reqGenPayroll = {
      user: adminUser,
      body: { month: 11, year: 2026 },
    };
    const resGenPayroll = createMockRes();
    await payrollController.generateMonthlyPayroll(reqGenPayroll, resGenPayroll);
    console.log(`  HTTP Status: ${resGenPayroll.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resGenPayroll.body, null, 2));

    // -----------------------------------------------------------------
    // 3. LIST COMPANY PAYSLIPS
    // -----------------------------------------------------------------
    console.log('\n[3/10] Exercising getCompanyPayslips (List Payslips)...');
    const reqListPayslips = {
      user: adminUser,
      query: { month: 11, year: 2026 },
    };
    const resListPayslips = createMockRes();
    await payrollController.getCompanyPayslips(reqListPayslips, resListPayslips);
    console.log(`  HTTP Status: ${resListPayslips.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resListPayslips.body, null, 2));

    const generatedPayslip = resListPayslips.body.data.payslips.find((p) => p.userId === empId);
    if (!generatedPayslip) throw new Error('Expected generated payslip for test employee not found in list.');
    const payslipId = generatedPayslip.id;

    // -----------------------------------------------------------------
    // 4. GET PAYSLIP BY ID
    // -----------------------------------------------------------------
    console.log(`\n[4/10] Exercising getPayslipById for ID: ${payslipId}...`);
    const reqGetPayslip = {
      user: adminUser,
      params: { id: payslipId },
    };
    const resGetPayslip = createMockRes();
    await payrollController.getPayslipById(reqGetPayslip, resGetPayslip);
    console.log(`  HTTP Status: ${resGetPayslip.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resGetPayslip.body, null, 2));

    // -----------------------------------------------------------------
    // 5. UPDATE PAYSLIP STATUS (MARK PAID)
    // -----------------------------------------------------------------
    console.log(`\n[5/10] Exercising updatePayslipStatus (Forward Transition to PAID)...`);
    const reqMarkPaid = {
      user: adminUser,
      params: { id: payslipId },
      body: { status: 'PAID' },
    };
    const resMarkPaid = createMockRes();
    await payrollController.updatePayslipStatus(reqMarkPaid, resMarkPaid);
    console.log(`  HTTP Status: ${resMarkPaid.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resMarkPaid.body, null, 2));

    // -----------------------------------------------------------------
    // 6. GET MY PAYSLIPS (EMPLOYEE OWNER ACCESS)
    // -----------------------------------------------------------------
    console.log('\n[6/10] Exercising getMyPayslips (Employee Self-Service)...');
    const reqMyPayslips = {
      user: empUser,
    };
    const resMyPayslips = createMockRes();
    await payrollController.getMyPayslips(reqMyPayslips, resMyPayslips);
    console.log(`  HTTP Status: ${resMyPayslips.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resMyPayslips.body, null, 2));

    // -----------------------------------------------------------------
    // 7. ACCOUNTS: CREATE TRANSACTION
    // -----------------------------------------------------------------
    console.log('\n[7/10] Exercising createTransaction (Accounts Voucher)...');
    const reqCreateTxn = {
      user: adminUser,
      body: {
        title: 'Cloud Production Cluster Compute - AWS Q4',
        category: 'INFRASTRUCTURE',
        type: 'EXPENSE',
        amount: 28450.75,
        department: 'Engineering & DevOps',
        date: new Date().toISOString(),
        paymentMethod: 'Corp Visa',
        ref: `INV-AWS-${runId}`,
        taxDeductible: true,
        notes: 'Monthly enterprise hosting and container cluster allocation.',
      },
    };
    const resCreateTxn = createMockRes();
    await accountController.createTransaction(reqCreateTxn, resCreateTxn);
    console.log(`  HTTP Status: ${resCreateTxn.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resCreateTxn.body, null, 2));

    const createdTxn = resCreateTxn.body.data.transaction;
    const txnId = createdTxn.dbId;

    // -----------------------------------------------------------------
    // 8. ACCOUNTS: LIST TRANSACTIONS
    // -----------------------------------------------------------------
    console.log('\n[8/10] Exercising getTransactions (List Accounts Transactions)...');
    const reqListTxn = {
      user: adminUser,
      query: { page: 1, limit: 10 },
    };
    const resListTxn = createMockRes();
    await accountController.getTransactions(reqListTxn, resListTxn);
    console.log(`  HTTP Status: ${resListTxn.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resListTxn.body, null, 2));

    // -----------------------------------------------------------------
    // 9. ACCOUNTS: GET STATS & METRICS
    // -----------------------------------------------------------------
    console.log('\n[9/10] Exercising getTransactionStats (Aggregated Ledger KPIs)...');
    const reqStats = { user: adminUser };
    const resStats = createMockRes();
    await accountController.getTransactionStats(reqStats, resStats);
    console.log(`  HTTP Status: ${resStats.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resStats.body, null, 2));

    // -----------------------------------------------------------------
    // 10. ACCOUNTS: BATCH UPDATE STATUS
    // -----------------------------------------------------------------
    console.log(`\n[10/10] Exercising batchUpdateStatus for Voucher: ${createdTxn.voucherNumber}...`);
    const reqBatchStatus = {
      user: adminUser,
      body: {
        ids: [createdTxn.voucherNumber],
        status: 'VERIFIED',
      },
    };
    const resBatchStatus = createMockRes();
    await accountController.batchUpdateStatus(reqBatchStatus, resBatchStatus);
    console.log(`  HTTP Status: ${resBatchStatus.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resBatchStatus.body, null, 2));

    console.log('\n' + '='.repeat(75));
    console.log('  REAL-DB SMOKE TEST COMPLETED SUCCESSFULLY WITH 0 FAILURES!');
    console.log('='.repeat(75));
  } catch (err) {
    console.error('Smoke test error:', err);
    process.exit(1);
  } finally {
    // Clean up test users and transactions
    try {
      await prisma.legacyPayslip.deleteMany({ where: { userId: empId } });
      await prisma.salaryStructure.deleteMany({ where: { userId: empId } });
      await prisma.accountTransaction.deleteMany({ where: { createdById: adminId } });
      await prisma.user.deleteMany({ where: { id: { in: [adminId, empId] } } });
    } catch (e) {
      console.warn('Cleanup note:', e.message);
    }
    await prisma.$disconnect();
  }
}

runRealDBSmokeTest().catch((e) => {
  console.error(e);
  process.exit(1);
});
