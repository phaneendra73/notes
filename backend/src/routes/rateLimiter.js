// Sliding Window In-Memory Rate Limiter for Hono on Cloudflare Workers
const store = new Map();
let lastCleanup = Date.now();

// Lazy garbage collection executed inside request context
function cleanupExpired(now) {
  if (now - lastCleanup > 60 * 1000) {
    lastCleanup = now;
    for (const [key, record] of store.entries()) {
      if (now >= record.resetTime) {
        store.delete(key);
      }
    }
  }
}

/**
 * Creates a rate limiter middleware for Hono routes.
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000ms / 1 min)
 * @param {number} options.max - Maximum requests allowed per window (default: 100)
 * @param {string} [options.keyPrefix] - Prefix for store keys (e.g., 'auth', 'write', 'general')
 * @param {boolean} [options.preferUser] - Prefer authenticated user ID over IP if available
 */
export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 1000;
  const max = options.max || 100;
  const keyPrefix = options.keyPrefix || 'global';
  const preferUser = options.preferUser || false;

  return async function rateLimiterMiddleware(c, next) {
    const now = Date.now();
    cleanupExpired(now);

    // Determine key: Authenticated user ID or Client IP
    let identifier = '';

    if (preferUser) {
      const userId = c.get('UserId');
      if (userId) {
        identifier = `user_${userId}`;
      }
    }

    if (!identifier) {
      const cfIp = c.req.header('cf-connecting-ip');
      const forwardedFor = c.req.header('x-forwarded-for');
      const realIp = c.req.header('x-real-ip');

      if (cfIp) {
        identifier = `ip_${cfIp.trim()}`;
      } else if (forwardedFor) {
        identifier = `ip_${forwardedFor.split(',')[0].trim()}`;
      } else if (realIp) {
        identifier = `ip_${realIp.trim()}`;
      } else {
        identifier = 'ip_127.0.0.1';
      }
    }

    const key = `${keyPrefix}:${identifier}`;
    let record = store.get(key);

    if (!record || now >= record.resetTime) {
      record = {
        count: 1,
        resetTime: now + windowMs,
      };
      store.set(key, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, max - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    c.header('X-RateLimit-Limit', String(max));
    c.header('X-RateLimit-Remaining', String(remaining));
    c.header('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));

    if (record.count > max) {
      c.header('Retry-After', String(resetSeconds));
      return c.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please try again in ${resetSeconds} seconds.`,
          retryAfterSeconds: resetSeconds,
        },
        429
      );
    }

    await next();
  };
}
