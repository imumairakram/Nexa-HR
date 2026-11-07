/**
 * scripts/db-reset.js
 *
 * Safe Database Reset / Truncation Utility for NexaHR.
 *
 * STRICT SAFETY REQUIREMENTS:
 * - Touch ONLY the `public` schema. Never touch `_prisma_migrations`, Supabase-internal schemas
 *   (auth, storage, extensions), or migration files.
 * - Prefer `DIRECT_URL` (direct connection, not pooler) if configured, else fallback to `DATABASE_URL`.
 * - Defaults to `--dry-run`: Prints each table, row counts, and what would be truncated without changing anything.
 * - Real wipe requires ALL 4 of the following guards:
 *   1. Environment variable ALLOW_DB_WIPE=true
 *   2. CLI flag --confirm=<database-name> matching target database
 *   3. Completed backup folder with valid manifest.json created within the last 30 minutes
 *   4. Explicit typed confirmation matching 'WIPE <database-name>'
 * - In ONE transaction: TRUNCATE TABLE <all public tables except _prisma_migrations> RESTART IDENTITY CASCADE.
 * - Verifies every table has 0 rows afterwards; automatically rolls back on any failure.
 *
 * Usage:
 *   node scripts/db-reset.js                  # Dry-run by default
 *   node scripts/db-reset.js --dry-run        # Explicit dry-run
 *   node scripts/db-reset.js --execute --confirm=<db-name>
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { PrismaClient } = require('@prisma/client');

function parseDbTarget(dbUrl) {
  if (!dbUrl) return { host: 'unknown', maskedHost: '****', database: 'unknown' };
  try {
    const parsed = new URL(dbUrl);
    const host = parsed.hostname;
    const database = (parsed.pathname || '').replace(/^\//, '') || 'postgres';
    const maskedHost = host.length > 8 ? `${host.slice(0, 3)}****${host.slice(-4)}` : '****';
    return { host, maskedHost, database };
  } catch (e) {
    return { host: 'unknown', maskedHost: '****', database: 'unknown' };
  }
}

function findRecentBackup(backupsDir = path.join(process.cwd(), 'backups'), maxAgeMinutes = 30) {
  if (!fs.existsSync(backupsDir)) {
    return { valid: false, reason: `Backups folder does not exist at '${backupsDir}'` };
  }

  const entries = fs.readdirSync(backupsDir, { withFileTypes: true });
  const subdirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);

  if (subdirs.length === 0) {
    return { valid: false, reason: 'No backup directories found in backups/.' };
  }

  const candidates = [];
  for (const dirName of subdirs) {
    const manifestPath = path.join(backupsDir, dirName, 'manifest.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        if (manifest && manifest.createdAt) {
          const createdAt = new Date(manifest.createdAt);
          if (!isNaN(createdAt.getTime())) {
            candidates.push({ dirName, manifest, createdAt });
          }
        }
      } catch (e) {
        // ignore malformed manifest
      }
    }
  }

  if (candidates.length === 0) {
    return { valid: false, reason: 'No valid backups with manifest.json found in backups/.' };
  }

  candidates.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const newest = candidates[0];
  const ageMs = Date.now() - newest.createdAt.getTime();
  const maxAgeMs = maxAgeMinutes * 60 * 1000;

  if (ageMs > maxAgeMs) {
    const ageMinutes = Math.round(ageMs / 60000);
    return {
      valid: false,
      reason: `Newest backup (${newest.dirName}) was created ${ageMinutes} minute(s) ago (must be within ${maxAgeMinutes} minutes). Please run scripts/db-backup.js first.`,
      newest,
    };
  }

  return {
    valid: true,
    newest,
    ageMinutes: Math.round(ageMs / 60000),
  };
}

async function getPublicTables(prismaClient) {
  const tables = await prismaClient.$queryRaw`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name != '_prisma_migrations'
    ORDER BY table_name ASC;
  `;
  return tables.map((t) => t.table_name);
}

async function promptTypedConfirmation(expectedText) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`\n[CONFIRMATION REQUIRED] To proceed, type '${expectedText}': `, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function runReset(options = {}) {
  const targetDbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!targetDbUrl) {
    throw new Error('Neither DIRECT_URL nor DATABASE_URL environment variable is set.');
  }

  const targetMeta = parseDbTarget(targetDbUrl);
  const isExecuteRequested = options.isExecuteRequested || false;
  const isDryRun = options.isDryRun !== undefined ? options.isDryRun : !isExecuteRequested;
  const confirmFlag = options.confirmFlag || null;
  const typedInputOverride = options.typedInputOverride || null;
  const prismaOverride = options.prismaOverride || null;
  const backupsDir = options.backupsDir || path.join(process.cwd(), 'backups');

  console.log('========================================================================');
  console.log(`[NexaHR DB WIPE & RESET] Target DB: ${targetMeta.database} on host: ${targetMeta.maskedHost}`);
  console.log(`[NexaHR DB WIPE & RESET] Mode: ${isDryRun ? 'DRY-RUN (default - no changes)' : 'LIVE EXECUTION'}`);
  console.log('========================================================================');

  const prisma = prismaOverride || new PrismaClient({
    datasources: { db: { url: targetDbUrl } },
    log: ['error'],
  });

  try {
    const tableNames = await getPublicTables(prisma);
    const tableCounts = [];

    for (const tableName of tableNames) {
      const countRes = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM public."${tableName}"`);
      const rowCount = countRes[0]?.count ?? 0;
      tableCounts.push({ table: tableName, count: rowCount });
      console.log(`  - Table: public."${tableName}" [Current rows: ${rowCount}]`);
    }

    if (isDryRun) {
      console.log('========================================================================');
      console.log('[DRY-RUN SUMMARY] Dry-run completed. NO DATA WAS MODIFIED.');
      console.log(`Tables inspected: ${tableNames.length}`);
      console.log(`Total rows that would be truncated: ${tableCounts.reduce((acc, t) => acc + t.count, 0)}`);
      console.log(`SQL statement that would be executed in a single transaction:`);
      const truncateList = tableNames.map((t) => `public."${t}"`).join(', ');
      console.log(`  TRUNCATE TABLE ${truncateList} RESTART IDENTITY CASCADE;`);
      console.log('========================================================================');
      return { isDryRun: true, tableCounts };
    }

    // ====================================================================
    // LIVE WIPE ENFORCEMENT GUARDS (ALL 4 REQUIRED)
    // ====================================================================

    // Guard 1: ALLOW_DB_WIPE=true env variable
    if (process.env.ALLOW_DB_WIPE !== 'true') {
      throw new Error('[GUARD 1 FAILED] ALLOW_DB_WIPE environment variable is not set to "true". Refusing to wipe.');
    }

    // Guard 2: --confirm=<db-name> flag matching target database
    if (!confirmFlag || confirmFlag !== targetMeta.database) {
      throw new Error(`[GUARD 2 FAILED] --confirm flag '${confirmFlag}' does not match target database '${targetMeta.database}'. Refusing to wipe.`);
    }

    // Guard 3: Recent backup created within 30 minutes
    const backupStatus = findRecentBackup(backupsDir, 30);
    if (!backupStatus.valid) {
      throw new Error(`[GUARD 3 FAILED] Fresh backup check failed: ${backupStatus.reason}`);
    }
    console.log(`[GUARD 3 PASSED] Valid fresh backup verified: ${backupStatus.newest.dirName} (${backupStatus.ageMinutes} min ago).`);

    // Guard 4: Interactive typed confirmation
    const expectedConfirmation = `WIPE ${targetMeta.database}`;
    const typedConfirmation = typedInputOverride !== null
      ? typedInputOverride
      : await promptTypedConfirmation(expectedConfirmation);

    if (typedConfirmation !== expectedConfirmation) {
      throw new Error(`[GUARD 4 FAILED] Confirmation mismatch. Expected '${expectedConfirmation}', received '${typedConfirmation}'. Aborting wipe.`);
    }
    console.log('[GUARD 4 PASSED] Confirmation received.');

    // ====================================================================
    // TRANSACTIONAL TRUNCATE
    // ====================================================================
    console.log('\n[EXECUTING] Truncating all public tables in a single transaction...');
    const truncateSql = `TRUNCATE TABLE ${tableNames.map((t) => `public."${t}"`).join(', ')} RESTART IDENTITY CASCADE;`;

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(truncateSql);

      // Verify every table has 0 rows inside the transaction
      for (const tableName of tableNames) {
        const verifyRes = await tx.$queryRawUnsafe(`SELECT COUNT(*)::int as count FROM public."${tableName}"`);
        const remaining = verifyRes[0]?.count ?? 0;
        if (remaining !== 0) {
          throw new Error(`Verification failed: Table public."${tableName}" still has ${remaining} row(s) after truncate!`);
        }
      }
    });

    console.log('========================================================================');
    console.log(`[SUCCESS] Database wipe completed successfully.`);
    console.log(`Verified all ${tableNames.length} public tables have exactly 0 rows.`);
    console.log('Schema, migrations table, and database constraints remain 100% intact.');
    console.log('========================================================================');

    return { isDryRun: false, tablesReset: tableNames.length };
  } finally {
    if (!prismaOverride) {
      await prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  const isDryRunArg = process.argv.includes('--dry-run');
  const isExecuteArg = process.argv.includes('--execute');
  const confirmParam = process.argv.find((a) => a.startsWith('--confirm='));
  const confirmFlag = confirmParam ? confirmParam.split('=')[1] : null;

  const isDryRun = isDryRunArg || !isExecuteArg;

  runReset({ isExecuteRequested: isExecuteArg, isDryRun, confirmFlag })
    .catch((err) => {
      console.error('\n[RESET ERROR]:', err.message);
      process.exit(1);
    });
}

module.exports = {
  parseDbTarget,
  findRecentBackup,
  getPublicTables,
  runReset,
};

