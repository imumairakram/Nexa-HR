const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const prisma = require('../config/prisma');
const cacheService = require('../services/cache.service');
const notificationController = require('../controllers/notification.controller');
const recruitmentController = require('../controllers/recruitment.controller');

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

describe('Release Stabilize: Notifications & Recruitment Source Fixes', () => {
  const origNotificationUpdateMany = prisma.notification.updateMany;
  const origJobAppCount = prisma.jobApplication.count;
  const origJobAppFindUnique = prisma.jobApplication.findUnique;
  const origJobAppCreate = prisma.jobApplication.create;
  const origInvalidateTags = cacheService.invalidateTags;

  afterEach(() => {
    prisma.notification.updateMany = origNotificationUpdateMany;
    prisma.jobApplication.count = origJobAppCount;
    prisma.jobApplication.findUnique = origJobAppFindUnique;
    prisma.jobApplication.create = origJobAppCreate;
    cacheService.invalidateTags = origInvalidateTags;
  });

  it('PATCH /api/notifications/read-all marks only current user unread notifications read and invalidates cache', async () => {
    const store = [
      { id: 'n1', userId: 'user-a', isRead: false },
      { id: 'n2', userId: 'user-a', isRead: true },
      { id: 'n3', userId: 'user-b', isRead: false },
    ];
    let capturedArgs = null;
    let invalidated = null;

    prisma.notification.updateMany = async (args) => {
      capturedArgs = args;
      assert.ok(args.data && typeof args.data === 'object', 'updateMany must include data');
      let count = 0;
      for (const row of store) {
        if (row.userId === args.where.userId && row.isRead === args.where.isRead) {
          Object.assign(row, args.data);
          count++;
        }
      }
      return { count };
    };
    cacheService.invalidateTags = (tags) => {
      invalidated = tags;
    };

    const req = { user: { userId: 'user-a' } };
    const res = createMockRes();
    await notificationController.markAllAsRead(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.deepEqual(capturedArgs, {
      where: { userId: 'user-a', isRead: false },
      data: { isRead: true },
    });
    assert.deepEqual(invalidated, ['notifications']);
    assert.equal(store.find((n) => n.id === 'n1').isRead, true);
    assert.equal(store.find((n) => n.id === 'n3').isRead, false, 'other user notification must stay unread');
  });

  it('POST /api/recruitment/applications defaults omitted source to MANUAL (ATSPipeline payload)', async () => {
    let createdData = null;
    prisma.jobApplication.count = async () => 0;
    prisma.jobApplication.findUnique = async () => null;
    prisma.jobApplication.create = async ({ data }) => {
      createdData = data;
      return { id: 'app-1', ...data, jobOpening: null };
    };

    const req = {
      body: {
        name: 'Jane Candidate',
        email: 'jane@example.com',
        role: 'Backend Engineer',
        department: 'Engineering',
        location: 'Islamabad HQ',
        stage: 'APPLIED',
      },
    };
    const res = createMockRes();
    await recruitmentController.createApplication(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(createdData.source, 'MANUAL');
  });

  it('POST /api/recruitment/applications accepts valid enum source (case-insensitive)', async () => {
    let createdData = null;
    prisma.jobApplication.count = async () => 1;
    prisma.jobApplication.findUnique = async () => null;
    prisma.jobApplication.create = async ({ data }) => {
      createdData = data;
      return { id: 'app-2', ...data, jobOpening: null };
    };

    const req = {
      body: {
        name: 'Ali Raza',
        email: 'ali@example.com',
        role: 'Product Designer',
        department: 'Design',
        source: 'linkedin',
      },
    };
    const res = createMockRes();
    await recruitmentController.createApplication(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(createdData.source, 'LINKEDIN');
  });

  it('POST /api/recruitment/applications rejects invalid source with 400 instead of 500', async () => {
    let createCalled = false;
    prisma.jobApplication.create = async () => {
      createCalled = true;
      return {};
    };

    const req = {
      body: {
        name: 'Bad Source',
        email: 'bad@example.com',
        role: 'QA Engineer',
        department: 'Engineering',
        source: 'Manual Entry',
      },
    };
    const res = createMockRes();
    await recruitmentController.createApplication(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /Invalid application source/i);
    assert.equal(createCalled, false);
  });
});
