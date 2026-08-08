import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { requireAuth, hashPassword, verifyPassword } from '../middleware/auth.js';

export const authRoutes = new Hono();

// ── POST /api/auth/signin ─────────────────────────────────────────────────────
authRoutes.post('/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const user = await c.env.DB.prepare('SELECT * FROM userprofiles WHERE email = ?')
      .bind(email.trim().toLowerCase())
      .first();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 400);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return c.json({ error: 'Invalid credentials' }, 400);
    }

    const secret = c.env?.JWT_SECRET || 'kadha_super_secret_jwt_key_2025';
    const token = await sign({ id: user.id }, secret);

    return c.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.profileUrl || null,
          bio: user.bio || null,
          githubUrl: user.githubUrl || null,
          twitterUrl: user.twitterUrl || null,
          role: user.role || 'author',
        },
      },
      200
    );
  } catch (err) {
    console.error('Signin error:', err);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// ── GET /api/auth/profile ─────────────────────────────────────────────────────
authRoutes.get('/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, profileUrl, bio, githubUrl, twitterUrl, role, createdAt FROM userprofiles WHERE id = ?'
    )
      .bind(parseInt(userId))
      .first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const [totalLessons, totalViews] = await Promise.all([
      c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM lessons WHERE authorId = ? AND isPublished = 1'
      )
        .bind(userId)
        .first(),
      c.env.DB.prepare('SELECT COALESCE(SUM(viewsCount), 0) as count FROM lessons WHERE authorId = ?')
        .bind(userId)
        .first(),
    ]);

    return c.json({
      user: {
        ...user,
        avatarUrl: user.profileUrl || null,
      },
      stats: {
        totalLessons: totalLessons?.count || 0,
        totalViews: totalViews?.count || 0,
      },
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// ── PUT /api/auth/profile ─────────────────────────────────────────────────────
authRoutes.put('/profile', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { name, avatarUrl, bio, githubUrl, twitterUrl } = await c.req.json();

    await c.env.DB.prepare(
      `UPDATE userprofiles
       SET name = ?, profileUrl = ?, bio = ?, githubUrl = ?, twitterUrl = ?, updatedAt = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
      .bind(name || '', avatarUrl || '', bio || '', githubUrl || '', twitterUrl || '', parseInt(userId))
      .run();

    const updated = await c.env.DB.prepare(
      'SELECT id, email, name, profileUrl, bio, githubUrl, twitterUrl, role FROM userprofiles WHERE id = ?'
    )
      .bind(parseInt(userId))
      .first();

    return c.json({ user: { ...updated, avatarUrl: updated.profileUrl || null } });
  } catch (err) {
    console.error('Profile update error:', err);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// ── POST /api/auth/password ───────────────────────────────────────────────────
authRoutes.post('/password', requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { currentPassword, newPassword } = await c.req.json();

    if (!newPassword || newPassword.length < 4) {
      return c.json({ error: 'New password must be at least 4 characters' }, 400);
    }

    const user = await c.env.DB.prepare('SELECT * FROM userprofiles WHERE id = ?')
      .bind(parseInt(userId))
      .first();

    if (!user) return c.json({ error: 'User not found' }, 404);

    if (currentPassword) {
      const valid = await verifyPassword(currentPassword, user.password);
      if (!valid) return c.json({ error: 'Current password is incorrect' }, 400);
    }

    const hashed = await hashPassword(newPassword);
    await c.env.DB.prepare(
      'UPDATE userprofiles SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?'
    )
      .bind(hashed, parseInt(userId))
      .run();

    return c.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Password update error:', err);
    return c.json({ error: 'Failed to update password' }, 500);
  }
});

// ── POST /api/auth/authors ────────────────────────────────────────────────────
authRoutes.post('/authors', requireAuth, async (c) => {
  try {
    const { name, email, password, bio, role = 'author' } = await c.req.json();

    if (!name || !email || !password) {
      return c.json({ error: 'Name, email, and password are required' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT id FROM userprofiles WHERE email = ?')
      .bind(email.trim().toLowerCase())
      .first();

    if (existing) {
      return c.json({ error: 'An account with this email already exists' }, 400);
    }

    const hashed = await hashPassword(password);
    await c.env.DB.prepare(
      'INSERT INTO userprofiles (name, email, password, bio, role) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(name, email.trim().toLowerCase(), hashed, bio || '', role)
      .run();

    return c.json({ message: 'Author account created successfully' }, 201);
  } catch (err) {
    console.error('Add author error:', err);
    return c.json({ error: 'Failed to create author account' }, 500);
  }
});
