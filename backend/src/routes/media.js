import { Hono } from 'hono';
import { authenticateUser } from './middleware.js';

export const mediaRoutes = new Hono();

// Helper to ensure media table exists in D1
async function ensureMediaTable(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      url TEXT NOT NULL,
      hash TEXT UNIQUE NOT NULL,
      mimeType TEXT DEFAULT 'image/webp',
      size INTEGER DEFAULT 0,
      width INTEGER,
      height INTEGER,
      authorId INTEGER NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
}

// ── Upload Image (with SHA-256 deduplication hash check) ──
mediaRoutes.post('/upload', authenticateUser, async (c) => {
  try {
    await ensureMediaTable(c.env.DB);

    const body = await c.req.json();
    const { filename, dataUrl, hash, size = 0, width = 0, height = 0 } = body;
    const authorId = c.get('UserId') || 1;

    if (!dataUrl || !filename) {
      return c.json({ error: 'Image data and filename are required' }, 400);
    }

    // 1. Deduplication check via SHA-256 hash
    if (hash) {
      try {
        const existing = await c.env.DB.prepare('SELECT * FROM media WHERE hash = ?').bind(hash).first();
        if (existing) {
          return c.json({
            message: 'Image already exists in Media Library (deduplicated)',
            image: existing,
            deduplicated: true,
          }, 200);
        }
      } catch (hashErr) {
        console.error('Hash check warning:', hashErr);
      }
    }

    // 2. Store image
    let publicUrl = dataUrl;

    if (c.env.MEDIA_BUCKET && hash) {
      try {
        const key = `uploads/${hash}-${filename.replace(/[^a-z0-9.]/gi, '_')}`;
        const base64Data = dataUrl.split(',')[1] || dataUrl;
        const buffer = Uint8Array.from(atob(base64Data), (char) => char.charCodeAt(0));

        await c.env.MEDIA_BUCKET.put(key, buffer, {
          httpMetadata: { contentType: 'image/webp' },
        });

        publicUrl = `https://kadha2-backend.phaneendra73.workers.dev/media/file/${key}`;
      } catch (r2Err) {
        console.error('R2 upload warning:', r2Err);
      }
    }

    // 3. Save metadata to D1 media table
    const fileHash = hash || `hash_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const result = await c.env.DB.prepare(
      'INSERT INTO media (filename, url, hash, mimeType, size, width, height, authorId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(
      filename,
      publicUrl,
      fileHash,
      'image/webp',
      parseInt(size) || 0,
      parseInt(width) || 0,
      parseInt(height) || 0,
      parseInt(authorId)
    ).run();

    const mediaId = result.meta.last_row_id;
    const newMedia = await c.env.DB.prepare('SELECT * FROM media WHERE id = ?').bind(mediaId).first();

    return c.json({
      message: 'Image uploaded successfully to Media Library',
      image: newMedia || { id: mediaId, filename, url: publicUrl, hash: fileHash },
      deduplicated: false,
    }, 201);
  } catch (error) {
    console.error('Media upload error:', error);
    return c.json({ error: 'Failed to upload media', details: error.message }, 500);
  }
});

// ── List & Search Media Library Items ──
mediaRoutes.get('/list', authenticateUser, async (c) => {
  try {
    await ensureMediaTable(c.env.DB);

    const query = (c.req.query('query') || '').trim();
    const page = parseInt(c.req.query('page')) || 1;
    const limit = Math.min(parseInt(c.req.query('limit')) || 24, 60);
    const skip = (page - 1) * limit;

    let whereSql = '';
    let bindArgs = [];

    if (query) {
      whereSql = 'WHERE filename LIKE ? OR hash LIKE ?';
      bindArgs.push(`%${query}%`, `%${query}%`);
    }

    const countRow = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM media ${whereSql}`).bind(...bindArgs).first();
    const totalCount = countRow?.total || 0;

    const selectSql = `
      SELECT id, filename, url, hash, mimeType, size, width, height, createdAt
      FROM media
      ${whereSql}
      ORDER BY createdAt DESC
      LIMIT ? OFFSET ?
    `;

    const result = await c.env.DB.prepare(selectSql).bind(...bindArgs, limit, skip).all();

    return c.json({
      media: result.results || [],
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalCount,
      },
    }, 200);
  } catch (error) {
    console.error('Error fetching media library:', error);
    return c.json({ error: 'Failed to fetch media', details: error.message }, 500);
  }
});

// ── Delete Image from Media Library ──
mediaRoutes.delete('/:id', authenticateUser, async (c) => {
  try {
    await ensureMediaTable(c.env.DB);
    const id = parseInt(c.req.param('id'));
    if (!id || isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    await c.env.DB.prepare('DELETE FROM media WHERE id = ?').bind(id).run();
    return c.json({ message: 'Image deleted from Media Library' }, 200);
  } catch (error) {
    console.error('Error deleting media:', error);
    return c.json({ error: 'Failed to delete media' }, 500);
  }
});
