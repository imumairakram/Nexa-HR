const { PrismaClient } = require('@prisma/client');

const isProduction = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test';

const prisma = new PrismaClient({
  // In production and test, suppress verbose queries and info to protect sensitive data; retain only warn and error logs
  log: isProduction ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
