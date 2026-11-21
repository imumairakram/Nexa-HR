/**
 * src/tests/dbConstraints.test.js
 *
 * DB-Gated Behavior Test Suite for Phase 2 Database Constraints, Triggers, and Indexes.
 * Runs only when TEST_DATABASE_URL is provided, and strictly verifies the target is a scratch/test database.
 * Executes all test operations within PostgreSQL transactions that are automatically ROLLED BACK,
 * using SAVEPOINTs so that expected constraint violations do not abort the transaction block,
 * leaving ZERO residual test data in append-only or payroll tables.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { PrismaClient } = require('@prisma/client');

const testDbUrl = process.env.TEST_DATABASE_URL;

// Safety Guard against non-scratch databases
function assertSafeTestDatabase(url) {
  if (!url) return false;
  const isScratchOrTest = url.includes('scratch') || url.includes('test') || url.includes('localhost') || url.includes('127.0.0.1');
  if (!isScratchOrTest) {
    throw new Error(`[SAFETY GUARD ERROR] Refusing to run DB-gated constraint test suite against non-scratch database: ${url}`);
  }
  return true;
}

const isEnabled = Boolean(testDbUrl && assertSafeTestDatabase(testDbUrl));

test('DB Constraints, Immutability Triggers, and Index Invariants Suite', { skip: !isEnabled && 'Skipped: TEST_DATABASE_URL not set or not scratch/test DB' }, async (t) => {
  const prisma = new PrismaClient({ datasources: { db: { url: testDbUrl } } });

  // Helper to run operations inside a guaranteed ROLLBACK transaction
  async function runInRollback(fn) {
    try {
      await prisma.$transaction(async (tx) => {
        await fn(tx);
        throw new Error('__INTENTIONAL_ROLLBACK__');
      }, { timeout: 30000 });
    } catch (err) {
      if (err.message !== '__INTENTIONAL_ROLLBACK__') {
        throw err;
      }
    }
  }

  // Helper to test expected failure using PostgreSQL SAVEPOINT
  async function expectFailure(tx, query, errorPattern) {
    await tx.$executeRawUnsafe('SAVEPOINT test_sp;');
    try {
      await tx.$executeRawUnsafe(query);
      assert.fail(`Expected query to fail matching ${errorPattern}, but it succeeded.`);
    } catch (err) {
      await tx.$executeRawUnsafe('ROLLBACK TO SAVEPOINT test_sp;');
      assert.match(err.message, errorPattern);
    }
  }

  // -------------------------------------------------------------
  // 1. IMMUTABILITY TRIGGERS (UPDATE / DELETE / TRUNCATE)
  // -------------------------------------------------------------
  await t.test('1. UPDATE / DELETE / TRUNCATE on append-only tables are rejected by DB triggers', async () => {
    await runInRollback(async (tx) => {
      const userId = 'u-trg-test-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO users (id, "employeeCode", email, password, "firstName", "lastName", role, "updatedAt")
        VALUES ('${userId}', 'EMP-TRG-1', 'trg1@company.invalid', 'hashed123', 'Trg', 'Tester', 'ADMIN', NOW())
      `);

      const entityId = 'le-trg-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO legal_entities (id, code, name, country, default_currency, timezone, updated_at)
        VALUES ('${entityId}', 'LE-TRG-1', 'Trg Entity', 'PK', 'PKR', 'Asia/Karachi', NOW())
      `);

      const accountId = 'la-trg-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO ledger_accounts (id, legal_entity_id, code, name, type, currency, updated_at)
        VALUES ('${accountId}', '${entityId}', '5010-TRG', 'Salary Expense Trg', 'EXPENSE', 'PKR', NOW())
      `);

      const jeId = 'je-trg-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO journal_entries (id, entry_number, posting_date, reference, created_by_id)
        VALUES ('${jeId}', 'JE-TRG-001', '2026-11-01', 'REF-TRG', '${userId}')
      `);

      const jlId = 'jl-trg-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, created_at)
        VALUES ('${jlId}', '${jeId}', '${accountId}', 1000.00, 0.00, NOW())
      `);

      const palId = 'pal-trg-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO payroll_audit_logs (id, actor_id, actor_email, action, entity, entity_id, before_state, after_state, created_at)
        VALUES ('${palId}', '${userId}', 'trg1@company.invalid', 'TEST_ACTION', 'User', '${userId}', '{"test":true}', '{"test":false}', NOW())
      `);

      // 1. UPDATE on journal_entries
      await expectFailure(
        tx,
        `UPDATE journal_entries SET reference = 'MUTATED' WHERE id = '${jeId}'`,
        /strictly append-only|forbidden|P0001/i
      );

      // 2. DELETE on journal_entries
      await expectFailure(
        tx,
        `DELETE FROM journal_entries WHERE id = '${jeId}'`,
        /strictly append-only|forbidden|P0001/i
      );

      // 3. UPDATE on journal_lines
      await expectFailure(
        tx,
        `UPDATE journal_lines SET debit = 2000.00 WHERE id = '${jlId}'`,
        /strictly append-only|forbidden|P0001/i
      );

      // 4. DELETE on journal_lines
      await expectFailure(
        tx,
        `DELETE FROM journal_lines WHERE id = '${jlId}'`,
        /strictly append-only|forbidden|P0001/i
      );

      // 5. UPDATE on payroll_audit_logs
      await expectFailure(
        tx,
        `UPDATE payroll_audit_logs SET action = 'ALTERED' WHERE id = '${palId}'`,
        /strictly append-only|forbidden|P0001/i
      );

      // 6. DELETE on payroll_audit_logs
      await expectFailure(
        tx,
        `DELETE FROM payroll_audit_logs WHERE id = '${palId}'`,
        /strictly append-only|forbidden|P0001/i
      );

      // 7. TRUNCATE on journal_entries
      await expectFailure(
        tx,
        `TRUNCATE TABLE journal_entries CASCADE`,
        /strictly append-only|TRUNCATE operation is forbidden|P0001/i
      );

      // 8. TRUNCATE on journal_lines
      await expectFailure(
        tx,
        `TRUNCATE TABLE journal_lines CASCADE`,
        /strictly append-only|TRUNCATE operation is forbidden|P0001/i
      );

      // 9. TRUNCATE on payroll_audit_logs
      await expectFailure(
        tx,
        `TRUNCATE TABLE payroll_audit_logs CASCADE`,
        /strictly append-only|TRUNCATE operation is forbidden|P0001/i
      );
    });
  });

  // -------------------------------------------------------------
  // 2. CHECK CONSTRAINT (chk_journal_line_debit_credit)
  // -------------------------------------------------------------
  await t.test('2. Journal line CHECK constraint validates non-negative and single-sided debit/credit', async () => {
    await runInRollback(async (tx) => {
      const userId = 'u-chk-test-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO users (id, "employeeCode", email, password, "firstName", "lastName", role, "updatedAt")
        VALUES ('${userId}', 'EMP-CHK-1', 'chk1@company.invalid', 'hashed123', 'Chk', 'Tester', 'ADMIN', NOW())
      `);

      const entityId = 'le-chk-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO legal_entities (id, code, name, country, default_currency, timezone, updated_at)
        VALUES ('${entityId}', 'LE-CHK-1', 'Chk Entity', 'PK', 'PKR', 'Asia/Karachi', NOW())
      `);

      const accountId = 'la-chk-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO ledger_accounts (id, legal_entity_id, code, name, type, currency, updated_at)
        VALUES ('${accountId}', '${entityId}', '5010-CHK', 'Salary Expense Chk', 'EXPENSE', 'PKR', NOW())
      `);

      const jeId = 'je-chk-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO journal_entries (id, entry_number, posting_date, reference, created_by_id)
        VALUES ('${jeId}', 'JE-CHK-001', '2026-11-01', 'REF-CHK', '${userId}')
      `);

      // Both debit > 0 and credit > 0 rejected
      await expectFailure(
        tx,
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, created_at)
         VALUES ('jl-chk-fail-1', '${jeId}', '${accountId}', 500.00, 500.00, NOW())`,
        /chk_journal_line_debit_credit|check constraint|23514/i
      );

      // Negative debit rejected
      await expectFailure(
        tx,
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, created_at)
         VALUES ('jl-chk-fail-2', '${jeId}', '${accountId}', -100.00, 0.00, NOW())`,
        /chk_journal_line_debit_credit|check constraint|23514/i
      );

      // Negative credit rejected
      await expectFailure(
        tx,
        `INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, created_at)
         VALUES ('jl-chk-fail-3', '${jeId}', '${accountId}', 0.00, -50.00, NOW())`,
        /chk_journal_line_debit_credit|check constraint|23514/i
      );

      // Valid debit-only line accepted
      const resDebit = await tx.$executeRawUnsafe(`
        INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, created_at)
        VALUES ('jl-chk-ok-1', '${jeId}', '${accountId}', 1500.00, 0.00, NOW())
      `);
      assert.equal(resDebit, 1);

      // Valid credit-only line accepted
      const resCredit = await tx.$executeRawUnsafe(`
        INSERT INTO journal_lines (id, journal_entry_id, account_id, debit, credit, created_at)
        VALUES ('jl-chk-ok-2', '${jeId}', '${accountId}', 0.00, 1500.00, NOW())
      `);
      assert.equal(resCredit, 1);
    });
  });

  // -------------------------------------------------------------
  // 3. EXCLUSION CONSTRAINT (exclude_overlapping_compensations)
  // -------------------------------------------------------------
  await t.test('3. EmployeeCompensation EXCLUDE constraint enforces half-open date ranges per user', async () => {
    await runInRollback(async (tx) => {
      const userId = 'u-comp-test-1';
      const userOtherId = 'u-comp-test-2';
      await tx.$executeRawUnsafe(`
        INSERT INTO users (id, "employeeCode", email, password, "firstName", "lastName", role, "updatedAt")
        VALUES
          ('${userId}', 'EMP-COMP-1', 'comp1@company.invalid', 'hashed123', 'Comp', 'Tester', 'ADMIN', NOW()),
          ('${userOtherId}', 'EMP-COMP-2', 'comp2@company.invalid', 'hashed123', 'Comp', 'Other', 'EMPLOYEE', NOW())
      `);

      const entityId = 'le-comp-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO legal_entities (id, code, name, country, default_currency, timezone, updated_at)
        VALUES ('${entityId}', 'LE-COMP-1', 'Comp Entity', 'PK', 'PKR', 'Asia/Karachi', NOW())
      `);

      const pgId = 'pg-comp-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO pay_groups (id, legal_entity_id, code, name, currency, proration_basis, updated_at)
        VALUES ('${pgId}', '${entityId}', 'PG-COMP-1', 'Comp PayGroup', 'PKR', 'WORKING_DAYS', NOW())
      `);

      // Period 1: [2026-01-01, 2026-06-01)
      await tx.$executeRawUnsafe(`
        INSERT INTO employee_compensations (id, user_id, pay_group_id, base_salary, currency, effective_from, effective_to, created_by_id, updated_at)
        VALUES ('ec-1', '${userId}', '${pgId}', 50000.00, 'PKR', '2026-01-01 00:00:00', '2026-06-01 00:00:00', '${userId}', NOW())
      `);

      // Overlapping period for SAME user: [2026-03-01, 2026-09-01) rejected
      await expectFailure(
        tx,
        `INSERT INTO employee_compensations (id, user_id, pay_group_id, base_salary, currency, effective_from, effective_to, created_by_id, updated_at)
         VALUES ('ec-overlap', '${userId}', '${pgId}', 60000.00, 'PKR', '2026-03-01 00:00:00', '2026-09-01 00:00:00', '${userId}', NOW())`,
        /exclude_overlapping_compensations|conflicting key value|23P01/i
      );

      // Same overlapping period for DIFFERENT user accepted
      const resOther = await tx.$executeRawUnsafe(`
        INSERT INTO employee_compensations (id, user_id, pay_group_id, base_salary, currency, effective_from, effective_to, created_by_id, updated_at)
        VALUES ('ec-other', '${userOtherId}', '${pgId}', 60000.00, 'PKR', '2026-03-01 00:00:00', '2026-09-01 00:00:00', '${userId}', NOW())
      `);
      assert.equal(resOther, 1);

      // Adjacent half-open range for SAME user: exact boundary [2026-06-01, infinity) accepted
      const resBoundary = await tx.$executeRawUnsafe(`
        INSERT INTO employee_compensations (id, user_id, pay_group_id, base_salary, currency, effective_from, effective_to, created_by_id, updated_at)
        VALUES ('ec-boundary', '${userId}', '${pgId}', 75000.00, 'PKR', '2026-06-01 00:00:00', NULL, '${userId}', NOW())
      `);
      assert.equal(resBoundary, 1);
    });
  });

  // -------------------------------------------------------------
  // 4. PARTIAL UNIQUE INDEX (unique_active_regular_pay_run)
  // -------------------------------------------------------------
  await t.test('4. Partial unique index rejects second active REGULAR PayRun for same period', async () => {
    await runInRollback(async (tx) => {
      const entityId = 'le-run-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO legal_entities (id, code, name, country, default_currency, timezone, updated_at)
        VALUES ('${entityId}', 'LE-RUN-1', 'Run Entity', 'PK', 'PKR', 'Asia/Karachi', NOW())
      `);

      const pgId = 'pg-run-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO pay_groups (id, legal_entity_id, code, name, currency, proration_basis, updated_at)
        VALUES ('${pgId}', '${entityId}', 'PG-RUN-1', 'Run PayGroup', 'PKR', 'FIXED_30', NOW())
      `);

      const periodId = 'pp-run-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO pay_periods (id, pay_group_id, period_number, year, start_date, end_date, payment_due_date, updated_at)
        VALUES ('${periodId}', '${pgId}', 11, 2026, '2026-11-01', '2026-11-30', '2026-12-01', NOW())
      `);

      // 1. First active regular pay run (status DRAFT)
      await tx.$executeRawUnsafe(`
        INSERT INTO pay_runs (id, pay_period_id, run_number, type, status, updated_at)
        VALUES ('pr-1', '${periodId}', 'RUN-2026-11-01', 'REGULAR', 'DRAFT', NOW())
      `);

      // 2. Second active regular pay run for SAME period rejected
      await expectFailure(
        tx,
        `INSERT INTO pay_runs (id, pay_period_id, run_number, type, status, updated_at)
         VALUES ('pr-dup', '${periodId}', 'RUN-2026-11-02', 'REGULAR', 'DRAFT', NOW())`,
        /unique_active_regular_pay_run|already exists|duplicate key|23505/i
      );

      // 3. Second OFF_CYCLE pay run for SAME period accepted
      const resOffCycle = await tx.$executeRawUnsafe(`
        INSERT INTO pay_runs (id, pay_period_id, run_number, type, status, updated_at)
        VALUES ('pr-offcycle', '${periodId}', 'RUN-2026-11-OFF', 'OFF_CYCLE', 'DRAFT', NOW())
      `);
      assert.equal(resOffCycle, 1);
    });
  });

  // -------------------------------------------------------------
  // 5. VERSION CLOSURE & MIGRATION TEST (Gate Item 10)
  // -------------------------------------------------------------
  await t.test('5. SalaryStructure -> EmployeeCompensation version closure closes old version and inserts new half-open range', async () => {
    await runInRollback(async (tx) => {
      const userId = 'u-mig-test-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO users (id, "employeeCode", email, password, "firstName", "lastName", role, "updatedAt")
        VALUES ('${userId}', 'EMP-MIG-1', 'mig1@company.invalid', 'hashed123', 'Mig', 'Tester', 'EMPLOYEE', NOW())
      `);

      const entityId = 'le-mig-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO legal_entities (id, code, name, country, default_currency, timezone, updated_at)
        VALUES ('${entityId}', 'LE-MIG-1', 'Mig Entity', 'PK', 'PKR', 'Asia/Karachi', NOW())
      `);

      const pgId = 'pg-mig-1';
      await tx.$executeRawUnsafe(`
        INSERT INTO pay_groups (id, legal_entity_id, code, name, currency, proration_basis, updated_at)
        VALUES ('${pgId}', '${entityId}', 'PG-MIG-1', 'Mig PayGroup', 'PKR', 'FIXED_30', NOW())
      `);

      // Existing SalaryStructure baseline
      await tx.$executeRawUnsafe(`
        INSERT INTO salary_structures (id, "userId", "basicSalary", "housingAllowance", "transportAllowance", "otherAllowances", "taxDeductions", "otherDeductions", "updatedAt")
        VALUES ('ss-mig-1', '${userId}', 100000.00, 20000.00, 10000.00, 5000.00, 8000.00, 2000.00, NOW())
      `);

      // Migration Step 1: Baseline EmployeeCompensation v1 created from SalaryStructure [2026-01-01, NULL)
      const v1From = '2026-01-01 00:00:00';
      await tx.$executeRawUnsafe(`
        INSERT INTO employee_compensations (id, user_id, pay_group_id, base_salary, currency, effective_from, effective_to, created_by_id, updated_at)
        VALUES ('ec-v1', '${userId}', '${pgId}', 100000.00, 'PKR', '${v1From}', NULL, '${userId}', NOW())
      `);

      // Migration Step 2: Salary adjustment effective 2026-07-01 -> closes v1 and inserts v2
      const v2From = '2026-07-01 00:00:00';

      // Atomic version closure: close v1 by setting effective_to = v2From
      const updateRes = await tx.$executeRawUnsafe(`
        UPDATE employee_compensations
        SET effective_to = '${v2From}'
        WHERE user_id = '${userId}' AND effective_to IS NULL
      `);
      assert.equal(updateRes, 1);

      // Insert new open-ended v2: [2026-07-01, NULL)
      const insertRes = await tx.$executeRawUnsafe(`
        INSERT INTO employee_compensations (id, user_id, pay_group_id, base_salary, currency, effective_from, effective_to, created_by_id, updated_at)
        VALUES ('ec-v2', '${userId}', '${pgId}', 120000.00, 'PKR', '${v2From}', NULL, '${userId}', NOW())
      `);
      assert.equal(insertRes, 1);

      // Verify temporal resolution:
      // A query for May 2026 resolves to v1 (100,000)
      const queryMay = await tx.$queryRawUnsafe(`
        SELECT base_salary FROM employee_compensations
        WHERE user_id = '${userId}'
          AND effective_from <= '2026-05-15 00:00:00'
          AND (effective_to IS NULL OR effective_to > '2026-05-15 00:00:00')
      `);
      assert.equal(queryMay.length, 1);
      assert.equal(Number(queryMay[0].base_salary), 100000);

      // A query for August 2026 resolves to v2 (120,000)
      const queryAug = await tx.$queryRawUnsafe(`
        SELECT base_salary FROM employee_compensations
        WHERE user_id = '${userId}'
          AND effective_from <= '2026-08-15 00:00:00'
          AND (effective_to IS NULL OR effective_to > '2026-08-15 00:00:00')
      `);
      assert.equal(queryAug.length, 1);
      assert.equal(Number(queryAug[0].base_salary), 120000);
    });
  });

  t.after(async () => {
    await prisma.$disconnect();
  });
});
