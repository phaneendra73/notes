import test from 'node:test';
import assert from 'node:assert/strict';

// Mock localStorage for Node.js test environment
class MockLocalStorage {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

// Bookmarks helper logic
function getBookmarkedIds(storage) {
  try {
    const raw = storage.getItem('kadha_bookmarks');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function toggleBookmarkId(storage, id) {
  const current = getBookmarkedIds(storage);
  const updated = current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id];
  storage.setItem('kadha_bookmarks', JSON.stringify(updated));
  return updated;
}

test('bookmarks helper correctly initializes empty array if no bookmarks stored', () => {
  const storage = new MockLocalStorage();
  const bookmarks = getBookmarkedIds(storage);
  assert.deepEqual(bookmarks, []);
});

test('toggleBookmarkId adds a note ID to bookmarks if not present', () => {
  const storage = new MockLocalStorage();
  const updated = toggleBookmarkId(storage, 101);

  assert.deepEqual(updated, [101]);
  assert.equal(storage.getItem('kadha_bookmarks'), '[101]');
});

test('toggleBookmarkId removes a note ID from bookmarks if already present', () => {
  const storage = new MockLocalStorage();
  toggleBookmarkId(storage, 101);
  toggleBookmarkId(storage, 202);
  const updated = toggleBookmarkId(storage, 101);

  assert.deepEqual(updated, [202]);
  assert.equal(storage.getItem('kadha_bookmarks'), '[202]');
});

test('getBookmarkedIds handles corrupted localStorage JSON gracefully', () => {
  const storage = new MockLocalStorage();
  storage.setItem('kadha_bookmarks', 'invalid-json-{');

  const bookmarks = getBookmarkedIds(storage);
  assert.deepEqual(bookmarks, []);
});
