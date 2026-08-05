const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('DB_SUCCESS: PostgreSQL connected successfully!');
  } catch (error) {
    console.error('DB_ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
