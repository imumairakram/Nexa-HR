const prisma = require('./src/config/prisma');

async function cleanEmojisFromDb() {
  console.log('Cleaning emoji characters from database notifications and announcements...');

  try {
    const notifications = await prisma.notification.findMany();
    for (const n of notifications) {
      const cleanTitle = n.title.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}⭐📢🏖💳🔒💬👤🔑⏱⚠️📝🔗🚦💵📉💰🏦🏷🏢✍📬👥🎉✨👏🚀🎨⚡❤️🏆⚪🟢👋]/gu, '').trim();
      const cleanMsg = n.message ? n.message.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}⭐📢🏖💳🔒💬👤🔑⏱⚠️📝🔗🚦💵📉💰🏦🏷🏢✍📬👥🎉✨👏🚀🎨⚡❤️🏆⚪🟢👋]/gu, '').trim() : n.message;
      if (cleanTitle !== n.title || cleanMsg !== n.message) {
        await prisma.notification.update({
          where: { id: n.id },
          data: { title: cleanTitle, message: cleanMsg },
        });
      }
    }

    const announcements = await prisma.announcement.findMany();
    for (const a of announcements) {
      const cleanTitle = a.title.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}⭐📢🏖💳🔒💬👤🔑⏱⚠️📝🔗🚦💵📉💰🏦🏷🏢✍📬👥🎉✨👏🚀🎨⚡❤️🏆⚪🟢👋]/gu, '').trim();
      const cleanSummary = a.summary ? a.summary.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E0}-\u{1F1FF}⭐📢🏖💳🔒💬👤🔑⏱⚠️📝🔗🚦💵📉💰🏦🏷🏢✍📬👥🎉✨👏🚀🎨⚡❤️🏆⚪🟢👋]/gu, '').trim() : a.summary;
      if (cleanTitle !== a.title || cleanSummary !== a.summary) {
        await prisma.announcement.update({
          where: { id: a.id },
          data: { title: cleanTitle, summary: cleanSummary },
        });
      }
    }

    console.log('Database notifications and announcements cleaned successfully.');
  } catch (err) {
    console.error('Error cleaning database emojis:', err);
  } finally {
    await prisma.$disconnect();
  }
}

cleanEmojisFromDb();
