import { Hono } from 'hono';
import { hashPassword, verifyPassword, authenticateUser } from './middleware.js';
import { sign } from 'hono/jwt';

export const userprofilesRoutes = new Hono();

// Admin / Author Signin
userprofilesRoutes.post('/signin', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const user = await c.env.DB.prepare('SELECT * FROM userprofiles WHERE email = ?')
      .bind(email)
      .first();

    if (!user) {
      return c.json({ error: 'Invalid Email' }, 400);
    }

    const passwordIsValid = await verifyPassword(password, user.password);
    if (!passwordIsValid) {
      return c.json({ error: 'Invalid Password' }, 400);
    }

    const secret = c.env?.JWT_SECRET || 'kadha2_super_secret_jwt_key_2025';
    const jwt = await sign({ id: user.id }, secret);

    return c.json(
      {
        jwt,
        message: 'Signed In',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profileUrl: user.profileUrl,
          bio: user.bio,
          role: user.role || 'author',
          githubUrl: user.githubUrl,
          twitterUrl: user.twitterUrl,
        },
      },
      200
    );
  } catch (error) {
    console.error('Signin error:', error);
    return c.json({ error: 'Failed to sign in', details: error.message }, 500);
  }
});

// Reset Password for logged-in Admin/Author
userprofilesRoutes.post('/reset-password', authenticateUser, async (c) => {
  try {
    const userId = c.get('UserId');
    const body = await c.req.json();
    const { currentPassword, newPassword } = body;

    if (!newPassword || newPassword.length < 4) {
      return c.json({ error: 'New password must be at least 4 characters long' }, 400);
    }

    const user = await c.env.DB.prepare('SELECT * FROM userprofiles WHERE id = ?')
      .bind(parseInt(userId))
      .first();

    if (!user) return c.json({ error: 'User profile not found' }, 404);

    if (currentPassword) {
      const isValid = await verifyPassword(currentPassword, user.password);
      if (!isValid) {
        return c.json({ error: 'Current password is incorrect' }, 400);
      }
    }

    const hashedPassword = await hashPassword(newPassword);
    await c.env.DB.prepare('UPDATE userprofiles SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
      .bind(hashedPassword, parseInt(userId))
      .run();

    return c.json({ message: 'Password updated successfully!' }, 200);
  } catch (error) {
    console.error('Reset password error:', error);
    return c.json({ error: 'Failed to reset password', details: error.message }, 500);
  }
});

// Add New Author / Admin Account
userprofilesRoutes.post('/add-author', authenticateUser, async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, password, bio, role = 'author' } = body;

    if (!name || !email || !password) {
      return c.json({ error: 'Name, email, and password are required' }, 400);
    }

    const existing = await c.env.DB.prepare('SELECT id FROM userprofiles WHERE email = ?')
      .bind(email)
      .first();

    if (existing) {
      return c.json({ error: 'An author account with this email already exists' }, 400);
    }

    const hashedPassword = await hashPassword(password);
    await c.env.DB.prepare(
      'INSERT INTO userprofiles (name, email, password, bio, role) VALUES (?, ?, ?, ?, ?)'
    )
      .bind(name, email, hashedPassword, bio || '', role)
      .run();

    return c.json({ message: 'New author account created successfully!' }, 201);
  } catch (error) {
    console.error('Add author error:', error);
    return c.json({ error: 'Failed to create author account', details: error.message }, 500);
  }
});

// Get current user profile + real author stats
userprofilesRoutes.get('/profile', authenticateUser, async (c) => {
  try {
    const userId = c.get('UserId');
    const user = await c.env.DB.prepare(
      'SELECT id, email, name, profileUrl, bio, githubUrl, twitterUrl, role, createdAt FROM userprofiles WHERE id = ?'
    )
      .bind(parseInt(userId))
      .first();

    if (!user) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    // Real stats querying normalized lessons table
    const totalBlogs = await c.env.DB.prepare('SELECT COUNT(*) as count FROM lessons WHERE authorId = ? AND isPublished = 1')
      .bind(userId)
      .first();
    const totalViews = await c.env.DB.prepare('SELECT SUM(viewsCount) as count FROM lessons WHERE authorId = ?')
      .bind(userId)
      .first();

    return c.json({
      user,
      stats: {
        totalBlogs: totalBlogs?.count || 0,
        totalViews: totalViews?.count || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return c.json({ error: 'Failed to fetch user profile', details: error.message }, 500);
  }
});

// Update user profile
userprofilesRoutes.put('/profile', authenticateUser, async (c) => {
  try {
    const userId = c.get('UserId');
    const body = await c.req.json();
    const { name, profileUrl, bio, githubUrl, twitterUrl } = body;

    await c.env.DB.prepare(
      `UPDATE userprofiles 
       SET name = ?, profileUrl = ?, bio = ?, githubUrl = ?, twitterUrl = ?, updatedAt = CURRENT_TIMESTAMP 
       WHERE id = ?`
    )
      .bind(
        name || '',
        profileUrl || '',
        bio || '',
        githubUrl || '',
        twitterUrl || '',
        parseInt(userId)
      )
      .run();

    const updatedUser = await c.env.DB.prepare(
      'SELECT id, email, name, profileUrl, bio, githubUrl, twitterUrl, role FROM userprofiles WHERE id = ?'
    )
      .bind(parseInt(userId))
      .first();

    return c.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});
