/**
 * Shared database query helpers for Kadha backend.
 * Pure DB operations — no HTTP context, no business logic.
 */

/**
 * Fetch tag objects for a list of lesson IDs.
 * Returns a map: { lessonId: [{ id, name }, ...] }
 */
export async function getTagsForLessons(db, lessonIds) {
  if (!lessonIds || lessonIds.length === 0) return {};
  const placeholders = lessonIds.map(() => '?').join(',');
  const result = await db
    .prepare(
      `SELECT tl.lessonId, t.id as tagId, t.name
       FROM tagsonlessons tl
       JOIN tags t ON tl.tagId = t.id
       WHERE tl.lessonId IN (${placeholders})`
    )
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
 * Attach tags array to each lesson object in an array.
 * Mutates nothing — returns new array of enriched lesson objects.
 */
export async function attachTagsToLessons(db, lessons) {
  if (!lessons || lessons.length === 0) return lessons;
  const lessonIds = lessons.map((l) => l.id);
  const tagMap = await getTagsForLessons(db, lessonIds);
  return lessons.map((lesson) => ({
    ...lesson,
    published: Boolean(lesson.isPublished ?? lesson.published),
    tags: (tagMap[lesson.id] || []).map((t) => t.name),
    tagObjects: tagMap[lesson.id] || [],
  }));
}

/**
 * Estimate reading time in minutes from slides blocks JSON.
 * Assumes 200 words per minute average reading speed.
 */
export function calcReadingTime(slides) {
  if (!Array.isArray(slides) || slides.length === 0) return 1;
  const textContent = slides
    .map((s) => JSON.stringify(s.blocks || s.blocksJson || ''))
    .join(' ');
  const wordCount = textContent.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Generate a URL-safe slug from a lesson title.
 * Appends a short base-36 timestamp suffix to guarantee uniqueness.
 * @example "C# Async Deep Dive" → "csharp-async-deep-dive-lxk9z"
 */
export function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${Date.now().toString(36)}`;
}

/**
 * Parse a slide row from DB into a clean slide object.
 * Decodes blocksJson, returns blocks array only (no markdown reconstruction).
 */
export function parseSlideRow(row, index = 0) {
  let blocks = [];
  try {
    blocks = JSON.parse(row.blocksJson || '[]');
  } catch {
    blocks = [];
  }
  const order = row.orderNumber || index + 1;
  return {
    id: row.id,
    orderNumber: order,
    title: row.title || `Slide ${order}`,
    blocks: Array.isArray(blocks) ? blocks : [],
  };
}

/**
 * Insert or replace tag-lesson associations.
 * Uses atomic D1 batching for single-roundtrip execution.
 */
export async function syncLessonTags(db, lessonId, tagIds) {
  const statements = [
    db.prepare('DELETE FROM tagsonlessons WHERE lessonId = ?').bind(lessonId),
  ];
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    for (const rawId of tagIds) {
      const tagId = parseInt(rawId, 10);
      if (!isNaN(tagId)) {
        statements.push(
          db.prepare('INSERT OR IGNORE INTO tagsonlessons (lessonId, tagId) VALUES (?, ?)').bind(lessonId, tagId)
        );
      }
    }
  }
  if (typeof db.batch === 'function') {
    await db.batch(statements);
  } else {
    for (const stmt of statements) {
      await stmt.run();
    }
  }
}
