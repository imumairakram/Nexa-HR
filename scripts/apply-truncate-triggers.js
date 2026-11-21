/**
 * scripts/apply-truncate-triggers.js
 *
 * Adds BEFORE TRUNCATE statement-level triggers on append-only tables:
 * journal_entries, journal_lines, payroll_audit_logs.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const statements = [
  // 1. Create prevent_truncate function
  `CREATE OR REPLACE FUNCTION prevent_truncate()
   RETURNS TRIGGER AS $$
   BEGIN
     RAISE EXCEPTION 'Table % is strictly append-only. TRUNCATE operation is forbidden.', TG_TABLE_NAME;
   END;
   $$ LANGUAGE plpgsql;`,

  // 2. Attach TRUNCATE triggers
  `DROP TRIGGER IF EXISTS trg_prevent_truncate_journal_entries ON journal_entries;`,
  `CREATE TRIGGER trg_prevent_truncate_journal_entries
   BEFORE TRUNCATE ON journal_entries
   FOR EACH STATEMENT EXECUTE FUNCTION prevent_truncate();`,

  `DROP TRIGGER IF EXISTS trg_prevent_truncate_journal_lines ON journal_lines;`,
  `CREATE TRIGGER trg_prevent_truncate_journal_lines
   BEFORE TRUNCATE ON journal_lines
   FOR EACH STATEMENT EXECUTE FUNCTION prevent_truncate();`,

  `DROP TRIGGER IF EXISTS trg_prevent_truncate_payroll_audit_logs ON payroll_audit_logs;`,
  `CREATE TRIGGER trg_prevent_truncate_payroll_audit_logs
   BEFORE TRUNCATE ON payroll_audit_logs
   FOR EACH STATEMENT EXECUTE FUNCTION prevent_truncate();`,
];

async function applyTruncateTriggers() {
  try {
    console.log('Applying BEFORE TRUNCATE triggers...');
    for (const stmt of statements) {
      await prisma.$executeRawUnsafe(stmt);
    }
    console.log('✅ Successfully applied BEFORE TRUNCATE triggers on journal_entries, journal_lines, payroll_audit_logs');
  } catch (err) {
    console.error('Error applying truncate triggers:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

applyTruncateTriggers();
