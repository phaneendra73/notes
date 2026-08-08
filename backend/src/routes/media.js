import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';

export const mediaRoutes = new Hono();

// ── POST /api/media/upload ────────────────────────────────────────────────────
// Accepts a base64 data URL. Deduplicates via SHA-256 hash.
mediaRoutes.post('/upload', requireAuth, async (c) => {
  try {
    const { filename, dataUrl, hash, size = 0, width = 0, height = 0 } = await c.req.json();
    const authorId = parseInt(c.get('userId') || 1);

    if (!dataUrl || !filename) {
      return c.json({ error: 'Image data and filename are required' }, 400);
    }

    // Limit base64 payload to ~750KB
    if (dataUrl.length > 1_000_000) {
      return c.json({ error: 'Image payload exceeds 750KB. Please compress before uploading.' }, 400);
    }

    // Deduplication check
    if (hash) {
      const existing = await c.env.DB.prepare('SELECT id FROM media WHERE hash = ?')
        .bind(hash)
        .first();
      if (existing) {
        const origin = new URL(c.req.url).origin;
        return c.json({
          deduplicated: true,
          image: { id: existing.id, url: `${origin}/api/media/${existing.id}` },
        });
      }
    }

    const fileHash = hash || `h_${Date.now().toString(36)}`;
    const result = await c.env.DB.prepare(
      'INSERT INTO media (filename, base64Data, hash, mimeType, size, width, height, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    )
      .bind(filename, dataUrl, fileHash, 'image/webp', parseInt(size), parseInt(width), parseInt(height), authorId)
      .run();

    const mediaId = result.meta.last_row_id;
    const origin = new URL(c.req.url).origin;

    return c.json(
      {
        deduplicated: false,
        image: {
          id: mediaId,
          filename,
          url: `${origin}/api/media/${mediaId}`,
          hash: fileHash,
          mimeType: 'image/webp',
          size: parseInt(size),
          width: parseInt(width),
          height: parseInt(height),
        },
      },
      201
    );
  } catch (err) {
    console.error('Media upload error:', err);
    return c.json({ error: 'Failed to upload media' }, 500);
  }
});

// ── GET /api/media/:id ────────────────────────────────────────────────────────
// Serves the binary image from stored base64 data. Public (no auth required).
mediaRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (!id || isNaN(id)) return c.text('Not Found', 404);

    const media = await c.env.DB.prepare('SELECT base64Data, mimeType FROM media WHERE id = ?')
      .bind(id)
      .first();

    if (!media?.base64Data) return c.text('Not Found', 404);

    const rawData = media.base64Data;

    if (rawData.startsWith('data:image/')) {
      const [header, base64Str] = rawData.split(',');
      const mime = header.match(/:(.*?);/)?.[1] || 'image/webp';
      const buffer = Uint8Array.from(atob(base64Str), (ch) => ch.charCodeAt(0));
      return c.body(buffer, 200, {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=31536000, immutable',
      });
    }

    if (rawData.startsWith('http')) return c.redirect(rawData);

    return c.text('Not Found', 404);
  } catch (err) {
    console.error('Media serve error:', err);
    return c.text('Error serving media', 500);
  }
});

// ── GET /api/media ────────────────────────────────────────────────────────────
// Paginated media library list (author only).
mediaRoutes.get('/', requireAuth, async (c) => {
  try {
    const page = Math.max(1, parseInt(c.req.query('page')) || 1);
    const limit = Math.min(parseInt(c.req.query('limit')) || 24, 60);
    const query = (c.req.query('query') || '').trim();
    const skip = (page - 1) * limit;

    let whereSql = '';
    const bindArgs = [];
    if (query) {
      whereSql = 'WHERE filename LIKE ?';
      bindArgs.push(`%${query}%`);
    }

    const countRow = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM media ${whereSql}`
    )
      .bind(...bindArgs)
      .first();
    const totalCount = countRow?.total || 0;

    const result = await c.env.DB.prepare(
      `SELECT id, filename, hash, mimeType, size, width, height, createdAt
       FROM media ${whereSql} ORDER BY createdAt DESC LIMIT ? OFFSET ?`
    )
      .bind(...bindArgs, limit, skip)
      .all();

    const origin = new URL(c.req.url).origin;
    const items = (result.results || []).map((img) => ({
      ...img,
      url: `${origin}/api/media/${img.id}`,
    }));

    return c.json({
      media: items,
      pagination: {
        page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalCount,
      },
    });
  } catch (err) {
    console.error('Media list error:', err);
    return c.json({ error: 'Failed to fetch media' }, 500);
  }
});

// ── DELETE /api/media/:id ─────────────────────────────────────────────────────
mediaRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (!id || isNaN(id)) return c.json({ error: 'Invalid media ID' }, 400);
    await c.env.DB.prepare('DELETE FROM media WHERE id = ?').bind(id).run();
    return c.json({ message: 'Media deleted' });
  } catch (err) {
    console.error('Media delete error:', err);
    return c.json({ error: 'Failed to delete media' }, 500);
  }
});
