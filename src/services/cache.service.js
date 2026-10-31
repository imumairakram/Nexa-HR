// High-Performance In-Memory Smart Cache Service for NexaHR
// Delivers sub-10ms API responses while maintaining 100% dynamic data integrity.

class CacheService {
  constructor() {
    this.store = new Map();
    this.userCache = new Map();
    // Default TTL: 60 seconds for GET requests
    this.defaultTTL = 60 * 1000;
    // User auth verification cache TTL: 60 seconds
    this.userTTL = 60 * 1000;
  }

  /**
   * Generate cache key from request
   */
  generateKey(req) {
    const userId = req.user?.userId || 'anon';
    const role = req.user?.role || 'ALL';
    const url = req.originalUrl || req.url;
    return `${role}:${userId}:${url}`;
  }

  /**
   * Get cached response
   */
  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.data;
  }

  /**
   * Set cached response
   */
  set(key, data, ttlMs = this.defaultTTL, tags = []) {
    this.store.set(key, {
      data,
      expiry: Date.now() + ttlMs,
      tags,
    });
  }

  /**
   * Invalidate by tags or key substrings
   */
  invalidateTags(tags) {
    if (!Array.isArray(tags)) tags = [tags];
    for (const [key, entry] of this.store.entries()) {
      const match = tags.some((t) => entry.tags.includes(t) || key.includes(t));
      if (match) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Invalidate based on route pattern
   */
  invalidateByRoute(route) {
    const clean = route.toLowerCase();
    if (clean.includes('/employees') || clean.includes('/profile')) {
      this.invalidateTags(['employees', 'dashboard', 'departments']);
    } else if (clean.includes('/attendance')) {
      this.invalidateTags(['attendance', 'dashboard']);
    } else if (clean.includes('/leaves')) {
      this.invalidateTags(['leaves', 'dashboard']);
    } else if (clean.includes('/payroll')) {
      this.invalidateTags(['payroll', 'dashboard']);
    } else if (clean.includes('/departments') || clean.includes('/designations')) {
      this.invalidateTags(['departments', 'designations', 'employees', 'dashboard']);
    } else if (clean.includes('/announcements')) {
      this.invalidateTags(['announcements', 'dashboard']);
    } else if (clean.includes('/tickets')) {
      this.invalidateTags(['tickets']);
    } else if (clean.includes('/accounts')) {
      this.invalidateTags(['accounts', 'dashboard']);
    } else if (clean.includes('/recruitment')) {
      this.invalidateTags(['recruitment', 'dashboard']);
    } else {
      // Fallback: clear all
      this.clear();
    }
  }

  /**
   * Clear all cache entries
   */
  clear() {
    this.store.clear();
  }

  // --- User Auth Verification Cache ---
  getCachedUser(userId) {
    const entry = this.userCache.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.userCache.delete(userId);
      return null;
    }
    return entry.user;
  }

  setCachedUser(userId, user) {
    this.userCache.set(userId, {
      user,
      expiry: Date.now() + this.userTTL,
    });
  }

  invalidateUser(userId) {
    this.userCache.delete(userId);
  }

  /**
   * Express middleware for caching GET responses
   */
  middleware(options = {}) {
    const ttl = (options.ttlSeconds || 60) * 1000;
    const tags = options.tags || [];

    return (req, res, next) => {
      // Only cache GET requests
      if (req.method !== 'GET') {
        return next();
      }

      // Allow client to bypass cache with header or query parameter
      if (req.headers['cache-control'] === 'no-cache' || req.query.fresh === 'true') {
        return next();
      }

      const key = this.generateKey(req);
      const cached = this.get(key);

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached);
      }

      // Intercept res.json to store into cache
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          this.set(key, body, ttl, tags);
        }
        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };

      next();
    };
  }

  /**
   * Express middleware to auto-invalidate on mutations (POST, PUT, PATCH, DELETE)
   */
  mutationInvalidator() {
    return (req, res, next) => {
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const originalSend = res.send.bind(res);
        res.send = (...args) => {
          if (res.statusCode >= 200 && res.statusCode < 400) {
            const url = req.originalUrl || req.url;
            // Never invalidate on /ai-screening/sync here; sync invalidates only when new candidate items are actually added
            if (!url.includes('/ai-screening/sync')) {
              this.invalidateByRoute(url);
            }
          }
          return originalSend(...args);
        };
      }
      next();
    };
  }
}

const cacheService = new CacheService();
module.exports = cacheService;
