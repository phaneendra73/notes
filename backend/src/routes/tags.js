import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';

export const tagRoutes = new Hono();

// ── GET /api/tags ─────────────────────────────────────────────────────────────
tagRoutes.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT id, name FROM tags ORDER BY name ASC').all();
    c.header('Cache-Control', 'public, max-age=120, s-maxage=600');
    return c.json({ tags: result.results || [] });
  } catch (err) {
    console.error('Tags fetch error:', err);
    return c.json({ tags: [] });
  }
});

// ── POST /api/tags ────────────────────────────────────────────────────────────
tagRoutes.post('/', requireAuth, async (c) => {
  try {
    const { tags } = await c.req.json();
    if (!Array.isArray(tags) || tags.length === 0) {
      return c.json({ error: 'Tags array is required' }, 400);
    }

    const uniqueNames = [...new Set(tags.map((t) => (typeof t === 'string' ? t.trim() : '')).filter(Boolean))];
    if (uniqueNames.length === 0) {
      return c.json({ error: 'No valid tag names provided' }, 400);
    }

    const statements = uniqueNames.map((name) =>
      c.env.DB.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').bind(name)
    );

    if (typeof c.env.DB.batch === 'function') {
      await c.env.DB.batch(statements);
    } else {
      for (const stmt of statements) await stmt.run();
    }

    const placeholders = uniqueNames.map(() => '?').join(',');
    const inserted = await c.env.DB.prepare(`SELECT id, name FROM tags WHERE name IN (${placeholders})`)
      .bind(...uniqueNames)
      .all();

    return c.json({ message: `${inserted.results?.length || 0} tag(s) processed`, tags: inserted.results || [] }, 201);
  } catch (err) {
    console.error('Create tags error:', err);
    return c.json({ error: 'Failed to create tags' }, 500);
  }
});

// ── DELETE /api/tags/:id ──────────────────────────────────────────────────────
tagRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const tagId = parseInt(c.req.param('id'));
    if (!tagId || isNaN(tagId)) {
      return c.json({ error: 'Invalid tag ID' }, 400);
    }

    const userId = parseInt(c.get('userId'));
    const user = await c.env.DB.prepare('SELECT role FROM userprofiles WHERE id = ?').bind(userId).first();
    if (user?.role !== 'admin') {
      return c.json({ error: 'Forbidden: Only administrators can delete global tags' }, 403);
    }

    const existing = await c.env.DB.prepare('SELECT id, name FROM tags WHERE id = ?')
      .bind(tagId)
      .first();

    if (!existing) {
      return c.json({ error: 'Tag not found' }, 404);
    }

    // ON DELETE CASCADE handles tagsonlessons rows automatically
    await c.env.DB.prepare('DELETE FROM tags WHERE id = ?').bind(tagId).run();

    return c.json({ message: `Tag '${existing.name}' deleted` });
  } catch (err) {
    console.error('Delete tag error:', err);
    return c.json({ error: 'Failed to delete tag' }, 500);
  }
});
