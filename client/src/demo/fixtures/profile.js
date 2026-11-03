/**
 * client/src/demo/fixtures/profile.js
 * Synthetic User Profiles for GET /auth/me
 */

import { DEMO_EMPLOYEES } from './employees.js';
import { getDemoSession } from '../demoSession.js';

export function getDemoCurrentUser() {
  const session = getDemoSession();
  const isEmployee = session && session.role === 'EMPLOYEE';
  const baseUser = isEmployee ? DEMO_EMPLOYEES[1] : DEMO_EMPLOYEES[0];

  return {
    ...baseUser,
    isGuest: true,
    isDemo: true,
    mustChangePassword: false,
    reportingManager: isEmployee
      ? 'Alexander Hayes (HR Operations Lead)'
      : 'Executive Board of Directors',
  };
}
