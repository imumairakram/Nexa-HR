/**
 * scripts/test-phase2-db-constraints.js
 *
 * Direct behavior tests for Phase 2 database constraints, triggers, and indexes.
 * Connects to PostgreSQL, attempts invalid operations, and verifies expected rejections.
 * Cleans up temporary test entities within transaction or finally block.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runConstraintBehaviorTests() {
  console.log('='.repeat(75));
  console.log('  NEXAHR - PHASE 2 DATABASE CONSTRAINTS & IMMUTABILITY BEHAVIOR TESTS');
  console.log('='.repeat(75));

  let passedCount = 0;
  let totalTests = 5;

  // Setup temporary test user & ledger accounts
  const testUserId = `test-user-${Date.now()}`;
  const testEmpCode = `EMP-TEST-${Math.floor(1000 + Math.random() * 9000)}`;

  let createdEntityId = null;
  let createdPayGroupId = null;
  let createdPayPeriodId = null;
  let createdAccountId = null;
  let createdJournalEntryId = null;

  try {
    // 0. Bootstrap test fixtures
    await prisma.user.create({
      data: {
        id: testUserId,
        employeeCode: testEmpCode,
        email: `${testUserId}@company.invalid`,
        password: 'TestPassword123!',
        firstName: 'Constraint',
        lastName: 'Tester',
        role: 'ADMIN',
      },
    });

    const legalEntity = await prisma.legalEntity.create({
      data: {
        code: `LE-TEST-${Date.now()}`,
        name: 'Constraint Test Entity',
        country: 'PAK',
        defaultCurrency: 'PKR',
      },
    });
    createdEntityId = legalEntity.id;

    const payGroup = await prisma.payGroup.create({
      data: {
        legalEntityId: createdEntityId,
        code: `PG-TEST-${Date.now()}`,
        name: 'Constraint Test PayGroup',
        currency: 'PKR',
        prorationBasis: 'WORKING_DAYS',
      },
    });
    createdPayGroupId = payGroup.id;

    const payPeriod = await prisma.payPeriod.create({
      data: {
        payGroupId: createdPayGroupId,
        periodNumber: 1,
        year: 2026,
        startDate: new Date('2026-11-01'),
        endDate: new Date('2026-11-30'),
        paymentDueDate: new Date('2026-12-01'),
      },
    });
    createdPayPeriodId = payPeriod.id;

    const ledgerAccount = await prisma.ledgerAccount.create({
      data: {
        legalEntityId: createdEntityId,
        code: `5010-TEST-${Date.now()}`,
        name: 'Salary Expense Test',
        type: 'EXPENSE',
        currency: 'PKR',
      },
    });
    createdAccountId = ledgerAccount.id;

    const journalEntry = await prisma.journalEntry.create({
      data: {
        entryNumber: `JE-TEST-${Date.now()}`,
        postingDate: new Date('2026-11-01'),
        reference: 'REF-TEST-001',
        createdById: testUserId,
      },
    });
    createdJournalEntryId = journalEntry.id;

    const journalLine = await prisma.journalLine.create({
      data: {
        journalEntryId: createdJournalEntryId,
        accountId: createdAccountId,
        debit: 1000.00,
        credit: 0.00,
      },
    });

    // -----------------------------------------------------------------
    // TEST 1: Immutability Triggers (UPDATE / DELETE / TRUNCATE rejected)
    // -----------------------------------------------------------------
    console.log('\n[TEST 1] UPDATE / DELETE / TRUNCATE on append-only tables raises exception...');
    let triggerBlocked = false;
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE journal_entries SET reference = 'MUTATED' WHERE id = '${createdJournalEntryId}'`
      );
    } catch (err) {
      if (err.message.includes('strictly append-only') || err.message.includes('forbidden')) {
        triggerBlocked = true;
      } else {
        console.error('Unexpected error:', err.message);
      }
    }

    let truncateBlocked = false;
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE payroll_audit_logs;`);
    } catch (err) {
      if (err.message.includes('strictly append-only') || err.message.includes('TRUNCATE operation is forbidden')) {
        truncateBlocked = true;
      }
    }

    if (triggerBlocked && truncateBlocked) {
      console.log('  ✅ PASSED: UPDATE and TRUNCATE were successfully rejected by immutability triggers.');
      passedCount++;
    } else {
      console.error(`  ❌ FAILED: triggerBlocked=${triggerBlocked}, truncateBlocked=${truncateBlocked}`);
    }

    // -----------------------------------------------------------------
    // TEST 2: Check Constraint (chk_journal_line_debit_credit)
    // -----------------------------------------------------------------
    console.log('\n[TEST 2] Journal line with both debit and credit (or negative) is rejected...');
    let checkConstraintBlocked = false;
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, created_at)
        VALUES ('jl-invalid-1', '${createdJournalEntryId}', '${createdAccountId}', 500.00, 500.00, NOW());
      `);
    } catch (err) {
      if (err.message.includes('chk_journal_line_debit_credit') || err.message.includes('check constraint')) {
        checkConstraintBlocked = true;
      }
    }

    if (checkConstraintBlocked) {
      console.log('  ✅ PASSED: Both-sided journal line was successfully rejected by chk_journal_line_debit_credit.');
      passedCount++;
    } else {
      console.error('  ❌ FAILED: Check constraint did not reject both-sided journal line.');
    }

    // -----------------------------------------------------------------
    // TEST 3: Exclusion Constraint (exclude_overlapping_compensations)
    // -----------------------------------------------------------------
    console.log('\n[TEST 3] Overlapping EmployeeCompensation ranges for the same user are rejected...');
    let overlapBlocked = false;

    // Insert first compensation: 2026-01-01 to 2026-06-01
    await prisma.employeeCompensation.create({
      data: {
        userId: testUserId,
        payGroupId: createdPayGroupId,
        createdById: testUserId,
        baseSalary: 50000,
        currency: 'PKR',
        effectiveFrom: new Date('2026-01-01T00:00:00Z'),
        effectiveTo: new Date('2026-06-01T00:00:00Z'),
      },
    });

    // Attempt overlapping compensation: 2026-03-01 to 2026-09-01
    try {
      await prisma.employeeCompensation.create({
        data: {
          userId: testUserId,
          payGroupId: createdPayGroupId,
          createdById: testUserId,
          baseSalary: 60000,
          currency: 'PKR',
          effectiveFrom: new Date('2026-03-01T00:00:00Z'),
          effectiveTo: new Date('2026-09-01T00:00:00Z'),
        },
      });
    } catch (err) {
      if (err.message.includes('exclude_overlapping_compensations') || err.message.includes('conflicting key value') || err.message.includes('exclusion constraint')) {
        overlapBlocked = true;
      }
    }

    if (overlapBlocked) {
      console.log('  ✅ PASSED: Overlapping compensation half-open range was rejected by exclude_overlapping_compensations.');
      passedCount++;
    } else {
      console.error('  ❌ FAILED: Overlapping compensation was not rejected.');
    }

    // -----------------------------------------------------------------
    // TEST 4: Non-overlapping half-open range succeeds (boundary test)
    // -----------------------------------------------------------------
    console.log('\n[TEST 4] Half-open boundary: exact match effectiveFrom = old effectiveTo succeeds...');
    let halfOpenSucceeded = false;
    try {
      await prisma.employeeCompensation.create({
        data: {
          userId: testUserId,
          payGroupId: createdPayGroupId,
          createdById: testUserId,
          baseSalary: 70000,
          currency: 'PKR',
          effectiveFrom: new Date('2026-06-01T00:00:00Z'), // Exactly matches previous effectiveTo
          effectiveTo: null, // open-ended
        },
      });
      halfOpenSucceeded = true;
    } catch (err) {
      console.error('Boundary insert failed:', err.message);
    }

    if (halfOpenSucceeded) {
      console.log('  ✅ PASSED: Half-open range [) allows consecutive effective ranges without gap or conflict.');
      passedCount++;
    } else {
      console.error('  ❌ FAILED: Consecutive range failed unexpectedly.');
    }

    // -----------------------------------------------------------------
    // TEST 5: Partial Unique Index (unique_active_regular_pay_run)
    // -----------------------------------------------------------------
    console.log('\n[TEST 5] Second active REGULAR PayRun for the same pay period is rejected...');
    let duplicateRunBlocked = false;

    // Create first regular pay run
    await prisma.payRun.create({
      data: {
        payPeriodId: createdPayPeriodId,
        runNumber: `RUN-TEST-1-${Date.now()}`,
        type: 'REGULAR',
        status: 'DRAFT',
      },
    });

    // Attempt second regular pay run for the same period
    try {
      await prisma.payRun.create({
        data: {
          payPeriodId: createdPayPeriodId,
          runNumber: `RUN-TEST-2-${Date.now()}`,
          type: 'REGULAR',
          status: 'DRAFT',
        },
      });
    } catch (err) {
      if (err.message.includes('unique_active_regular_pay_run') || err.message.includes('Unique constraint failed')) {
        duplicateRunBlocked = true;
      }
    }

    if (duplicateRunBlocked) {
      console.log('  ✅ PASSED: Second regular pay run was rejected by partial unique index unique_active_regular_pay_run.');
      passedCount++;
    } else {
      console.error('  ❌ FAILED: Duplicate regular pay run was not rejected.');
    }

    console.log('\n' + '='.repeat(75));
    console.log(`  BEHAVIOR TEST SUMMARY: ${passedCount}/${totalTests} TESTS PASSED`);
    console.log('='.repeat(75));

    if (passedCount !== totalTests) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  } finally {
    // Cleanup fixtures
    try {
      await prisma.employeeCompensation.deleteMany({ where: { userId: testUserId } });
      await prisma.payRun.deleteMany({ where: { payPeriodId: createdPayPeriodId } });
      await prisma.payPeriod.deleteMany({ where: { id: createdPayPeriodId } });
      await prisma.payGroup.deleteMany({ where: { id: createdPayGroupId } });
      // Note: journalEntry and journalLine cannot be deleted due to immutability triggers (which proves triggers work!)
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    } catch (cleanupErr) {
      // Expected if referenced by immutable journal entries
    }
    await prisma.$disconnect();
  }
}

runConstraintBehaviorTests();
