/**
 * src/tests/setup.js
 *
 * Preloaded test setup for Node.js test runner (--require ./src/tests/setup.js)
 * Guarantees that:
 * 1. NODE_ENV is set to 'test'
 * 2. EMAIL_DELIVERY_MODE is set to 'log'
 * 3. DATABASE_URL and DIRECT_URL are forced to an unreachable dummy loopback URL
 *    (postgresql://test:test@127.0.0.1:1/test) BEFORE Prisma is loaded, UNLESS
 *    TEST_DATABASE_URL is explicitly configured.
 * 4. dotenv.config is guarded so loading .env in test files never restores production DATABASE_URL.
 * 5. Outbound network guard is installed to block any external requests.
 */

process.env.NODE_ENV = 'test';
process.env.EMAIL_DELIVERY_MODE = 'log';

// Setup database URL isolation
const testDbUrl = process.env.TEST_DATABASE_URL && process.env.TEST_DATABASE_URL.trim();
if (testDbUrl) {
  process.env.DATABASE_URL = testDbUrl;
  process.env.DIRECT_URL = testDbUrl;
} else {
  process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
  process.env.DIRECT_URL = 'postgresql://test:test@127.0.0.1:1/test';
}

// Guard dotenv so requiring dotenv in tests cannot overwrite test database isolation
try {
  const dotenv = require('dotenv');
  const originalConfig = dotenv.config;
  dotenv.config = function (options = {}) {
    const result = originalConfig.call(this, options);
    if (!process.env.TEST_DATABASE_URL || !process.env.TEST_DATABASE_URL.trim()) {
      process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
      process.env.DIRECT_URL = 'postgresql://test:test@127.0.0.1:1/test';
    } else {
      process.env.DATABASE_URL = process.env.TEST_DATABASE_URL.trim();
      process.env.DIRECT_URL = process.env.TEST_DATABASE_URL.trim();
    }
    process.env.NODE_ENV = 'test';
    process.env.EMAIL_DELIVERY_MODE = 'log';
    return result;
  };
} catch {
  // dotenv not yet loaded
}

// Install strict network guard for all tests
try {
  const { installNetworkGuard } = require('./helpers/networkGuard');
  installNetworkGuard();
} catch (e) {
  console.warn('[TEST SETUP] Network guard installation warning:', e.message);
}

