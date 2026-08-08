import test from 'node:test';
import assert from 'node:assert/strict';
import { parseInline } from '../../src/lib/inline.js';

test('parseInline parses plain text as array containing plain text string', () => {
  const result = parseInline('Hello world');
  assert.equal(result.length, 1);
  assert.equal(result[0], 'Hello world');
});

test('parseInline parses **bold** formatting into strong element', () => {
  const result = parseInline('This is **bold** text');
  assert.equal(result.length, 3);
  assert.equal(result[0], 'This is ');
  assert.equal(result[1].type, 'strong');
  assert.equal(result[1].props.children, 'bold');
  assert.equal(result[2], ' text');
});

test('parseInline parses *italic* formatting into em element', () => {
  const result = parseInline('This is *italic* text');
  assert.equal(result.length, 3);
  assert.equal(result[0], 'This is ');
  assert.equal(result[1].type, 'em');
  assert.equal(result[1].props.children, 'italic');
  assert.equal(result[2], ' text');
});

test('parseInline parses `code` formatting into code element', () => {
  const result = parseInline('Use `Task.Delay` for async sleep');
  assert.equal(result.length, 3);
  assert.equal(result[0], 'Use ');
  assert.equal(result[1].type, 'code');
  assert.equal(result[1].props.children, 'Task.Delay');
  assert.equal(result[2], ' for async sleep');
});

test('parseInline parses [text](url) links into anchor element with security attrs', () => {
  const result = parseInline('Check [Docs](https://example.com) for details');
  assert.equal(result.length, 3);
  assert.equal(result[0], 'Check ');
  assert.equal(result[1].type, 'a');
  assert.equal(result[1].props.href, 'https://example.com');
  assert.equal(result[1].props.target, '_blank');
  assert.equal(result[1].props.rel, 'noopener noreferrer');
  assert.equal(result[1].props.children, 'Docs');
});

test('parseInline neutralizes malicious javascript: URLs in links', () => {
  const result = parseInline('[Click](javascript:alert(1))');
  assert.equal(result[0].type, 'a');
  assert.equal(result[0].props.href, '#');
});
