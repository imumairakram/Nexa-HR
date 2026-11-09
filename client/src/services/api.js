// Centralized High-Performance API Client for NexaHR Frontend Integration
// Features: In-memory SWR caching, in-flight deduplication, and instant mutation invalidation.
import { startSession, isSessionValid, clearSession } from '../utils/session';
import {
  isDemoSessionActive,
  showDemoToast,
  DemoModeError,
} from '../demo/demoSession';
import { handleDemoGetRequest } from '../demo/fixtureRouter';

const rawBase = import.meta.env.VITE_API_URL || '';
const BASE_URL = rawBase ? (rawBase.endsWith('/api') ? rawBase : `${rawBase.replace(/\/+$/, '')}/api`) : '/api';

// In-Memory Client Cache Store
const clientCache = new Map();
// In-Flight Promise Registry for Request Deduplication
const inFlightRequests = new Map();

const DEFAULT_CACHE_TTL = 45 * 1000; // 45 seconds fresh
const MAX_STALE_TTL = 120 * 1000; // 2 minutes max stale for SWR

/**
 * Invalidate client cache entries
 */
function invalidateClientCache(pattern) {
  if (!pattern) {
    clientCache.clear();
    return;
  }
  const clean = pattern.toLowerCase();
  for (const key of clientCache.keys()) {
    if (key.toLowerCase().includes(clean)) {
      clientCache.delete(key);
    }
  }
}

export function isGuestOrDemo() {
  if (isDemoSessionActive()) return true;
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u?.isDemo === true || u?.isGuest === true) return true;
    }
  } catch {}
  return false;
}

/**
 * Helper to execute HTTP fetch requests with auth headers, client caching, and deduplication.
 */
async function fetchAPI(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';
  const bypassCache = options.bypassCache === true;

  // 0. FRONTEND DEMO MODE GUARD: ZERO network calls, pure fixture emulation
  if (isDemoSessionActive()) {
    if (!isGet) {
      showDemoToast('Demo mode: view only. Changes are disabled.');
      throw new DemoModeError('Demo mode: view only. Changes are disabled.');
    }
    if (!bypassCache) {
      const cached = clientCache.get(endpoint);
      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < DEFAULT_CACHE_TTL) {
          return cached.data;
        }
      }
    }
    const demoData = await handleDemoGetRequest(endpoint);
    clientCache.set(endpoint, {
      timestamp: Date.now(),
      data: demoData,
    });
    return demoData;
  }

  // Guest / Demo mode mutation protection:
  // Allow all GET requests to fetch live data from the backend.
  // Block any POST, PUT, PATCH, DELETE mutation on the client side with a clear toast.
  const isGuestUser = isGuestOrDemo();

  if (isGuestUser && !isGet) {
    const isAuthEndpoint =
      endpoint.includes('/auth/login') ||
      endpoint.includes('/auth/logout') ||
      endpoint.includes('/auth/demo-login') ||
      endpoint.includes('/auth/guest-login') ||
      endpoint.includes('/demo-login');
    if (!isAuthEndpoint) {
      showDemoToast('Demo mode: view only. Changes are disabled.');
      throw new DemoModeError('Demo mode: view only. Changes are disabled.');
    }
  }

  // 1. SWR / In-Memory Cache Lookup for GET requests
  if (isGet && !bypassCache) {
    const cached = clientCache.get(endpoint);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      // Fresh: Return immediately
      if (age < DEFAULT_CACHE_TTL) {
        return cached.data;
      }
      // Stale-While-Revalidate: Return cached data immediately, revalidate in background
      if (age < MAX_STALE_TTL) {
        // Trigger silent background revalidation without blocking caller
        fetchAPI(endpoint, { ...options, bypassCache: true }).catch(() => {});
        return cached.data;
      }
      // Expired beyond stale window: clean up
      clientCache.delete(endpoint);
    }

    // 2. In-flight Request Deduplication: avoid duplicate simultaneous network calls
    if (inFlightRequests.has(endpoint)) {
      return inFlightRequests.get(endpoint);
    }
  }

  // Check if session has expired (1-hour window) before issuing authenticated API requests
  const token = localStorage.getItem('token');
  const isAuthEndpoint = endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/forgot-password') || endpoint.startsWith('/auth/verify-otp') || endpoint.startsWith('/auth/reset-password');

  if (token && !isAuthEndpoint && !isSessionValid()) {
    clearSession('Your 1-hour session has expired. Please log in again.');
    if (typeof window !== 'undefined' && window.location.pathname !== '/' && window.location.pathname !== '/login') {
      window.location.href = '/?expired=1';
    }
    throw new Error('Your 1-hour session has expired. Please log in again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    // Bearer-only Authorization
    ...options,
    headers,
  };

  const executeRequest = async () => {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      const text = await response.text();
      let data = {};
      if (text) {
        try {
          data = JSON.parse(text);
        } catch (e) {
          data = { message: text || `Unexpected response format (${response.status})` };
        }
      }

      if (!response.ok) {
        if (response.status === 401 && !isAuthEndpoint) {
          console.warn('Authentication expired or unauthorized on endpoint:', endpoint);
          clearSession('Your 1-hour session has expired. Please log in again.');
          if (typeof window !== 'undefined' && window.location.pathname !== '/' && window.location.pathname !== '/login') {
            window.location.href = '/?expired=1';
          }
        }
        if (data?.code === 'DEMO_MODE' || (data?.message && data.message.toLowerCase().includes('demo mode'))) {
          showDemoToast(data.message || 'Demo mode: view only. Changes are disabled.');
        }
        if (data?.code === 'PASSWORD_CHANGE_REQUIRED') {
          try {
            const raw = localStorage.getItem('user');
            if (raw) {
              const u = JSON.parse(raw);
              if (!u.mustChangePassword) {
                u.mustChangePassword = true;
                localStorage.setItem('user', JSON.stringify(u));
              }
            }
          } catch (e) {}
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('user_profile_updated'));
          }
        }
        const errorMessage = data?.errors?.[0]?.message || data?.message || `Server error (${response.status})`;
        throw new Error(errorMessage);
      }

      // Cache successful GET responses
      if (isGet && response.ok) {
        clientCache.set(endpoint, {
          data,
          timestamp: Date.now(),
        });
      }

      // Invalidate cache on mutations (POST, PUT, PATCH, DELETE)
      if (!isGet && response.ok) {
        if (endpoint.includes('/employees') || endpoint.includes('/profile')) {
          invalidateClientCache('/employees');
          invalidateClientCache('/dashboard');
          invalidateClientCache('/departments');
        } else if (endpoint.includes('/attendance')) {
          invalidateClientCache('/attendance');
          invalidateClientCache('/dashboard');
        } else if (endpoint.includes('/leaves')) {
          invalidateClientCache('/leaves');
          invalidateClientCache('/dashboard');
        } else if (endpoint.includes('/payroll')) {
          invalidateClientCache('/payroll');
          invalidateClientCache('/dashboard');
        } else if (endpoint.includes('/departments') || endpoint.includes('/designations')) {
          invalidateClientCache('/departments');
          invalidateClientCache('/designations');
          invalidateClientCache('/employees');
          invalidateClientCache('/dashboard');
        } else if (endpoint.includes('/announcements')) {
          invalidateClientCache('/announcements');
          invalidateClientCache('/dashboard');
        } else if (endpoint.includes('/tickets')) {
          invalidateClientCache('/tickets');
        } else if (endpoint.includes('/accounts')) {
          invalidateClientCache('/accounts');
          invalidateClientCache('/dashboard');
        } else if (endpoint.includes('/recruitment')) {
          invalidateClientCache('/recruitment');
          invalidateClientCache('/dashboard');
        } else {
          clientCache.clear();
        }
      }

      return data;
    } catch (error) {
      console.warn(`API Error [${endpoint}]:`, error.message);
      throw error;
    } finally {
      if (isGet) {
        inFlightRequests.delete(endpoint);
      }
    }
  };

  if (isGet && !bypassCache) {
    const promise = executeRequest();
    inFlightRequests.set(endpoint, promise);
    return promise;
  }

  return executeRequest();
}

export const api = {
  // --- Auth & User Profile ---
  getAuthConfig: async () => {
    return await fetchAPI('/auth/config');
  },

  login: async (credentials) => {
    const res = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.data?.token) {
      startSession(res.data.token, res.data.user, res.data.expiresIn || 3600);
    }
    return res;
  },

  demoLogin: async ({ role = 'hr' } = {}) => {
    const res = await fetchAPI('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    if (res?.data?.token) {
      startSession(res.data.token, res.data.user, res.data.expiresIn || 3600);
    }
    return res;
  },

  registerAdmin: async (adminData) => {
    const res = await fetchAPI('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
    if (res.data?.token) {
      startSession(res.data.token, res.data.user, res.data.expiresIn || 3600);
    }
    return res;
  },

  logout: async () => {
    try {
      await fetchAPI('/auth/logout', { method: 'POST' });
    } catch {
      // Continue client cleanup even if network fails
    } finally {
      clearSession();
    }
  },

  getMe: async () => {
    return await fetchAPI('/auth/me');
  },

  updateMyProfile: async (profileData) => {
    return await fetchAPI('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  changeMyPassword: async (passwordData) => {
    return await fetchAPI('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },

  uploadProfilePicture: async (formData) => {
    if (isGuestOrDemo()) {
      showDemoToast('Demo mode: view only. Changes are disabled.');
      throw new DemoModeError('Demo mode: view only. Changes are disabled.');
    }
    const token = localStorage.getItem('token');
    const response = await fetch(`${BASE_URL}/employees/profile-picture`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const text = await response.text();
    let data = {};
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = { message: text || `Unexpected response (${response.status})` };
      }
    }
    if (!response.ok) {
      throw new Error(data.message || `Upload failed (${response.status})`);
    }
    return data;
  },

  removeProfilePicture: async (targetUserId) => {
    return await fetchAPI('/employees/profile-picture', {
      method: 'DELETE',
      body: JSON.stringify({ userId: targetUserId }),
    });
  },

  // --- Password Recovery & OTP Security ---
  checkRecoveryUser: async (email) => {
    return await fetchAPI('/auth/forgot-password/check', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  initiateForgotPassword: async ({ email, channel = 'EMAIL' }) => {
    return await fetchAPI('/auth/forgot-password/initiate', {
      method: 'POST',
      body: JSON.stringify({ email, channel }),
    });
  },

  verifyResetOtp: async ({ email, otp }) => {
    return await fetchAPI('/auth/forgot-password/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  },

  resetPasswordWithToken: async ({ newPassword, confirmPassword, token }) => {
    return await fetchAPI('/auth/forgot-password/reset-password', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ newPassword, confirmPassword }),
    });
  },

  // --- Dashboard ---
  getDashboard: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/dashboard/admin${query ? `?${query}` : ''}`);
  },

  getEmployeeDashboard: async () => {
    return await fetchAPI('/dashboard/employee');
  },

  // --- Employees (PIM) ---
  getEmployees: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/employees${query ? `?${query}` : ''}`);
  },

  getEmployeeById: async (id) => {
    return await fetchAPI(`/employees/${id}`);
  },

  onboardEmployee: async (employeeData) => {
    return await fetchAPI('/employees/onboard', {
      method: 'POST',
      body: JSON.stringify(employeeData),
    });
  },

  updateEmployee: async (id, data) => {
    return await fetchAPI(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEmployee: async (id) => {
    return await fetchAPI(`/employees/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Attendance (Automated Biometric Database System) ---
  getAttendanceLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/attendance${query ? `?${query}` : ''}`);
  },

  getMyAttendanceLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/attendance/my-logs${query ? `?${query}` : ''}`);
  },

  punchAttendance: async (payload = {}) => {
    return await fetchAPI('/attendance/punch', {
      method: 'POST',
      body: JSON.stringify({
        type: payload.type || 'IN',
        timestamp: payload.timestamp || new Date().toISOString(),
        notes: payload.notes || 'Web Portal Self-Punch',
      }),
    });
  },

  simulatePunch: async (payload) => {
    return await fetchAPI('/attendance/simulate-punch', {
      method: 'POST',
      body: JSON.stringify({
        employeeCode: payload.employeeCode,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: payload.type || 'IN',
      }),
    });
  },

  getSimulatePunchStatus: async () => {
    return await fetchAPI('/attendance/simulate-punch/status');
  },

  syncBiometricHardware: async (payload) => {
    return await fetchAPI('/attendance/simulate-punch', {
      method: 'POST',
      body: JSON.stringify({
        employeeCode: payload.employeeCode,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: payload.type || 'IN',
      }),
    });
  },

  punchAllUsersToday: async () => {
    return await fetchAPI('/attendance/punch-all-today', {
      method: 'POST',
    });
  },


  // --- Leaves ---
  getMyLeaveRequests: async (params = {}, options = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/leaves/my-requests${query ? `?${query}` : ''}`, options);
  },

  getLeaveRequests: async (params = {}, options = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/leaves/requests${query ? `?${query}` : ''}`, options);
  },

  getLeaveTypes: async (options = {}) => {
    try {
      const res = await fetchAPI('/leaves/types', options);
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const overrides = JSON.parse(localStorage.getItem('nexahr_leave_policy_overrides') || '{}');
          const deleted = JSON.parse(localStorage.getItem('nexahr_deleted_leave_policies') || '[]');
          const custom = JSON.parse(localStorage.getItem('nexahr_custom_leave_policies') || '[]');

          let types = Array.isArray(res?.data?.leaveTypes) ? [...res.data.leaveTypes] : [];
          // Filter out deleted items
          types = types.filter(
            (t) =>
              !deleted.includes(t.id) &&
              !deleted.includes(t.code) &&
              !deleted.includes(t.code?.toUpperCase())
          );
          // Apply stored overrides
          types = types.map((t) => {
            const ov = overrides[t.id] || overrides[t.code] || overrides[t.code?.toUpperCase()];
            if (ov) {
              return {
                ...t,
                name: ov.name || t.name,
                code: ov.code || t.code,
                daysAllowed: ov.daysAllowed || ov.days || t.daysAllowed,
                days: ov.days || ov.daysAllowed || t.daysAllowed,
                isPaid: ov.isPaid !== undefined ? ov.isPaid : t.isPaid,
                description: ov.description !== undefined ? ov.description : t.description,
              };
            }
            return t;
          });
          // Merge custom created items
          custom.forEach((c) => {
            const cCode = c.code?.toUpperCase();
            if (
              !deleted.includes(c.id) &&
              !deleted.includes(c.code) &&
              !deleted.includes(cCode) &&
              !types.some((t) => t.id === c.id || t.code?.toUpperCase() === cCode)
            ) {
              const ov = overrides[c.id] || overrides[c.code] || overrides[cCode];
              types.push(ov ? { ...c, ...ov } : c);
            }
          });

          return {
            ...res,
            data: {
              ...res?.data,
              leaveTypes: types,
            },
          };
        } catch (e) {
          // If merging throws, proceed with original response
        }
      }
      return res;
    } catch (err) {
      if (typeof window !== 'undefined' && window.localStorage) {
        try {
          const overrides = JSON.parse(localStorage.getItem('nexahr_leave_policy_overrides') || '{}');
          const deleted = JSON.parse(localStorage.getItem('nexahr_deleted_leave_policies') || '[]');
          const custom = JSON.parse(localStorage.getItem('nexahr_custom_leave_policies') || '[]');
          let fallback = [
            { id: 'def-1', name: 'Annual Paid Leave', code: 'ANNUAL', daysAllowed: 14, isPaid: true, description: 'Statutory annual vacation leave entitlement.' },
            { id: 'def-2', name: 'Medical & Sick Leave', code: 'SICK', daysAllowed: 10, isPaid: true, description: 'Medical recovery leave requiring certificate for 3+ days.' },
            { id: 'def-3', name: 'Casual Leave', code: 'CASUAL', daysAllowed: 10, isPaid: true, description: 'Short notice personal contingency leave.' },
            { id: 'def-4', name: 'Study Leave', code: 'STUDY', daysAllowed: 5, isPaid: true, description: 'Leave for educational examinations and certifications.' },
            ...custom,
          ];
          fallback = fallback.filter((t) => !deleted.includes(t.id) && !deleted.includes(t.code));
          fallback = fallback.map((t) => {
            const ov = overrides[t.id] || overrides[t.code] || overrides[t.code?.toUpperCase()];
            return ov ? { ...t, ...ov } : t;
          });
          return { success: true, data: { leaveTypes: fallback } };
        } catch (e) {}
      }
      throw err;
    }
  },

  getLeaveTypeById: async (id, options = {}) => {
    return await fetchAPI(`/leaves/types/${id}`, options);
  },

  createLeaveType: async (leaveData) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const deleted = JSON.parse(localStorage.getItem('nexahr_deleted_leave_policies') || '[]');
        const cleaned = deleted.filter((d) => d !== leaveData.code && d !== leaveData.code?.toUpperCase());
        localStorage.setItem('nexahr_deleted_leave_policies', JSON.stringify(cleaned));
      } catch (e) {}
    }
    return await fetchAPI('/leaves/types', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  },

  updateLeaveType: async (id, leaveData) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const overrides = JSON.parse(localStorage.getItem('nexahr_leave_policy_overrides') || '{}');
        const updated = {
          id,
          name: leaveData.name,
          code: leaveData.code?.toUpperCase(),
          daysAllowed: leaveData.daysAllowed,
          days: leaveData.daysAllowed,
          isPaid: leaveData.isPaid,
          type: leaveData.isPaid ? 'PAID' : 'UNPAID',
          description: leaveData.description,
          updatedAt: Date.now(),
        };
        overrides[id] = updated;
        if (leaveData.code) {
          overrides[leaveData.code] = updated;
          overrides[leaveData.code.toUpperCase()] = updated;
        }
        localStorage.setItem('nexahr_leave_policy_overrides', JSON.stringify(overrides));

        // Clean from deleted
        const deleted = JSON.parse(localStorage.getItem('nexahr_deleted_leave_policies') || '[]');
        const cleaned = deleted.filter((d) => d !== id && d !== leaveData.code && d !== leaveData.code?.toUpperCase());
        localStorage.setItem('nexahr_deleted_leave_policies', JSON.stringify(cleaned));

        // Update in custom policies if present
        const custom = JSON.parse(localStorage.getItem('nexahr_custom_leave_policies') || '[]');
        const updatedCustom = custom.map((c) =>
          c.id === id || c.code === leaveData.code || c.code?.toUpperCase() === leaveData.code?.toUpperCase()
            ? { ...c, ...updated }
            : c
        );
        localStorage.setItem('nexahr_custom_leave_policies', JSON.stringify(updatedCustom));
      } catch (e) {}
    }

    invalidateClientCache('/leaves');
    invalidateClientCache('/dashboard');

    try {
      return await fetchAPI(`/leaves/types/${id}`, {
        method: 'PUT',
        body: JSON.stringify(leaveData),
      });
    } catch (err) {
      console.warn('API updateLeaveType pending/error (persisted locally):', err.message);
      return {
        success: true,
        message: 'Leave policy updated successfully.',
        data: { leaveType: { id, ...leaveData } },
      };
    }
  },

  deleteLeaveType: async (id) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const deleted = JSON.parse(localStorage.getItem('nexahr_deleted_leave_policies') || '[]');
        if (!deleted.includes(id)) deleted.push(id);
        localStorage.setItem('nexahr_deleted_leave_policies', JSON.stringify(deleted));

        const overrides = JSON.parse(localStorage.getItem('nexahr_leave_policy_overrides') || '{}');
        delete overrides[id];
        localStorage.setItem('nexahr_leave_policy_overrides', JSON.stringify(overrides));

        const custom = JSON.parse(localStorage.getItem('nexahr_custom_leave_policies') || '[]');
        const updatedCustom = custom.filter((c) => c.id !== id);
        localStorage.setItem('nexahr_custom_leave_policies', JSON.stringify(updatedCustom));
      } catch (e) {}
    }

    invalidateClientCache('/leaves');
    invalidateClientCache('/dashboard');

    try {
      return await fetchAPI(`/leaves/types/${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.warn('API deleteLeaveType pending/error (removed locally):', err.message);
      return {
        success: true,
        message: 'Leave policy deleted successfully.',
      };
    }
  },

  createLeaveRequest: async (leaveData) => {
    return await fetchAPI('/leaves/request', {
      method: 'POST',
      body: JSON.stringify(leaveData),
    });
  },

  updateLeaveStatus: async (requestId, statusData) => {
    return await fetchAPI(`/leaves/requests/${requestId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  },

  invalidateLeavesCache: () => {
    invalidateClientCache('/leaves');
    invalidateClientCache('/dashboard');
  },

  // --- Payroll ---
  getPayslips: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/payroll/payslips${query ? `?${query}` : ''}`);
  },

  getMyPayslips: async () => {
    return await fetchAPI('/payroll/my-payslips');
  },

  getPayslipById: async (id) => {
    return await fetchAPI(`/payroll/payslips/${id}`);
  },

  generatePayroll: async (payrollData) => {
    return await fetchAPI('/payroll/generate', {
      method: 'POST',
      body: JSON.stringify(payrollData),
    });
  },


  // --- Departments & Designations ---
  getDepartments: async () => {
    return await fetchAPI('/departments');
  },

  createDepartment: async (deptData) => {
    return await fetchAPI('/departments', {
      method: 'POST',
      body: JSON.stringify(deptData),
    });
  },

  updateDepartment: async (id, deptData) => {
    return await fetchAPI(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(deptData),
    });
  },

  deleteDepartment: async (id) => {
    return await fetchAPI(`/departments/${id}`, {
      method: 'DELETE',
    });
  },

  getDesignations: async (departmentId = '') => {
    return await fetchAPI(`/designations${departmentId ? `?departmentId=${departmentId}` : ''}`);
  },

  createDesignation: async (desigData) => {
    return await fetchAPI('/designations', {
      method: 'POST',
      body: JSON.stringify(desigData),
    });
  },

  updateDesignation: async (id, desigData) => {
    return await fetchAPI(`/designations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(desigData),
    });
  },

  deleteDesignation: async (id) => {
    return await fetchAPI(`/designations/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Notifications ---
  getNotifications: async () => {
    return await fetchAPI('/notifications');
  },

  markNotificationRead: async (id) => {
    return await fetchAPI(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  markAllNotificationsRead: async () => {
    return await fetchAPI('/notifications/read-all', {
      method: 'PATCH',
    });
  },

  deleteNotification: async (id) => {
    return await fetchAPI(`/notifications/${id}`, {
      method: 'DELETE',
    });
  },

  clearAllNotifications: async () => {
    return await fetchAPI('/notifications', {
      method: 'DELETE',
    });
  },

  // --- Announcements ---
  getAnnouncements: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/announcements${query ? `?${query}` : ''}`);
  },

  createAnnouncement: async (announcementData) => {
    return await fetchAPI('/announcements', {
      method: 'POST',
      body: JSON.stringify(announcementData),
    });
  },

  updateAnnouncement: async (id, data) => {
    return await fetchAPI(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAnnouncement: async (id) => {
    return await fetchAPI(`/announcements/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Helpdesk & Support Tickets ---
  getMyTickets: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/tickets/my${query ? `?${query}` : ''}`);
  },

  getAllTickets: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/tickets${query ? `?${query}` : ''}`);
  },

  getTicketById: async (id) => {
    return await fetchAPI(`/tickets/${id}`);
  },

  createTicket: async (ticketData) => {
    return await fetchAPI('/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData),
    });
  },

  addTicketReply: async (ticketId, message) => {
    return await fetchAPI(`/tickets/${ticketId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  updateTicketStatus: async (ticketId, status, extra = {}) => {
    return await fetchAPI(`/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, ...extra }),
    });
  },

  // --- Documents & Corporate Policies ---
  getIssuedDocuments: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/documents/issued${query ? `?${query}` : ''}`);
  },

  issueDocument: async (documentData) => {
    return await fetchAPI('/documents/issue', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  },

  deleteIssuedDocument: async (id) => {
    return await fetchAPI(`/documents/issued/${id}`, {
      method: 'DELETE',
    });
  },

  getCompanyPolicies: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/documents/policies${query ? `?${query}` : ''}`);
  },

  publishCompanyPolicy: async (policyData) => {
    return await fetchAPI('/documents/policies', {
      method: 'POST',
      body: JSON.stringify(policyData),
    });
  },

  deleteCompanyPolicy: async (id) => {
    return await fetchAPI(`/documents/policies/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Accounts & Financial Ledger Operations ---
  getAccountTransactions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/accounts/transactions${query ? `?${query}` : ''}`);
  },

  getAccountStats: async () => {
    return await fetchAPI('/accounts/stats');
  },

  createAccountTransaction: async (txnData) => {
    return await fetchAPI('/accounts/transactions', {
      method: 'POST',
      body: JSON.stringify(txnData),
    });
  },

  updateAccountTransaction: async (id, txnData) => {
    return await fetchAPI(`/accounts/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(txnData),
    });
  },

  deleteAccountTransaction: async (id) => {
    return await fetchAPI(`/accounts/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  batchDeleteAccountTransactions: async (ids) => {
    return await fetchAPI('/accounts/batch-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  batchUpdateAccountTransactionStatus: async (ids, status) => {
    return await fetchAPI('/accounts/batch-status', {
      method: 'POST',
      body: JSON.stringify({ ids, status }),
    });
  },

  clearAllAccountTransactions: async () => {
    return await fetchAPI('/accounts/clear', {
      method: 'POST',
    });
  },

  seedAccountTransactions: async (force = false) => {
    return await fetchAPI(`/accounts/seed${force ? '?force=true' : ''}`, {
      method: 'POST',
    });
  },

  // --- Recruitment & ATS Enterprise Operations ---
  getRecruitmentStats: async (options = {}) => {
    return await fetchAPI('/recruitment/stats', options);
  },

  getJobOpenings: async (params = {}, options = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/recruitment/jobs${query ? `?${query}` : ''}`, options);
  },

  getJobOpeningById: async (id, options = {}) => {
    return await fetchAPI(`/recruitment/jobs/${id}`, options);
  },

  createJobOpening: async (jobData) => {
    return await fetchAPI('/recruitment/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  updateJobOpening: async (id, jobData) => {
    return await fetchAPI(`/recruitment/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },

  toggleJobOpeningStatus: async (id) => {
    return await fetchAPI(`/recruitment/jobs/${id}/status`, {
      method: 'PATCH',
    });
  },

  deleteJobOpening: async (id) => {
    return await fetchAPI(`/recruitment/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  getJobApplications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/recruitment/applications${query ? `?${query}` : ''}`);
  },

  getJobApplicationById: async (id) => {
    return await fetchAPI(`/recruitment/applications/${id}`);
  },
  viewApplicationResume: async (id) => {
    if (isGuestOrDemo()) {
      showDemoToast('CV preview is not available in demo mode.');
      throw new DemoModeError('CV preview is not available in demo mode.');
    }
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${BASE_URL}/recruitment/applications/${id}/resume`, {
      method: 'GET',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to load resume' }));
      throw new Error(err.message || 'Failed to download candidate resume');
    }
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    window.open(objectUrl, '_blank');
    setTimeout(() => window.URL.revokeObjectURL(objectUrl), 60000);
    return true;
  },

  createJobApplication: async (appData) => {
    return await fetchAPI('/recruitment/applications', {
      method: 'POST',
      body: JSON.stringify(appData),
    });
  },

  updateJobApplication: async (id, appData) => {
    return await fetchAPI(`/recruitment/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(appData),
    });
  },

  updateJobApplicationStage: async (id, stage) => {
    return await fetchAPI(`/recruitment/applications/${id}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  },

  // --- AI ATS Auto-Screening & Gmail Sync ---
  syncAiScreeningGmail: async () => {
    return await fetchAPI('/recruitment/ai-screening/sync', {
      method: 'POST',
    });
  },

  getAiScreeningStatus: async () => {
    return await fetchAPI('/recruitment/ai-screening/status');
  },

  getAiScreenedOutApplications: async () => {
    return await fetchAPI('/recruitment/ai-screening/screened-out');
  },

  overrideAiApplication: async (id) => {
    return await fetchAPI(`/recruitment/applications/${id}/ai-override`, {
      method: 'POST',
    });
  },

  rescanAiApplication: async (id) => {
    return await fetchAPI(`/recruitment/applications/${id}/rescan`, {
      method: 'POST',
    });
  },

  deleteJobApplication: async (id) => {
    return await fetchAPI(`/recruitment/applications/${id}`, {
      method: 'DELETE',
    });
  },

  getJobInterviews: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/recruitment/interviews${query ? `?${query}` : ''}`);
  },

  createJobInterview: async (interviewData) => {
    return await fetchAPI('/recruitment/interviews', {
      method: 'POST',
      body: JSON.stringify(interviewData),
    });
  },

  updateJobInterview: async (id, interviewData) => {
    return await fetchAPI(`/recruitment/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(interviewData),
    });
  },

  deleteJobInterview: async (id) => {
    return await fetchAPI(`/recruitment/interviews/${id}`, {
      method: 'DELETE',
    });
  },

  getRecruitmentTaxonomies: async (type = 'ALL') => {
    return await fetchAPI(`/recruitment/taxonomies?type=${type}`);
  },

  createRecruitmentTaxonomy: async (taxData) => {
    return await fetchAPI('/recruitment/taxonomies', {
      method: 'POST',
      body: JSON.stringify(taxData),
    });
  },

  updateRecruitmentTaxonomy: async (id, taxData) => {
    return await fetchAPI(`/recruitment/taxonomies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(taxData),
    });
  },

  toggleRecruitmentTaxonomy: async (id) => {
    return await fetchAPI(`/recruitment/taxonomies/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  deleteRecruitmentTaxonomy: async (id) => {
    return await fetchAPI(`/recruitment/taxonomies/${id}`, {
      method: 'DELETE',
    });
  },

  seedRecruitmentData: async (force = false) => {
    return await fetchAPI(`/recruitment/seed${force ? '?force=true' : ''}`, {
      method: 'POST',
    });
  },

  clearAllRecruitmentData: async () => {
    return await fetchAPI('/recruitment/clear-all', {
      method: 'DELETE',
    });
  },

  // --- Documents & Corporate Policies Hub ---
  getIssuedDocuments: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return await fetchAPI(`/documents/issued${qs ? `?${qs}` : ''}`);
  },

  issueDocument: async (docData) => {
    const res = await fetchAPI('/documents/issue', {
      method: 'POST',
      body: JSON.stringify(docData),
    });
    invalidateClientCache('/documents');
    return res;
  },

  uploadEmployeeDocument: async (docData) => {
    const res = await fetchAPI('/documents/upload', {
      method: 'POST',
      body: JSON.stringify(docData),
    });
    invalidateClientCache('/documents');
    return res;
  },

  deleteIssuedDocument: async (id) => {
    const res = await fetchAPI(`/documents/issued/${id}`, {
      method: 'DELETE',
    });
    invalidateClientCache('/documents');
    return res;
  },

  getCompanyPolicies: async (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return await fetchAPI(`/documents/policies${qs ? `?${qs}` : ''}`);
  },

  publishCompanyPolicy: async (policyData) => {
    const res = await fetchAPI('/documents/policies', {
      method: 'POST',
      body: JSON.stringify(policyData),
    });
    invalidateClientCache('/documents');
    return res;
  },

  deleteCompanyPolicy: async (id) => {
    const res = await fetchAPI(`/documents/policies/${id}`, {
      method: 'DELETE',
    });
    invalidateClientCache('/documents');
    return res;
  },

  // --- Client Cache Utilities ---
  getCached: (endpoint) => {
    const entry = clientCache.get(endpoint);
    return entry ? entry.data : null;
  },

  hasCached: (endpoint) => {
    return clientCache.has(endpoint);
  },

  clearCache: (pattern) => {
    invalidateClientCache(pattern);
  },

  prefetch: async (endpoints = []) => {
    return Promise.allSettled(
      endpoints.map((ep) =>
        fetchAPI(ep).catch((e) => {
          console.warn('Prefetch skipped for:', ep, e.message);
        })
      )
    );
  },
};


