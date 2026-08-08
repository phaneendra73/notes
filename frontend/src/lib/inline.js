import React from 'react';

/**
 * Lightweight inline text parser.
 *
 * Supports ONLY the formatting authors use in paragraph and callout content:
 *   **bold**     → <strong>
 *   *italic*     → <em>
 *   `code`       → <code>
 *   [text](url)  → <a href="url">
 *
 * Returns an array of React elements and string nodes.
 * No HTML strings. No dangerouslySetInnerHTML. No heavy Markdown library.
 *
 * @param {string} text - Raw text with inline formatting
 * @returns {React.ReactNode[]}
 */
export function parseInline(text) {
  if (!text || typeof text !== 'string') return [text || ''];

  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    if (match[1] !== undefined) {
      // **bold**
      nodes.push(React.createElement('strong', { key: key++ }, match[1]));
    } else if (match[2] !== undefined) {
      // *italic*
      nodes.push(React.createElement('em', { key: key++ }, match[2]));
    } else if (match[3] !== undefined) {
      // `code`
      nodes.push(React.createElement('code', { key: key++, className: 'inline-code' }, match[3]));
    } else if (match[4] !== undefined && match[5] !== undefined) {
      // [text](url)
      const href = match[5];
      const isSafeUrl = /^https?:\/\/|^mailto:/.test(href);
      nodes.push(
        React.createElement(
          'a',
          {
            key: key++,
            href: isSafeUrl ? href : '#',
            target: isSafeUrl && href.startsWith('http') ? '_blank' : undefined,
            rel: isSafeUrl && href.startsWith('http') ? 'noopener noreferrer' : undefined,
            className: 'inline-link',
          },
          match[4]
        )
      );
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : [text];
}

/**
 * Render a multi-line text string with inline formatting.
 * Preserves line breaks by splitting on \n and inserting <br /> elements.
 *
 * @param {string} text
 * @returns {React.ReactNode}
 */
export function renderInlineText(text) {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.flatMap((line, lineIdx) => {
    const parsed = parseInline(line);
    if (lineIdx < lines.length - 1) {
      return [...parsed, React.createElement('br', { key: `br-${lineIdx}` })];
    }
    return parsed;
  });
}
