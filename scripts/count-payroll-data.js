const { PrismaClient } = require('@prisma/client');

require('dotenv').config();

const LIVE_URL = process.env.DIRECT_URL || process.env.DATABASE_URL;
const SCRATCH_URL = process.env.TEST_DATABASE_URL;

if (!LIVE_URL) {
  console.error('[CONFIG ERROR] DIRECT_URL or DATABASE_URL must be set in .env');
  process.exit(1);
}
if (!SCRATCH_URL) {
  console.error('[CONFIG ERROR] TEST_DATABASE_URL must be set to run scratch checks');
  process.exit(1);
}

async function getCounts(url, label) {
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    const [je, jl, pal, pv2, ec, lp] = await Promise.all([
      prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM journal_entries').catch(e => [{ count: 'N/A' }]),
      prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM journal_lines').catch(e => [{ count: 'N/A' }]),
      prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM payroll_audit_logs').catch(e => [{ count: 'N/A' }]),
      prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM payslips_v2').catch(e => [{ count: 'N/A' }]),
      prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM employee_compensations').catch(e => [{ count: 'N/A' }]),
      prisma.$queryRawUnsafe('SELECT COUNT(*)::int as count FROM payslips').catch(e => [{ count: 'N/A' }]),
    ]);

    console.log(`\n=== Table Row Counts: ${label} ===`);
    console.log(`  - journal_entries:       ${je[0].count}`);
    console.log(`  - journal_lines:         ${jl[0].count}`);
    console.log(`  - payroll_audit_logs:    ${pal[0].count}`);
    console.log(`  - payslips_v2:           ${pv2[0].count}`);
    console.log(`  - employee_compensations:${ec[0].count}`);
    console.log(`  - payslips (legacy):     ${lp[0].count}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await getCounts(LIVE_URL, 'LIVE Database (postgres)');
  await getCounts(SCRATCH_URL, 'SCRATCH Database (nexahr_scratch)');
}

main().catch(console.error);
