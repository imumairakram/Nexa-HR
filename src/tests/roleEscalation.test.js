const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const { installNetworkGuard } = require('./helpers/networkGuard');
installNetworkGuard();

const employeeRoutes = require('../routes/employee.routes');
const authRoutes = require('../routes/auth.routes');
const cacheService = require('../services/cache.service');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');

test('Fix 8: Role Escalation & Account Hardening', async (t) => {
  const app = express();
  app.use(express.json());
  app.use('/api/employees', employeeRoutes);
  app.use('/api/auth', authRoutes);

  let server;
  let baseUrl;

  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}/api`;
      resolve();
    });
  });

  // Test accounts
  const soleAdmin = {
    id: 'user-sole-admin-1',
    email: 'admin.only@example.com',
    role: 'ADMIN',
    isActive: true,
    isDemo: false,
  };

  const hrManager = {
    id: 'user-hr-manager-1',
    email: 'hr.manager@example.com',
    role: 'HR_MANAGER',
    isActive: true,
    isDemo: false,
  };

  const employee = {
    id: 'user-employee-1',
    email: 'dev.staff@example.com',
    role: 'EMPLOYEE',
    isActive: true,
    isDemo: false,
  };

  // Cache users for token auth
  cacheService.setCachedUser(soleAdmin.id, soleAdmin);
  cacheService.setCachedUser(hrManager.id, hrManager);
  cacheService.setCachedUser(employee.id, employee);

  const adminToken = generateToken({ userId: soleAdmin.id, role: 'ADMIN', isDemo: false });
  const hrToken = generateToken({ userId: hrManager.id, role: 'HR_MANAGER', isDemo: false });
  const empToken = generateToken({ userId: employee.id, role: 'EMPLOYEE', isDemo: false });

  // Save original prisma methods
  const origFindUnique = prisma.user.findUnique;
  const origFindFirst = prisma.user.findFirst;
  const origCount = prisma.user.count;
  const origDelete = prisma.user.delete;

  t.after(() => {
    if (server) server.close();
    prisma.user.findUnique = origFindUnique;
    prisma.user.findFirst = origFindFirst;
    prisma.user.count = origCount;
    prisma.user.delete = origDelete;
  });

  await t.test('HR_MANAGER cannot create an ADMIN account (onboard)', async () => {
    const res = await fetch(`${baseUrl}/employees/onboard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({
        email: 'new.admin@example.com',
        firstName: 'New',
        lastName: 'Admin',
        role: 'ADMIN',
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.message, /HR Managers are only permitted to create Employee accounts/i);
  });

  await t.test('HR_MANAGER cannot edit an ADMIN account', async () => {
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === soleAdmin.id) {
        return { ...soleAdmin, profile: null, salaryStructure: null };
      }
      return null;
    };

    const res = await fetch(`${baseUrl}/employees/${soleAdmin.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({
        firstName: 'ModifiedAdminName',
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.message, /HR Managers are only permitted to edit Employee accounts/i);
  });

  await t.test('HR_MANAGER cannot promote an employee to ADMIN or HR_MANAGER', async () => {
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === employee.id) {
        return { ...employee, profile: null, salaryStructure: null };
      }
      return null;
    };

    const resAdmin = await fetch(`${baseUrl}/employees/${employee.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({
        role: 'ADMIN',
      }),
    });

    assert.equal(resAdmin.status, 403);
    const bodyAdmin = await resAdmin.json();
    assert.match(bodyAdmin.message, /Only an Administrator can assign or promote accounts/i);

    const resHR = await fetch(`${baseUrl}/employees/${employee.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${hrToken}`,
      },
      body: JSON.stringify({
        role: 'HR_MANAGER',
      }),
    });

    assert.equal(resHR.status, 403);
    const bodyHR = await resHR.json();
    assert.match(bodyHR.message, /Only an Administrator can assign or promote accounts/i);
  });

  await t.test('HR_MANAGER cannot delete an ADMIN account', async () => {
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === soleAdmin.id) {
        return { ...soleAdmin };
      }
      return null;
    };

    const res = await fetch(`${baseUrl}/employees/${soleAdmin.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${hrToken}`,
      },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.message, /HR Managers are only permitted to delete Employee accounts/i);
  });

  await t.test('ADMIN cannot demote themselves if they are the last active ADMIN', async () => {
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === soleAdmin.id) {
        return { ...soleAdmin, profile: null, salaryStructure: null };
      }
      return null;
    };

    prisma.user.count = async ({ where }) => {
      if (where?.role === 'ADMIN' && where?.isActive === true) {
        return 1; // Only 1 active ADMIN in the entire system
      }
      return 0;
    };

    const res = await fetch(`${baseUrl}/employees/${soleAdmin.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        role: 'EMPLOYEE',
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    // Either "You cannot change your own role." or "The last active Administrator cannot be demoted or deactivated."
    assert.ok(
      body.message.includes('You cannot change your own role') ||
      body.message.includes('last active Administrator cannot be demoted')
    );
  });

  await t.test('ADMIN cannot deactivate themselves if they are the last active ADMIN', async () => {
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === soleAdmin.id) {
        return { ...soleAdmin, profile: null, salaryStructure: null };
      }
      return null;
    };

    prisma.user.count = async ({ where }) => {
      if (where?.role === 'ADMIN' && where?.isActive === true) {
        return 1;
      }
      return 0;
    };

    const res = await fetch(`${baseUrl}/employees/${soleAdmin.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        isActive: false,
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.message, /last active Administrator cannot be demoted or deactivated/i);
  });

  await t.test('ADMIN cannot delete themselves if they are the last active ADMIN', async () => {
    prisma.user.findUnique = async ({ where }) => {
      if (where.id === soleAdmin.id) {
        return { ...soleAdmin };
      }
      return null;
    };

    prisma.user.count = async ({ where }) => {
      if (where?.role === 'ADMIN' && where?.isActive === true) {
        return 1;
      }
      return 0;
    };

    const res = await fetch(`${baseUrl}/employees/${soleAdmin.id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.message, /last active Administrator cannot be deleted/i);
  });

  await t.test('Self role change is rejected even if multiple admins exist', async () => {
    const admin2 = {
      id: 'user-admin-2',
      email: 'admin2@example.com',
      role: 'ADMIN',
      isActive: true,
      isDemo: false,
    };
    cacheService.setCachedUser(admin2.id, admin2);
    const admin2Token = generateToken({ userId: admin2.id, role: 'ADMIN', isDemo: false });

    prisma.user.findUnique = async ({ where }) => {
      if (where.id === admin2.id) {
        return { ...admin2, profile: null, salaryStructure: null };
      }
      return null;
    };

    prisma.user.count = async () => 2; // 2 admins exist

    const res = await fetch(`${baseUrl}/employees/${admin2.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${admin2Token}`,
      },
      body: JSON.stringify({
        role: 'EMPLOYEE',
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.match(body.message, /You cannot change your own role/i);
  });

  await t.test('Client-supplied role on self-profile update (/api/auth/profile) is rejected with 400', async () => {
    const res = await fetch(`${baseUrl}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${empToken}`,
      },
      body: JSON.stringify({
        firstName: 'Staff',
        role: 'ADMIN',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.match(body.message, /Role modification is not permitted/i);
  });
});

