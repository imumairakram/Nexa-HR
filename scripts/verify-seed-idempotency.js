require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const scratchUrl = process.env.TEST_DATABASE_URL;

if (!scratchUrl) {
  console.error('[CONFIG ERROR] TEST_DATABASE_URL must be configured in environment or .env');
  process.exit(1);
}

// Safety Guard: ensure target is strictly a scratch/test database
if (!scratchUrl.includes('scratch') && !scratchUrl.includes('test') && !scratchUrl.includes('localhost')) {
  console.error('[SAFETY ERROR] Refusing to run seed idempotency verification against non-scratch/non-test database:', scratchUrl);
  process.exit(1);
}

const prisma = new PrismaClient({ datasources: { db: { url: scratchUrl } } });

async function verifySeedIdempotency() {
  const childEnv = { ...process.env, DATABASE_URL: scratchUrl, DIRECT_URL: scratchUrl };

  console.log('--- Executing Run 1 of seed-payroll-catalogs.js ---');
  execSync('node scripts/seed-payroll-catalogs.js', { stdio: 'inherit', env: childEnv });

  const counts1 = {
    legalEntities: await prisma.legalEntity.count(),
    payGroups: await prisma.payGroup.count(),
    payComponents: await prisma.payComponent.count(),
    ledgerAccounts: await prisma.ledgerAccount.count(),
    taxRuleSets: await prisma.taxRuleSet.count(),
    taxSlabs: await prisma.taxSlab.count(),
    contributionRules: await prisma.contributionRule.count(),
  };
  console.log('\nRow Counts after Run 1:\n', JSON.stringify(counts1, null, 2));

  console.log('\n--- Executing Run 2 of seed-payroll-catalogs.js ---');
  execSync('node scripts/seed-payroll-catalogs.js', { stdio: 'inherit', env: childEnv });

  const counts2 = {
    legalEntities: await prisma.legalEntity.count(),
    payGroups: await prisma.payGroup.count(),
    payComponents: await prisma.payComponent.count(),
    ledgerAccounts: await prisma.ledgerAccount.count(),
    taxRuleSets: await prisma.taxRuleSet.count(),
    taxSlabs: await prisma.taxSlab.count(),
    contributionRules: await prisma.contributionRule.count(),
  };
  console.log('\nRow Counts after Run 2:\n', JSON.stringify(counts2, null, 2));

  const identical = JSON.stringify(counts1) === JSON.stringify(counts2);
  console.log('\nIdempotency Check:', identical ? 'SUCCESS (Exact Match, 0 Drift)' : 'FAILED (Count Mismatch)');
  await prisma.$disconnect();
  if (!identical) process.exit(1);
}

verifySeedIdempotency().catch((err) => {
  console.error(err);
  process.exit(1);
});
