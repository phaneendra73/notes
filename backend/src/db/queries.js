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
 * Pure diffing logic for slides to identify insertions, updates, deletions, and unchanged slides.
 */
export function diffSlides(existingSlides = [], incomingSlides = []) {
  const existingMap = new Map();
  existingSlides.forEach((row) => {
    existingMap.set(row.id, row);
  });

  const incomingIds = new Set(
    incomingSlides
      .filter((s) => s.id != null && !isNaN(Number(s.id)))
      .map((s) => Number(s.id))
  );

  // Slides in DB but omitted in incoming payload -> Delete
  const toDelete = existingSlides
    .filter((row) => !incomingIds.has(row.id))
    .map((row) => row.id);

  const toUpdate = [];
  const toInsert = [];
  const unchanged = [];

  incomingSlides.forEach((slide, idx) => {
    const targetOrder = slide.orderNumber || idx + 1;
    const targetTitle = slide.title || `Slide ${targetOrder}`;
    const blocks = Array.isArray(slide.blocks) && slide.blocks.length > 0
      ? slide.blocks
      : [{ type: 'paragraph', content: slide.content || '' }];
    const blocksJson = JSON.stringify(blocks);

    const slideId = slide.id != null ? Number(slide.id) : null;
    const existing = slideId != null ? existingMap.get(slideId) : null;

    if (existing) {
      // Check if anything actually changed
      const titleChanged = (existing.title || '') !== targetTitle;
      const orderChanged = Number(existing.orderNumber) !== Number(targetOrder);
      
      let blocksChanged = false;
      try {
        blocksChanged = JSON.stringify(JSON.parse(existing.blocksJson || '[]')) !== blocksJson;
      } catch {
        blocksChanged = true;
      }

      if (titleChanged || orderChanged || blocksChanged) {
        toUpdate.push({
          id: existing.id,
          orderNumber: targetOrder,
          title: targetTitle,
          blocksJson,
        });
      } else {
        unchanged.push({ id: existing.id });
      }
    } else {
      toInsert.push({
        orderNumber: targetOrder,
        title: targetTitle,
        blocksJson,
      });
    }
  });

  return {
    toDelete,
    toUpdate,
    toInsert,
    unchanged,
  };
}

/**
 * Intelligent UPSERT / diff sync for lesson slides.
 * Executes deletes, updates, and inserts atomically in a D1 batch transaction.
 * Preserves slide IDs and avoids UNIQUE(lessonId, orderNumber) collisions.
 */
export async function syncLessonSlides(db, lessonId, incomingSlides) {
  if (!Array.isArray(incomingSlides) || incomingSlides.length === 0) return;

  const existingRow = await db
    .prepare('SELECT id, orderNumber, title, blocksJson FROM slides WHERE lessonId = ? ORDER BY orderNumber ASC')
    .bind(lessonId)
    .all();
  const existingSlides = existingRow.results || [];

  const { toDelete, toUpdate, toInsert, unchanged } = diffSlides(existingSlides, incomingSlides);

  // If nothing to delete, update, or insert, we are done
  if (toDelete.length === 0 && toUpdate.length === 0 && toInsert.length === 0) {
    return { toDelete, toUpdate, toInsert, unchanged };
  }

  const statements = [];

  // 1. Delete removed slides
  for (const id of toDelete) {
    statements.push(db.prepare('DELETE FROM slides WHERE id = ? AND lessonId = ?').bind(id, lessonId));
  }

  // 2. If there are updates or inserts, temporarily shift order numbers of existing kept slides
  // to avoid temporary UNIQUE(lessonId, orderNumber) constraint collisions during reordering.
  if (toUpdate.length > 0) {
    statements.push(
      db.prepare('UPDATE slides SET orderNumber = -orderNumber - 10000 WHERE lessonId = ?').bind(lessonId)
    );
    // Apply updates
    for (const slide of toUpdate) {
      statements.push(
        db.prepare('UPDATE slides SET orderNumber = ?, title = ?, blocksJson = ? WHERE id = ? AND lessonId = ?').bind(
          slide.orderNumber,
          slide.title,
          slide.blocksJson,
          slide.id,
          lessonId
        )
      );
    }
    // Restore unchanged slides' positive order numbers if they were shifted
    for (const slide of unchanged) {
      const orig = existingSlides.find((s) => s.id === slide.id);
      if (orig) {
        statements.push(
          db.prepare('UPDATE slides SET orderNumber = ? WHERE id = ? AND lessonId = ?').bind(
            orig.orderNumber,
            slide.id,
            lessonId
          )
        );
      }
    }
  }

  // 3. Insert newly added slides
  for (const slide of toInsert) {
    statements.push(
      db.prepare('INSERT INTO slides (lessonId, orderNumber, title, blocksJson) VALUES (?, ?, ?, ?)').bind(
        lessonId,
        slide.orderNumber,
        slide.title,
        slide.blocksJson
      )
    );
  }

  if (typeof db.batch === 'function') {
    await db.batch(statements);
  } else {
    for (const stmt of statements) {
      await stmt.run();
    }
  }

  return { toDelete, toUpdate, toInsert, unchanged };
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

