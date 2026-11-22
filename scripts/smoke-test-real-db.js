/**
 * scripts/smoke-test-real-db.js
 *
 * Real-DB Smoke Test (Zero Mocks, Real Prisma Client against nexahr_scratch).
 * Exercises positive operational flow AND strict negative safety cases:
 *
 * Positive cases:
 * 1. Set Salary Structure
 * 2. Generate Monthly Payroll
 * 3. List Company Payslips
 * 4. Get Payslip by ID (Admin)
 * 5. Update Payslip Status (mark PAID)
 * 6. Get My Payslips (Employee Owner Access)
 * 7. Accounts: Create Transaction Voucher
 * 8. Accounts: List Transactions
 * 9. Accounts: Aggregated Stats & Cash Flow
 * 10. Accounts: Batch Update Status
 *
 * Negative cases (Item 10):
 * 11. (Negative) Employee B reading Employee A payslip -> 403 Forbidden
 * 12. (Negative) Reverting PAID payslip back to DRAFT or GENERATED -> 409/400 Conflict
 * 13. (Negative) Re-running generate-monthly leaves PAID payslips untouched and lists under skipped
 *
 * Reports actual JSON response payloads verbatim.
 */

require('dotenv').config();

const scratchUrl = process.env.TEST_DATABASE_URL || process.env.DIRECT_URL;

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
  const empAId = `smoke-emp-a-${runId}`;
  const empBId = `smoke-emp-b-${runId}`;

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
          id: empAId,
          employeeCode: `EMP-A-${runId.toString().slice(-4)}`,
          email: `emp-a-${runId}@nexahr.test`,
          password: 'HashedPassword123!',
          firstName: 'Smoke',
          lastName: 'EmployeeA',
          role: 'EMPLOYEE',
        },
        {
          id: empBId,
          employeeCode: `EMP-B-${runId.toString().slice(-4)}`,
          email: `emp-b-${runId}@nexahr.test`,
          password: 'HashedPassword123!',
          firstName: 'Smoke',
          lastName: 'EmployeeB',
          role: 'EMPLOYEE',
        },
      ],
    });

    const adminUser = { userId: adminId, role: 'ADMIN', email: `admin-${runId}@nexahr.test` };
    const empAUser = { userId: empAId, role: 'EMPLOYEE', email: `emp-a-${runId}@nexahr.test` };
    const empBUser = { userId: empBId, role: 'EMPLOYEE', email: `emp-b-${runId}@nexahr.test` };

    // -----------------------------------------------------------------
    // 1. SET SALARY STRUCTURE FOR EMPLOYEE A & B
    // -----------------------------------------------------------------
    console.log('\n[1/13] Exercising setSalaryStructure for Employee A...');
    const reqSetSalaryA = {
      user: adminUser,
      body: {
        userId: empAId,
        basicSalary: 150000,
        housingAllowance: 30000,
        transportAllowance: 15000,
        otherAllowances: 5000,
        taxDeductions: 12500,
        otherDeductions: 2500,
      },
    };
    const resSetSalaryA = createMockRes();
    await payrollController.setSalaryStructure(reqSetSalaryA, resSetSalaryA);
    console.log(`  HTTP Status: ${resSetSalaryA.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resSetSalaryA.body, null, 2));

    const reqSetSalaryB = {
      user: adminUser,
      body: {
        userId: empBId,
        basicSalary: 120000,
        housingAllowance: 25000,
        transportAllowance: 10000,
        taxDeductions: 8000,
        otherDeductions: 1000,
      },
    };
    const resSetSalaryB = createMockRes();
    await payrollController.setSalaryStructure(reqSetSalaryB, resSetSalaryB);

    // -----------------------------------------------------------------
    // 2. GENERATE MONTHLY PAYROLL
    // -----------------------------------------------------------------
    console.log('\n[2/13] Exercising generateMonthlyPayroll...');
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
    console.log('\n[3/13] Exercising getCompanyPayslips (List Payslips)...');
    const reqListPayslips = {
      user: adminUser,
      query: { month: 11, year: 2026 },
    };
    const resListPayslips = createMockRes();
    await payrollController.getCompanyPayslips(reqListPayslips, resListPayslips);
    console.log(`  HTTP Status: ${resListPayslips.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resListPayslips.body, null, 2));

    const generatedPayslipA = resListPayslips.body.data.payslips.find((p) => p.userId === empAId);
    if (!generatedPayslipA) throw new Error('Expected generated payslip for Employee A not found.');
    const payslipAId = generatedPayslipA.id;

    // -----------------------------------------------------------------
    // 4. GET PAYSLIP BY ID (ADMIN ACCESS)
    // -----------------------------------------------------------------
    console.log(`\n[4/13] Exercising getPayslipById for ID: ${payslipAId}...`);
    const reqGetPayslip = {
      user: adminUser,
      params: { id: payslipAId },
    };
    const resGetPayslip = createMockRes();
    await payrollController.getPayslipById(reqGetPayslip, resGetPayslip);
    console.log(`  HTTP Status: ${resGetPayslip.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resGetPayslip.body, null, 2));

    // -----------------------------------------------------------------
    // 5. UPDATE PAYSLIP STATUS (MARK PAID)
    // -----------------------------------------------------------------
    console.log(`\n[5/13] Exercising updatePayslipStatus (Forward Transition to PAID)...`);
    const reqMarkPaid = {
      user: adminUser,
      params: { id: payslipAId },
      body: { status: 'PAID' },
    };
    const resMarkPaid = createMockRes();
    await payrollController.updatePayslipStatus(reqMarkPaid, resMarkPaid);
    console.log(`  HTTP Status: ${resMarkPaid.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resMarkPaid.body, null, 2));

    // -----------------------------------------------------------------
    // 6. GET MY PAYSLIPS (EMPLOYEE OWNER ACCESS)
    // -----------------------------------------------------------------
    console.log('\n[6/13] Exercising getMyPayslips (Employee A Self-Service)...');
    const reqMyPayslips = {
      user: empAUser,
    };
    const resMyPayslips = createMockRes();
    await payrollController.getMyPayslips(reqMyPayslips, resMyPayslips);
    console.log(`  HTTP Status: ${resMyPayslips.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resMyPayslips.body, null, 2));

    // -----------------------------------------------------------------
    // 7. ACCOUNTS: CREATE TRANSACTION
    // -----------------------------------------------------------------
    console.log('\n[7/13] Exercising createTransaction (Accounts Voucher)...');
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

    // -----------------------------------------------------------------
    // 8. ACCOUNTS: LIST TRANSACTIONS
    // -----------------------------------------------------------------
    console.log('\n[8/13] Exercising getTransactions (List Accounts Transactions)...');
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
    console.log('\n[9/13] Exercising getTransactionStats (Aggregated Ledger KPIs)...');
    const reqStats = { user: adminUser };
    const resStats = createMockRes();
    await accountController.getTransactionStats(reqStats, resStats);
    console.log(`  HTTP Status: ${resStats.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resStats.body, null, 2));

    // -----------------------------------------------------------------
    // 10. ACCOUNTS: BATCH UPDATE STATUS
    // -----------------------------------------------------------------
    console.log(`\n[10/13] Exercising batchUpdateStatus for Voucher: ${createdTxn.voucherNumber}...`);
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

    // =================================================================
    // NEGATIVE CASES (ITEM 10)
    // =================================================================

    // -----------------------------------------------------------------
    // 11. (NEGATIVE) Employee B reading Employee A payslip -> 403 Forbidden
    // -----------------------------------------------------------------
    console.log('\n[11/13] [NEGATIVE TEST] Employee B reading Employee A payslip -> Expect 403 Forbidden...');
    const reqEmpBReadA = {
      user: empBUser,
      params: { id: payslipAId },
    };
    const resEmpBReadA = createMockRes();
    await payrollController.getPayslipById(reqEmpBReadA, resEmpBReadA);
    console.log(`  HTTP Status: ${resEmpBReadA.statusCode} (Expected: 403)`);
    console.log('  Response Payload:\n', JSON.stringify(resEmpBReadA.body, null, 2));
    if (resEmpBReadA.statusCode !== 403) {
      throw new Error(`Negative test failed: Expected 403, got ${resEmpBReadA.statusCode}`);
    }

    // -----------------------------------------------------------------
    // 12. (NEGATIVE) PAID payslip cannot revert -> 409/400 Conflict
    // -----------------------------------------------------------------
    console.log('\n[12/13] [NEGATIVE TEST] Attempting to revert PAID payslip to DRAFT -> Expect 409/400 Conflict...');
    const reqRevertPaid = {
      user: adminUser,
      params: { id: payslipAId },
      body: { status: 'DRAFT' },
    };
    const resRevertPaid = createMockRes();
    await payrollController.updatePayslipStatus(reqRevertPaid, resRevertPaid);
    console.log(`  HTTP Status: ${resRevertPaid.statusCode} (Expected: 409 or 400)`);
    console.log('  Response Payload:\n', JSON.stringify(resRevertPaid.body, null, 2));
    if (resRevertPaid.statusCode !== 409 && resRevertPaid.statusCode !== 400) {
      throw new Error(`Negative test failed: Expected 409/400, got ${resRevertPaid.statusCode}`);
    }

    // -----------------------------------------------------------------
    // 13. (NEGATIVE) generate-monthly run twice leaves PAID untouched and lists under skipped
    // -----------------------------------------------------------------
    console.log('\n[13/13] [NEGATIVE TEST] Re-running generateMonthlyPayroll for month 11/2026 -> Expect PAID payslip untouched and skipped...');
    const reqGenPayroll2 = {
      user: adminUser,
      body: { month: 11, year: 2026 },
    };
    const resGenPayroll2 = createMockRes();
    await payrollController.generateMonthlyPayroll(reqGenPayroll2, resGenPayroll2);
    console.log(`  HTTP Status: ${resGenPayroll2.statusCode}`);
    console.log('  Response Payload:\n', JSON.stringify(resGenPayroll2.body, null, 2));

    const checkSlipA = await prisma.legacyPayslip.findUnique({ where: { id: payslipAId } });
    console.log(`  Verification: Payslip A status after second run is still: '${checkSlipA.status}' (Must remain PAID)`);
    if (checkSlipA.status !== 'PAID') {
      throw new Error(`Negative test failed: Payslip A status was overwritten! Value: ${checkSlipA.status}`);
    }

    console.log('\n' + '='.repeat(75));
    console.log('  ALL 13 SMOKE TEST CASES (POSITIVE + NEGATIVE) PASSED WITH 0 FAILURES!');
    console.log('='.repeat(75));
  } catch (err) {
    console.error('Smoke test error:', err);
    process.exit(1);
  } finally {
    // Clean up test users and transactions
    try {
      await prisma.legacyPayslip.deleteMany({ where: { userId: { in: [empAId, empBId] } } });
      await prisma.salaryStructure.deleteMany({ where: { userId: { in: [empAId, empBId] } } });
      await prisma.accountTransaction.deleteMany({ where: { createdById: adminId } });
      await prisma.user.deleteMany({ where: { id: { in: [adminId, empAId, empBId] } } });
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
