require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
    console.log(`ADMIN accounts found: ${admins.length}`);
    for (const u of admins) {
        const safe = {};
        for (const k of ['id', 'email', 'employeeCode', 'role', 'isActive', 'status', 'mustChangePassword', 'lastLogin', 'createdAt']) {
            if (k in u) safe[k] = u[k];
        }
        console.log(safe);
    }
    await prisma.$disconnect();
})();