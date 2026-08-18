import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAndNormalizeJson,
  normalizeBlock,
  normalizePage,
  AI_PROMPT_TEMPLATE,
  SAMPLE_PAGE_JSON
} from '../../src/lib/jsonParser.js';

test('parseAndNormalizeJson parses single block array correctly', () => {
  const json = JSON.stringify([
    { type: 'heading', level: 2, content: 'Test Heading' },
    { type: 'paragraph', content: 'Test content' }
  ]);

  const result = parseAndNormalizeJson(json);
  assert.equal(result.type, 'blocks');
  assert.equal(result.count, 2);
  assert.equal(result.blocks[0].content, 'Test Heading');
  assert.equal(result.blocks[1].content, 'Test content');
});

test('parseAndNormalizeJson parses single page object correctly', () => {
  const json = JSON.stringify({
    title: 'Page 1: Intro',
    blocks: [
      { type: 'callout', variant: 'tip', content: 'Important Tip' }
    ]
  });

  const result = parseAndNormalizeJson(json);
  assert.equal(result.type, 'single_page');
  assert.equal(result.page.title, 'Page 1: Intro');
  assert.equal(result.page.blocks.length, 1);
  assert.equal(result.page.blocks[0].type, 'callout');
});

test('parseAndNormalizeJson parses array of pages correctly', () => {
  const json = JSON.stringify([
    { title: 'Page A', blocks: [{ type: 'heading', content: 'A' }] },
    { title: 'Page B', blocks: [{ type: 'paragraph', content: 'B' }] }
  ]);

  const result = parseAndNormalizeJson(json);
  assert.equal(result.type, 'pages');
  assert.equal(result.count, 2);
  assert.equal(result.pages[0].title, 'Page A');
  assert.equal(result.pages[1].title, 'Page B');
});

test('parseAndNormalizeJson parses full note object correctly', () => {
  const json = JSON.stringify({
    title: 'Full Engineering Note',
    excerpt: 'Short summary of note',
    coverUrl: 'https://example.com/image.jpg',
    pages: [
      { title: 'Chapter 1', blocks: [{ type: 'paragraph', content: 'Hello' }] }
    ]
  });

  const result = parseAndNormalizeJson(json);
  assert.equal(result.type, 'note');
  assert.equal(result.note.title, 'Full Engineering Note');
  assert.equal(result.note.excerpt, 'Short summary of note');
  assert.equal(result.note.pages.length, 1);
  assert.equal(result.note.pages[0].title, 'Chapter 1');
});

test('parseAndNormalizeJson strips markdown code fence wrappers', () => {
  const fenced = '```json\n{\n  "title": "Fenced Title",\n  "blocks": [{ "type": "heading", "content": "Clean" }]\n}\n```';
  const result = parseAndNormalizeJson(fenced);
  assert.equal(result.type, 'single_page');
  assert.equal(result.page.title, 'Fenced Title');
});

test('parseAndNormalizeJson throws on invalid JSON or empty input', () => {
  assert.throws(() => parseAndNormalizeJson(''), /Input is empty/);
  assert.throws(() => parseAndNormalizeJson('invalid json syntax'));
  assert.throws(() => parseAndNormalizeJson('[]'), /JSON array is empty/);
});

test('normalizeBlock supplies default attributes for incomplete block objects', () => {
  const block = normalizeBlock({ type: 'quiz' });
  assert.equal(block.type, 'quiz');
  assert.ok(Array.isArray(block.options));
  assert.equal(typeof block.answer, 'number');
});
