/**
 * src/utils/envGuard.js
 *
 * Strict Environment & Database Name Safety Guard.
 * Protects production databases from accidental workstation mutations:
 * - Inspects DATABASE_URL, DIRECT_URL, and TEST_DATABASE_URL.
 * - Enforces an explicit database name allowlist: (*_scratch, *_dev, *_test).
 * - Ignores host strings, ports (e.g. 5432, 6543), poolers, and query strings (?pgbouncer=true).
 * - Immediately rejects and aborts if the database name is not in the allowlist unless LIVE_OK === 'true'.
 */

class UnsafeDatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsafeDatabaseError';
  }
}

/**
 * Checks if a database URL targets an allowlisted database (*_scratch, *_dev, *_test).
 * @param {string} urlString 
 * @returns {boolean}
 */
function isDatabaseAllowed(urlString) {
  if (!urlString) return true;
  try {
    const parsed = new URL(urlString);
    // Extract database name from pathname (e.g. /nexahr_scratch -> nexahr_scratch)
    const dbName = parsed.pathname.replace(/^\/+/, '').split('/')[0];
    if (!dbName) return false;

    // Allowlist: ends with _scratch, _dev, _test or is scratch, dev, test (case-insensitive)
    return /^(?:.*_)?(?:scratch|dev|test)$/i.test(dbName);
  } catch (err) {
    return false;
  }
}

/**
 * Enforces database safety. Throws or terminates if an unsafe database is targeted without LIVE_OK=true.
 * @param {string|null} customUrl 
 * @param {object} options 
 */
function enforceDatabaseSafety(customUrl = null, options = {}) {
  const { throwOnly = false } = options;

  if (process.env.LIVE_OK === 'true') {
    return true;
  }

  const urlsToCheck = customUrl
    ? [customUrl]
    : [process.env.DIRECT_URL, process.env.DATABASE_URL, process.env.TEST_DATABASE_URL].filter(Boolean);

  for (const urlStr of urlsToCheck) {
    if (!isDatabaseAllowed(urlStr)) {
      let parsedDb = 'unknown';
      try {
        parsedDb = new URL(urlStr).pathname.replace(/^\/+/, '').split('/')[0];
      } catch (e) {}

      const msg = `
================================================================================
[CRITICAL ENVIRONMENT SAFETY GUARD TRIGGERED]
Operation aborted: Connection targets database "${parsedDb}", which is not allowlisted!
Target URL: ${urlStr.replace(/:[^:@]+@/, ':****@')}
Allowed database names: (*_scratch, *_dev, *_test)

Per NexaHR Security & Reliability Architecture:
1. Production databases (e.g. /postgres) are strictly protected from workstation commands.
2. All migrations, reset scripts, tests, and local dev must target scratch/dev/test databases.
3. Pass LIVE_OK=true explicitly only for verified production CI/CD deployments.
================================================================================
`;
      if (throwOnly || process.env.NODE_ENV === 'test') {
        throw new UnsafeDatabaseError(msg.trim());
      } else {
        console.error(msg);
        process.exit(1);
      }
    }
  }

  return true;
}

// Auto-run on import if not in test environment
if (process.env.NODE_ENV !== 'test') {
  enforceDatabaseSafety();
}

module.exports = {
  isDatabaseAllowed,
  enforceDatabaseSafety,
  UnsafeDatabaseError,
};
