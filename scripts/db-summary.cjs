require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: [] });

(async () => {
    const users = await prisma.user.findMany({
        select: { email: true, employeeCode: true, role: true, isActive: true, mustChangePassword: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
    });
    console.table(users);

    const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name`;
    const rows = [];
    for (const t of tables) {
        const r = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS c FROM "public"."${t.table_name}"`);
        rows.push({ table: t.table_name, rows: r[0].c });
    }
    console.table(rows);
    await prisma.$disconnect();
})();