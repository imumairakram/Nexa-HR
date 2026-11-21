/**
 * scripts/apply-phase2a-constraints.js
 *
 * Runs Phase 2a constraints, indexes, triggers, and extensions statement by statement.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const statements = [
  // 1. Install btree_gist extension for temporal exclusion constraints
  `CREATE EXTENSION IF NOT EXISTS btree_gist;`,

  // 2. Partial unique index on pay_runs: only one active regular run per period
  `CREATE UNIQUE INDEX IF NOT EXISTS unique_active_regular_pay_run
   ON pay_runs (pay_period_id)
   WHERE type = 'REGULAR' AND status NOT IN ('VOID', 'REVERSED');`,

  // 3. Check constraint on journal_lines: non-negative debits/credits & single-sided per line
  `ALTER TABLE journal_lines DROP CONSTRAINT IF EXISTS chk_journal_line_debit_credit;`,
  `ALTER TABLE journal_lines ADD CONSTRAINT chk_journal_line_debit_credit
   CHECK (debit >= 0 AND credit >= 0 AND (debit = 0 OR credit = 0));`,

  // 4. Append-only immutability trigger function
  `CREATE OR REPLACE FUNCTION prevent_modification_and_deletion()
   RETURNS TRIGGER AS $$
   BEGIN
     RAISE EXCEPTION 'Table % is strictly append-only. UPDATE and DELETE operations are forbidden.', TG_TABLE_NAME;
   END;
   $$ LANGUAGE plpgsql;`,

  // 5. Attach immutability triggers to journal_entries, journal_lines, payroll_audit_logs
  `DROP TRIGGER IF EXISTS trg_immutable_journal_entries ON journal_entries;`,
  `CREATE TRIGGER trg_immutable_journal_entries
   BEFORE UPDATE OR DELETE ON journal_entries
   FOR EACH ROW EXECUTE FUNCTION prevent_modification_and_deletion();`,

  `DROP TRIGGER IF EXISTS trg_immutable_journal_lines ON journal_lines;`,
  `CREATE TRIGGER trg_immutable_journal_lines
   BEFORE UPDATE OR DELETE ON journal_lines
   FOR EACH ROW EXECUTE FUNCTION prevent_modification_and_deletion();`,

  `DROP TRIGGER IF EXISTS trg_immutable_payroll_audit_logs ON payroll_audit_logs;`,
  `CREATE TRIGGER trg_immutable_payroll_audit_logs
   BEFORE UPDATE OR DELETE ON payroll_audit_logs
   FOR EACH ROW EXECUTE FUNCTION prevent_modification_and_deletion();`,

  // 6. Half-open date range EXCLUDE constraint to prevent overlapping employee compensation records
  `ALTER TABLE employee_compensations DROP CONSTRAINT IF EXISTS exclude_overlapping_compensations;`,
  `ALTER TABLE employee_compensations
   ADD CONSTRAINT exclude_overlapping_compensations
   EXCLUDE USING gist (
     user_id WITH =,
     tsrange(effective_from, COALESCE(effective_to, 'infinity'::timestamp), '[)') WITH &&
   );`
];

async function runConstraints() {
  try {
    console.log(`Applying ${statements.length} Phase 2a statements...`);
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      console.log(`[${i + 1}/${statements.length}] Executing...`);
      await prisma.$executeRawUnsafe(stmt);
    }
    console.log('✅ Successfully applied all constraints, indexes, and triggers!');
  } catch (err) {
    console.error('❌ Error applying constraints:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runConstraints();
