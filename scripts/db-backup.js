/**
 * scripts/db-backup.js
 *
 * Safe Database Backup Utility for NexaHR (public schema only).
 *
 * Requirements:
 * - Dumps all tables in the `public` schema (excluding `_prisma_migrations`) to JSON files.
 * - Stores files in `backups/<timestamp>/` directory.
 * - Redacts password, OTP, token, secret, and cryptographic hash columns.
 * - Refuses to overwrite an existing backup folder.
 * - Prints only table names and row counts (never row content or credentials).
 * - Pre-computes and saves a manifest.json with metadata for wipe verification.
 * - Never touches non-public schemas (auth, storage, extensions) or _prisma_migrations.
 *
 * Usage:
 *   node scripts/db-backup.js
 *   node scripts/db-backup.js --dry-run
 *   node scripts/db-backup.js --out=<custom-folder>
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const SENSITIVE_COLUMN_PATTERNS = [
  /password/i,
  /^otp/i,
  /token/i,
  /secret/i,
  /hash/i,
  /salt/i,
];

function isSensitiveColumn(columnName) {
  return SENSITIVE_COLUMN_PATTERNS.some((pattern) => pattern.test(columnName));
}

function redactRecord(record) {
  if (!record || typeof record !== 'object') return record;
  if (Array.isArray(record)) return record.map(redactRecord);

  const redacted = {};
  for (const [key, value] of Object.entries(record)) {
    if (isSensitiveColumn(key) && value !== null && value !== undefined) {
      redacted[key] = '[REDACTED]';
    } else if (value instanceof Date) {
      redacted[key] = value.toISOString();
    } else if (typeof value === 'bigint') {
      redacted[key] = value.toString();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      redacted[key] = redactRecord(value);
    } else {
      redacted[key] = value;
    }
  }
  return redacted;
}

function parseDbTarget(dbUrl) {
  if (!dbUrl) return { host: 'unknown', database: 'unknown' };
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

async function createBackup(options = {}) {
  const targetDbUrl = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!targetDbUrl) {
    throw new Error('Neither DIRECT_URL nor DATABASE_URL environment variable is set.');
  }

  const { isDryRun = false, customOutDir = null, prismaOverride = null } = options;
  const targetMeta = parseDbTarget(targetDbUrl);

  console.log('========================================================================');
  console.log(`[NexaHR DB BACKUP] Target Database: ${targetMeta.database} on host: ${targetMeta.maskedHost}`);
  console.log(`[NexaHR DB BACKUP] Mode: ${isDryRun ? 'DRY-RUN (no files written)' : 'LIVE BACKUP'}`);
  console.log('========================================================================');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFolder = customOutDir || path.join(process.cwd(), 'backups', timestamp);

  if (!isDryRun) {
    if (fs.existsSync(backupFolder)) {
      throw new Error(`Refusing to overwrite existing backup directory: ${backupFolder}`);
    }
    fs.mkdirSync(backupFolder, { recursive: true });
  }

  const prisma = prismaOverride || new PrismaClient({
    datasources: { db: { url: targetDbUrl } },
    log: ['error'],
  });

  const tableSummary = [];

  try {
    const tableNames = await getPublicTables(prisma);
    console.log(`Found ${tableNames.length} public schema tables to back up:`);

    for (const tableName of tableNames) {
      const rows = await prisma.$queryRawUnsafe(`SELECT * FROM public."${tableName}"`);
      const rowCount = rows.length;
      tableSummary.push({ table: tableName, rowCount });

      console.log(`  - Table: public."${tableName}" -> ${rowCount} row(s)`);

      if (!isDryRun) {
        const sanitizedRows = rows.map(redactRecord);
        const filePath = path.join(backupFolder, `${tableName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(sanitizedRows, null, 2), 'utf8');
      }
    }

    if (!isDryRun) {
      const manifest = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        database: targetMeta.database,
        hostMasked: targetMeta.maskedHost,
        totalTables: tableNames.length,
        totalRows: tableSummary.reduce((acc, t) => acc + t.rowCount, 0),
        tables: tableSummary,
      };
      fs.writeFileSync(path.join(backupFolder, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
      console.log('========================================================================');
      console.log(`[SUCCESS] Backup completed successfully.`);
      console.log(`Backup Directory: ${backupFolder}`);
      console.log('========================================================================');
    } else {
      console.log('========================================================================');
      console.log(`[DRY-RUN COMPLETE] No files written.`);
      console.log('========================================================================');
    }

    return {
      backupFolder: isDryRun ? null : backupFolder,
      tables: tableSummary,
    };
  } finally {
    if (!prismaOverride) {
      await prisma.$disconnect();
    }
  }
}

if (require.main === module) {
  const isDryRun = process.argv.includes('--dry-run');
  const customOutArg = process.argv.find((a) => a.startsWith('--out='));
  const customOutDir = customOutArg ? customOutArg.split('=')[1] : null;

  createBackup({ isDryRun, customOutDir })
    .catch((err) => {
      console.error('[BACKUP ERROR]:', err.message);
      process.exit(1);
    });
}

module.exports = {
  redactRecord,
  isSensitiveColumn,
  parseDbTarget,
  getPublicTables,
  createBackup,
};

