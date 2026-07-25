function escapeHtml(text = '') {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function renderInlineMarkdown(text = '') {
  let html = escapeHtml(text);

  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline">$1</a>');
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  return html;
}

function parseTableRow(row = '') {
  const trimmed = row.trim();
  if (!trimmed) return [];

  const withoutLeading = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const withoutTrailing = withoutLeading.endsWith('|') ? withoutLeading.slice(0, -1) : withoutLeading;

  return withoutTrailing.split('|').map(cell => cell.trim());
}

function isTableSeparatorRow(row = '') {
  const cells = parseTableRow(row);
  if (cells.length < 2) return false;
  return cells.every(cell => /^:?-{3,}:?$/.test(cell));
}

function buildTableHtml(rows = []) {
  const parsedRows = rows.map(parseTableRow).filter(row => row.length > 0);
  if (parsedRows.length < 2) return '';

  const headers = parsedRows[0].map(cell => `<th>${renderInlineMarkdown(cell)}</th>`).join('');
  const bodyRows = parsedRows.slice(2).map(row => {
    const cells = row.map(cell => `<td>${renderInlineMarkdown(cell)}</td>`).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `<table><thead><tr>${headers}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

function parseTableBlocks(markdown = '') {
  const lines = markdown.split(/\r?\n/);
  const output = [];
  const placeholders = [];

  for (let index = 0; index < lines.length; index += 1) {
    const currentLine = lines[index].trim();
    const nextLine = lines[index + 1]?.trim() || '';

    if (currentLine.includes('|') && isTableSeparatorRow(nextLine) && parseTableRow(currentLine).length > 1) {
      const rows = [currentLine, nextLine];
      let cursor = index + 1;

      while (cursor + 1 < lines.length) {
        const nextRow = lines[cursor + 1]?.trim() || '';
        if (!nextRow || !nextRow.includes('|') || isTableSeparatorRow(nextRow)) break;
        rows.push(nextRow);
        cursor += 1;
      }

      const placeholder = `__KADHA_TABLE_${placeholders.length}__`;
      placeholders.push(buildTableHtml(rows));
      output.push(placeholder);
      index = cursor;
      continue;
    }

    output.push(lines[index]);
  }

  return {
    html: output.join('\n'),
    placeholders,
  };
}

export function renderMarkdown(markdown = '') {
  if (!markdown) return 'No content available.';

  const { html: contentWithPlaceholders, placeholders } = parseTableBlocks(markdown);
  const segments = contentWithPlaceholders.split(/(__KADHA_TABLE_\d+__)/);
  const escapedSegments = segments.map(segment => {
    if (!segment) return '';
    if (/^__KADHA_TABLE_\d+__$/.test(segment)) return segment;
    return escapeHtml(segment);
  });

  let html = escapedSegments.join('');

  placeholders.forEach((tableHtml, index) => {
    html = html.replace(`__KADHA_TABLE_${index}__`, tableHtml);
  });

  // Code blocks: ```language ... ```
  html = html.replace(/```(\w*)\n([\s\S]*?)\n```/gm, (match, lang, code) => {
    return `<pre><code class="language-${lang}">${code.trim()}</code></pre>`;
  });

  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Headers: # Header
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
  html = html.replace(/^#### (.*?)$/gm, '<h4>$1</h4>');

  // Blockquotes: > Quote
  html = html.replace(/^&gt;\s(.*?)$/gm, '<blockquote>$1</blockquote>');

  // Horizontal rules: --- or *** or ___ on a line
  html = html.replace(/^(?:\*{3,}|-{3,}|_{3,})\s*$/gm, '<hr />');

  // Task list items
  html = html.replace(/^- \[ \] (.*?)$/gm, '<li class="task-list-item"><label><input type="checkbox" disabled /> $1</label></li>');
  html = html.replace(/^- \[(x|X)\] (.*?)$/gm, '<li class="task-list-item"><label><input type="checkbox" checked disabled /> $2</label></li>');

  // Strikethrough: ~~text~~
  html = html.replace(/~~([^~]+)~~/g, '<del>$1</del>');

  // Images: ![alt](url)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');

  // Unordered lists: - item
  html = html.replace(/^\-\s(.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');

  // Ordered lists: 1. item
  html = html.replace(/^\d+\.\s(.*?)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>)+/gs, '<ol>$&</ol>');

  // Links: [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-400 hover:underline">$1</a>');

  // Bold & Italic
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

  // Paragraphs (split by double newlines)
  const lines = html.split('\n\n');
  const formattedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    // Skip if it starts with structural block tags
    if (/^<(h1|h2|h3|h4|pre|blockquote|ul|li|ol|table|hr)/i.test(trimmed)) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
  });

  return formattedLines.filter(Boolean).join('');
}
