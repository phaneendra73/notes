import test from 'node:test';
import assert from 'node:assert/strict';
import { diffPages } from '../../../backend/src/db/queries.js';

test('diffPages identifies completely unchanged pages', () => {
  const existing = [
    { id: 1, orderNumber: 1, title: 'Introduction', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Hello' }]) },
    { id: 2, orderNumber: 2, title: 'Details', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'World' }]) },
  ];

  const incoming = [
    { id: 1, orderNumber: 1, title: 'Introduction', blocks: [{ type: 'paragraph', content: 'Hello' }] },
    { id: 2, orderNumber: 2, title: 'Details', blocks: [{ type: 'paragraph', content: 'World' }] },
  ];

  const result = diffPages(existing, incoming);

  assert.equal(result.toDelete.length, 0);
  assert.equal(result.toInsert.length, 0);
  assert.equal(result.toUpdate.length, 0);
  assert.equal(result.unchanged.length, 2);
  assert.deepEqual(result.unchanged, [{ id: 1 }, { id: 2 }]);
});

test('diffPages detects single page content modification and keeps other pages untouched', () => {
  const existing = [
    { id: 10, orderNumber: 1, title: 'Page 1', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Original 1' }]) },
    { id: 11, orderNumber: 2, title: 'Page 2', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Original 2' }]) },
    { id: 12, orderNumber: 3, title: 'Page 3', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Original 3' }]) },
  ];

  const incoming = [
    { id: 10, orderNumber: 1, title: 'Page 1', blocks: [{ type: 'paragraph', content: 'Original 1' }] },
    { id: 11, orderNumber: 2, title: 'Page 2 Updated', blocks: [{ type: 'paragraph', content: 'Modified content' }] },
    { id: 12, orderNumber: 3, title: 'Page 3', blocks: [{ type: 'paragraph', content: 'Original 3' }] },
  ];

  const result = diffPages(existing, incoming);

  assert.equal(result.toDelete.length, 0);
  assert.equal(result.toInsert.length, 0);
  assert.equal(result.toUpdate.length, 1);
  assert.equal(result.toUpdate[0].id, 11);
  assert.equal(result.toUpdate[0].title, 'Page 2 Updated');
  assert.equal(result.unchanged.length, 2);
  assert.deepEqual(result.unchanged, [{ id: 10 }, { id: 12 }]);
});

test('diffPages detects newly added page without ID and queues for insertion', () => {
  const existing = [
    { id: 10, orderNumber: 1, title: 'Page 1', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Original 1' }]) },
  ];

  const incoming = [
    { id: 10, orderNumber: 1, title: 'Page 1', blocks: [{ type: 'paragraph', content: 'Original 1' }] },
    { orderNumber: 2, title: 'New Page 2', blocks: [{ type: 'paragraph', content: 'Newly created content' }] },
  ];

  const result = diffPages(existing, incoming);

  assert.equal(result.toDelete.length, 0);
  assert.equal(result.unchanged.length, 1);
  assert.equal(result.unchanged[0].id, 10);
  assert.equal(result.toInsert.length, 1);
  assert.equal(result.toInsert[0].title, 'New Page 2');
  assert.equal(result.toInsert[0].orderNumber, 2);
});

test('diffPages detects deleted page and updates order numbers of remaining pages', () => {
  const existing = [
    { id: 1, orderNumber: 1, title: 'Page 1', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'One' }]) },
    { id: 2, orderNumber: 2, title: 'Page 2', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Two' }]) },
    { id: 3, orderNumber: 3, title: 'Page 3', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Three' }]) },
  ];

  // User deleted page 1
  const incoming = [
    { id: 2, orderNumber: 1, title: 'Page 2', blocks: [{ type: 'paragraph', content: 'Two' }] },
    { id: 3, orderNumber: 2, title: 'Page 3', blocks: [{ type: 'paragraph', content: 'Three' }] },
  ];

  const result = diffPages(existing, incoming);

  assert.deepEqual(result.toDelete, [1]);
  assert.equal(result.toInsert.length, 0);
  // Page 2 and 3 changed their orderNumber from 2->1 and 3->2
  assert.equal(result.toUpdate.length, 2);
  assert.equal(result.toUpdate[0].id, 2);
  assert.equal(result.toUpdate[0].orderNumber, 1);
  assert.equal(result.toUpdate[1].id, 3);
  assert.equal(result.toUpdate[1].orderNumber, 2);
  assert.equal(result.unchanged.length, 0);
});

test('diffPages handles reordering between two existing pages', () => {
  const existing = [
    { id: 1, orderNumber: 1, title: 'Page 1', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'One' }]) },
    { id: 2, orderNumber: 2, title: 'Page 2', blocksJson: JSON.stringify([{ type: 'paragraph', content: 'Two' }]) },
  ];

  // Swapped order
  const incoming = [
    { id: 2, orderNumber: 1, title: 'Page 2', blocks: [{ type: 'paragraph', content: 'Two' }] },
    { id: 1, orderNumber: 2, title: 'Page 1', blocks: [{ type: 'paragraph', content: 'One' }] },
  ];

  const result = diffPages(existing, incoming);

  assert.equal(result.toDelete.length, 0);
  assert.equal(result.toInsert.length, 0);
  assert.equal(result.toUpdate.length, 2);
  assert.equal(result.toUpdate[0].id, 2);
  assert.equal(result.toUpdate[0].orderNumber, 1);
  assert.equal(result.toUpdate[1].id, 1);
  assert.equal(result.toUpdate[1].orderNumber, 2);
});

test('diffPages handles empty existing pages cleanly', () => {
  const existing = [];
  const incoming = [
    { orderNumber: 1, title: 'Page 1', blocks: [{ type: 'paragraph', content: 'First' }] },
    { orderNumber: 2, title: 'Page 2', blocks: [{ type: 'paragraph', content: 'Second' }] },
  ];

  const result = diffPages(existing, incoming);

  assert.equal(result.toDelete.length, 0);
  assert.equal(result.toUpdate.length, 0);
  assert.equal(result.unchanged.length, 0);
  assert.equal(result.toInsert.length, 2);
});
