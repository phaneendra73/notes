import test from 'node:test';
import assert from 'node:assert/strict';

// Helper function: Normalize tag input into string array
function normalizeTagNames(tags) {
  if (!Array.isArray(tags)) return [];
  return tags
    .map((t) => {
      if (!t) return '';
      return typeof t === 'object' ? t.name || t.tagName || '' : String(t);
    })
    .map((s) => s.trim())
    .filter(Boolean);
}

// Helper function: Match note tag objects to global tags list
function matchTagIds(noteTags, globalTags) {
  const names = normalizeTagNames(noteTags);
  if (names.length === 0 || !Array.isArray(globalTags)) return [];

  return globalTags
    .filter((gTag) => names.some((n) => n.toLowerCase() === (gTag.name || '').toLowerCase()))
    .map((gTag) => gTag.id);
}

test('normalizeTagNames handles both string arrays and tag objects', () => {
  const input = ['C#', { id: 2, name: 'DSA' }, { id: 3, tagName: 'React' }, null, ''];
  const normalized = normalizeTagNames(input);

  assert.deepEqual(normalized, ['C#', 'DSA', 'React']);
});

test('matchTagIds matches note tags to global tag IDs case-insensitively', () => {
  const globalTags = [
    { id: 10, name: 'C#' },
    { id: 20, name: 'DSA' },
    { id: 30, name: 'System Design' },
  ];
  const noteTags = ['c#', 'dsa'];

  const matchedIds = matchTagIds(noteTags, globalTags);
  assert.deepEqual(matchedIds, [10, 20]);
});

test('matchTagIds returns empty array if no tags match', () => {
  const globalTags = [{ id: 10, name: 'C#' }];
  const matchedIds = matchTagIds(['Python', 'Java'], globalTags);

  assert.deepEqual(matchedIds, []);
});

// Helper function: Format tag param for API query requests
function formatTagQueryParam(tagId) {
  if (tagId == null || tagId === '') return undefined;
  return Array.isArray(tagId) ? tagId.join(',') : String(tagId);
}

test('formatTagQueryParam formats tag ID correctly as a scalar or CSV string for query params', () => {
  assert.equal(formatTagQueryParam(1), '1');
  assert.equal(formatTagQueryParam('C#'), 'C#');
  assert.equal(formatTagQueryParam([1, 2]), '1,2');
  assert.equal(formatTagQueryParam(null), undefined);
  assert.equal(formatTagQueryParam(undefined), undefined);
});

