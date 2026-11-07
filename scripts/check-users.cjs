require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [] });
(async () => {
    const users = await prisma.user.findMany({
        select: { email: true, employeeCode: true, role: true, isActive: true, isDemo: true, mustChangePassword: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
    });
    console.table(users);
    await prisma.$disconnect();
})();