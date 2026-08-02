import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { useDebounce } from 'use-debounce';

// Calculate Levenshtein distance between two strings
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

// Calculate fuzzy match score (lower is better, 0 = exact)
function calculateFuzzyScore(item, searchQuery) {
  if (!item || !searchQuery) return Infinity;
  const queryLower = searchQuery.toLowerCase().trim();
  const titleLower = (item.title || '').toLowerCase();
  const excerptLower = (item.excerpt || '').toLowerCase();
  const tagNames = Array.isArray(item.tags)
    ? item.tags.map((t) => (typeof t === 'object' ? t.name || '' : t).toLowerCase())
    : [];

  // 1. Direct exact or substring match
  if (titleLower === queryLower) return 0;
  if (titleLower.startsWith(queryLower)) return 1;
  if (titleLower.includes(queryLower)) return 2;
  if (tagNames.some((t) => t.includes(queryLower))) return 3;
  if (excerptLower.includes(queryLower)) return 4;

  // 2. Word-level fuzzy match (allows 1-2 typos e.g., 'acess' -> 'Access')
  const queryWords = queryLower.split(/\s+/).filter(Boolean);
  const titleWords = titleLower.split(/\s+/).filter(Boolean);
  let totalDistance = 0;
  let matchedWordCount = 0;

  for (const qWord of queryWords) {
    const maxDist = qWord.length <= 4 ? 1 : 2;
    let bestDistForWord = Infinity;

    // Check title words
    for (const tWord of titleWords) {
      if (Math.abs(tWord.length - qWord.length) > maxDist + 1) continue;
      const dist = levenshtein(tWord, qWord);
      if (dist <= maxDist && dist < bestDistForWord) {
        bestDistForWord = dist;
      }
      // Partial prefix typo match
      if (tWord.length >= 4 && qWord.length >= 3 && levenshtein(tWord.slice(0, qWord.length), qWord) <= 1) {
        bestDistForWord = Math.min(bestDistForWord, 1);
      }
    }

    // Check tag names
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

const useSearch = (query) => {
  const [debouncedQuery] = useDebounce(query, 250);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length === 0) {
      setResults([]);
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        setLoading(true);
        setError(null);

        const isAuthenticated = Boolean(localStorage.getItem('jwt'));

        // 1. Primary search query with backend sequence pattern support
        const response = await api.get('/lessons/getall', {
          params: {
            query: debouncedQuery,
            limit: 20,
            includeUnpublished: isAuthenticated ? 'true' : 'false',
          },
        });
        let fetchedList = response.data.lessons || response.data.blogs || [];

        // 2. If backend returns 0 exact results, fetch all lessons for client fuzzy fallback
        if (fetchedList.length === 0) {
          const fallbackRes = await api.get('/lessons/getall', {
            params: {
              limit: 50,
              includeUnpublished: isAuthenticated ? 'true' : 'false',
            },
          });
          fetchedList = fallbackRes.data.lessons || fallbackRes.data.blogs || [];
        }

        // 3. Rank & sort all candidate notes by fuzzy relevance score
        const rankedResults = fetchedList
          .map((note) => ({
            note,
            score: calculateFuzzyScore(note, debouncedQuery),
          }))
          .filter((item) => item.score < Infinity)
          .sort((a, b) => a.score - b.score)
          .map((item) => item.note);

        setResults(rankedResults.slice(0, 10));
      } catch (err) {
        setError('Error searching notes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  return { results, loading, error };
};

export default useSearch;
