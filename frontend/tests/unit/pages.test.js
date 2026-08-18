import test from 'node:test';
import assert from 'node:assert/strict';
import { BLOCK_TYPES, createDefaultBlock, BLOCK_PICKER_ORDER } from '../../src/lib/blocks.js';

test('createDefaultBlock returns valid default block for heading', () => {
  const block = createDefaultBlock(BLOCK_TYPES.HEADING);
  assert.equal(block.type, 'heading');
  assert.equal(block.level, 2);
  assert.ok(typeof block.content === 'string');
});

test('createDefaultBlock returns valid default block for code', () => {
  const block = createDefaultBlock(BLOCK_TYPES.CODE);
  assert.equal(block.type, 'code');
  assert.equal(block.language, 'csharp');
  assert.ok(block.content.includes('//'));
});

test('createDefaultBlock returns valid default block for quiz', () => {
  const block = createDefaultBlock(BLOCK_TYPES.QUIZ);
  assert.equal(block.type, 'quiz');
  assert.ok(Array.isArray(block.options));
  assert.equal(block.options.length, 4);
  assert.equal(block.answer, 0);
});

test('createDefaultBlock returns valid default block for callout', () => {
  const block = createDefaultBlock(BLOCK_TYPES.CALLOUT);
  assert.equal(block.type, 'callout');
  assert.equal(block.variant, 'tip');
});

test('createDefaultBlock returns valid default block for table', () => {
  const block = createDefaultBlock(BLOCK_TYPES.TABLE);
  assert.equal(block.type, 'table');
  assert.ok(Array.isArray(block.headers));
  assert.ok(Array.isArray(block.rows));
});

test('createDefaultBlock returns valid default block for divider', () => {
  const block = createDefaultBlock(BLOCK_TYPES.DIVIDER);
  assert.equal(block.type, 'divider');
  assert.equal(block.style, 'solid');
});

test('createDefaultBlock returns valid default block for steps', () => {
  const block = createDefaultBlock(BLOCK_TYPES.STEPS);
  assert.equal(block.type, 'steps');
  assert.ok(Array.isArray(block.items));
});

test('createDefaultBlock returns valid default block for keyvalue', () => {
  const block = createDefaultBlock(BLOCK_TYPES.KEYVALUE);
  assert.equal(block.type, 'keyvalue');
  assert.ok(Array.isArray(block.pairs));
});

test('BLOCK_PICKER_ORDER contains all supported block types', () => {
  assert.equal(BLOCK_PICKER_ORDER.length, Object.keys(BLOCK_TYPES).length);
  Object.values(BLOCK_TYPES).forEach((type) => {
    assert.ok(BLOCK_PICKER_ORDER.includes(type));
  });
});

