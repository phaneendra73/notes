/**
 * Production-ready Rate Limiter for Cloudflare Workers.
 *
 * Persists rate-limit state in Cloudflare D1 so rate limits are shared
 * across all edge nodes and worker isolates globally.
 *
 * Features:
 * - Real client IP detection (CF-Connecting-IP, True-Client-IP, X-Forwarded-For)
 * - Standard headers: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset, Retry-After
 * - 429 Too Many Requests response with JSON error details
 * - Asynchronous background cleanup of expired records (non-blocking)
 * - Graceful in-memory fallback if DB binding is unavailable
 */

// Memory fallback store for local testing/environments without D1
const memoryStore = new Map();

/**
 * Extract the true client IP from incoming Cloudflare request headers.
 */
export function getClientIp(c) {
  return (
    c.req.header('cf-connecting-ip') ||
    c.req.header('true-client-ip') ||
    c.req.header('x-real-ip') ||
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    '127.0.0.1'
  );
}

/**
 * Creates a rate-limiting middleware.
 *
 * @param {object} options
 * @param {number} options.windowMs - Sliding window in milliseconds (default: 60,000 = 1 min)
 * @param {number} options.max - Maximum allowed requests per window (default: 100)
 * @param {string} options.keyPrefix - Namespace prefix for the key (e.g. 'auth', 'global')
 */
export function createRateLimiter({ windowMs = 60_000, max = 100, keyPrefix = 'rl' } = {}) {
  return async (c, next) => {
    const ip = getClientIp(c);
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();
    const windowSec = Math.ceil(windowMs / 1000);

    // If D1 Database is available, use persistent D1 storage
    if (c.env?.DB) {
      try {
        const row = await c.env.DB.prepare(
          'SELECT count, resetAt FROM rate_limits WHERE key = ?'
        )
          .bind(key)
          .first();

        if (!row || now >= row.resetAt) {
          const resetAt = now + windowMs;
          await c.env.DB.prepare(
            `INSERT INTO rate_limits (key, count, resetAt)
             VALUES (?, 1, ?)
             ON CONFLICT(key) DO UPDATE SET count = 1, resetAt = excluded.resetAt`
          )
            .bind(key, resetAt)
            .run();

          // Schedule async cleanup of expired records without blocking response
          if (c.executionCtx?.waitUntil) {
            c.executionCtx.waitUntil(
              c.env.DB.prepare('DELETE FROM rate_limits WHERE resetAt < ?')
                .bind(now)
                .run()
                .catch(() => {})
            );
          }

          c.header('RateLimit-Limit', String(max));
          c.header('RateLimit-Remaining', String(max - 1));
          c.header('RateLimit-Reset', String(windowSec));

          return await next();
        }

        const count = row.count + 1;
        const remainingSec = Math.max(1, Math.ceil((row.resetAt - now) / 1000));

        if (row.count >= max) {
          c.header('Retry-After', String(remainingSec));
          c.header('RateLimit-Limit', String(max));
          c.header('RateLimit-Remaining', '0');
          c.header('RateLimit-Reset', String(remainingSec));

          return c.json(
            {
              error: 'Too Many Requests',
              message: `Rate limit exceeded. Please retry after ${remainingSec} seconds.`,
              retryAfter: remainingSec,
            },
            429
          );
        }

        // Increment count
        await c.env.DB.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?')
          .bind(key)
          .run();

        c.header('RateLimit-Limit', String(max));
        c.header('RateLimit-Remaining', String(Math.max(0, max - count)));
        c.header('RateLimit-Reset', String(remainingSec));

        return await next();
      } catch (err) {
        console.warn('D1 Rate limiter error (failing open):', err);
        // Fail open if DB has an unexpected error to avoid taking down APIs
      }
    }

    // In-memory fallback (used in unit tests or local dev without DB)
    let entry = memoryStore.get(key);
    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + windowMs };
      memoryStore.set(key, entry);
    }

    entry.count += 1;
    const remainingSec = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));

    if (entry.count > max) {
      c.header('Retry-After', String(remainingSec));
      c.header('RateLimit-Limit', String(max));
      c.header('RateLimit-Remaining', '0');
      c.header('RateLimit-Reset', String(remainingSec));

      return c.json(
        {
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Please retry after ${remainingSec} seconds.`,
          retryAfter: remainingSec,
        },
        429
      );
    }

    c.header('RateLimit-Limit', String(max));
    c.header('RateLimit-Remaining', String(Math.max(0, max - entry.count)));
    c.header('RateLimit-Reset', String(remainingSec));

    return await next();
  };
}
