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

test('BLOCK_PICKER_ORDER contains all supported block types', () => {
  assert.equal(BLOCK_PICKER_ORDER.length, 7);
  assert.ok(BLOCK_PICKER_ORDER.includes(BLOCK_TYPES.HEADING));
  assert.ok(BLOCK_PICKER_ORDER.includes(BLOCK_TYPES.PARAGRAPH));
  assert.ok(BLOCK_PICKER_ORDER.includes(BLOCK_TYPES.CODE));
  assert.ok(BLOCK_PICKER_ORDER.includes(BLOCK_TYPES.CALLOUT));
  assert.ok(BLOCK_PICKER_ORDER.includes(BLOCK_TYPES.QUIZ));
  assert.ok(BLOCK_PICKER_ORDER.includes(BLOCK_TYPES.DIAGRAM));
  assert.ok(BLOCK_PICKER_ORDER.includes(BLOCK_TYPES.IMAGE));
});
