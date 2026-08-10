// Centralized API Client for NexaHR Backend Integration

const BASE_URL = '/api';

/**
 * Helper to execute HTTP fetch requests with auth headers and error handling.
 */
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.warn(`API Error [${endpoint}]:`, error.message);
    throw error;
  }
}

export const api = {
  // --- Auth & User Profile ---
  login: async (credentials) => {
    const res = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  registerAdmin: async (adminData) => {
    const res = await fetchAPI('/auth/register-admin', {
      method: 'POST',
      body: JSON.stringify(adminData),
    });
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res;
  },

  getMe: async () => {
    return await fetchAPI('/auth/me');
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
  getDashboard: async () => {
    return await fetchAPI('/dashboard/admin');
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

  // --- Attendance (Automated Biometric Database System) ---
  getAttendanceLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/attendance${query ? `?${query}` : ''}`);
  },

  getMyAttendanceLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/attendance/my-logs${query ? `?${query}` : ''}`);
  },

  syncBiometricHardware: async (payload) => {
    return await fetchAPI('/attendance/hardware-sync', {
      method: 'POST',
      headers: {
        'x-hardware-key': 'nexahr_biometric_hardware_secret_2026',
      },
      body: JSON.stringify({
        employeeCode: payload.employeeCode,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: payload.type || 'IN',
      }),
    });
  },

  // --- Leaves ---
  getLeaveRequests: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/leaves/requests${query ? `?${query}` : ''}`);
  },

  getLeaveTypes: async () => {
    return await fetchAPI('/leaves/types');
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

  // --- Payroll ---
  getPayslips: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await fetchAPI(`/payroll/payslips${query ? `?${query}` : ''}`);
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

  getDesignations: async (departmentId = '') => {
    return await fetchAPI(`/designations${departmentId ? `?departmentId=${departmentId}` : ''}`);
  },

  createDesignation: async (desigData) => {
    return await fetchAPI('/designations', {
      method: 'POST',
      body: JSON.stringify(desigData),
    });
  },
};
