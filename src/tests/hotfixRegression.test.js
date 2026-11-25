const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');

const prisma = require('../config/prisma');
const app = require('../index');
const cacheService = require('../services/cache.service');
const { generateToken } = require('../utils/jwt');
const { getAdminDashboard, getEmployeeDashboard } = require('../controllers/dashboard.controller');

function walkJsFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'tests' || entry.name === 'node_modules') continue;
      results.push(...walkJsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

describe('Hotfix Regression Suite', () => {
  // 1a. Static guard against legacy fields on prisma.payslip
  it('Static check: no src file calls prisma.payslip or tx.payslip with legacy fields', () => {
    const srcDir = path.resolve(__dirname, '..');
    const files = walkJsFiles(srcDir);
    const legacyFieldRegex = /\b(month|year|userId_month_year|taxDeductions|unpaidLeaveDeduction)\b/;
    const violations = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (/(prisma|tx)\.payslip\./.test(lines[i])) {
          const snippet = lines.slice(i, i + 12).join('\n');
          if (legacyFieldRegex.test(snippet)) {
            violations.push(`${path.relative(srcDir, file)}:${i + 1}`);
          }
        }
      }
    }

    assert.deepEqual(
      violations,
      [],
      `Found legacy field usage with prisma.payslip/tx.payslip (must use legacyPayslip): ${violations.join(', ')}`
    );
  });

  // 2. Dashboard partial failure test
  describe('Dashboard partial failure resilience', () => {
    let origAgg, origUserCount, origDeptCount, origDeptFindMany, origAttFindMany, origLeaveCount;
    let origAttFindUnique, origLeaveGroupBy, origLegacyPayslipFindFirst, origUserFindUnique;

    beforeEach(() => {
      origAgg = prisma.legacyPayslip.aggregate;
      origUserCount = prisma.user.count;
      origDeptCount = prisma.department.count;
      origDeptFindMany = prisma.department.findMany;
      origAttFindMany = prisma.attendance.findMany;
      origLeaveCount = prisma.leaveRequest.count;
      origAttFindUnique = prisma.attendance.findUnique;
      origLeaveGroupBy = prisma.leaveRequest.groupBy;
      origLegacyPayslipFindFirst = prisma.legacyPayslip.findFirst;
      origUserFindUnique = prisma.user.findUnique;
    });

    afterEach(() => {
      prisma.legacyPayslip.aggregate = origAgg;
      prisma.user.count = origUserCount;
      prisma.department.count = origDeptCount;
      prisma.department.findMany = origDeptFindMany;
      prisma.attendance.findMany = origAttFindMany;
      prisma.leaveRequest.count = origLeaveCount;
      prisma.attendance.findUnique = origAttFindUnique;
      prisma.leaveRequest.groupBy = origLeaveGroupBy;
      prisma.legacyPayslip.findFirst = origLegacyPayslipFindFirst;
      prisma.user.findUnique = origUserFindUnique;
    });

    it('getAdminDashboard returns 200 with widgets.payslips.error = true when payslip widget throws', async () => {
      prisma.user.count = async () => 5;
      prisma.department.count = async () => 2;
      prisma.attendance.findMany = async () => [];
      prisma.leaveRequest.count = async () => 1;
      prisma.department.findMany = async () => [];
      prisma.legacyPayslip.aggregate = async () => {
        throw new Error('Simulated payslip table failure');
      };

      const req = { user: { userId: 'adm-1', role: 'ADMIN' } };
      let statusCode = 200;
      let payload = null;
      const res = {
        status(c) { statusCode = c; return this; },
        json(body) { payload = body; return this; },
      };

      await getAdminDashboard(req, res);

      assert.equal(statusCode, 200);
      assert.equal(payload.success, true);
      assert.equal(payload.data.summary.totalActiveEmployees, 5);
      assert.equal(payload.data.widgets.payslips.error, true);
      assert.equal(payload.data.widgets.headcount.error, false);
    });

    it('getEmployeeDashboard returns 200 with widgets.payslips.error = true when payslip widget throws', async () => {
      prisma.attendance.findUnique = async () => null;
      prisma.attendance.findMany = async () => [];
      prisma.leaveRequest.groupBy = async () => [];
      prisma.legacyPayslip.findFirst = async () => {
        throw new Error('Simulated employee payslip query failure');
      };
      prisma.user.findUnique = async () => ({
        id: 'emp-1',
        employeeCode: 'EMP-1',
        firstName: 'Test',
        lastName: 'Employee',
        email: 'emp@nexahr.test',
        role: 'EMPLOYEE',
        deletedAt: null,
        profile: null,
        salaryStructure: null,
      });

      const req = { user: { userId: 'emp-1', role: 'EMPLOYEE' } };
      let statusCode = 200;
      let payload = null;
      const res = {
        status(c) { statusCode = c; return this; },
        json(body) { payload = body; return this; },
      };

      await getEmployeeDashboard(req, res);

      assert.equal(statusCode, 200);
      assert.equal(payload.success, true);
      assert.equal(payload.data.widgets.payslips.error, true);
      assert.equal(payload.data.widgets.profile.error, false);
      assert.equal(payload.data.latestPayslip, null);
    });
  });

  // 3. Recruitment & Destructive Endpoints RBAC 401/403 Tests
  describe('Recruitment & Destructive Endpoints Security', () => {
    let server;
    let baseUrl;
    let origFindUnique;
    let origNodeEnv;
    let origAllowRecClear;
    let origAllowRecSeed;

    beforeEach(async () => {
      origFindUnique = prisma.user.findUnique;
      origNodeEnv = process.env.NODE_ENV;
      origAllowRecClear = process.env.ALLOW_RECRUITMENT_CLEAR;
      origAllowRecSeed = process.env.ALLOW_RECRUITMENT_SEED;
      cacheService.clear();

      await new Promise((resolve) => {
        server = http.createServer(app);
        server.listen(0, '127.0.0.1', () => {
          baseUrl = `http://127.0.0.1:${server.address().port}`;
          resolve();
        });
      });
    });

    afterEach(async () => {
      prisma.user.findUnique = origFindUnique;
      process.env.NODE_ENV = origNodeEnv;
      if (origAllowRecClear !== undefined) process.env.ALLOW_RECRUITMENT_CLEAR = origAllowRecClear;
      else delete process.env.ALLOW_RECRUITMENT_CLEAR;
      if (origAllowRecSeed !== undefined) process.env.ALLOW_RECRUITMENT_SEED = origAllowRecSeed;
      else delete process.env.ALLOW_RECRUITMENT_SEED;
      cacheService.clear();
      if (server) {
        await new Promise((resolve) => server.close(resolve));
      }
    });

    it('Unauthenticated requests to recruitment destructive routes return 401', async () => {
      const r1 = await fetch(`${baseUrl}/api/recruitment/clear-all`, { method: 'DELETE' });
      const r2 = await fetch(`${baseUrl}/api/recruitment/jobs`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      assert.equal(r1.status, 401);
      assert.equal(r2.status, 401);
    });

    it('EMPLOYEE role is rejected (403) on recruitment POST/DELETE/clear-all/seed', async () => {
      prisma.user.findUnique = async ({ where }) => ({
        id: where.id,
        email: 'emp@nexahr.test',
        firstName: 'Emp',
        lastName: 'User',
        role: 'EMPLOYEE',
        isActive: true,
        deletedAt: null,
        employeeCode: 'EMP-1',
        isDemo: false,
        mustChangePassword: false,
      });

      const empToken = generateToken({ userId: 'emp-1', role: 'EMPLOYEE', isDemo: false });
      const headers = { Authorization: `Bearer ${empToken}`, 'Content-Type': 'application/json' };

      const resJob = await fetch(`${baseUrl}/api/recruitment/jobs`, { method: 'POST', headers, body: JSON.stringify({ title: 'Test' }) });
      const resClear = await fetch(`${baseUrl}/api/recruitment/clear-all`, { method: 'DELETE', headers });
      const resSeed = await fetch(`${baseUrl}/api/recruitment/seed`, { method: 'POST', headers });

      assert.equal(resJob.status, 403);
      assert.equal(resClear.status, 403);
      assert.equal(resSeed.status, 403);
    });

    it('HR_MANAGER is rejected (403) on DELETE /api/recruitment/clear-all and POST /api/recruitment/seed', async () => {
      prisma.user.findUnique = async ({ where }) => ({
        id: where.id,
        email: 'hr@nexahr.test',
        firstName: 'HR',
        lastName: 'Manager',
        role: 'HR_MANAGER',
        isActive: true,
        deletedAt: null,
        employeeCode: 'EMP-HR',
        isDemo: false,
        mustChangePassword: false,
      });

      const hrToken = generateToken({ userId: 'hr-1', role: 'HR_MANAGER', isDemo: false });
      const headers = { Authorization: `Bearer ${hrToken}` };

      const resClear = await fetch(`${baseUrl}/api/recruitment/clear-all`, { method: 'DELETE', headers });
      const resSeed = await fetch(`${baseUrl}/api/recruitment/seed`, { method: 'POST', headers });

      assert.equal(resClear.status, 403);
      assert.equal(resSeed.status, 403);
    });

    it('ADMIN is rejected (403) on DELETE /api/recruitment/clear-all without ALLOW_RECRUITMENT_CLEAR=true or in production', async () => {
      prisma.user.findUnique = async ({ where }) => ({
        id: where.id,
        email: 'adm@nexahr.test',
        firstName: 'Sys',
        lastName: 'Admin',
        role: 'ADMIN',
        isActive: true,
        deletedAt: null,
        employeeCode: 'EMP-ADM',
        isDemo: false,
        mustChangePassword: false,
      });

      const admToken = generateToken({ userId: 'adm-1', role: 'ADMIN', isDemo: false });
      const headers = { Authorization: `Bearer ${admToken}` };

      delete process.env.ALLOW_RECRUITMENT_CLEAR;
      const resNoFlag = await fetch(`${baseUrl}/api/recruitment/clear-all`, { method: 'DELETE', headers });
      assert.equal(resNoFlag.status, 403);

      process.env.ALLOW_RECRUITMENT_CLEAR = 'true';
      process.env.NODE_ENV = 'production';
      const resProd = await fetch(`${baseUrl}/api/recruitment/clear-all`, { method: 'DELETE', headers });
      assert.equal(resProd.status, 403);
    });
  });
});
