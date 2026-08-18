import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseAndNormalizeJson,
  normalizeBlock,
  normalizeSlide,
  AI_PROMPT_TEMPLATE,
  SAMPLE_SLIDE_JSON
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

test('parseAndNormalizeJson parses single slide object correctly', () => {
  const json = JSON.stringify({
    title: 'Slide 1: Intro',
    blocks: [
      { type: 'callout', variant: 'tip', content: 'Important Tip' }
    ]
  });

  const result = parseAndNormalizeJson(json);
  assert.equal(result.type, 'single_slide');
  assert.equal(result.slide.title, 'Slide 1: Intro');
  assert.equal(result.slide.blocks.length, 1);
  assert.equal(result.slide.blocks[0].type, 'callout');
});

test('parseAndNormalizeJson parses array of slides correctly', () => {
  const json = JSON.stringify([
    { title: 'Slide A', blocks: [{ type: 'heading', content: 'A' }] },
    { title: 'Slide B', blocks: [{ type: 'paragraph', content: 'B' }] }
  ]);

  const result = parseAndNormalizeJson(json);
  assert.equal(result.type, 'slides');
  assert.equal(result.count, 2);
  assert.equal(result.slides[0].title, 'Slide A');
  assert.equal(result.slides[1].title, 'Slide B');
});

test('parseAndNormalizeJson parses full lesson object correctly', () => {
  const json = JSON.stringify({
    title: 'Full Note Lesson',
    excerpt: 'Short summary of note',
    coverUrl: 'https://example.com/image.jpg',
    slides: [
      { title: 'Chapter 1', blocks: [{ type: 'paragraph', content: 'Hello' }] }
    ]
  });

  const result = parseAndNormalizeJson(json);
  assert.equal(result.type, 'lesson');
  assert.equal(result.lesson.title, 'Full Note Lesson');
  assert.equal(result.lesson.excerpt, 'Short summary of note');
  assert.equal(result.lesson.slides.length, 1);
  assert.equal(result.lesson.slides[0].title, 'Chapter 1');
});

test('parseAndNormalizeJson strips markdown code fence wrappers', () => {
  const fenced = '```json\n{\n  "title": "Fenced Title",\n  "blocks": [{ "type": "heading", "content": "Clean" }]\n}\n```';
  const result = parseAndNormalizeJson(fenced);
  assert.equal(result.type, 'single_slide');
  assert.equal(result.slide.title, 'Fenced Title');
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
