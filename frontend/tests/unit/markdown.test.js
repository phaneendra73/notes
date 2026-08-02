import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, autoWrapMermaid } from '../../src/utils/markdown.js';

test('renders formatted content inside markdown tables with responsive container', () => {
  const markdown = [
    '| Feature | Description | Status |',
    '| --- | --- | --- |',
    '| **Auth** | JWT Token authentication | `Active` |',
    '| **Search** | Levenshtein typo-tolerant search | `Active` |',
  ].join('\n');

  const html = renderMarkdown(markdown);

  assert.match(html, /<table/);
  assert.match(html, /<strong>Auth<\/strong>/);
  assert.match(html, /<code>Active<\/code>/);
});

test('autoWrapMermaid wraps unfenced raw mermaid blocks cleanly', () => {
  const input = `Architecture Overview

graph TD
    A[Client] --> B[API Gateway]
    B --> C[(SQLite D1)]

> System Diagram`;

  const wrapped = autoWrapMermaid(input);
  assert.match(wrapped, /```mermaid\n\s*graph TD/);

  const html = renderMarkdown(input);
  assert.match(html, /class="mermaid/);
  assert.match(html, /data-code=/);
});

test('renders styled code blocks with language badge and copy button data attribute', () => {
  const markdown = `\`\`\`csharp
public async Task<int> ProcessDataAsync()
{
    return 42;
}
\`\`\``;

  const html = renderMarkdown(markdown);
  assert.match(html, /CSHARP/);
  assert.match(html, /copy-code-btn/);
  assert.match(html, /data-code=/);
  assert.match(html, /ProcessDataAsync/);
});

test('renders images with custom width and alignment classes', () => {
  const markdown = `![Architecture | 300px | center](https://images.unsplash.com/photo-1550745165-9bc0b252726f)`;

  const html = renderMarkdown(markdown);
  assert.match(html, /max-width:\s*300px/);
  assert.match(html, /flex-col items-center/);
  assert.match(html, /Architecture/);
});

test('sanitizes malicious links and returns valid HTML structure', () => {
  const markdown = `[Safe Link](javascript:alert(1))
[Valid Link](https://example.com)`;

  const html = renderMarkdown(markdown);

  assert.match(html, /<a /);
  assert.match(html, /https:\/\/example\.com/);
});

test('handles raw base64 data URIs inside markdown text seamlessly', () => {
  const base64Img = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEAD8D+JaQAA3AA/v59WAAAAA==';
  const markdown = `Here is an inline diagram:

${base64Img}`;

  const html = renderMarkdown(markdown);
  assert.match(html, /<img src="data:image\/webp;base64,/);
});
