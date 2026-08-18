import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import {
  attachTagsToNotes,
  calcReadingTime,
  generateSlug,
  parsePageRow,
  syncNotePages,
  syncNoteTags,
} from '../db/queries.js';

export const noteRoutes = new Hono();

// Shared SELECT fragment for note list queries
const NOTE_SELECT = `
  SELECT
    n.id, n.title, n.slug, n.excerpt, n.imageUrl as coverUrl,
    n.readingTime, n.pagesCount, n.pagesCount as slidesCount, n.viewsCount,
    n.isPublished as published,
    n.createdAt, n.updatedAt,
    u.name as authorName, u.profileUrl as authorAvatarUrl
  FROM notes n
  LEFT JOIN userprofiles u ON n.authorId = u.id
`;

// Helper for fallback table names if running against legacy DB
async function runQuery(db, sql, fallbackSql, params = []) {
  try {
    return await db.prepare(sql).bind(...params);
  } catch (err) {
    if (fallbackSql) {
      return await db.prepare(fallbackSql).bind(...params);
    }
    throw err;
  }
}

// ── GET /api/notes ────────────────────────────────────────────────────────────
// Paginated note catalog. Supports: page, limit, query (search), tags (CSV), sort.
noteRoutes.get('/', async (c) => {
  try {
    const page = Math.max(1, parseInt(c.req.query('page')) || 1);
    const limit = Math.min(Math.max(1, parseInt(c.req.query('limit')) || 9), 50);
    const searchQuery = (c.req.query('query') || '').trim();
    const sort = c.req.query('sort') || 'latest';
    const tagsParam = c.req.query('tags')
      ? c.req.query('tags').split(',').map((t) => t.trim()).filter(Boolean)
      : [];
    const includeUnpublished = c.req.query('includeUnpublished') === 'true';
    const skip = (page - 1) * limit;

    const whereClauses = [];
    const bindArgs = [];

    if (!includeUnpublished) {
      whereClauses.push('n.isPublished = 1');
    }

    if (searchQuery) {
      const words = searchQuery.split(/\s+/).filter((w) => w.length > 0);
      if (words.length > 0) {
        const conditions = words
          .map(
            () =>
              `(n.title LIKE ? OR n.excerpt LIKE ? OR n.id IN (
                SELECT tn.noteId FROM tagsonnotes tn
                JOIN tags t ON tn.tagId = t.id WHERE t.name LIKE ?
              ))`
          )
          .join(' AND ');
        whereClauses.push(`(${conditions})`);
        words.forEach((w) => {
          const p = `%${w}%`;
          bindArgs.push(p, p, p);
        });
      }
    }

    if (tagsParam.length > 0) {
      const placeholders = tagsParam.map(() => '?').join(',');
      whereClauses.push(
        `n.id IN (SELECT tn.noteId FROM tagsonnotes tn JOIN tags t ON tn.tagId = t.id WHERE t.id IN (${placeholders}) OR t.name IN (${placeholders}))`
      );
      bindArgs.push(...tagsParam, ...tagsParam);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderBy = 'n.createdAt DESC';
    if (sort === 'views') orderBy = 'n.viewsCount DESC, n.createdAt DESC';
    else if (sort === 'oldest') orderBy = 'n.createdAt ASC';
    else if (sort === 'title') orderBy = 'n.title ASC';

    let totalCount = 0;
    let notesRow;

    try {
      const countRow = await c.env.DB.prepare(
        `SELECT COUNT(*) as total FROM notes n ${whereSql}`
      )
        .bind(...bindArgs)
        .first();
      totalCount = countRow?.total || 0;

      notesRow = await c.env.DB.prepare(
        `${NOTE_SELECT} ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
      )
        .bind(...bindArgs, limit, skip)
        .all();
    } catch {
      // Fallback if legacy table names are active
      const legacyWhereSql = whereSql.replace(/notes n/g, 'lessons n').replace(/tagsonnotes tn/g, 'tagsonlessons tn').replace(/tn\.noteId/g, 'tn.lessonId');
      const countRow = await c.env.DB.prepare(
        `SELECT COUNT(*) as total FROM lessons n ${legacyWhereSql}`
      )
        .bind(...bindArgs)
        .first();
      totalCount = countRow?.total || 0;

      const LEGACY_SELECT = NOTE_SELECT.replace(/FROM notes n/g, 'FROM lessons n').replace(/n\.pagesCount/g, 'n.slidesCount');
      notesRow = await c.env.DB.prepare(
        `${LEGACY_SELECT} ${legacyWhereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
      )
        .bind(...bindArgs, limit, skip)
        .all();
    }

    const notes = await attachTagsToNotes(c.env.DB, notesRow.results || []);

    if (!includeUnpublished && !searchQuery) {
      c.header('Cache-Control', 'public, max-age=60, s-maxage=180');
    }

    return c.json({
      notes,
      pagination: {
        page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalCount,
        limit,
      },
    });
  } catch (err) {
    console.error('Fetch notes error:', err);
    return c.json({ error: 'Failed to fetch notes' }, 500);
  }
});

// ── GET /api/notes/stats ──────────────────────────────────────────────────────
noteRoutes.get('/stats', async (c) => {
  try {
    let notesRow, viewsRow, tagsRow;
    try {
      [notesRow, viewsRow, tagsRow] = await Promise.all([
        c.env.DB.prepare('SELECT COUNT(*) as total FROM notes WHERE isPublished = 1').first(),
        c.env.DB.prepare('SELECT COALESCE(SUM(viewsCount), 0) as total FROM notes').first(),
        c.env.DB.prepare('SELECT COUNT(*) as total FROM tags').first(),
      ]);
    } catch {
      [notesRow, viewsRow, tagsRow] = await Promise.all([
        c.env.DB.prepare('SELECT COUNT(*) as total FROM lessons WHERE isPublished = 1').first(),
        c.env.DB.prepare('SELECT COALESCE(SUM(viewsCount), 0) as total FROM lessons').first(),
        c.env.DB.prepare('SELECT COUNT(*) as total FROM tags').first(),
      ]);
    }

    c.header('Cache-Control', 'public, max-age=120, s-maxage=300');
    return c.json({
      totalNotes: notesRow?.total || 0,
      totalViews: viewsRow?.total || 0,
      totalTags: tagsRow?.total || 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return c.json({ totalNotes: 0, totalViews: 0, totalTags: 0 });
  }
});

// ── GET /api/notes/:id/pages (and :id/slides) ──────────────────────────────────
const getPagesHandler = async (c) => {
  try {
    const param = c.req.param('id');
    const isNumericId = /^\d+$/.test(param);
    const offset = Math.max(0, parseInt(c.req.query('offset')) || 0);
    const limit = Math.max(1, parseInt(c.req.query('limit')) || 5);

    let note;
    try {
      note = await c.env.DB.prepare(
        `SELECT id FROM notes WHERE ${isNumericId ? 'id = ?' : 'slug = ?'}`
      )
        .bind(isNumericId ? parseInt(param) : param)
        .first();
    } catch {
      note = await c.env.DB.prepare(
        `SELECT id FROM lessons WHERE ${isNumericId ? 'id = ?' : 'slug = ?'}`
      )
        .bind(isNumericId ? parseInt(param) : param)
        .first();
    }

    if (!note) return c.json({ error: 'Note not found' }, 404);

    let totalPagesCount = 0;
    let pagesRow;

    try {
      const totalRow = await c.env.DB.prepare(
        'SELECT COUNT(*) as total FROM pages WHERE noteId = ?'
      )
        .bind(note.id)
        .first();
      totalPagesCount = totalRow?.total || 0;

      pagesRow = await c.env.DB.prepare(
        'SELECT id, orderNumber, title, blocksJson FROM pages WHERE noteId = ? ORDER BY orderNumber ASC LIMIT ? OFFSET ?'
      )
        .bind(note.id, limit, offset)
        .all();
    } catch {
      const totalRow = await c.env.DB.prepare(
        'SELECT COUNT(*) as total FROM slides WHERE lessonId = ?'
      )
        .bind(note.id)
        .first();
      totalPagesCount = totalRow?.total || 0;

      pagesRow = await c.env.DB.prepare(
        'SELECT id, orderNumber, title, blocksJson FROM slides WHERE lessonId = ? ORDER BY orderNumber ASC LIMIT ? OFFSET ?'
      )
        .bind(note.id, limit, offset)
        .all();
    }

    const pages = (pagesRow.results || []).map((row, idx) => parsePageRow(row, offset + idx));

    return c.json({
      pages,
      slides: pages, // backward compat
      totalPagesCount,
      totalSlidesCount: totalPagesCount, // backward compat
      offset,
      hasMore: offset + pages.length < totalPagesCount,
    });
  } catch (err) {
    console.error('Fetch pages batch error:', err);
    return c.json({ error: 'Failed to fetch pages' }, 500);
  }
};

noteRoutes.get('/:id/pages', getPagesHandler);
noteRoutes.get('/:id/slides', getPagesHandler);

// ── GET /api/notes/:id ────────────────────────────────────────────────────────
noteRoutes.get('/:id', async (c) => {
  try {
    const param = c.req.param('id');
    const isNumericId = /^\d+$/.test(param);
    const offset = Math.max(0, parseInt(c.req.query('offset')) || 0);
    const limit = Math.max(0, parseInt(c.req.query('limit')) || 5); // 0 = fetch all

    let note;
    try {
      note = await c.env.DB.prepare(
        `${NOTE_SELECT} WHERE ${isNumericId ? 'n.id = ?' : 'n.slug = ?'}`
      )
        .bind(isNumericId ? parseInt(param) : param)
        .first();
    } catch {
      const LEGACY_SELECT = NOTE_SELECT.replace(/FROM notes n/g, 'FROM lessons n').replace(/n\.pagesCount/g, 'n.slidesCount');
      note = await c.env.DB.prepare(
        `${LEGACY_SELECT} WHERE ${isNumericId ? 'n.id = ?' : 'n.slug = ?'}`
      )
        .bind(isNumericId ? parseInt(param) : param)
        .first();
    }

    if (!note) return c.json({ error: 'Note not found' }, 404);

    let totalPagesCount = 0;
    let pagesRow;

    try {
      const totalPagesRow = await c.env.DB.prepare(
        'SELECT COUNT(*) as total FROM pages WHERE noteId = ?'
      )
        .bind(note.id)
        .first();
      totalPagesCount = totalPagesRow?.total || 0;

      let pagesQuery =
        'SELECT id, orderNumber, title, blocksJson FROM pages WHERE noteId = ? ORDER BY orderNumber ASC';
      const pageParams = [note.id];
      if (limit > 0) {
        pagesQuery += ' LIMIT ? OFFSET ?';
        pageParams.push(limit, offset);
      }

      pagesRow = await c.env.DB.prepare(pagesQuery).bind(...pageParams).all();
    } catch {
      const totalPagesRow = await c.env.DB.prepare(
        'SELECT COUNT(*) as total FROM slides WHERE lessonId = ?'
      )
        .bind(note.id)
        .first();
      totalPagesCount = totalPagesRow?.total || 0;

      let pagesQuery =
        'SELECT id, orderNumber, title, blocksJson FROM slides WHERE lessonId = ? ORDER BY orderNumber ASC';
      const pageParams = [note.id];
      if (limit > 0) {
        pagesQuery += ' LIMIT ? OFFSET ?';
        pageParams.push(limit, offset);
      }

      pagesRow = await c.env.DB.prepare(pagesQuery).bind(...pageParams).all();
    }

    const pages = (pagesRow.results || []).map((row, idx) => parsePageRow(row, offset + idx));

    // Increment view count ONLY on explicit request (incrementView=1)
    if (offset === 0 && c.req.query('incrementView') === '1') {
      const updatePromise = c.env.DB.prepare(
        'UPDATE notes SET viewsCount = viewsCount + 1 WHERE id = ?'
      )
        .bind(note.id)
        .run()
        .catch(() => {
          return c.env.DB.prepare('UPDATE lessons SET viewsCount = viewsCount + 1 WHERE id = ?').bind(note.id).run();
        });

      if (c.executionCtx?.waitUntil) {
        c.executionCtx.waitUntil(updatePromise);
      } else {
        updatePromise.catch((err) => console.warn('View count update error:', err));
      }
    }

    const [noteWithTags] = await attachTagsToNotes(c.env.DB, [note]);

    const resultPayload = {
      ...noteWithTags,
      totalPagesCount,
      pagesCount: totalPagesCount,
      pages,
      offset,
      hasMore: limit > 0 ? offset + pages.length < totalPagesCount : false,
    };

    return c.json({
      note: resultPayload,
    });
  } catch (err) {
    console.error('Fetch note error:', err);
    return c.json({ error: 'Failed to fetch note' }, 500);
  }
});

// ── POST /api/notes ───────────────────────────────────────────────────────────
noteRoutes.post('/', requireAuth, async (c) => {
  try {
    const authorId = c.get('userId') || 1;
    const body = await c.req.json();
    const { title, excerpt, coverUrl, pages, slides, tagIds, published = true } = body;

    if (!title || !title.trim()) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const rawPages = pages || slides;
    const processedPages = Array.isArray(rawPages) && rawPages.length > 0 ? rawPages : [
      { orderNumber: 1, title: 'Introduction', blocks: [{ type: 'paragraph', content: 'Add your content here.' }] },
    ];

    const slug = generateSlug(title);
    const readingTime = calcReadingTime(processedPages);
    const pagesCount = processedPages.length;

    let noteId;
    try {
      const noteResult = await c.env.DB.prepare(
        `INSERT INTO notes (title, slug, excerpt, imageUrl, readingTime, pagesCount, isPublished, authorId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          title.trim(),
          slug,
          excerpt || '',
          coverUrl || '',
          readingTime,
          pagesCount,
          published ? 1 : 0,
          parseInt(authorId)
        )
        .run();
      noteId = noteResult.meta.last_row_id;
    } catch {
      const lessonResult = await c.env.DB.prepare(
        `INSERT INTO lessons (title, slug, excerpt, imageUrl, readingTime, slidesCount, isPublished, authorId)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(
          title.trim(),
          slug,
          excerpt || '',
          coverUrl || '',
          readingTime,
          pagesCount,
          published ? 1 : 0,
          parseInt(authorId)
        )
        .run();
      noteId = lessonResult.meta.last_row_id;
    }

    for (let i = 0; i < processedPages.length; i++) {
      const page = processedPages[i];
      const orderNum = page.orderNumber || i + 1;
      const blocks = Array.isArray(page.blocks) && page.blocks.length > 0
        ? page.blocks
        : [{ type: 'paragraph', content: page.content || '' }];

      try {
        await c.env.DB.prepare(
          'INSERT INTO pages (noteId, orderNumber, title, blocksJson) VALUES (?, ?, ?, ?)'
        )
          .bind(noteId, orderNum, page.title || `Page ${orderNum}`, JSON.stringify(blocks))
          .run();
      } catch {
        await c.env.DB.prepare(
          'INSERT INTO slides (lessonId, orderNumber, title, blocksJson) VALUES (?, ?, ?, ?)'
        )
          .bind(noteId, orderNum, page.title || `Slide ${orderNum}`, JSON.stringify(blocks))
          .run();
      }
    }

    await syncNoteTags(c.env.DB, noteId, tagIds);

    return c.json({ message: 'Note created', id: noteId, slug }, 201);
  } catch (err) {
    console.error('Create note error:', err);
    return c.json({ error: 'Failed to create note', details: err.message }, 500);
  }
});

// ── PUT /api/notes/:id ────────────────────────────────────────────────────────
noteRoutes.put('/:id', requireAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (!id || isNaN(id)) return c.json({ error: 'Invalid note ID' }, 400);

    let existing;
    let isLegacy = false;
    try {
      existing = await c.env.DB.prepare('SELECT * FROM notes WHERE id = ?').bind(id).first();
    } catch {
      existing = await c.env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first();
      isLegacy = true;
    }

    if (!existing) return c.json({ error: 'Note not found' }, 404);

    const userId = parseInt(c.get('userId'));
    const user = await c.env.DB.prepare('SELECT role FROM userprofiles WHERE id = ?').bind(userId).first();
    if (user?.role !== 'admin' && existing.authorId !== userId) {
      return c.json({ error: 'Forbidden: You do not have permission to modify this note' }, 403);
    }

    const body = await c.req.json();
    const { title, excerpt, coverUrl, pages, slides, tagIds, published } = body;

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedExcerpt = excerpt !== undefined ? excerpt : existing.excerpt;
    const updatedCoverUrl = coverUrl !== undefined ? coverUrl : existing.imageUrl;
    const updatedPublished = published !== undefined ? (published ? 1 : 0) : existing.isPublished;

    const rawPages = pages || slides;
    const processedPages = Array.isArray(rawPages) && rawPages.length > 0 ? rawPages : null;
    const readingTime = processedPages ? calcReadingTime(processedPages) : existing.readingTime;
    const pagesCount = processedPages ? processedPages.length : (existing.pagesCount || existing.slidesCount);

    // Perform smart differential sync on pages if provided
    let pageDiffResult = null;
    if (processedPages) {
      pageDiffResult = await syncNotePages(c.env.DB, id, processedPages);
    }

    const pagesModified = pageDiffResult && (
      pageDiffResult.toDelete.length > 0 ||
      pageDiffResult.toUpdate.length > 0 ||
      pageDiffResult.toInsert.length > 0
    );

    const metaChanged =
      updatedTitle !== existing.title ||
      updatedExcerpt !== existing.excerpt ||
      updatedCoverUrl !== existing.imageUrl ||
      updatedPublished !== existing.isPublished ||
      readingTime !== existing.readingTime ||
      pagesCount !== (existing.pagesCount || existing.slidesCount) ||
      pagesModified;

    if (metaChanged) {
      if (!isLegacy) {
        try {
          await c.env.DB.prepare(
            `UPDATE notes SET title = ?, excerpt = ?, imageUrl = ?, readingTime = ?, pagesCount = ?, isPublished = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
          )
            .bind(updatedTitle, updatedExcerpt, updatedCoverUrl, readingTime, pagesCount, updatedPublished, id)
            .run();
        } catch {
          await c.env.DB.prepare(
            `UPDATE lessons SET title = ?, excerpt = ?, imageUrl = ?, readingTime = ?, slidesCount = ?, isPublished = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
          )
            .bind(updatedTitle, updatedExcerpt, updatedCoverUrl, readingTime, pagesCount, updatedPublished, id)
            .run();
        }
      } else {
        await c.env.DB.prepare(
          `UPDATE lessons SET title = ?, excerpt = ?, imageUrl = ?, readingTime = ?, slidesCount = ?, isPublished = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
        )
          .bind(updatedTitle, updatedExcerpt, updatedCoverUrl, readingTime, pagesCount, updatedPublished, id)
          .run();
      }
    }

    if (tagIds !== undefined) {
      await syncNoteTags(c.env.DB, id, tagIds);
    }

    return c.json({
      message: 'Note updated',
      diff: pageDiffResult ? {
        deleted: pageDiffResult.toDelete.length,
        updated: pageDiffResult.toUpdate.length,
        inserted: pageDiffResult.toInsert.length,
        unchanged: pageDiffResult.unchanged.length,
      } : null,
    });
  } catch (err) {
    console.error('Update note error:', err);
    return c.json({ error: 'Failed to update note', details: err.message }, 500);
  }
});

// ── DELETE /api/notes/:id ─────────────────────────────────────────────────────
noteRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (!id || isNaN(id)) return c.json({ error: 'Invalid note ID' }, 400);

    let existing;
    let isLegacy = false;
    try {
      existing = await c.env.DB.prepare('SELECT id, authorId FROM notes WHERE id = ?').bind(id).first();
    } catch {
      existing = await c.env.DB.prepare('SELECT id, authorId FROM lessons WHERE id = ?').bind(id).first();
      isLegacy = true;
    }

    if (!existing) return c.json({ error: 'Note not found' }, 404);

    const userId = parseInt(c.get('userId'));
    const user = await c.env.DB.prepare('SELECT role FROM userprofiles WHERE id = ?').bind(userId).first();
    if (user?.role !== 'admin' && existing.authorId !== userId) {
      return c.json({ error: 'Forbidden: You do not have permission to delete this note' }, 403);
    }

    if (!isLegacy) {
      try {
        await c.env.DB.prepare('DELETE FROM notes WHERE id = ?').bind(id).run();
      } catch {
        await c.env.DB.prepare('DELETE FROM lessons WHERE id = ?').bind(id).run();
      }
    } else {
      await c.env.DB.prepare('DELETE FROM lessons WHERE id = ?').bind(id).run();
    }

    return c.json({ message: 'Note deleted' });
  } catch (err) {
    console.error('Delete note error:', err);
    return c.json({ error: 'Failed to delete note' }, 500);
  }
});
