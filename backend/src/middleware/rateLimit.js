/**
 * In-memory rate limiter factory for Cloudflare Workers.
 *
 * Creates a middleware that limits requests per IP address within a sliding window.
 * Resets counters across Worker restarts (no persistent store — acceptable for CF Workers).
 *
 * @param {object} options
 * @param {number} options.windowMs - Window duration in milliseconds
 * @param {number} options.max - Maximum requests allowed per window
 * @param {string} options.keyPrefix - Prefix for the in-memory key (to namespace multiple limiters)
 */
export function createRateLimiter({ windowMs = 60_000, max = 100, keyPrefix = 'rl' } = {}) {
  const store = new Map(); // { key: { count, resetAt } }

  return async (c, next) => {
    const ip =
      c.req.header('CF-Connecting-IP') ||
      c.req.header('X-Forwarded-For') ||
      'unknown';
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      store.set(key, entry);
    }

    entry.count += 1;

    if (entry.count > max) {
      return c.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please retry after ${Math.ceil((entry.resetAt - now) / 1000)} seconds.`,
          retryAfter: Math.ceil((entry.resetAt - now) / 1000),
        },
        429
      );
    }

    await next();
  };
}
