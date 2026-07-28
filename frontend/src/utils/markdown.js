import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for safe, well-formatted markdown rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
});

/**
 * Custom marked renderer to wrap mermaid code blocks in a special div
 * so the frontend can initialize mermaid diagrams.
 */
const renderer = new marked.Renderer();
const defaultCodeRenderer = renderer.code.bind(renderer);

renderer.code = (code, language, isEscaped) => {
  if (language === 'mermaid') {
    const rawCode = typeof code === 'object' ? code.text : code;
    return `<div className="mermaid-wrapper my-6 p-4 rounded-xl bg-card border border-border flex flex-col items-center justify-center overflow-x-auto">
      <div className="mermaid" data-code="${encodeURIComponent(rawCode)}">${rawCode}</div>
    </div>`;
  }

  // Quiz code block format: ```quiz ... ```
  if (language === 'quiz') {
    const rawQuiz = typeof code === 'object' ? code.text : code;
    return `<div class="quiz-block-placeholder" data-quiz="${encodeURIComponent(rawQuiz)}"></div>`;
  }

  return defaultCodeRenderer(code, language, isEscaped);
};

marked.use({ renderer });

/**
 * Render markdown string to sanitized HTML.
 * Uses `marked` for proper parsing (handles nested lists, tables, code blocks, data URIs, etc.)
 * and `DOMPurify` to prevent XSS while allowing data:image URIs.
 */
export function renderMarkdown(markdown = '') {
  if (!markdown) return '<p class="text-muted-foreground">No content available.</p>';

  // Transform raw data:image/... URIs into markdown images if not already inside ![alt](data:image...)
  let processedMarkdown = markdown;
  if (typeof processedMarkdown === 'string') {
    processedMarkdown = processedMarkdown.replace(
      /(?<!\]\()(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)/g,
      '![Image]($1)'
    );
  }

  const rawHtml = marked.parse(processedMarkdown);

  // Sanitize to prevent XSS — allow common HTML elements, SVG/mermaid outputs, data: URIs for images
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ADD_DATA_URI_TAGS: ['img'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'em', 'del', 'code', 'pre',
      'ul', 'ol', 'li',
      'blockquote',
      'a', 'img',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'input', 'label', // for task lists
      'div', 'span', 'button',
      'svg', 'g', 'path', 'text', 'line', 'rect', 'circle', 'polygon', 'defs', 'marker', 'foreignObject', 'tspan', 'style' // for mermaid SVG
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title',
      'class', 'className', 'id',
      'type', 'checked', 'disabled',
      'loading',
      'data-code', 'data-quiz', 'data-language',
      'width', 'height', 'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'marker-end', 'transform', 'style', 'xmlns'
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed'],
  });

  return cleanHtml;
}

/**
 * Calculate reading time for a text segment in minutes and seconds
 */
export function calculateSlideReadingTime(text = '') {
  const plainText = text.replace(/<[^>]+>/g, '').replace(/[*#_~`>\[\]()!|-]/g, ' ');
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const seconds = Math.max(15, Math.ceil((words / 200) * 60));

  if (seconds < 60) {
    return `${seconds} sec read`;
  }
  const mins = Math.ceil(seconds / 60);
  return `${mins} min read`;
}
