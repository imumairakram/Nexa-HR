/**
 * scripts/verify-phase2a-index.js
 *
 * Verifies that all Phase 2a raw SQL constraints, indexes, triggers and extensions exist in PostgreSQL.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verify() {
  try {
    console.log('='.repeat(70));
    console.log('  NEXAHR - PHASE 2a CONSTRAINTS, INDEXES & TRIGGERS VERIFICATION');
    console.log('='.repeat(70));

    // 1. Check unique_active_regular_pay_run index
    const indexResult = await prisma.$queryRawUnsafe(`
      SELECT indexname, indexdef FROM pg_indexes
      WHERE tablename = 'pay_runs' AND indexname = 'unique_active_regular_pay_run';
    `);
    console.log(`[1] Index 'unique_active_regular_pay_run':`, indexResult.length === 1 ? '✅ PRESENT' : '❌ MISSING');
    if (indexResult.length > 0) {
      console.log(`    Definition: ${indexResult[0].indexdef}`);
    }

    // 2. Check chk_journal_line_debit_credit constraint
    const checkResult = await prisma.$queryRawUnsafe(`
      SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint
      WHERE conname = 'chk_journal_line_debit_credit';
    `);
    console.log(`[2] Constraint 'chk_journal_line_debit_credit':`, checkResult.length === 1 ? '✅ PRESENT' : '❌ MISSING');
    if (checkResult.length > 0) {
      console.log(`    Definition: ${checkResult[0].def}`);
    }

    // 3. Check exclude_overlapping_compensations constraint
    const excludeResult = await prisma.$queryRawUnsafe(`
      SELECT conname, pg_get_constraintdef(oid) as def FROM pg_constraint
      WHERE conname = 'exclude_overlapping_compensations';
    `);
    console.log(`[3] Constraint 'exclude_overlapping_compensations':`, excludeResult.length === 1 ? '✅ PRESENT' : '❌ MISSING');
    if (excludeResult.length > 0) {
      console.log(`    Definition: ${excludeResult[0].def}`);
    }

    // 4. Check UPDATE/DELETE immutability triggers
    const triggersResult = await prisma.$queryRawUnsafe(`
      SELECT DISTINCT trigger_name, event_object_table
      FROM information_schema.triggers
      WHERE trigger_name IN (
        'trg_immutable_journal_entries',
        'trg_immutable_journal_lines',
        'trg_immutable_payroll_audit_logs'
      );
    `);
    console.log(`[4] Immutability Triggers (UPDATE/DELETE): ${triggersResult.length}/3 present`);
    for (const trg of triggersResult) {
      console.log(`    ✅ ${trg.trigger_name} on ${trg.event_object_table}`);
    }

    // 5. Check TRUNCATE triggers (queried from pg_trigger because PostgreSQL TRUNCATE triggers are extension triggers)
    const truncateTriggersResult = await prisma.$queryRawUnsafe(`
      SELECT tgname as trigger_name, relname as event_object_table
      FROM pg_trigger
      JOIN pg_class ON pg_trigger.tgrelid = pg_class.oid
      WHERE tgname IN (
        'trg_prevent_truncate_journal_entries',
        'trg_prevent_truncate_journal_lines',
        'trg_prevent_truncate_payroll_audit_logs'
      );
    `);
    console.log(`[5] Statement-Level Truncate Triggers: ${truncateTriggersResult.length}/3 present`);
    for (const trg of truncateTriggersResult) {
      console.log(`    ✅ ${trg.trigger_name} on ${trg.event_object_table}`);
    }

    console.log('='.repeat(70));
    if (indexResult.length === 1 && checkResult.length === 1 && excludeResult.length === 1 && triggersResult.length === 3 && truncateTriggersResult.length === 3) {
      console.log('🎉 ALL PHASE 2a DATABASE OBJECTS VERIFIED SUCCESSFULLY!');
    } else {
      console.error('❌ Verification failed: Some database objects are missing!');
      process.exit(1);
    }
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verify();
