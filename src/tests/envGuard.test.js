const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { isDatabaseAllowed, enforceDatabaseSafety, UnsafeDatabaseError } = require('../utils/envGuard');

describe('Environment Safety Guard - Database Name Allowlist (*_scratch, *_dev, *_test)', () => {
  const origEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...origEnv, NODE_ENV: 'test' };
    delete process.env.LIVE_OK;
  });

  afterEach(() => {
    process.env = { ...origEnv };
  });

  describe('isDatabaseAllowed(url)', () => {
    it('allows valid scratch, dev, and test database names regardless of host, port, or query string', () => {
      const allowedUrls = [
        'postgresql://postgres:pass@aws-0-ap-northeast-1.pooler.supabase.com:5432/nexahr_scratch',
        'postgresql://postgres:pass@aws-0-ap-northeast-1.pooler.supabase.com:6543/nexahr_scratch?pgbouncer=true',
        'postgresql://postgres:pass@localhost:5432/nexahr_dev',
        'postgresql://user:secret@direct.db.internal:5432/nexahr_test?sslmode=require&connection_limit=5',
        'postgresql://user:secret@custom-host:9999/scratch',
        'postgresql://user:secret@custom-host:9999/dev',
        'postgresql://user:secret@custom-host:9999/test',
        'postgresql://user:secret@custom-host:9999/NEXAHR_SCRATCH',
        'postgresql://user:secret@custom-host:9999/COMPANY_DEV?pool_timeout=10',
      ];

      for (const url of allowedUrls) {
        assert.equal(isDatabaseAllowed(url), true, `Expected URL to be allowed: ${url}`);
      }
    });

    it('rejects production, default, or un-whitelisted database names', () => {
      const blockedUrls = [
        'postgresql://postgres:pass@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres',
        'postgresql://postgres:pass@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
        'postgresql://postgres:pass@localhost:5432/postgres',
        'postgresql://user:secret@direct.db.internal:5432/production',
        'postgresql://user:secret@direct.db.internal:5432/nexahr_prod',
        'postgresql://user:secret@direct.db.internal:5432/nexahr_live',
        'postgresql://user:secret@direct.db.internal:5432/main',
        'postgresql://user:secret@direct.db.internal:5432/staging',
      ];

      for (const url of blockedUrls) {
        assert.equal(isDatabaseAllowed(url), false, `Expected URL to be rejected: ${url}`);
      }
    });

    it('returns false for malformed URLs or missing database paths', () => {
      assert.equal(isDatabaseAllowed('not-a-url'), false);
      assert.equal(isDatabaseAllowed('postgresql://user:secret@host:5432/'), false);
    });
  });

  describe('enforceDatabaseSafety(url, options)', () => {
    it('throws UnsafeDatabaseError when targeting an un-allowlisted database', () => {
      const liveUrl = 'postgresql://postgres:secret@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';
      assert.throws(
        () => enforceDatabaseSafety(liveUrl, { throwOnly: true }),
        UnsafeDatabaseError
      );
    });

    it('passes silently when targeting an allowlisted database', () => {
      const scratchUrl = 'postgresql://postgres:secret@aws-0-ap-northeast-1.pooler.supabase.com:5432/nexahr_scratch';
      assert.doesNotThrow(() => enforceDatabaseSafety(scratchUrl, { throwOnly: true }));
    });

    it('allows non-whitelisted databases when LIVE_OK=true is explicitly provided for CI/CD', () => {
      process.env.LIVE_OK = 'true';
      const liveUrl = 'postgresql://postgres:secret@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres';
      assert.doesNotThrow(() => enforceDatabaseSafety(liveUrl, { throwOnly: true }));
    });
  });
});
