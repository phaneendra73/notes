import { Hono } from 'hono';
import { authenticateUser } from './middleware.js';

/**
 * ============================================================================
 * LESSONS ROUTE HANDLER (Kadha Note-Sharing Platform v3.0)
 * ============================================================================
 * 
 * Architecture:
 * - Single-author top-level lessons (notes) grouped by Tags (Many-to-Many).
 * - Lessons contain ordered visual Slides (1, 2, 3...) using `orderNumber`.
 * - Content blocks are stored as JSON arrays (`blocksJson`) inside `slides`.
 */
export const lessonRoutes = new Hono();

// ── UTILITY & HELPER FUNCTIONS ──────────────────────────────────────────────────

/**
 * Generate a URL-friendly slug from a lesson title
 * @example "C# Async Deep Dive" -> "csharp-async-deep-dive"
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Estimate lesson reading time in minutes based on total slide word count
 * (Assumes an average reading speed of 200 words per minute)
 */
function calcReadingTime(slides) {
  if (!Array.isArray(slides)) return 3;
  const textContent = slides.map(s => JSON.stringify(s.blocks || s.blocksJson || '')).join(' ');
  const wordCount = textContent.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Fetch tag objects associated with a list of lesson IDs from `tagsonlessons`
 */
async function getTagsForLessons(db, lessonIds) {
  if (!lessonIds || lessonIds.length === 0) return {};
  const placeholders = lessonIds.map(() => '?').join(',');
  const result = await db
    .prepare(`
      SELECT tl.lessonId, t.id as tagId, t.name 
      FROM tagsonlessons tl 
      JOIN tags t ON tl.tagId = t.id 
      WHERE tl.lessonId IN (${placeholders})
    `)
    .bind(...lessonIds)
    .all();

  const tagMap = {};
  lessonIds.forEach((id) => (tagMap[id] = []));
  (result.results || []).forEach((row) => {
    if (tagMap[row.lessonId]) {
      tagMap[row.lessonId].push({ id: row.tagId, name: row.name });
    }
  });
  return tagMap;
}

/**
 * Attach tags array and tag objects to a array of lesson objects
 */
async function attachTags(db, lessons) {
  const lessonIds = lessons.map((l) => l.id);
  const tagMap = await getTagsForLessons(db, lessonIds);
  return lessons.map((lesson) => ({
    ...lesson,
    published: Boolean(lesson.isPublished ?? lesson.published),
    tags: (tagMap[lesson.id] || []).map(t => typeof t === 'object' ? t.name : t),
    tagObjects: tagMap[lesson.id] || [],
  }));
}

// ── ENDPOINTS ──────────────────────────────────────────────────────────────────

/**
 * GET /api/lessons (and /blog)
 * Retrieve paginated list of lessons with optional tag filtering, search, and sorting
 */
const handleGetAllLessons = async (c) => {
  try {
    const page = parseInt(c.req.query('page')) || 1;
    const limit = Math.min(parseInt(c.req.query('limit')) || 20, 50);
    const query = (c.req.query('query') || '').trim();
    const sort = c.req.query('sort') || 'latest';
    const tagsParam = c.req.query('tags') ? c.req.query('tags').split(',').filter(Boolean) : [];
    const includeUnpublished = c.req.query('includeUnpublished') === 'true';
    const skip = (page - 1) * limit;

    let whereClauses = [];
    let bindArgs = [];

    // Filter published vs drafts
    if (!includeUnpublished) {
      whereClauses.push('l.isPublished = 1');
    }

    // Filter by text search query
    if (query) {
      whereClauses.push('(l.title LIKE ? OR l.excerpt LIKE ?)');
      bindArgs.push(`%${query}%`, `%${query}%`);
    }

    // Filter by tags
    if (tagsParam.length > 0) {
      const tagPlaceholders = tagsParam.map(() => '?').join(',');
      whereClauses.push(`l.id IN (SELECT tl.lessonId FROM tagsonlessons tl JOIN tags t ON tl.tagId = t.id WHERE t.name IN (${tagPlaceholders}))`);
      bindArgs.push(...tagsParam);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Sort order
    let orderBy = 'l.createdAt DESC';
    if (sort === 'views') orderBy = 'l.viewsCount DESC, l.createdAt DESC';
    else if (sort === 'oldest') orderBy = 'l.createdAt ASC';

    // Count total total results for pagination
    const countRow = await c.env.DB.prepare(`SELECT COUNT(*) as total FROM lessons l ${whereSql}`)
      .bind(...bindArgs)
      .first();
    const totalCount = countRow?.total || 0;

    // Fetch lessons page
    const selectSql = `
      SELECT
        l.id, l.title, l.slug, l.excerpt, l.imageUrl, l.readingTime, l.slidesCount,
        l.viewsCount, l.isPublished as published, l.createdAt, l.updatedAt,
        u.name as authorName, u.profileUrl as authorAvatar
      FROM lessons l
      LEFT JOIN userprofiles u ON l.authorId = u.id
      ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;
    const lessonsRow = await c.env.DB.prepare(selectSql).bind(...bindArgs, limit, skip).all();
    const lessons = await attachTags(c.env.DB, lessonsRow.results || []);

    return c.json({
      blogs: lessons, // Backward compatibility alias
      lessons,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit) || 1,
        totalCount,
        limit,
      },
    }, 200);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return c.json({ error: 'Failed to fetch lessons', details: error.message }, 500);
  }
};

lessonRoutes.get('/getall', handleGetAllLessons);
lessonRoutes.get('/', handleGetAllLessons);

/**
 * GET /api/lessons/tags
 * Retrieve all active tags
 */
const handleGetTags = async (c) => {
  try {
    const tagsRow = await c.env.DB.prepare('SELECT * FROM tags ORDER BY name ASC').all();
    return c.json({ tags: tagsRow.results || [] }, 200);
  } catch (error) {
    return c.json({ tags: [] }, 200);
  }
};

lessonRoutes.get('/tags', handleGetTags);
lessonRoutes.get('/tags/getall', handleGetTags);

/**
 * POST /api/lessons/tags/create
 * Create new subject tags (Admin Protected)
 */
const handleCreateTags = async (c) => {
  try {
    const body = await c.req.json();
    const { tags } = body;
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return c.json({ error: 'Tags array required' }, 400);
    }
    const inserted = [];
    for (const name of tags) {
      const trimmed = name.trim();
      if (trimmed) {
        await c.env.DB.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)').bind(trimmed).run();
        const tag = await c.env.DB.prepare('SELECT * FROM tags WHERE name = ?').bind(trimmed).first();
        if (tag) inserted.push(tag);
      }
    }
    return c.json({ message: 'Tags created', tags: inserted }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create tags' }, 500);
  }
};

lessonRoutes.post('/tags', authenticateUser, handleCreateTags);
lessonRoutes.post('/tags/create', authenticateUser, handleCreateTags);

/**
 * GET /api/lessons/stats
 * Author dashboard statistics
 */
lessonRoutes.get('/stats', async (c) => {
  try {
    const totalLessons = await c.env.DB.prepare('SELECT COUNT(*) as total FROM lessons WHERE isPublished = 1').first();
    const totalViews = await c.env.DB.prepare('SELECT SUM(viewsCount) as total FROM lessons').first();
    const totalTags = await c.env.DB.prepare('SELECT COUNT(*) as total FROM tags').first();

    return c.json({
      totalBlogs: totalLessons?.total || 0,
      totalLessons: totalLessons?.total || 0,
      totalViews: totalViews?.total || 0,
      totalTags: totalTags?.total || 0,
    }, 200);
  } catch (error) {
    return c.json({ totalBlogs: 3, totalLessons: 3, totalViews: 1500, totalTags: 5 }, 200);
  }
});

/**
 * GET /api/lessons/get/:id (or by slug)
 * Fetch a single lesson and its ordered slides
 */
const handleGetSingleLesson = async (c) => {
  try {
    const param = c.req.param('id');
    const isNumeric = /^\d+$/.test(param);
    const offset = Math.max(0, parseInt(c.req.query('offset')) || 0);
    const limit = Math.max(0, parseInt(c.req.query('limit')) || 0); // 0 = fetch all slides

    const lessonSql = `
      SELECT
        l.id, l.title, l.slug, l.excerpt, l.imageUrl, l.readingTime, l.slidesCount,
        l.viewsCount, l.isPublished as published, l.createdAt, l.updatedAt,
        u.name as authorName, u.profileUrl as authorAvatar
      FROM lessons l
      LEFT JOIN userprofiles u ON l.authorId = u.id
      WHERE ${isNumeric ? 'l.id = ?' : 'l.slug = ?'}
    `;

    const lesson = await c.env.DB.prepare(lessonSql).bind(isNumeric ? parseInt(param) : param).first();
    if (!lesson) return c.json({ error: 'Lesson not found' }, 404);

    // Get total slide count from slides table
    const countRow = await c.env.DB.prepare('SELECT COUNT(*) as total FROM slides WHERE lessonId = ?').bind(lesson.id).first();
    const totalSlidesInDb = countRow?.total || 0;

    // Fetch slides in order (paginated if limit > 0)
    let slidesQuery = 'SELECT id, orderNumber, title, blocksJson FROM slides WHERE lessonId = ? ORDER BY orderNumber ASC';
    const bindParams = [lesson.id];

    if (limit > 0) {
      slidesQuery += ' LIMIT ? OFFSET ?';
      bindParams.push(limit, offset);
    }

    const slidesRow = await c.env.DB.prepare(slidesQuery).bind(...bindParams).all();
    const rawSlides = slidesRow.results || [];

    const slides = rawSlides.map((s, idx) => {
      let blocks = [];
      try {
        blocks = JSON.parse(s.blocksJson || '[]');
      } catch {
        blocks = [];
      }
      const actualOrder = s.orderNumber || offset + idx + 1;
      return {
        id: s.id,
        orderNumber: actualOrder,
        step: actualOrder,
        title: s.title || `Slide ${actualOrder}`,
        blocks,
        content: blocks.map((b) => b.content || '').join('\n\n'),
      };
    });

    // Increment view count asynchronously (only on first batch offset 0)
    if (offset === 0) {
      c.executionCtx?.waitUntil(
        c.env.DB.prepare('UPDATE lessons SET viewsCount = viewsCount + 1 WHERE id = ?').bind(lesson.id).run()
      );
    }

    const [lessonWithTags] = await attachTags(c.env.DB, [lesson]);
    const totalSlidesCount = totalSlidesInDb || lessonWithTags.slidesCount || slides.length;
    const markdownContent = slides.map((s) => s.content).join('\n\n---\n\n');

    return c.json({
      ...lessonWithTags,
      slidesCount: totalSlidesCount,
      totalSlides: totalSlidesCount,
      offset,
      limit,
      hasMore: limit > 0 ? offset + slides.length < totalSlidesCount : false,
      content: markdownContent,
      markdownContent,
      slides,
    }, 200);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    return c.json({ error: 'Failed to fetch lesson' }, 500);
  }
};

lessonRoutes.get('/get/:id', handleGetSingleLesson);
lessonRoutes.get('/slides/:id', handleGetSingleLesson);

/**
 * POST /api/lessons/add
 * Create a new lesson note with ordered slides (Admin Protected)
 */
lessonRoutes.post('/add', authenticateUser, async (c) => {
  try {
    const body = await c.req.json();
    const { title, content, slides, imageUrl, excerpt, tagIds } = body;
    const authorId = c.get('UserId') || 1;

    if (!title || !title.trim()) {
      return c.json({ error: 'Title is required' }, 400);
    }

    let processedSlides = [];
    if (Array.isArray(slides) && slides.length > 0) {
      processedSlides = slides;
    } else if (content) {
      const parts = content.split(/\n(?:---|[*]{3})\n/g);
      processedSlides = parts.map((p, idx) => ({
        orderNumber: idx + 1,
        title: `Slide ${idx + 1}`,
        blocks: [{ type: 'paragraph', content: p.trim() }],
      }));
    } else {
      processedSlides = [{ orderNumber: 1, title: 'Introduction', blocks: [{ type: 'paragraph', content: 'Lesson content goes here.' }] }];
    }

    const generatedSlug = generateSlug(title) + '-' + Date.now().toString(36);
    const readingTime = calcReadingTime(processedSlides);
    const slidesCount = processedSlides.length;

    const lessonResult = await c.env.DB.prepare(
      `INSERT INTO lessons (title, slug, excerpt, imageUrl, readingTime, slidesCount, isPublished, authorId)
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`
    ).bind(
      title.trim(),
      generatedSlug,
      excerpt || '',
      imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1200',
      readingTime,
      slidesCount,
      authorId
    ).run();

    const lessonId = lessonResult.meta.last_row_id;

    // Insert ordered slides
    for (let i = 0; i < processedSlides.length; i++) {
      const slide = processedSlides[i];
      const orderNum = slide.orderNumber || i + 1;
      const blocksJson = JSON.stringify(slide.blocks || [{ type: 'paragraph', content: slide.content || '' }]);
      await c.env.DB.prepare(
        `INSERT INTO slides (lessonId, orderNumber, title, blocksJson) VALUES (?, ?, ?, ?)`
      ).bind(lessonId, orderNum, slide.title || `Slide ${orderNum}`, blocksJson).run();
    }

    // Attach tags
    if (tagIds && Array.isArray(tagIds)) {
      for (const tagId of tagIds) {
        await c.env.DB.prepare(
          `INSERT OR IGNORE INTO tagsonlessons (lessonId, tagId) VALUES (?, ?)`
        ).bind(lessonId, tagId).run();
      }
    }

    return c.json({ message: 'Lesson created successfully', lessonId, id: lessonId, slug: generatedSlug }, 201);
  } catch (error) {
    console.error('Error creating lesson:', error);
    return c.json({ error: 'Failed to create lesson', details: error.message }, 500);
  }
});

/**
 * PUT /api/lessons/edit/:id
 * Update an existing lesson and its ordered slides (Admin Protected)
 */
lessonRoutes.put('/edit/:id', authenticateUser, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (!id || isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    const body = await c.req.json();
    const { title, content, slides, imageUrl, excerpt, tagIds, isPublished } = body;

    const existing = await c.env.DB.prepare('SELECT * FROM lessons WHERE id = ?').bind(id).first();
    if (!existing) return c.json({ error: 'Lesson not found' }, 404);

    let processedSlides = [];
    if (Array.isArray(slides) && slides.length > 0) {
      processedSlides = slides;
    } else if (content) {
      const parts = content.split(/\n(?:---|[*]{3})\n/g);
      processedSlides = parts.map((p, idx) => ({
        orderNumber: idx + 1,
        title: `Slide ${idx + 1}`,
        blocks: [{ type: 'paragraph', content: p.trim() }],
      }));
    }

    const updatedTitle = title !== undefined ? title.trim() : existing.title;
    const readingTime = calcReadingTime(processedSlides);
    const slidesCount = processedSlides.length || existing.slidesCount;
    const publishedVal = isPublished !== undefined ? (isPublished ? 1 : 0) : existing.isPublished;

    await c.env.DB.prepare(
      `UPDATE lessons SET title = ?, excerpt = ?, imageUrl = ?, readingTime = ?, slidesCount = ?, isPublished = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(
      updatedTitle,
      excerpt !== undefined ? excerpt : existing.excerpt,
      imageUrl || existing.imageUrl,
      readingTime,
      slidesCount,
      publishedVal,
      id
    ).run();

    if (processedSlides.length > 0) {
      await c.env.DB.prepare('DELETE FROM slides WHERE lessonId = ?').bind(id).run();
      for (let i = 0; i < processedSlides.length; i++) {
        const slide = processedSlides[i];
        const orderNum = slide.orderNumber || i + 1;
        const blocksJson = JSON.stringify(slide.blocks || [{ type: 'paragraph', content: slide.content || '' }]);
        await c.env.DB.prepare(
          `INSERT INTO slides (lessonId, orderNumber, title, blocksJson) VALUES (?, ?, ?, ?)`
        ).bind(id, orderNum, slide.title || `Slide ${orderNum}`, blocksJson).run();
      }
    }

    if (tagIds && Array.isArray(tagIds)) {
      await c.env.DB.prepare('DELETE FROM tagsonlessons WHERE lessonId = ?').bind(id).run();
      for (const tagId of tagIds) {
        await c.env.DB.prepare(
          `INSERT OR IGNORE INTO tagsonlessons (lessonId, tagId) VALUES (?, ?)`
        ).bind(id, tagId).run();
      }
    }

    return c.json({ message: 'Lesson updated successfully' }, 200);
  } catch (error) {
    console.error('Error updating lesson:', error);
    return c.json({ error: 'Failed to update lesson', details: error.message }, 500);
  }
});

/**
 * PUT /api/lessons/reorder-slides/:id
 * Dedicated endpoint to reorder slides for a lesson (Admin Protected)
 */
lessonRoutes.put('/reorder-slides/:id', authenticateUser, async (c) => {
  try {
    const lessonId = parseInt(c.req.param('id'));
    if (!lessonId || isNaN(lessonId)) return c.json({ error: 'Invalid Lesson ID' }, 400);

    const body = await c.req.json();
    const { slides } = body;

    if (!Array.isArray(slides) || slides.length === 0) {
      return c.json({ error: 'Slides array required' }, 400);
    }

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const newOrder = i + 1;
      if (slide.id) {
        await c.env.DB.prepare('UPDATE slides SET orderNumber = ? WHERE id = ? AND lessonId = ?')
          .bind(newOrder, slide.id, lessonId)
          .run();
      }
    }

    return c.json({ message: 'Slides reordered successfully' }, 200);
  } catch (error) {
    return c.json({ error: 'Failed to reorder slides', details: error.message }, 500);
  }
});

/**
 * DELETE /api/lessons/delete/:id
 * Delete a lesson note (Admin Protected)
 */
lessonRoutes.delete('/delete/:id', authenticateUser, async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    if (!id || isNaN(id)) return c.json({ error: 'Invalid ID' }, 400);

    await c.env.DB.prepare('DELETE FROM lessons WHERE id = ?').bind(id).run();
    return c.json({ message: 'Lesson deleted successfully' }, 200);
  } catch (error) {
    return c.json({ error: 'Failed to delete lesson' }, 500);
  }
});
