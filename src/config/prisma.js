const { PrismaClient } = require('@prisma/client');

const isProduction = process.env.NODE_ENV === 'production';

const prisma = new PrismaClient({
  // In production, suppress verbose queries and info to protect sensitive data; retain only warn and error logs
  log: isProduction ? ['warn', 'error'] : ['query', 'info', 'warn', 'error'],
});

module.exports = prisma;
