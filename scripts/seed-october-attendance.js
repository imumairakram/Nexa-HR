require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Seed realistic, randomized attendance data for October 2026
 * For all active users in the system (e.g., umairdevelop@gmail.com and umaaiirakram@gmail.com)
 */
async function seedOctoberAttendance() {
  console.log('[SEED] Starting October 2026 attendance generation...');

  const users = await prisma.user.findMany({
    where: { isActive: true },
    select: {
      id: true,
      email: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  if (users.length === 0) {
    console.error('[SEED] No active users found in database to seed attendance.');
    process.exit(1);
  }

  console.log(`[SEED] Found ${users.length} active user(s):`, users.map((u) => `${u.firstName} ${u.lastName} (${u.email})`));

  const year = 2026;
  const monthIndex = 9; // October (0-indexed)
  const daysInOctober = 31;

  let totalRecordsCreated = 0;
  let totalRecordsUpdated = 0;

  for (const user of users) {
    console.log(`\n[SEED] Generating October records for: ${user.firstName} ${user.lastName} (${user.employeeCode})`);

    for (let day = 1; day <= daysInOctober; day++) {
      // Create local date for day
      const targetDate = new Date(year, monthIndex, day);
      const dayOfWeek = targetDate.getDay();

      // Skip weekends (Saturday=6, Sunday=0)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      // Date for @db.Date column in Postgres: normalize to UTC midnight or local date
      const dateForDb = new Date(Date.UTC(year, monthIndex, day, 0, 0, 0));

      // Deterministic yet realistic randomness based on user id and day
      const randomSeed = Math.floor(Math.random() * 100);

      let status = 'PRESENT';
      let inHour = 8;
      let inMin = 45 + Math.floor(Math.random() * 25); // 08:45 to 09:10
      let outHour = 17;
      let outMin = 15 + Math.floor(Math.random() * 50); // 17:15 to 18:05
      let notes = 'Biometric Terminal HQ - Face Recognition verified';

      if (randomSeed >= 96) {
        // ~4% ON_LEAVE
        status = 'ON_LEAVE';
        inHour = 9;
        inMin = 0;
        outHour = 9;
        outMin = 0;
        notes = 'Approved Casual / Sick Leave';
      } else if (randomSeed >= 90) {
        // ~6% HALF_DAY
        status = 'HALF_DAY';
        inHour = 9;
        inMin = Math.floor(Math.random() * 15); // 09:00 - 09:15
        outHour = 13;
        outMin = 15 + Math.floor(Math.random() * 30); // 13:15 - 13:45
        notes = 'Approved Half-Day Departure';
      } else if (randomSeed >= 78) {
        // ~12% LATE
        status = 'LATE';
        inHour = 9;
        inMin = 20 + Math.floor(Math.random() * 25); // 09:20 - 09:45
        outHour = 17;
        outMin = 30 + Math.floor(Math.random() * 45); // 17:30 - 18:15
        notes = 'Biometric Terminal HQ - Late arrival logged';
      }

      // Calculate timestamps
      // Pakistan Standard Time is UTC+5, so local hours 8:50 are stored as local Date or UTC
      const checkInTime = new Date(year, monthIndex, day, inHour, inMin, 0);
      let checkOutTime = status === 'ON_LEAVE' ? null : new Date(year, monthIndex, day, outHour, outMin, 0);

      let totalHours = 0;
      if (checkOutTime && checkInTime) {
        const diffMs = Math.max(0, checkOutTime.getTime() - checkInTime.getTime());
        totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
      }

      const existing = await prisma.attendance.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: dateForDb,
          },
        },
      });

      if (existing) {
        await prisma.attendance.update({
          where: { id: existing.id },
          data: {
            checkInTime,
            checkOutTime,
            status,
            totalHours,
            notes,
          },
        });
        totalRecordsUpdated++;
      } else {
        await prisma.attendance.create({
          data: {
            userId: user.id,
            date: dateForDb,
            checkInTime,
            checkOutTime,
            status,
            totalHours,
            notes,
          },
        });
        totalRecordsCreated++;
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`[SEED] October 2026 Attendance Summary:`);
  console.log(`  - Users processed: ${users.length}`);
  console.log(`  - New records created: ${totalRecordsCreated}`);
  console.log(`  - Records updated: ${totalRecordsUpdated}`);
  console.log(`  - Total active October records: ${totalRecordsCreated + totalRecordsUpdated}`);
  console.log(`========================================\n`);

  try {
    const cacheService = require('../src/services/cache.service');
    cacheService.invalidateTags(['attendance', 'dashboard']);
    console.log('[SEED] Invalidation of attendance & dashboard caches complete.');
  } catch (err) {
    // Cache service may be optional in standalone scripts
  }

  await prisma.$disconnect();
}

seedOctoberAttendance().catch((err) => {
  console.error('[SEED ERROR]', err);
  process.exit(1);
});

