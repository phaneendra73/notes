import { verify } from 'hono/jwt';

/**
 * Hash a plain-text password using SHA-256.
 * Note: This is a simple SHA-256 hash, suitable for a single-author personal platform.
 * For a public multi-user app, use bcrypt or Argon2.
 */
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Compare a plain-text password against a stored SHA-256 hash.
 */
export async function verifyPassword(inputPassword, storedHash) {
  const inputHash = await hashPassword(inputPassword);
  return inputHash === storedHash;
}

/**
 * JWT authentication middleware.
 * Verifies the Bearer token in the Authorization header.
 * On success, sets c.get('userId') for downstream route handlers.
 */
export const requireAuth = async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const secret = c.env?.JWT_SECRET || 'kadha_super_secret_jwt_key_2025';
    const payload = await verify(token, secret, 'HS256');
    if (!payload?.id) {
      return c.json({ error: 'Unauthorized: Invalid token payload' }, 401);
    }
    c.set('userId', payload.id);
    await next();
  } catch {
    return c.json({ error: 'Unauthorized: Token verification failed' }, 401);
  }
};
