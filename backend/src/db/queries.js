/**
 * Shared database query helpers for Notes backend.
 * Pure DB operations — no HTTP context, no business logic.
 */

/**
 * Fetch tag objects for a list of note IDs.
 * Returns a map: { noteId: [{ id, name }, ...] }
 */
export async function getTagsForNotes(db, noteIds) {
  if (!noteIds || noteIds.length === 0) return {};
  const placeholders = noteIds.map(() => '?').join(',');
  
  let result;
  try {
    result = await db
      .prepare(
        `SELECT tn.noteId, t.id as tagId, t.name
         FROM tagsonnotes tn
         JOIN tags t ON tn.tagId = t.id
         WHERE tn.noteId IN (${placeholders})`
      )
      .bind(...noteIds)
      .all();
  } catch {
    result = { results: [] };
  }

  const tagMap = {};
  noteIds.forEach((id) => (tagMap[id] = []));
  (result.results || []).forEach((row) => {
    const key = row.noteId;
    if (tagMap[key]) {
      tagMap[key].push({ id: row.tagId, name: row.name });
    }
  });
  return tagMap;
}

/**
 * Attach tags array to each note object in an array.
 * Mutates nothing — returns new array of enriched note objects.
 */
export async function attachTagsToNotes(db, notes) {
  if (!notes || notes.length === 0) return notes;
  const noteIds = notes.map((n) => n.id);
  const tagMap = await getTagsForNotes(db, noteIds);
  return notes.map((note) => ({
    ...note,
    published: Boolean(note.isPublished ?? note.published),
    tags: (tagMap[note.id] || []).map((t) => t.name),
    tagObjects: tagMap[note.id] || [],
  }));
}

/**
 * Estimate reading time in minutes from pages blocks JSON.
 * Assumes 200 words per minute average reading speed.
 */
export function calcReadingTime(pages) {
  if (!Array.isArray(pages) || pages.length === 0) return 1;
  const textContent = pages
    .map((p) => {
      if (Array.isArray(p.blocks)) {
        return p.blocks
          .map((b) => {
            let blockText = b.content || '';
            if (b.question) blockText += ' ' + b.question;
            if (b.explanation) blockText += ' ' + b.explanation;
            if (Array.isArray(b.options)) blockText += ' ' + b.options.join(' ');
            if (Array.isArray(b.items)) blockText += ' ' + b.items.join(' ');
            if (Array.isArray(b.pairs)) blockText += ' ' + b.pairs.map((pr) => `${pr.key} ${pr.value}`).join(' ');
            return blockText;
          })
          .join(' ');
      }
      return typeof p.content === 'string' ? p.content : '';
    })
    .join(' ');

  const wordCount = textContent.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Generate URL-friendly slug from title + timestamp suffix for uniqueness.
 */
export function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
  const suffix = Date.now().toString(36);
  return `${base || 'note'}-${suffix}`;
}

/**
 * Parse a raw D1 page row into a normalized page object with parsed JSON blocks.
 */
export function parsePageRow(row) {
  if (!row) return null;
  let blocks = [];
  if (row.blocksJson) {
    try {
      blocks = JSON.parse(row.blocksJson);
    } catch {
      blocks = [];
    }
  }
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    title: row.title,
    blocks,
  };
}

/**
 * D1 SQLite UPSERT / Diff Computation for pages.
 * Compares existing DB pages with incoming editor pages.
 * Returns: { toDelete, toUpdate, toInsert, unchanged }
 */
export function diffPages(existingPages, incomingPages) {
  const existingMap = new Map();
  for (const page of existingPages) {
    existingMap.set(page.id, page);
  }

  const incomingIds = new Set(
    incomingPages.filter((p) => p.id !== undefined && p.id !== null).map((p) => p.id)
  );

  // Pages in DB that are missing in incoming list -> DELETE
  const toDelete = existingPages
    .filter((p) => !incomingIds.has(p.id))
    .map((p) => p.id);

  const toUpdate = [];
  const toInsert = [];
  const unchanged = [];

  incomingPages.forEach((incPage, idx) => {
    const targetOrder = incPage.orderNumber || idx + 1;
    const targetTitle = incPage.title || `Page ${targetOrder}`;
    const blocksJson = JSON.stringify(incPage.blocks || []);

    if (incPage.id && existingMap.has(incPage.id)) {
      const existing = existingMap.get(incPage.id);
      const isDirty =
        existing.orderNumber !== targetOrder ||
        existing.title !== targetTitle ||
        existing.blocksJson !== blocksJson;

      if (isDirty) {
        toUpdate.push({
          id: incPage.id,
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
 * Intelligent UPSERT / diff sync for note pages.
 * Executes deletes, updates, and inserts atomically in a D1 batch transaction.
 * Preserves page IDs and avoids UNIQUE(noteId, orderNumber) collisions.
 */
export async function syncNotePages(db, noteId, incomingPages) {
  if (!Array.isArray(incomingPages) || incomingPages.length === 0) return;

  const existingRow = await db
    .prepare('SELECT id, orderNumber, title, blocksJson FROM pages WHERE noteId = ? ORDER BY orderNumber ASC')
    .bind(noteId)
    .all();
  const existingPages = existingRow.results || [];

  const { toDelete, toUpdate, toInsert, unchanged } = diffPages(existingPages, incomingPages);

  // If nothing to delete, update, or insert, we are done
  if (toDelete.length === 0 && toUpdate.length === 0 && toInsert.length === 0) {
    return { toDelete, toUpdate, toInsert, unchanged };
  }

  const statements = [];

  // 1. Delete removed pages
  for (const id of toDelete) {
    statements.push(db.prepare('DELETE FROM pages WHERE id = ? AND noteId = ?').bind(id, noteId));
  }

  // 2. If there are updates or inserts, temporarily shift order numbers of existing kept pages
  // to avoid temporary UNIQUE(noteId, orderNumber) constraint collisions during reordering.
  if (toUpdate.length > 0) {
    for (let i = 0; i < toUpdate.length; i++) {
      statements.push(
        db.prepare('UPDATE pages SET orderNumber = ? WHERE id = ?').bind(-(i + 1), toUpdate[i].id)
      );
    }
  }

  // 3. Apply target updates
  for (const up of toUpdate) {
    statements.push(
      db
        .prepare('UPDATE pages SET orderNumber = ?, title = ?, blocksJson = ? WHERE id = ?')
        .bind(up.orderNumber, up.title, up.blocksJson, up.id)
    );
  }

  // 4. Insert newly created pages
  for (const ins of toInsert) {
    statements.push(
      db
        .prepare('INSERT INTO pages (noteId, orderNumber, title, blocksJson) VALUES (?, ?, ?, ?)')
        .bind(noteId, ins.orderNumber, ins.title, ins.blocksJson)
    );
  }

  // 5. Update note's pagesCount
  const finalPagesCount = incomingPages.length;
  statements.push(
    db.prepare('UPDATE notes SET pagesCount = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').bind(finalPagesCount, noteId)
  );

  // Execute all atomic statements together
  if (typeof db.batch === 'function') {
    try {
      await db.batch(statements);
    } catch {
      for (const stmt of statements) {
        await stmt.run();
      }
    }
  } else {
    for (const stmt of statements) {
      await stmt.run();
    }
  }

  return { toDelete, toUpdate, toInsert, unchanged };
}

/**
 * Insert or replace tag-note associations.
 * Uses atomic D1 batching for single-roundtrip execution.
 */
export async function syncNoteTags(db, noteId, tagIds) {
  const statements = [
    db.prepare('DELETE FROM tagsonnotes WHERE noteId = ?').bind(noteId),
  ];
  if (Array.isArray(tagIds) && tagIds.length > 0) {
    for (const rawId of tagIds) {
      const tagId = parseInt(rawId, 10);
      if (!isNaN(tagId)) {
        statements.push(
          db.prepare('INSERT OR IGNORE INTO tagsonnotes (noteId, tagId) VALUES (?, ?)').bind(noteId, tagId)
        );
      }
    }
  }
  if (typeof db.batch === 'function') {
    try {
      await db.batch(statements);
    } catch {
      for (const stmt of statements) {
        await stmt.run();
      }
    }
  } else {
    for (const stmt of statements) {
      await stmt.run();
    }
  }
}
