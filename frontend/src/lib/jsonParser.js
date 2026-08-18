import { BLOCK_TYPES, createDefaultBlock } from './blocks.js';

export const AI_PROMPT_TEMPLATE = `You are an expert technical writer and software educator.
Generate a structured JSON note for an interactive visual learning platform.

Requirements:
- Structure content into coherent "pages" (each page represents one focused concept).
- Use interactive block types: 'heading', 'paragraph', 'code', 'callout', 'quiz', 'diagram', 'image', 'table', 'steps', 'keyvalue', 'divider'.
- Return strictly valid JSON with no markdown wrapping or preamble.

Expected JSON Structure:
{
  "title": "Title of the Note",
  "excerpt": "A concise 1-2 sentence overview summary of this note.",
  "coverUrl": "https://images.unsplash.com/...",
  "pages": [
    {
      "title": "Page 1: Title",
      "blocks": [
        { "type": "heading", "level": 2, "content": "Section Title" },
        { "type": "paragraph", "content": "Explanatory paragraph with **bold** or \`code\` terms." },
        { "type": "code", "language": "csharp", "content": "public async Task RunAsync() { }" },
        { "type": "callout", "variant": "tip", "content": "Key takeaway tip." },
        {
          "type": "quiz",
          "question": "What is the primary benefit of ...?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": 0,
          "explanation": "Option A is correct because..."
        }
      ]
    }
  ]
}`;

export const SAMPLE_PAGE_JSON = {
  title: "Caching Strategies & Architecture",
  excerpt: "Deep dive into Cache-Aside, Read-Through, and Write-Behind caching patterns.",
  coverUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=1200",
  pages: [
    {
      title: "Cache-Aside Pattern",
      blocks: [
        {
          type: "heading",
          level: 2,
          content: "Cache-Aside (Lazy Loading)"
        },
        {
          type: "paragraph",
          content: "The application code directly manages reads and writes to the cache. If data is not present in cache, the application reads from the database and populates the cache for subsequent requests."
        },
        {
          type: "code",
          language: "csharp",
          content: "public async Task<User> GetUserAsync(int id)\n{\n    var cached = await _cache.GetAsync<User>($\"user:{id}\");\n    if (cached != null) return cached;\n\n    var user = await _db.Users.FindAsync(id);\n    await _cache.SetAsync($\"user:{id}\", user, TimeSpan.FromMinutes(10));\n    return user;\n}"
        },
        {
          type: "callout",
          variant: "tip",
          content: "Best suited for read-heavy workloads where data does not change frequently."
        },
        {
          type: "quiz",
          question: "What happens in Cache-Aside when a cache miss occurs?",
          options: [
            "The application queries the DB and populates the cache",
            "The cache automatically fetches data from the DB",
            "An exception is immediately thrown to the client",
            "The request fails with HTTP 404"
          ],
          answer: 0,
          explanation: "In Cache-Aside, the application code handles fetching from the DB on a miss and inserting it into the cache."
        }
      ]
    }
  ]
};

/**
 * Normalizes a single block ensuring required fields are present.
 */
export function normalizeBlock(rawBlock) {
  if (!rawBlock || typeof rawBlock !== 'object') {
    return { type: 'paragraph', content: '' };
  }

  const type = String(rawBlock.type || 'paragraph').toLowerCase();
  const validTypes = Object.values(BLOCK_TYPES);
  const resolvedType = validTypes.includes(type) ? type : 'paragraph';

  const defaultBlock = createDefaultBlock(resolvedType);
  return {
    ...defaultBlock,
    ...rawBlock,
    type: resolvedType,
  };
}

/**
 * Normalizes an array of blocks.
 */
export function normalizeBlocks(blocks) {
  if (!Array.isArray(blocks)) return [];
  return blocks.map(normalizeBlock);
}

/**
 * Normalizes a page object.
 */
export function normalizePage(rawPage, index = 0) {
  if (!rawPage || typeof rawPage !== 'object') {
    return {
      orderNumber: index + 1,
      title: `Page ${index + 1}`,
      blocks: [createDefaultBlock('paragraph')],
    };
  }

  const title = typeof rawPage.title === 'string' && rawPage.title.trim()
    ? rawPage.title.trim()
    : `Page ${index + 1}`;

  const rawBlocks = Array.isArray(rawPage.blocks)
    ? rawPage.blocks
    : (Array.isArray(rawPage.content) ? rawPage.content : []);

  const blocks = rawBlocks.length > 0
    ? normalizeBlocks(rawBlocks)
    : [createDefaultBlock('paragraph')];

  return {
    orderNumber: rawPage.orderNumber || index + 1,
    title,
    blocks,
  };
}

/**
 * Parses raw JSON and detects payload structure:
 * - 'blocks': Array of blocks
 * - 'single_page': Single page object with { title, blocks }
 * - 'pages': Array of page objects
 * - 'note': Full note object with { title, excerpt, pages }
 */
export function parseAndNormalizeJson(jsonString) {
  if (!jsonString || typeof jsonString !== 'string') {
    throw new Error('Input is empty');
  }

  // Strip possible markdown code fence wrapper (e.g. ```json ... ```)
  let cleanStr = jsonString.trim();
  if (cleanStr.startsWith('```')) {
    cleanStr = cleanStr.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  }

  const parsed = JSON.parse(cleanStr);

  if (Array.isArray(parsed)) {
    if (parsed.length === 0) {
      throw new Error('JSON array is empty');
    }

    // Check if it's an array of blocks vs array of pages
    const hasBlockTypes = parsed.some((item) => item && typeof item === 'object' && item.type);
    const hasItemTitles = parsed.some((item) => item && typeof item === 'object' && (item.title || Array.isArray(item.blocks)));

    if (hasBlockTypes && !hasItemTitles) {
      // It's an array of blocks for 1 page
      return {
        type: 'blocks',
        blocks: normalizeBlocks(parsed),
        count: parsed.length,
      };
    } else {
      // It's an array of pages
      const pages = parsed.map((p, i) => normalizePage(p, i));
      return {
        type: 'pages',
        pages,
        count: parsed.length,
      };
    }
  }

  if (parsed && typeof parsed === 'object') {
    const rawPagesList = Array.isArray(parsed.pages) ? parsed.pages : null;

    // Check if it's a full note with .pages
    if (rawPagesList) {
      const pages = rawPagesList.map((p, i) => normalizePage(p, i));
      const noteObj = {
        title: typeof parsed.title === 'string' ? parsed.title.trim() : '',
        excerpt: typeof parsed.excerpt === 'string' ? parsed.excerpt.trim() : '',
        coverUrl: typeof parsed.coverUrl === 'string' ? parsed.coverUrl : (parsed.imageUrl || ''),
        pages,
        tagIds: Array.isArray(parsed.tagIds) ? parsed.tagIds : [],
      };
      return {
        type: 'note',
        note: noteObj,
        pageCount: pages.length,
      };
    }

    // Check if it's a single page with .blocks or .title
    if (Array.isArray(parsed.blocks) || typeof parsed.title === 'string') {
      const pageObj = normalizePage(parsed, 0);
      return {
        type: 'single_page',
        page: pageObj,
        blockCount: Array.isArray(parsed.blocks) ? parsed.blocks.length : 0,
      };
    }

    // Fallback: single block object
    if (parsed.type) {
      return {
        type: 'blocks',
        blocks: [normalizeBlock(parsed)],
        count: 1,
      };
    }
  }

  throw new Error('JSON structure not recognized. Expected page object, blocks array, or pages array.');
}
