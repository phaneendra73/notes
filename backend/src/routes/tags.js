import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';

export const tagRoutes = new Hono();

// ── GET /api/tags ─────────────────────────────────────────────────────────────
tagRoutes.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare('SELECT id, name FROM tags ORDER BY name ASC').all();
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

    const inserted = [];
    for (const rawName of tags) {
      const name = rawName.trim();
      if (!name) continue;
      await c.env.DB.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)')
        .bind(name)
        .run();
      const tag = await c.env.DB.prepare('SELECT id, name FROM tags WHERE name = ?')
        .bind(name)
        .first();
      if (tag) inserted.push(tag);
    }

    return c.json({ message: `${inserted.length} tag(s) created`, tags: inserted }, 201);
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
