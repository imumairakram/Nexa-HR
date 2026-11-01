/**
 * scripts/disable-legacy-admin.js
 *
 * Safely neutralizes a legacy administrative account without deleting records.
 *
 * Safety Controls:
 * - Refuses to run unless at least one OTHER active ADMIN exists (prevents lockout).
 * - Takes legacy email from LEGACY_ADMIN_EMAIL env var (no hardcoding).
 * - Sets isActive: false, mustChangePassword: true, and overwrites password hash with
 *   a high-entropy random secret (48+ chars) that is never stored or logged.
 * - Supports --dry-run to simulate without modifying data.
 * - Prints only email, id, and status confirmation. Never prints secrets.
 *
 * Usage:
 *   LEGACY_ADMIN_EMAIL="admin@nexahr.com" node scripts/disable-legacy-admin.js --dry-run
 *   LEGACY_ADMIN_EMAIL="admin@nexahr.com" node scripts/disable-legacy-admin.js
 */

require('dotenv').config();
const crypto = require('crypto');
const prisma = require('../src/config/prisma');
const { hashPassword } = require('../src/utils/password');

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  const legacyEmail = (process.env.LEGACY_ADMIN_EMAIL || '').trim().toLowerCase();

  if (!legacyEmail) {
    console.error('ERROR: LEGACY_ADMIN_EMAIL environment variable is required.');
    console.error('Example: LEGACY_ADMIN_EMAIL="legacy-admin@domain.com" node scripts/disable-legacy-admin.js');
    process.exit(1);
  }

  // 1. Locate target user account
  const legacyUser = await prisma.user.findUnique({
    where: { email: legacyEmail },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      employeeCode: true,
    },
  });

  if (!legacyUser) {
    console.error(`ERROR: No user account found with email "${legacyEmail}".`);
    process.exit(1);
  }

  // 2. Safety Check: Verify at least one OTHER active ADMIN exists
  const otherActiveAdminsCount = await prisma.user.count({
    where: {
      role: 'ADMIN',
      isActive: true,
      NOT: { id: legacyUser.id },
    },
  });

  if (otherActiveAdminsCount < 1) {
    console.error('REFUSING TO RUN: No other active ADMIN accounts found in the system.');
    console.error('Disabling this account would cause total administrative lockout.');
    console.error('Please create another active ADMIN account first using scripts/create-admin.js.');
    process.exit(1);
  }

  // 3. Dry-run mode
  if (isDryRun) {
    console.log(`[DRY RUN] Target account located: ${legacyUser.email} (id: ${legacyUser.id}, employeeCode: ${legacyUser.employeeCode})`);
    console.log(`[DRY RUN] Safety check passed: ${otherActiveAdminsCount} other active ADMIN account(s) verified.`);
    console.log('[DRY RUN] Target account would be set to isActive: false, mustChangePassword: true, and password hash replaced with a random secret.');
    console.log('[DRY RUN] No changes were written to the database.');
    return;
  }

  // 4. Overwrite password with freshly generated random 48-char secret and deactivate
  const randomSecret = crypto.randomBytes(36).toString('hex'); // 72-char cryptographically strong random secret
  const randomizedHash = await hashPassword(randomSecret);

  const updatedUser = await prisma.user.update({
    where: { id: legacyUser.id },
    data: {
      isActive: false,
      password: randomizedHash,
      mustChangePassword: true,
    },
    select: {
      id: true,
      email: true,
      isActive: true,
    },
  });

  console.log(`SUCCESS: Neutralized and deactivated legacy account ${updatedUser.email} (id: ${updatedUser.id}).`);
}

main()
  .catch((err) => {
    console.error('Execution error:', err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

