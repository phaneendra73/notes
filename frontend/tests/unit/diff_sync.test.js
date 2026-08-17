import test from 'node:test';
import assert from 'node:assert/strict';
import { diffSlides } from '../../../backend/src/db/queries.js';

test('diffSlides identifies completely unchanged slides', () => {
  const existing = [
    { id: 1, orderNumber: 1, title: 'Introduction', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Hello' }]) },
    { id: 2, orderNumber: 2, title: 'Details', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'World' }]) },
  ];

  const incoming = [
    { id: 1, orderNumber: 1, title: 'Introduction', blocks: [{ type: 'paragraph', content: 'Hello' }] },
    { id: 2, orderNumber: 2, title: 'Details', blocks: [{ type: 'paragraph', content: 'World' }] },
  ];

  const result = diffSlides(existing, incoming);

  assert.equal(result.toDelete.length, 0);
  assert.equal(result.toInsert.length, 0);
  assert.equal(result.toUpdate.length, 0);
  assert.equal(result.unchanged.length, 2);
  assert.deepEqual(result.unchanged, [{ id: 1 }, { id: 2 }]);
});

test('diffSlides detects single slide content modification and keeps other slides untouched', () => {
  const existing = [
    { id: 10, orderNumber: 1, title: 'Slide 1', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Original 1' }]) },
    { id: 11, orderNumber: 2, title: 'Slide 2', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Original 2' }]) },
    { id: 12, orderNumber: 3, title: 'Slide 3', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Original 3' }]) },
  ];

  const incoming = [
    { id: 10, orderNumber: 1, title: 'Slide 1', blocks: [{ type: 'paragraph', content: 'Original 1' }] },
    { id: 11, orderNumber: 2, title: 'Slide 2 Updated', blocks: [{ type: 'paragraph', content: 'Modified content' }] },
    { id: 12, orderNumber: 3, title: 'Slide 3', blocks: [{ type: 'paragraph', content: 'Original 3' }] },
  ];

  const result = diffSlides(existing, incoming);

  assert.equal(result.toDelete.length, 0);
  assert.equal(result.toInsert.length, 0);
  assert.equal(result.toUpdate.length, 1);
  assert.equal(result.toUpdate[0].id, 11);
  assert.equal(result.toUpdate[0].title, 'Slide 2 Updated');
  assert.equal(result.unchanged.length, 2);
  assert.deepEqual(result.unchanged, [{ id: 10 }, { id: 12 }]);
});

test('diffSlides detects newly added slide without ID and queues for insertion', () => {
  const existing = [
    { id: 10, orderNumber: 1, title: 'Slide 1', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Original 1' }]) },
  ];

  const incoming = [
    { id: 10, orderNumber: 1, title: 'Slide 1', blocks: [{ type: 'paragraph', content: 'Original 1' }] },
    { orderNumber: 2, title: 'New Slide 2', blocks: [{ type: 'paragraph', content: 'Newly created content' }] },
  ];

  const result = diffSlides(existing, incoming);

  assert.equal(result.toDelete.length, 0);
  assert.equal(result.unchanged.length, 1);
  assert.equal(result.unchanged[0].id, 10);
  assert.equal(result.toInsert.length, 1);
  assert.equal(result.toInsert[0].title, 'New Slide 2');
  assert.equal(result.toInsert[0].orderNumber, 2);
});

test('diffSlides detects deleted slide and updates order numbers of remaining slides', () => {
  const existing = [
    { id: 1, orderNumber: 1, title: 'Slide 1', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'One' }]) },
    { id: 2, orderNumber: 2, title: 'Slide 2', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Two' }]) },
    { id: 3, orderNumber: 3, title: 'Slide 3', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Three' }]) },
  ];

  // User deleted slide 1
  const incoming = [
    { id: 2, orderNumber: 1, title: 'Slide 2', blocks: [{ type: 'paragraph', content: 'Two' }] },
    { id: 3, orderNumber: 2, title: 'Slide 3', blocks: [{ type: 'paragraph', content: 'Three' }] },
  ];

  const result = diffSlides(existing, incoming);

  assert.deepEqual(result.toDelete, [1]);
  assert.equal(result.toInsert.length, 0);
  // Slide 2 and 3 changed their orderNumber from 2->1 and 3->2
  assert.equal(result.toUpdate.length, 2);
  assert.equal(result.toUpdate[0].id, 2);
  assert.equal(result.toUpdate[0].orderNumber, 1);
  assert.equal(result.toUpdate[1].id, 3);
  assert.equal(result.toUpdate[1].orderNumber, 2);
  assert.equal(result.unchanged.length, 0);
});

test('diffSlides handles reordering between two existing slides', () => {
  const existing = [
    { id: 1, orderNumber: 1, title: 'Slide 1', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'One' }]) },
    { id: 2, orderNumber: 2, title: 'Slide 2', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Two' }]) },
  ];

  // Swapped order
  const incoming = [
    { id: 2, orderNumber: 1, title: 'Slide 2', blocks: [{ type: 'paragraph', content: 'Two' }] },
    { id: 1, orderNumber: 2, title: 'Slide 1', blocks: [{ type: 'paragraph', content: 'One' }] },
  ];

  const result = diffSlides(existing, incoming);

  assert.equal(result.toDelete.length, 0);
  assert.equal(result.toInsert.length, 0);
  assert.equal(result.toUpdate.length, 2);
  assert.equal(result.toUpdate[0].id, 2);
  assert.equal(result.toUpdate[0].orderNumber, 1);
  assert.equal(result.toUpdate[1].id, 1);
  assert.equal(result.toUpdate[1].orderNumber, 2);
});

test('diffSlides handles empty existing slides cleanly', () => {
  const existing = [];
  const incoming = [
    { orderNumber: 1, title: 'Slide 1', blocks: [{ type: 'paragraph', content: 'First' }] },
    { orderNumber: 2, title: 'Slide 2', blocks: [{ type: 'paragraph', content: 'Second' }] },
  ];

  const result = diffSlides(existing, incoming);

  assert.equal(result.toDelete.length, 0);
  assert.equal(result.toUpdate.length, 0);
  assert.equal(result.unchanged.length, 0);
  assert.equal(result.toInsert.length, 2);
});
