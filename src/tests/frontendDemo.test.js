/**
 * src/tests/frontendDemo.test.js
 *
 * Automated Test Suite for NexaHR Frontend-Only Demo Mode
 * Tests feature-flag configuration, session lifecycle, storage isolation,
 * fixture routing, mutation protection, and zero-PII compliance.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

// Enforce zero external network calls
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

// Mock browser window and storages for Node.js test environment
class MockStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.get(String(key)) ?? null;
  }
  setItem(key, value) {
    this.store.set(String(key), String(value));
  }
  removeItem(key) {
    this.store.delete(String(key));
  }
  clear() {
    this.store.clear();
  }
  get length() {
    return this.store.size;
  }
  keys() {
    return Array.from(this.store.keys());
  }
}

globalThis.sessionStorage = new MockStorage();
globalThis.localStorage = new MockStorage();
globalThis.window = {
  sessionStorage: globalThis.sessionStorage,
  localStorage: globalThis.localStorage,
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
};
globalThis.CustomEvent = class CustomEvent {
  constructor(name, opts = {}) {
    this.name = name;
    this.detail = opts.detail;
  }
};
globalThis.Event = class Event {
  constructor(name) {
    this.name = name;
  }
};

test('Frontend Demo Mode - Feature Flag Configuration', async (t) => {
  const { isGuestDemoConfigured } = await import('../../client/src/demo/demoSession.js');

  await t.test('returns false when VITE_ENABLE_GUEST_DEMO is unset', () => {
    delete process.env.VITE_ENABLE_GUEST_DEMO;
    delete process.env.VITE_GUEST_DEMO_UNTIL;
    assert.equal(isGuestDemoConfigured(), false);
  });

  await t.test('returns false when VITE_ENABLE_GUEST_DEMO is "false"', () => {
    process.env.VITE_ENABLE_GUEST_DEMO = 'false';
    assert.equal(isGuestDemoConfigured(), false);
  });

  await t.test('returns true when VITE_ENABLE_GUEST_DEMO is "true"', () => {
    process.env.VITE_ENABLE_GUEST_DEMO = 'true';
    assert.equal(isGuestDemoConfigured(), true);
  });

  await t.test('returns false when VITE_GUEST_DEMO_UNTIL has expired in the past', () => {
    process.env.VITE_ENABLE_GUEST_DEMO = 'true';
    process.env.VITE_GUEST_DEMO_UNTIL = '2020-01-01T00:00:00Z';
    assert.equal(isGuestDemoConfigured(), false);
  });

  await t.test('returns true when VITE_GUEST_DEMO_UNTIL is in the future', () => {
    process.env.VITE_ENABLE_GUEST_DEMO = 'true';
    process.env.VITE_GUEST_DEMO_UNTIL = '2099-12-31T23:59:59Z';
    assert.equal(isGuestDemoConfigured(), true);
    delete process.env.VITE_GUEST_DEMO_UNTIL;
  });
});

test('Frontend Demo Mode - Session Lifecycle & Storage Isolation', async (t) => {
  const {
    startDemoSession,
    getDemoSession,
    isDemoSessionActive,
    clearDemoSession,
    getDemoExpiryRemainingMs,
    DemoModeError,
    DEMO_SESSION_DURATION_MS,
  } = await import('../../client/src/demo/demoSession.js');

  await t.test('initializes Guest HR session exclusively in sessionStorage', () => {
    sessionStorage.clear();
    localStorage.clear();

    // Set a dummy real user token in localStorage to test isolation
    localStorage.setItem('token', 'real-production-admin-jwt-token');
    localStorage.setItem('user', JSON.stringify({ id: 'real-1', email: 'real@company.com' }));

    const session = startDemoSession('ADMIN');
    assert.equal(session.role, 'ADMIN');
    assert.equal(session.isDemo, true);
    assert.equal(session.email, 'guest-hr@demo.invalid');
    assert.equal(isDemoSessionActive(), true);

    // Verify localStorage was completely untouched
    assert.equal(localStorage.getItem('token'), 'real-production-admin-jwt-token');
    assert.equal(JSON.parse(localStorage.getItem('user')).email, 'real@company.com');
  });

  await t.test('initializes Guest Employee session with normalized role', () => {
    sessionStorage.clear();
    const session = startDemoSession('employee');
    assert.equal(session.role, 'EMPLOYEE');
    assert.equal(session.isDemo, true);
    assert.equal(session.email, 'guest-employee@demo.invalid');
  });

  await t.test('enforces 60-minute duration and returns remaining ms', () => {
    sessionStorage.clear();
    startDemoSession('ADMIN');
    const remaining = getDemoExpiryRemainingMs();
    assert.ok(remaining > 0 && remaining <= DEMO_SESSION_DURATION_MS);
  });

  await t.test('clearDemoSession removes demo session without touching localStorage', () => {
    localStorage.setItem('token', 'should-remain');
    clearDemoSession();
    assert.equal(isDemoSessionActive(), false);
    assert.equal(getDemoSession(), null);
    assert.equal(localStorage.getItem('token'), 'should-remain');
  });

  await t.test('DemoModeError class contains expected properties', () => {
    const err = new DemoModeError();
    assert.equal(err.name, 'DemoModeError');
    assert.equal(err.code, 'DEMO_MODE');
    assert.equal(err.isDemo, true);
    assert.equal(err.message, 'Demo mode: view only. Changes are disabled.');
  });
});

test('Frontend Demo Mode - Synthetic Fixture Router', async (t) => {
  const { startDemoSession } = await import('../../client/src/demo/demoSession.js');
  const { handleDemoGetRequest } = await import('../../client/src/demo/fixtureRouter.js');

  sessionStorage.clear();
  startDemoSession('ADMIN');

  await t.test('/auth/me returns synthetic user marked isDemo', async () => {
    const res = await handleDemoGetRequest('/auth/me');
    assert.equal(res.success, true);
    assert.equal(res.data.isDemo, true);
    assert.equal(res.data.isGuest, true);
    assert.equal(res.data.mustChangePassword, false);
    assert.ok(res.data.email.endsWith('@demo.invalid'));
  });

  await t.test('/dashboard/admin returns metrics and charts', async () => {
    const res = await handleDemoGetRequest('/dashboard/admin');
    assert.equal(res.success, true);
    assert.equal(res.data.metrics.totalEmployees, 15);
    assert.ok(Array.isArray(res.data.charts.attendanceTrend));
  });

  await t.test('/dashboard/employee returns personal employee metrics', async () => {
    const res = await handleDemoGetRequest('/dashboard/employee');
    assert.equal(res.success, true);
    assert.ok(res.data.todayClockStatus);
    assert.ok(res.data.monthlyAttendance);
  });

  await t.test('/employees returns 15 employees and supports search', async () => {
    const resAll = await handleDemoGetRequest('/employees');
    assert.equal(resAll.success, true);
    assert.equal(resAll.data.employees.length, 15);
    assert.equal(resAll.data.pagination.total, 15);

    // Search query
    const resSearch = await handleDemoGetRequest('/employees?search=gabriel');
    assert.equal(resSearch.success, true);
    assert.ok(resSearch.data.employees.length >= 1);
    assert.ok(resSearch.data.employees[0].firstName.toLowerCase().includes('gabriel'));
  });

  await t.test('/attendance returns 30-day logs and today summary', async () => {
    const res = await handleDemoGetRequest('/attendance');
    assert.equal(res.success, true);
    assert.ok(res.data.attendances.length >= 30);
    assert.ok(res.data.summary);
  });

  await t.test('/leaves/requests and /leaves/my-requests return leave records', async () => {
    const resReqs = await handleDemoGetRequest('/leaves/requests');
    assert.equal(resReqs.success, true);
    assert.ok(resReqs.data.leaveRequests.length > 0);

    const resMy = await handleDemoGetRequest('/leaves/my-requests');
    assert.equal(resMy.success, true);
    assert.ok(resMy.data.balance);
  });

  await t.test('/payroll/payslips returns 15 payslips and payroll summary', async () => {
    const res = await handleDemoGetRequest('/payroll/payslips');
    assert.equal(res.success, true);
    assert.equal(res.data.payslips.length, 15);
    assert.ok(res.data.summary.totalGrossDisbursed > 0);
  });

  await t.test('/recruitment/jobs and /recruitment/applications return ATS mock data', async () => {
    const resJobs = await handleDemoGetRequest('/recruitment/jobs');
    assert.equal(resJobs.success, true);
    assert.equal(resJobs.data.jobs.length, 3);

    const resApps = await handleDemoGetRequest('/recruitment/applications');
    assert.equal(resApps.success, true);
    assert.equal(resApps.data.applications.length, 6);
    assert.ok(resApps.data.applications[0].aiBreakdown);
  });

  await t.test('unhandled GET endpoint returns graceful empty array fallback', async () => {
    const res = await handleDemoGetRequest('/unknown/demo/route');
    assert.equal(res.success, true);
    assert.deepEqual(res.data, []);
  });
});

test('Frontend Demo Mode - Zero PII Compliance', async () => {
  const { DEMO_EMPLOYEES } = await import('../../client/src/demo/fixtures/employees.js');
  const { DEMO_CANDIDATES } = await import('../../client/src/demo/fixtures/recruitment.js');

  for (const emp of DEMO_EMPLOYEES) {
    assert.ok(
      emp.email.endsWith('@demo.invalid'),
      `Employee ${emp.firstName} ${emp.lastName} must use @demo.invalid email, got: ${emp.email}`
    );
    assert.ok(
      !emp.email.includes('gmail.com') && !emp.email.includes('nexahr.com'),
      `Employee email contains real domain: ${emp.email}`
    );
  }

  for (const cand of DEMO_CANDIDATES) {
    assert.ok(
      cand.email.endsWith('@demo.invalid'),
      `Candidate ${cand.name} must use @demo.invalid email, got: ${cand.email}`
    );
  }
});
