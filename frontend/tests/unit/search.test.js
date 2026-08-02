import test from 'node:test';
import assert from 'node:assert/strict';

// Levenshtein distance for fuzzy matching verification
function levenshtein(a, b) {
  const tmp = [];
  let i, j;
  const alen = a.length, blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  for (i = 0; i <= alen; i++) tmp[i] = [i];
  for (j = 0; j <= blen; j++) tmp[0][j] = j;
  for (i = 1; i <= alen; i++) {
    for (j = 1; j <= blen; j++) {
      tmp[i][j] = a[i - 1] === b[j - 1]
        ? tmp[i - 1][j - 1]
        : Math.min(tmp[i - 1][j] + 1, tmp[i][j - 1] + 1, tmp[i - 1][j - 1] + 1);
    }
  }
  return tmp[alen][blen];
}

function calculateFuzzyScore(item, searchQuery) {
  if (!item || !searchQuery) return Infinity;
  const queryLower = searchQuery.toLowerCase().trim();
  const titleLower = (item.title || '').toLowerCase();
  const tagNames = Array.isArray(item.tags)
    ? item.tags.map((t) => (typeof t === 'object' ? t.name || '' : t).toLowerCase())
    : [];

  if (titleLower === queryLower) return 0;
  if (titleLower.includes(queryLower)) return 1;
  if (tagNames.some((t) => t.includes(queryLower))) return 2;

  const queryWords = queryLower.split(/\s+/).filter(Boolean);
  const titleWords = titleLower.split(/\s+/).filter(Boolean);

  let totalDistance = 0;
  let matchedWordCount = 0;

  for (const qWord of queryWords) {
    const maxDist = qWord.length <= 4 ? 1 : 2;
    let bestDistForWord = Infinity;

    for (const tWord of titleWords) {
      const dist = levenshtein(tWord, qWord);
      if (dist <= maxDist && dist < bestDistForWord) {
        bestDistForWord = dist;
      }
      if (tWord.length >= 4 && qWord.length >= 3 && levenshtein(tWord.slice(0, qWord.length), qWord) <= 1) {
        bestDistForWord = Math.min(bestDistForWord, 1);
      }
    }

    for (const tag of tagNames) {
      const dist = levenshtein(tag, qWord);
      if (dist <= maxDist && dist < bestDistForWord) {
        bestDistForWord = dist;
      }
    }

    if (bestDistForWord < Infinity) {
      totalDistance += bestDistForWord;
      matchedWordCount++;
    }
  }

  if (matchedWordCount > 0) {
    return 10 + totalDistance - matchedWordCount * 2;
  }
  return Infinity;
}

test('fuzzy search matches exact title queries with top priority score', () => {
  const note = { id: 1, title: 'Access Modifiers', tags: ['C#', 'OOP'] };
  const score = calculateFuzzyScore(note, 'Access Modifiers');
  assert.equal(score, 0);
});

test('fuzzy search matches misspelled single-word query (acess -> Access Modifiers)', () => {
  const note = { id: 1, title: 'Access Modifiers', tags: ['C#', 'OOP'] };
  const score = calculateFuzzyScore(note, 'acess');
  assert.ok(score < Infinity);
});

test('fuzzy search matches multi-word query with typos (acess modifer -> Access Modifiers)', () => {
  const note = { id: 1, title: 'Access Modifiers', tags: ['C#', 'OOP'] };
  const score = calculateFuzzyScore(note, 'acess modifer');
  assert.ok(score < Infinity);
});

test('fuzzy search matches subject tag queries case-insensitively (dsa -> DSA)', () => {
  const note = { id: 2, title: 'Binary Search Trees', tags: ['DSA', 'Algorithms'] };
  const score = calculateFuzzyScore(note, 'dsa');
  assert.equal(score, 2);
});

test('fuzzy search ranks exact title match higher than typo match', () => {
  const exactNote = { id: 1, title: 'Access Modifiers' };
  const typoNote = { id: 2, title: 'Process Managers' };

  const exactScore = calculateFuzzyScore(exactNote, 'Access');
  const typoScore = calculateFuzzyScore(typoNote, 'Access');

  assert.ok(exactScore < typoScore);
});

test('fuzzy search returns Infinity for completely unrelated query', () => {
  const note = { id: 3, title: 'React Hooks Guide', tags: ['Frontend'] };
  const score = calculateFuzzyScore(note, 'quantum mechanics');
  assert.equal(score, Infinity);
});
