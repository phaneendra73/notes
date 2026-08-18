import { BLOCK_TYPES, createDefaultBlock } from './blocks.js';

export const AI_PROMPT_TEMPLATE = `You are a visual note and slide generator for an engineering learning platform.
Your task is to take my raw notes/text and convert them into a structured JSON slide deck.

OUTPUT REQUIREMENTS:
- Return ONLY valid JSON (no markdown wrapping, or inside a \`\`\`json block).
- Make each slide focused, crisp, and high-impact.
- Use diverse visual blocks for maximum clarity: headings, paragraphs, callouts (tip/warning/info/note), code blocks, key-value pairs, numbered steps, diagrams (Mermaid), and interactive quizzes.

JSON SCHEMA:
{
  "title": "Title of the Note",
  "excerpt": "A crisp 1-2 sentence overview of the note.",
  "slides": [
    {
      "title": "Slide Title",
      "blocks": [
        { "type": "heading", "level": 2, "content": "Section Title" },
        { "type": "paragraph", "content": "Crisp explanation. You can use **bold**, *italic*, and \`code\` formatting." },
        { "type": "callout", "variant": "tip", "content": "Key takeaway or best practice." },
        { "type": "code", "language": "csharp", "content": "// Code snippet here" },
        { "type": "keyvalue", "title": "Trade-offs", "layout": "list", "pairs": [
          { "key": "Advantage", "value": "High performance and lower memory usage." },
          { "key": "Drawback", "value": "Increased initial implementation complexity." }
        ]},
        { "type": "steps", "title": "Execution Steps", "items": ["Step 1 description", "Step 2 description"] },
        { "type": "quiz", "question": "Question text?", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": 0, "explanation": "Why Option A is correct." }
      ]
    }
  ]
}

SUPPORTED BLOCK TYPES & ATTRIBUTES:
- "heading": { "type": "heading", "level": 2 or 3, "content": "string" }
- "paragraph": { "type": "paragraph", "content": "string with markdown bold/italic/code" }
- "code": { "type": "code", "language": "csharp|javascript|typescript|python|sql|bash|json|yaml|go|rust|text", "content": "string" }
- "callout": { "type": "callout", "variant": "tip|warning|info|note", "content": "string" }
- "keyvalue": { "type": "keyvalue", "title": "string", "layout": "list|grid", "pairs": [{"key": "string", "value": "string"}] }
- "steps": { "type": "steps", "title": "string", "items": ["string"] }
- "table": { "type": "table", "caption": "string", "headers": ["Col 1", "Col 2"], "rows": [["Val 1", "Val 2"]] }
- "diagram": { "type": "diagram", "content": "graph TD\\n  A[Start] --> B[Process]\\n  B --> C[End]" }
- "quiz": { "type": "quiz", "question": "string", "options": ["A", "B", "C", "D"], "answer": 0, "explanation": "string" }
- "divider": { "type": "divider", "label": "string", "style": "solid" }

Convert the following raw notes:
`;

export const SAMPLE_SLIDE_JSON = {
  title: "Distributed Caching & Cache-Aside",
  blocks: [
    {
      type: "heading",
      level: 2,
      content: "Cache-Aside Architecture"
    },
    {
      type: "paragraph",
      content: "In the **Cache-Aside** pattern, the application is responsible for coordinating reads and writes with both the cache and the primary database."
    },
    {
      type: "callout",
      variant: "tip",
      content: "Best suited for read-heavy workloads where data doesn't change every second."
    },
    {
      type: "keyvalue",
      title: "Key Characteristics",
      layout: "list",
      pairs: [
        { key: "Read Flow", value: "Check cache -> On miss, read DB & write back to cache." },
        { key: "Write Flow", value: "Update DB directly -> Invalidate or update cache entry." },
        { key: "Resilience", value: "If cache fails, requests can still fallback to the primary DB." }
      ]
    },
    {
      type: "code",
      language: "csharp",
      content: "public async Task<UserProfile> GetUserAsync(string userId)\n{\n    var cached = await _redis.GetStringAsync($\"user:{userId}\");\n    if (cached != null) return JsonSerializer.Deserialize<UserProfile>(cached);\n\n    var user = await _db.Users.FindAsync(userId);\n    if (user != null)\n        await _redis.SetStringAsync($\"user:{userId}\", JsonSerializer.Serialize(user), new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(30) });\n\n    return user;\n}"
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
 * Normalizes a slide object.
 */
export function normalizeSlide(rawSlide, index = 0) {
  if (!rawSlide || typeof rawSlide !== 'object') {
    return {
      orderNumber: index + 1,
      title: `Slide ${index + 1}`,
      blocks: [createDefaultBlock('paragraph')],
    };
  }

  const title = typeof rawSlide.title === 'string' && rawSlide.title.trim()
    ? rawSlide.title.trim()
    : `Slide ${index + 1}`;

  const rawBlocks = Array.isArray(rawSlide.blocks)
    ? rawSlide.blocks
    : (Array.isArray(rawSlide.content) ? rawSlide.content : []);

  const blocks = rawBlocks.length > 0
    ? normalizeBlocks(rawBlocks)
    : [createDefaultBlock('paragraph')];

  return {
    orderNumber: rawSlide.orderNumber || index + 1,
    title,
    blocks,
  };
}

/**
 * Parses raw JSON and detects payload structure:
 * - 'blocks': Array of blocks
 * - 'single_slide': Single slide object with { title, blocks }
 * - 'slides': Array of slide objects
 * - 'lesson': Full lesson object with { title, excerpt, slides }
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

    // Check if it's an array of blocks vs array of slides
    const hasBlockTypes = parsed.some((item) => item && typeof item === 'object' && item.type);
    const hasSlideTitles = parsed.some((item) => item && typeof item === 'object' && (item.title || Array.isArray(item.blocks)));

    if (hasBlockTypes && !hasSlideTitles) {
      // It's an array of blocks for 1 slide
      return {
        type: 'blocks',
        blocks: normalizeBlocks(parsed),
        count: parsed.length,
      };
    } else {
      // It's an array of slides
      return {
        type: 'slides',
        slides: parsed.map((s, i) => normalizeSlide(s, i)),
        count: parsed.length,
      };
    }
  }

  if (parsed && typeof parsed === 'object') {
    // Check if it's a full lesson with .slides
    if (Array.isArray(parsed.slides)) {
      return {
        type: 'lesson',
        lesson: {
          title: typeof parsed.title === 'string' ? parsed.title.trim() : '',
          excerpt: typeof parsed.excerpt === 'string' ? parsed.excerpt.trim() : '',
          coverUrl: typeof parsed.coverUrl === 'string' ? parsed.coverUrl : (parsed.imageUrl || ''),
          slides: parsed.slides.map((s, i) => normalizeSlide(s, i)),
          tagIds: Array.isArray(parsed.tagIds) ? parsed.tagIds : [],
        },
        slideCount: parsed.slides.length,
      };
    }

    // Check if it's a single slide with .blocks or .title
    if (Array.isArray(parsed.blocks) || typeof parsed.title === 'string') {
      return {
        type: 'single_slide',
        slide: normalizeSlide(parsed, 0),
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

  throw new Error('JSON structure not recognized. Expected slide object, blocks array, or slides array.');
}
