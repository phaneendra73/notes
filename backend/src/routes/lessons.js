import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth.js';
import {
  attachTagsToLessons,
  calcReadingTime,
  generateSlug,
  parseSlideRow,
  syncLessonSlides,
  syncLessonTags,
} from '../db/queries.js';

export const lessonRoutes = new Hono();

// Shared SELECT fragment for lesson list queries
const LESSON_SELECT = `
  SELECT
    l.id, l.title, l.slug, l.excerpt, l.imageUrl as coverUrl,
    l.readingTime, l.slidesCount, l.viewsCount,
    l.isPublished as published,
    l.createdAt, l.updatedAt,
    u.name as authorName, u.profileUrl as authorAvatarUrl
  FROM lessons l
  LEFT JOIN userprofiles u ON l.authorId = u.id
`;

// ── GET /api/lessons ──────────────────────────────────────────────────────────
// Paginated lesson catalog. Supports: page, limit, query (search), tags (CSV), sort.
lessonRoutes.get('/', async (c) => {
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
      whereClauses.push('l.isPublished = 1');
    }

    if (searchQuery) {
      const words = searchQuery.split(/\s+/).filter((w) => w.length > 0);
      if (words.length > 0) {
        const conditions = words
          .map(
            () =>
              `(l.title LIKE ? OR l.excerpt LIKE ? OR l.id IN (
                SELECT tl.lessonId FROM tagsonlessons tl
                JOIN tags t ON tl.tagId = t.id WHERE t.name LIKE ?
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
        `l.id IN (SELECT tl.lessonId FROM tagsonlessons tl JOIN tags t ON tl.tagId = t.id WHERE t.id IN (${placeholders}) OR t.name IN (${placeholders}))`
      );
      bindArgs.push(...tagsParam, ...tagsParam);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderBy = 'l.createdAt DESC';
    if (sort === 'views') orderBy = 'l.viewsCount DESC, l.createdAt DESC';
    else if (sort === 'oldest') orderBy = 'l.createdAt ASC';
    else if (sort === 'title') orderBy = 'l.title ASC';

    const countRow = await c.env.DB.prepare(
      `SELECT COUNT(*) as total FROM lessons l ${whereSql}`
    )
      .bind(...bindArgs)
      .first();
    const totalCount = countRow?.total || 0;

    const lessonsRow = await c.env.DB.prepare(
      `${LESSON_SELECT} ${whereSql} ORDER BY ${orderBy} LIMIT ? OFFSET ?`
    )
      .bind(...bindArgs, limit, skip)
      .all();

    const lessons = await attachTagsToLessons(c.env.DB, lessonsRow.results || []);

    if (!includeUnpublished && !searchQuery) {
      c.header('Cache-Control', 'public, max-age=60, s-maxage=180');
    }

    return c.json({
      lessons,
      pagination: {
        page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalCount,
        limit,
      },
    });
  } catch (err) {
    console.error('Fetch lessons error:', err);
    return c.json({ error: 'Failed to fetch lessons' }, 500);
  }
});

// ── GET /api/lessons/stats ────────────────────────────────────────────────────
lessonRoutes.get('/stats', async (c) => {
  try {
    const [lessonsRow, viewsRow, tagsRow] = await Promise.all([
      c.env.DB.prepare('SELECT COUNT(*) as total FROM lessons WHERE isPublished = 1').first(),
      c.env.DB.prepare('SELECT COALESCE(SUM(viewsCount), 0) as total FROM lessons').first(),
      c.env.DB.prepare('SELECT COUNT(*) as total FROM tags').first(),
    ]);

    c.header('Cache-Control', 'public, max-age=120, s-maxage=300');
    return c.json({
      totalLessons: lessonsRow?.total || 0,
      totalViews: viewsRow?.total || 0,
      totalTags: tagsRow?.total || 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return c.json({ totalLessons: 0, totalViews: 0, totalTags: 0 });
  }
});

// ── GET /api/lessons/:id/slides ───────────────────────────────────────────────
// Paginated slides for a lesson. Supports: offset, limit.
lessonRoutes.get('/:id/slides', async (c) => {
  try {
    const param = c.req.param('id');
    const isNumericId = /^\d+$/.test(param);
    const offset = Math.max(0, parseInt(c.req.query('offset')) || 0);
    const limit = Math.max(1, parseInt(c.req.query('limit')) || 5);

    const lesson = await c.env.DB.prepare(
      `SELECT id FROM lessons WHERE ${isNumericId ? 'id = ?' : 'slug = ?'}`
    )
      .bind(isNumericId ? parseInt(param) : param)
      .first();

    if (!lesson) return c.json({ error: 'Lesson not found' }, 404);

    const totalRow = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM slides WHERE lessonId = ?'
    )
      .bind(lesson.id)
      .first();
    const totalSlidesCount = totalRow?.total || 0;

    const slidesRow = await c.env.DB.prepare(
      'SELECT id, orderNumber, title, blocksJson FROM slides WHERE lessonId = ? ORDER BY orderNumber ASC LIMIT ? OFFSET ?'
    )
      .bind(lesson.id, limit, offset)
      .all();

    const slides = (slidesRow.results || []).map((row, idx) => parseSlideRow(row, offset + idx));

    return c.json({
      slides,
      totalSlidesCount,
      offset,
      hasMore: offset + slides.length < totalSlidesCount,
    });
  } catch (err) {
    console.error('Fetch slides batch error:', err);
    return c.json({ error: 'Failed to fetch slides' }, 500);
  }
});

// ── GET /api/lessons/:id ──────────────────────────────────────────────────────
// Fetch a single lesson with paginated slides. Supports: offset, limit (0 = all slides).
lessonRoutes.get('/:id', async (c) => {
  try {
    const param = c.req.param('id');
    const isNumericId = /^\d+$/.test(param);
    const offset = Math.max(0, parseInt(c.req.query('offset')) || 0);
    const limit = Math.max(0, parseInt(c.req.query('limit')) || 5); // 0 = fetch all

    const lesson = await c.env.DB.prepare(
      `${LESSON_SELECT} WHERE ${isNumericId ? 'l.id = ?' : 'l.slug = ?'}`
    )
      .bind(isNumericId ? parseInt(param) : param)
      .first();

    if (!lesson) return c.json({ error: 'Lesson not found' }, 404);

    const totalSlidesRow = await c.env.DB.prepare(
      'SELECT COUNT(*) as total FROM slides WHERE lessonId = ?'
    )
      .bind(lesson.id)
      .first();
    const totalSlidesCount = totalSlidesRow?.total || 0;

    let slidesQuery =
      'SELECT id, orderNumber, title, blocksJson FROM slides WHERE lessonId = ? ORDER BY orderNumber ASC';
    const slideParams = [lesson.id];
    if (limit > 0) {
      slidesQuery += ' LIMIT ? OFFSET ?';
      slideParams.push(limit, offset);
    }

    const slidesRow = await c.env.DB.prepare(slidesQuery).bind(...slideParams).all();
    const slides = (slidesRow.results || []).map((row, idx) => parseSlideRow(row, offset + idx));

    // Increment view count ONLY on explicit request (incrementView=1) to prevent double counts
    if (offset === 0 && c.req.query('incrementView') === '1') {
      const updatePromise = c.env.DB.prepare(
        'UPDATE lessons SET viewsCount = viewsCount + 1 WHERE id = ?'
      )
        .bind(lesson.id)
        .run();
      if (c.executionCtx?.waitUntil) {
        c.executionCtx.waitUntil(updatePromise);
      } else {
        updatePromise.catch((err) => console.warn('View count update error:', err));
      }
    }

    const [lessonWithTags] = await attachTagsToLessons(c.env.DB, [lesson]);

    return c.json({
      lesson: {
        ...lessonWithTags,
        totalSlidesCount,
        slides,
        offset,
        hasMore: limit > 0 ? offset + slides.length < totalSlidesCount : false,
      },
    });
  } catch (err) {
    console.error('Fetch lesson error:', err);
    return c.json({ error: 'Failed to fetch lesson' }, 500);
  }
});

// ── POST /api/lessons ─────────────────────────────────────────────────────────
lessonRoutes.post('/', requireAuth, async (c) => {
  try {
    const authorId = c.get('userId') || 1;
    const body = await c.req.json();
    const { title, excerpt, coverUrl, slides, tagIds, published = true } = body;

    if (!title || !title.trim()) {
      return c.json({ error: 'Title is required' }, 400);
    }

    const processedSlides = Array.isArray(slides) && slides.length > 0 ? slides : [
      { orderNumber: 1, title: 'Introduction', blocks: [{ type: 'paragraph', content: 'Add your content here.' }] },
    ];

    const slug = generateSlug(title);
    const readingTime = calcReadingTime(processedSlides);
    const slidesCount = processedSlides.length;

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
        slidesCount,
        published ? 1 : 0,
        parseInt(authorId)
      )
      .run();

    const lessonId = lessonResult.meta.last_row_id;

    for (let i = 0; i < processedSlides.length; i++) {
      const slide = processedSlides[i];
      const orderNum = slide.orderNumber || i + 1;
      const blocks = Array.isArray(slide.blocks) && slide.blocks.length > 0
        ? slide.blocks
        : [{ type: 'paragraph', content: slide.content || '' }];

      await c.env.DB.prepare(
        'INSERT INTO slides (lessonId, orderNumber, title, blocksJson) VALUES (?, ?, ?, ?)'
      )
        .bind(lessonId, orderNum, slide.title || `Slide ${orderNum}`, JSON.stringify(blocks))
        .run();
    }

    await syncLessonTags(c.env.DB, lessonId, tagIds);

    return c.json({ message: 'Lesson created', id: lessonId, slug }, 201);
  } catch (err) {
    console.error('Create lesson error:', err);
    return c.json({ error: 'Failed to create lesson', details: err.message }, 500);
  }
});

// ── PUT /api/lessons/:id ──────────────────────────────────────────────────────
lessonRoutes.put('/:id', requireAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (!id || isNaN(id)) return c.json({ error: 'Invalid lesson ID' }, 400);

    const existing = await c.env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Lesson not found' }, 404);

    const userId = parseInt(c.get('userId'));
    const user = await c.env.DB.prepare('SELECT role FROM userprofiles WHERE id = ?').bind(userId).first();
    if (user?.role !== 'admin' && existing.authorId !== userId) {
      return c.json({ error: 'Forbidden: You do not have permission to modify this note' }, 403);
    }

    const body = await c.req.json();
    const { title, excerpt, coverUrl, slides, tagIds, published } = body;

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const updatedExcerpt = excerpt !== undefined ? excerpt : existing.excerpt;
    const updatedCoverUrl = coverUrl !== undefined ? coverUrl : existing.imageUrl;
    const updatedPublished = published !== undefined ? (published ? 1 : 0) : existing.isPublished;

    const processedSlides = Array.isArray(slides) && slides.length > 0 ? slides : null;
    const readingTime = processedSlides ? calcReadingTime(processedSlides) : existing.readingTime;
    const slidesCount = processedSlides ? processedSlides.length : existing.slidesCount;

    // Perform smart differential sync on slides if provided
    let slideDiffResult = null;
    if (processedSlides) {
      slideDiffResult = await syncLessonSlides(c.env.DB, id, processedSlides);
    }

    // Check if lesson metadata or slide count/reading time changed or slides were modified
    const slidesModified = slideDiffResult && (
      slideDiffResult.toDelete.length > 0 ||
      slideDiffResult.toUpdate.length > 0 ||
      slideDiffResult.toInsert.length > 0
    );

    const metaChanged =
      updatedTitle !== existing.title ||
      updatedExcerpt !== existing.excerpt ||
      updatedCoverUrl !== existing.imageUrl ||
      updatedPublished !== existing.isPublished ||
      readingTime !== existing.readingTime ||
      slidesCount !== existing.slidesCount ||
      slidesModified;

    if (metaChanged) {
      await c.env.DB.prepare(
        `UPDATE lessons SET title = ?, excerpt = ?, imageUrl = ?, readingTime = ?, slidesCount = ?, isPublished = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
      )
        .bind(updatedTitle, updatedExcerpt, updatedCoverUrl, readingTime, slidesCount, updatedPublished, id)
        .run();
    }

    if (tagIds !== undefined) {
      await syncLessonTags(c.env.DB, id, tagIds);
    }

    return c.json({
      message: 'Lesson updated',
      diff: slideDiffResult ? {
        deleted: slideDiffResult.toDelete.length,
        updated: slideDiffResult.toUpdate.length,
        inserted: slideDiffResult.toInsert.length,
        unchanged: slideDiffResult.unchanged.length,
      } : null,
    });
  } catch (err) {
    console.error('Update lesson error:', err);
    return c.json({ error: 'Failed to update lesson', details: err.message }, 500);
  }
});

// ── DELETE /api/lessons/:id ───────────────────────────────────────────────────
lessonRoutes.delete('/:id', requireAuth, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (!id || isNaN(id)) return c.json({ error: 'Invalid lesson ID' }, 400);

    const existing = await c.env.DB.prepare('SELECT id, authorId FROM lessons WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Lesson not found' }, 404);

    const userId = parseInt(c.get('userId'));
    const user = await c.env.DB.prepare('SELECT role FROM userprofiles WHERE id = ?').bind(userId).first();
    if (user?.role !== 'admin' && existing.authorId !== userId) {
      return c.json({ error: 'Forbidden: You do not have permission to delete this note' }, 403);
    }

    // slides and tagsonlessons use ON DELETE CASCADE in schema
    await c.env.DB.prepare('DELETE FROM lessons WHERE id = ?').bind(id).run();

    return c.json({ message: 'Lesson deleted' });
  } catch (err) {
    console.error('Delete lesson error:', err);
    return c.json({ error: 'Failed to delete lesson' }, 500);
  }
});

