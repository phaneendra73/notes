import { verify } from 'hono/jwt';

export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyPassword(inputPassword, storedHash) {
  const inputHash = await hashPassword(inputPassword);
  return inputHash === storedHash;
}

export const authenticateUser = async (c, next) => {
  const authHeader = c.req.header('Authorization');

  if (!authHeader) {
    return c.json({ error: 'Unauthorized: No token provided' }, 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = c.env?.JWT_SECRET || 'kadha2_super_secret_jwt_key_2025';
    const user = await verify(token, secret, 'HS256');
    if (user) {
      c.set('UserId', user.id);
      await next();
    } else {
      return c.json({ error: 'Unauthorized: Invalid token' }, 401);
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    return c.json({ error: 'Unauthorized: Token verification failed' }, 401);
  }
};
