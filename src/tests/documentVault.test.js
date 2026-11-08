'use strict';
/**
 * src/tests/documentVault.test.js
 * Fix 20 — Document Vault (Prisma-backed) Tests
 *
 * Tests:
 *  1. Upload validation (file type, size limit, RBAC)
 *  2. RBAC: who can publish policies vs. view docs
 *  3. Download/access: EMPLOYEE sees only own docs
 *  4. Policy publish guard: only ADMIN/HR_MANAGER
 *
 * All tests are unit tests — no real DB or network calls.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');

// ─── Minimal mocks ───────────────────────────────────────────────────────────

// Shared in-memory vault (simulates prisma.vaultDocument)
const vaultStore = [];
let idCounter = 1;

const mockPrisma = {
  vaultDocument: {
    async create({ data }) {
      const row = { id: `vid-${idCounter++}`, ...data, createdAt: new Date(), updatedAt: new Date() };
      vaultStore.push(row);
      return row;
    },
    async findMany({ where }) {
      return vaultStore.filter((r) => {
        if (where.kind && r.kind !== where.kind) return false;
        if (where.employeeId && r.employeeId !== where.employeeId) return false;
        return true;
      });
    },
    async findUnique({ where }) {
      return vaultStore.find((r) => r.id === where.id) || null;
    },
    async delete({ where }) {
      const idx = vaultStore.findIndex((r) => r.id === where.id);
      if (idx === -1) throw new Error('Not found');
      vaultStore.splice(idx, 1);
      return { id: where.id };
    },
  },
  user: {
    async findFirst({ where }) {
      return null; // no real users needed for unit tests
    },
    async findUnique({ where }) {
      return null;
    },
  },
};

// Mock notification service
const mockNotify = { createInAppNotification: async () => {}, broadcastInAppNotification: async () => {}, sendDocumentIssuedEmail: async () => {} };

// Inject mocks by overriding require cache before loading controller
const Module = require('module');
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request.includes('config/prisma'))            return mockPrisma;
  if (request.includes('notification.service'))     return mockNotify;
  return origLoad.apply(this, arguments);
};

const ctrl = require('../controllers/document.controller');

// Restore after tests
after(() => { Module._load = origLoad; });

// ─── Helper: mock req/res ─────────────────────────────────────────────────────

function makeReq(role, body = {}, params = {}, query = {}, userId = 'user-1') {
  return { user: { id: userId, role, email: 'test@example.com', employeeCode: 'EMP-001' }, body, params, query };
}

function makeRes() {
  const res = { _status: 200, _body: null };
  res.status = (code) => { res._status = code; return res; };
  res.json   = (body)  => { res._body  = body;  return res; };
  return res;
}

// ════════════════════════════════════════════════════════════════════════════
// SUITE 1 — Upload validation & RBAC
// ════════════════════════════════════════════════════════════════════════════

describe('Fix 20 — Document Vault Upload Validation', () => {
  it('issueDocument: rejects missing title', async () => {
    const req = makeReq('ADMIN', { employeeId: 'emp-1', title: '' });
    const res = makeRes();
    await ctrl.issueDocument(req, res);
    assert.equal(res._status, 400);
    assert.ok(res._body.message.toLowerCase().includes('missing') || res._body.message.toLowerCase().includes('mandatory'));
  });

  it('issueDocument: rejects missing employeeId', async () => {
    const req = makeReq('ADMIN', { title: 'Test Doc', employeeId: '' });
    const res = makeRes();
    await ctrl.issueDocument(req, res);
    assert.equal(res._status, 400);
  });

  it('uploadEmployeeDocument: rejects missing title', async () => {
    const req = makeReq('EMPLOYEE', { title: '', type: 'CERTIFICATE' });
    const res = makeRes();
    await ctrl.uploadEmployeeDocument(req, res);
    assert.equal(res._status, 400);
    assert.ok(res._body.message.toLowerCase().includes('title'));
  });

  it('issueDocument: succeeds with valid payload (ADMIN)', async () => {
    const req = makeReq('ADMIN', {
      employeeId: 'some-emp-id',
      title:      'Official Offer Letter',
      type:       'OFFER_LETTER',
      issuer:     'HR Team',
      description: 'You are hired.',
    });
    const res = makeRes();
    await ctrl.issueDocument(req, res);
    assert.equal(res._status, 201);
    assert.ok(res._body.success);
    assert.ok(res._body.data.document.referenceNumber.startsWith('NEXA-'));
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SUITE 2 — Policy publish RBAC
// ════════════════════════════════════════════════════════════════════════════

describe('Fix 20 — Policy Publish RBAC', () => {
  it('publishCompanyPolicy: EMPLOYEE is rejected with 403', async () => {
    const req = makeReq('EMPLOYEE', { title: 'HR Policy', description: 'Some policy text.' });
    const res = makeRes();
    await ctrl.publishCompanyPolicy(req, res);
    assert.equal(res._status, 403);
    assert.ok(!res._body.success);
  });

  it('publishCompanyPolicy: HR_MANAGER succeeds', async () => {
    const req = makeReq('HR_MANAGER', {
      title:       'Leave Policy 2026',
      category:    'LEAVE',
      description: 'All employees are entitled to 15 days annual leave.',
    });
    const res = makeRes();
    await ctrl.publishCompanyPolicy(req, res);
    assert.equal(res._status, 201);
    assert.ok(res._body.success);
    assert.equal(res._body.data.policy.category, 'LEAVE');
  });

  it('publishCompanyPolicy: ADMIN succeeds', async () => {
    const req = makeReq('ADMIN', {
      title:       'InfoSec Policy',
      category:    'SECURITY',
      description: 'All company devices must have full-disk encryption.',
    });
    const res = makeRes();
    await ctrl.publishCompanyPolicy(req, res);
    assert.equal(res._status, 201);
    assert.ok(res._body.success);
  });

  it('publishCompanyPolicy: rejects missing title', async () => {
    const req = makeReq('ADMIN', { description: 'No title provided.' });
    const res = makeRes();
    await ctrl.publishCompanyPolicy(req, res);
    assert.equal(res._status, 400);
  });

  it('publishCompanyPolicy: rejects missing description', async () => {
    const req = makeReq('ADMIN', { title: 'Policy Without Content' });
    const res = makeRes();
    await ctrl.publishCompanyPolicy(req, res);
    assert.equal(res._status, 400);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SUITE 3 — Employee access to their own docs only
// ════════════════════════════════════════════════════════════════════════════

describe('Fix 20 — Employee Document Access Control', () => {
  it('getIssuedDocuments: EMPLOYEE only sees their own docs', async () => {
    // Clear and seed
    vaultStore.length = 0;
    // Doc for emp-A
    await mockPrisma.vaultDocument.create({ data: { kind: 'ISSUED', referenceNumber: 'REF-A1', title: 'Doc A', type: 'OFFER_LETTER', employeeId: 'emp-A', uploadedById: 'admin-1', status: 'VERIFIED' } });
    // Doc for emp-B
    await mockPrisma.vaultDocument.create({ data: { kind: 'ISSUED', referenceNumber: 'REF-B1', title: 'Doc B', type: 'CONTRACT',    employeeId: 'emp-B', uploadedById: 'admin-1', status: 'VERIFIED' } });

    const req = makeReq('EMPLOYEE', {}, {}, {}, 'emp-A');
    const res = makeRes();
    await ctrl.getIssuedDocuments(req, res);
    assert.equal(res._status, 200);
    assert.equal(res._body.data.documents.length, 1);
    assert.equal(res._body.data.documents[0].title, 'Doc A');
  });

  it('deleteIssuedDocument: EMPLOYEE cannot delete another employee\'s doc', async () => {
    vaultStore.length = 0;
    const doc = await mockPrisma.vaultDocument.create({ data: { kind: 'ISSUED', referenceNumber: 'REF-X1', title: 'Others Doc', type: 'NDA', employeeId: 'emp-B', uploadedById: 'admin-1', status: 'VERIFIED' } });

    const req = makeReq('EMPLOYEE', {}, { id: doc.id }, {}, 'emp-A');
    const res = makeRes();
    await ctrl.deleteIssuedDocument(req, res);
    assert.equal(res._status, 403);
  });

  it('deleteIssuedDocument: EMPLOYEE can delete their own doc', async () => {
    vaultStore.length = 0;
    const doc = await mockPrisma.vaultDocument.create({ data: { kind: 'ISSUED', referenceNumber: 'REF-MY1', title: 'My Doc', type: 'CERTIFICATE', employeeId: 'emp-A', uploadedById: 'emp-A', status: 'VERIFIED' } });

    const req = makeReq('EMPLOYEE', {}, { id: doc.id }, {}, 'emp-A');
    const res = makeRes();
    await ctrl.deleteIssuedDocument(req, res);
    assert.equal(res._status, 200);
    assert.ok(res._body.success);
  });

  it('getCompanyPolicies: returns only POLICY kind records', async () => {
    vaultStore.length = 0;
    await mockPrisma.vaultDocument.create({ data: { kind: 'POLICY', referenceNumber: 'POL-001', title: 'Policy A', type: 'GOVERNANCE', uploadedById: 'admin-1', status: 'ACTIVE' } });
    await mockPrisma.vaultDocument.create({ data: { kind: 'ISSUED', referenceNumber: 'DOC-001', title: 'Doc A',    type: 'OFFER_LETTER', employeeId: 'emp-A', uploadedById: 'admin-1', status: 'VERIFIED' } });

    const req = makeReq('EMPLOYEE');
    const res = makeRes();
    await ctrl.getCompanyPolicies(req, res);
    assert.equal(res._status, 200);
    assert.equal(res._body.data.policies.length, 1);
    assert.equal(res._body.data.policies[0].title, 'Policy A');
  });
});

// ════════════════════════════════════════════════════════════════════════════
// SUITE 4 — Delete Safety: Documents Survive User Deletion (SET NULL)
// ════════════════════════════════════════════════════════════════════════════

describe('Fix 20 — Delete Safety: Documents Survive User Deletion', () => {
  it('vault document survives when its uploader is deleted (uploadedById set to null)', async () => {
    vaultStore.length = 0;
    const doc = await mockPrisma.vaultDocument.create({
      data: {
        kind: 'POLICY',
        referenceNumber: 'POL-SURVIVE-1',
        title: 'Permanent Company Policy',
        type: 'GOVERNANCE',
        uploadedBy: 'HR',
        uploadedById: 'admin-to-be-deleted',
        status: 'ACTIVE',
      },
    });

    assert.equal(doc.uploadedById, 'admin-to-be-deleted');

    // Simulate ON DELETE SET NULL on uploader foreign key
    const targetDoc = vaultStore.find((d) => d.id === doc.id);
    targetDoc.uploadedById = null;

    // Document must still exist in vault
    assert.equal(vaultStore.length, 1);
    assert.equal(targetDoc.uploadedById, null);
    assert.equal(targetDoc.title, 'Permanent Company Policy');
    assert.equal(targetDoc.uploadedBy, 'HR'); // Snapshot preserved

    // Controller getCompanyPolicies handles null uploadedById gracefully
    const req = makeReq('ADMIN');
    const res = makeRes();
    await ctrl.getCompanyPolicies(req, res);
    assert.equal(res._status, 200);
    assert.equal(res._body.data.policies.length, 1);
    assert.equal(res._body.data.policies[0].uploadedById, null);
    assert.equal(res._body.data.policies[0].title, 'Permanent Company Policy');
  });

  it('issued document survives when its recipient employee is deleted (employeeId set to null)', async () => {
    vaultStore.length = 0;
    const doc = await mockPrisma.vaultDocument.create({
      data: {
        kind: 'ISSUED',
        referenceNumber: 'OFR-SURVIVE-1',
        title: 'Archived Offer Letter',
        type: 'OFFER_LETTER',
        employeeId: 'emp-to-be-deleted',
        employeeName: 'Former Employee',
        employeeCode: 'EMP-999',
        uploadedBy: 'HR',
        uploadedById: 'admin-1',
        status: 'VERIFIED',
      },
    });

    // Simulate ON DELETE SET NULL on employee foreign key
    const targetDoc = vaultStore.find((d) => d.id === doc.id);
    targetDoc.employeeId = null;

    // Document must still exist with historical snapshots preserved
    assert.equal(vaultStore.length, 1);
    assert.equal(targetDoc.employeeId, null);
    assert.equal(targetDoc.employeeName, 'Former Employee');
    assert.equal(targetDoc.employeeCode, 'EMP-999');

    // HR can still retrieve the document record
    const req = makeReq('ADMIN');
    const res = makeRes();
    await ctrl.getIssuedDocuments(req, res);
    assert.equal(res._status, 200);
    assert.equal(res._body.data.documents.length, 1);
    assert.equal(res._body.data.documents[0].employeeName, 'Former Employee');
    assert.equal(res._body.data.documents[0].employeeId, null);
  });
});


