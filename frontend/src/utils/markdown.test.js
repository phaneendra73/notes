import test from 'node:test';
import assert from 'node:assert/strict';
import { renderMarkdown } from './markdown.js';

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
