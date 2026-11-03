import { useEffect, useRef } from 'react';

/**
 * client/src/demo/demoSession.js
 *
 * Frontend-only Demo Mode Session Manager
 * - Fully isolated in sessionStorage (never touches or mutates real localStorage session).
 * - Enforces 60-minute session lifetime.
 * - Enforces VITE_GUEST_DEMO_UNTIL deadline check.
 * - Zero network calls, zero server token dependencies.
 */

export const DEMO_SESSION_KEY = 'nexahr_demo_session';
export const DEMO_SESSION_DURATION_MS = 60 * 60 * 1000; // 60 minutes

export class DemoModeError extends Error {
  constructor(message = 'Demo mode: view only. Changes are disabled.') {
    super(message);
    this.name = 'DemoModeError';
    this.code = 'DEMO_MODE';
    this.isDemo = true;
  }
}

/**
 * Triggers a global toast notification for demo mode actions
 */
export function showDemoToast(message = 'Demo mode: view only. Changes are disabled.') {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('show_demo_toast', {
        detail: { message },
      })
    );
  }
}

/**
 * Checks if guest demo mode is configured and valid based on build-time env vars
 */
function getEnv(key) {
  try {
    if (typeof import.meta !== 'undefined' && import.meta && import.meta.env && import.meta.env[key] !== undefined) {
      return import.meta.env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process && process.env && process.env[key] !== undefined) {
      return process.env[key];
    }
  } catch {}
  return undefined;
}

export function isGuestDemoConfigured() {
  const isEnabled = getEnv('VITE_ENABLE_GUEST_DEMO') === 'true';
  if (!isEnabled) return false;

  const untilStr = getEnv('VITE_GUEST_DEMO_UNTIL');
  if (untilStr) {
    const untilTimestamp = new Date(untilStr).getTime();
    if (!isNaN(untilTimestamp) && Date.now() > untilTimestamp) {
      return false; // Deadline has passed
    }
  }

  return true;
}

/**
 * Retrieves the active demo session from sessionStorage, validating expiry
 */
export function getDemoSession() {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }

  try {
    const raw = sessionStorage.getItem(DEMO_SESSION_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    if (!session || !session.isDemo) return null;

    const now = Date.now();

    // 1. Check 60-minute session expiry
    if (session.expiresAt && now >= Number(session.expiresAt)) {
      clearDemoSession('Your demo session has ended (60-minute duration reached).');
      return null;
    }

    // 2. Check build-time deadline expiry
    const untilStr = getEnv('VITE_GUEST_DEMO_UNTIL');
    if (untilStr) {
      const untilTimestamp = new Date(untilStr).getTime();
      if (!isNaN(untilTimestamp) && now > untilTimestamp) {
        clearDemoSession('The preview period for demo mode has concluded.');
        return null;
      }
    }

    return session;
  } catch (err) {
    console.warn('[DemoSession] Parse error:', err);
    return null;
  }
}

/**
 * Checks if an active, unexpired demo session exists
 */
export function isDemoSessionActive() {
  return Boolean(getDemoSession());
}

/**
 * Initializes a new client-side demo session in sessionStorage
 * Role must be 'ADMIN' (HR) or 'EMPLOYEE'
 */
export function startDemoSession(role = 'ADMIN') {
  if (typeof window === 'undefined') return null;

  const normalizedRole = String(role).toUpperCase().includes('EMP') ? 'EMPLOYEE' : 'ADMIN';
  const now = Date.now();
  const expiresAt = now + DEMO_SESSION_DURATION_MS;

  const session = {
    role: normalizedRole,
    isDemo: true,
    name: normalizedRole === 'ADMIN' ? 'Guest HR Administrator' : 'Guest Staff Employee',
    email: normalizedRole === 'ADMIN' ? 'guest-hr@demo.invalid' : 'guest-employee@demo.invalid',
    employeeCode: normalizedRole === 'ADMIN' ? 'DEMO-HR-001' : 'DEMO-EMP-001',
    designation: normalizedRole === 'ADMIN' ? 'HR Operations Lead' : 'Senior Software Engineer',
    department: normalizedRole === 'ADMIN' ? 'Human Resources' : 'Engineering & DevOps',
    startedAt: now,
    expiresAt,
  };

  sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));

  window.dispatchEvent(
    new CustomEvent('demo_session_started', {
      detail: session,
    })
  );

  return session;
}

/**
 * Clears demo session from sessionStorage without touching real localStorage
 */
export function clearDemoSession(reason = null) {
  if (typeof window === 'undefined') return;

  sessionStorage.removeItem(DEMO_SESSION_KEY);

  window.dispatchEvent(
    new CustomEvent('demo_session_ended', {
      detail: { reason },
    })
  );
}

/**
 * Returns remaining milliseconds until demo session expires
 */
export function getDemoExpiryRemainingMs() {
  const session = getDemoSession();
  if (!session || !session.expiresAt) return 0;
  return Math.max(0, Number(session.expiresAt) - Date.now());
}

/**
 * Custom React Hook to actively enforce 60-minute demo session timeout across layouts
 */
export function useDemoSessionExpiry(onExpire) {
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isDemoSessionActive()) return;

    const checkAndExpire = () => {
      if (!isDemoSessionActive()) {
        if (typeof onExpireRef.current === 'function') {
          onExpireRef.current();
        } else {
          window.location.href = '/?demo_ended=1';
        }
      }
    };

    checkAndExpire();

    const remainingMs = getDemoExpiryRemainingMs();
    let timeoutId = null;
    if (remainingMs > 0) {
      timeoutId = setTimeout(() => {
        clearDemoSession('Your 60-minute demo session has concluded.');
        checkAndExpire();
      }, remainingMs + 100);
    }

    const intervalId = setInterval(() => {
      checkAndExpire();
    }, 5000);

    const handleFocus = () => {
      if (!document.hidden) checkAndExpire();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);
}
