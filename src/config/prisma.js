const { PrismaClient } = require('@prisma/client');

let dbUrl = process.env.DATABASE_URL;
if (dbUrl && dbUrl.includes(':6543') && !dbUrl.includes('pgbouncer=true')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'pgbouncer=true';
}

const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test';

const prisma = new PrismaClient({
  ...(dbUrl ? { datasources: { db: { url: dbUrl } } } : {}),
  // In production and test, suppress verbose queries and info to protect sensitive data; retain only warn and error logs
  log: isProduction ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
