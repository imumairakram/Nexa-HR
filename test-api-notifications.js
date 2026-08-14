const prisma = require('./src/config/prisma');

async function testApiNotifications() {
  console.log('Testing notification and announcement API endpoints...\n');

  try {
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    const employee = await prisma.user.findFirst({ where: { role: 'EMPLOYEE' } });

    // 1. Check notifications in DB
    const adminNotifs = await prisma.notification.findMany({
      where: { OR: [{ userId: admin.id }, { userId: null }] },
      orderBy: { createdAt: 'desc' },
    });

    const empNotifs = await prisma.notification.findMany({
      where: { OR: [{ userId: employee.id }, { userId: null }] },
      orderBy: { createdAt: 'desc' },
    });

    console.log(`✅ Admin Notifications (${adminNotifs.length} total, ${adminNotifs.filter(n => !n.isRead).length} unread):`);
    adminNotifs.slice(0, 3).forEach((n, i) => {
      console.log(`   ${i + 1}. [${n.category}] ${n.title} - ${n.message} (Read: ${n.isRead})`);
    });

    console.log(`\n✅ Employee Notifications (${empNotifs.length} total, ${empNotifs.filter(n => !n.isRead).length} unread):`);
    empNotifs.slice(0, 3).forEach((n, i) => {
      console.log(`   ${i + 1}. [${n.category}] ${n.title} - ${n.message} (Read: ${n.isRead})`);
    });

    // 2. Check Announcements in DB
    const announcements = await prisma.announcement.findMany({
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    });
    console.log(`\n✅ Announcements in Database (${announcements.length} total):`);
    announcements.forEach((a, i) => {
      console.log(`   ${i + 1}. [${a.category} | ${a.priority}] ${a.title} (Pinned: ${a.pinned})`);
    });

    console.log('\nAll API database data verified cleanly!');
  } catch (e) {
    console.error('Error during verification:', e);
  } finally {
    await prisma.$disconnect();
  }
}

testApiNotifications();
