import { useEffect, useRef } from 'react';

// Strict 1-Hour Session Lifespan (60 minutes = 3,600,000 milliseconds)
export const SESSION_DURATION_MS = 60 * 60 * 1000;

export const SESSION_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  EXPIRES_AT: 'sessionExpiresAt',
  STARTED_AT: 'sessionStartedAt',
  GUEST: 'isGuest',
  AVATAR: 'user_avatar',
  EXPIRED_NOTICE: 'session_expired_notice',
};

/**
 * Parses JWT token payload without external dependencies
 */
export const parseJwtPayload = (token) => {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Initializes a new authenticated 1-hour session
 */
export const startSession = (token, user, expiresInSeconds = 3600) => {
  if (!token) return;

  const now = Date.now();
  // Standardize duration: 1 hour (3600s = 3,600,000ms)
  const durationMs =
    expiresInSeconds && !isNaN(expiresInSeconds)
      ? Number(expiresInSeconds) * 1000
      : SESSION_DURATION_MS;
  const expiresAt = now + durationMs;

  try {
    localStorage.removeItem(SESSION_KEYS.AVATAR);
    localStorage.setItem(SESSION_KEYS.TOKEN, token);
    if (user) {
      localStorage.setItem(SESSION_KEYS.USER, JSON.stringify(user));
    }
    localStorage.setItem(SESSION_KEYS.EXPIRES_AT, expiresAt.toString());
    localStorage.setItem(SESSION_KEYS.STARTED_AT, now.toString());

    // Clear any previous expiration notification banner
    sessionStorage.removeItem(SESSION_KEYS.EXPIRED_NOTICE);

    // Notify application listeners
    window.dispatchEvent(
      new CustomEvent('session_started', {
        detail: { token, user, expiresAt, durationMs },
      })
    );
    window.dispatchEvent(new Event('user_profile_updated'));
  } catch (err) {
    console.warn('[Session] LocalStorage error on startSession:', err);
  }

  return { expiresAt, durationMs };
};

/**
 * Clears active session and all cached user credentials
 */
export const clearSession = (noticeReason = null) => {
  try {
    localStorage.removeItem(SESSION_KEYS.TOKEN);
    localStorage.removeItem(SESSION_KEYS.USER);
    localStorage.removeItem(SESSION_KEYS.EXPIRES_AT);
    localStorage.removeItem(SESSION_KEYS.STARTED_AT);
    localStorage.removeItem(SESSION_KEYS.GUEST);
    localStorage.removeItem(SESSION_KEYS.AVATAR);

    // Clean up user-scoped cached avatars
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('user_avatar_')) {
        localStorage.removeItem(key);
      }
    });

    sessionStorage.clear();

    if (noticeReason) {
      sessionStorage.setItem(SESSION_KEYS.EXPIRED_NOTICE, noticeReason);
    }

    // Fire broadcast events
    window.dispatchEvent(
      new CustomEvent('session_expired', { detail: { reason: noticeReason } })
    );
    window.dispatchEvent(new Event('user_profile_updated'));
  } catch (err) {
    console.warn('[Session] LocalStorage error on clearSession:', err);
  }
};

/**
 * Evaluates whether the current session is valid and has not passed the 1-hour window
 */
export const isSessionValid = () => {
  try {
    const token = localStorage.getItem(SESSION_KEYS.TOKEN);
    const expiresAtStr = localStorage.getItem(SESSION_KEYS.EXPIRES_AT);

    // If no token or no expiration timestamp exists, session is invalid
    if (!token || !expiresAtStr) {
      return false;
    }

    const expiresAt = Number(expiresAtStr);
    const now = Date.now();

    // Check 1-hour expiration timestamp
    if (isNaN(expiresAt) || now >= expiresAt) {
      clearSession('Your session has expired after 1 hour. Please log in again.');
      return false;
    }

    // Secondary cryptographic check: verify JWT internal exp claim if present
    const jwtPayload = parseJwtPayload(token);
    if (jwtPayload && jwtPayload.exp && now >= jwtPayload.exp * 1000) {
      clearSession('Your session has expired after 1 hour. Please log in again.');
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

/**
 * Returns remaining milliseconds until the 1-hour session expires
 */
export const getRemainingSessionMs = () => {
  try {
    const expiresAtStr = localStorage.getItem(SESSION_KEYS.EXPIRES_AT);
    if (!expiresAtStr) return 0;
    const expiresAt = Number(expiresAtStr);
    if (isNaN(expiresAt)) return 0;
    return Math.max(0, expiresAt - Date.now());
  } catch {
    return 0;
  }
};

/**
 * Consumes the expired session banner message if one was stored
 */
export const consumeSessionExpiredNotice = () => {
  try {
    const notice = sessionStorage.getItem(SESSION_KEYS.EXPIRED_NOTICE);
    if (notice) {
      sessionStorage.removeItem(SESSION_KEYS.EXPIRED_NOTICE);
      return notice;
    }
  } catch { }
  return null;
};

/**
 * Custom React Hook to actively enforce 1-hour session timeout across layouts
 */
export const useSessionExpiry = (onExpire) => {
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    // If user is not logged in, no need to monitor
    const token = localStorage.getItem(SESSION_KEYS.TOKEN);
    if (!token) return;

    const checkAndExpire = () => {
      if (!isSessionValid()) {
        if (typeof onExpireRef.current === 'function') {
          onExpireRef.current();
        } else {
          window.location.href = '/?expired=1';
        }
      }
    };

    // 1. Initial validation check
    checkAndExpire();

    // 2. Set precise timeout for remaining milliseconds
    const remainingMs = getRemainingSessionMs();
    let timeoutId = null;
    if (remainingMs > 0) {
      timeoutId = setTimeout(() => {
        checkAndExpire();
      }, remainingMs + 100); // 100ms grace
    }

    // 3. Heartbeat interval every 5 seconds (catches system sleep/wake, tab freezing)
    const intervalId = setInterval(() => {
      checkAndExpire();
    }, 5000);

    // 4. Instant revalidation when tab regains focus or visibility changes
    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        checkAndExpire();
      }
    };

    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      clearInterval(intervalId);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
    };
  }, []);
};
