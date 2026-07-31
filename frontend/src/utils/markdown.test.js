import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown, autoWrapMermaid } from './markdown.js';

test('renders formatted content inside markdown tables', () => {
  const markdown = [
    '| Name | Notes |',
    '| --- | --- |',
    '| **Ada** | [Docs](https://example.com) |',
  ].join('\n');

  const html = renderMarkdown(markdown);

  assert.match(html, /<table>/);
  assert.match(html, /<strong>Ada<\/strong>/);
  assert.match(html, /<a href="https:\/\/example\.com"/);
});

test('autoWrapMermaid wraps unfenced raw mermaid blocks', () => {
  const input = `Level-Order BFS Traversal

graph TD
    A((10)) --> B((5))
    A --> C((15))

> Key Takeaway`;

  const wrapped = autoWrapMermaid(input);
  assert.match(wrapped, /```mermaid\n\s*graph TD/);

  const html = renderMarkdown(input);
  assert.match(html, /class="mermaid/);
  assert.match(html, /data-code=/);
});

test('renders styled code blocks with copy button data attribute', () => {
  const markdown = `\`\`\`csharp
public async Task<int> ProcessDataAsync()
{
    return 42;
}
\`\`\``;

  const html = renderMarkdown(markdown);
  assert.match(html, /CSHARP/);
  assert.match(html, /copy-code-btn/);
  assert.match(html, /ProcessDataAsync/);
});

test('renders images with custom size and alignment attributes', () => {
  const markdown = `![System Architecture | 300px | center](https://example.com/logo.webp)`;

  const html = renderMarkdown(markdown);
  assert.match(html, /max-width:\s*300px/);
  assert.match(html, /flex-col items-center/);
  assert.match(html, /System Architecture/);
});


