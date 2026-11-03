/**
 * src/tests/helpers/dbGuard.js
 *
 * Test Database Isolation & Safety Guard
 * - Integration tests must strictly run against TEST_DATABASE_URL (never production DATABASE_URL).
 * - If TEST_DATABASE_URL is missing or equals DATABASE_URL, skip DB integration tests with a clear message.
 * - Refuses destructive setup if the target database contains non-test users.
 */

function getDbTestEligibility() {
  const testDb = process.env.TEST_DATABASE_URL;
  const prodDb = process.env.DATABASE_URL;

  if (!testDb || !testDb.trim()) {
    return {
      canRun: false,
      reason: 'TEST_DATABASE_URL is not set. Database integration tests are skipped to protect production.',
    };
  }

  // Normalize URLs to detect identical databases
  const normalize = (u) => {
    if (!u) return '';
    try {
      const parsed = new URL(u);
      return `${parsed.host}${parsed.pathname}`.toLowerCase();
    } catch {
      return u.trim().toLowerCase();
    }
  };

  if (normalize(testDb) === normalize(prodDb)) {
    return {
      canRun: false,
      reason: 'TEST_DATABASE_URL is identical to DATABASE_URL. Database integration tests are skipped to prevent running against production.',
    };
  }

  return {
    canRun: true,
    testDbUrl: testDb,
  };
}

/**
 * Verifies that the connected database is an isolated test database containing no real users
 * Non-test users are any accounts not ending in '@test.invalid'
 */
async function verifySafeTestDatabase(prisma) {
  if (!prisma || !prisma.user) return;

  const nonTestUsers = await prisma.user.findMany({
    where: {
      NOT: {
        email: { endsWith: '@test.invalid' },
      },
    },
    select: { id: true, email: true, employeeCode: true },
  });

  if (nonTestUsers.length > 0) {
    throw new Error(
      `[DATABASE SAFETY GUARD] Refusing destructive test execution! Target database contains ${nonTestUsers.length} non-test user(s) (e.g. ${nonTestUsers[0].email} [${nonTestUsers[0].employeeCode}]). Tests may only run on an empty database or one containing exclusively @test.invalid users.`
    );
  }
}

module.exports = {
  getDbTestEligibility,
  verifySafeTestDatabase,
};

