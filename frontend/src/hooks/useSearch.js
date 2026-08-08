import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import client from '../api/client.js';

// ── Levenshtein distance (for client-side fuzzy fallback) ─────────────────────
function levenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const dp = [];
  for (let i = 0; i <= a.length; i++) dp[i] = [i];
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + 1);
    }
  }
  return dp[a.length][b.length];
}

function fuzzyScore(lesson, query) {
  if (!lesson || !query) return Infinity;
  const q = query.toLowerCase().trim();
  const title = (lesson.title || '').toLowerCase();
  const excerpt = (lesson.excerpt || '').toLowerCase();
  const tags = (lesson.tags || []).map((t) =>
    (typeof t === 'string' ? t : t.name || '').toLowerCase()
  );

  if (title === q) return 0;
  if (title.startsWith(q)) return 1;
  if (title.includes(q)) return 2;
  if (tags.some((t) => t.includes(q))) return 3;
  if (excerpt.includes(q)) return 4;

  // Word-level fuzzy with Levenshtein
  const qWords = q.split(/\s+/).filter(Boolean);
  const tWords = title.split(/\s+/).filter(Boolean);
  let total = 0;
  let matched = 0;
  for (const qw of qWords) {
    const maxDist = qw.length <= 4 ? 1 : 2;
    let best = Infinity;
    for (const tw of tWords) {
      if (Math.abs(tw.length - qw.length) > maxDist + 1) continue;
      const d = levenshtein(tw, qw);
      if (d <= maxDist) best = Math.min(best, d);
    }
    for (const tag of tags) {
      const d = levenshtein(tag, qw);
      if (d <= maxDist) best = Math.min(best, d);
    }
    if (best < Infinity) { total += best; matched++; }
  }
  return matched > 0 ? 10 + total - matched * 2 : Infinity;
}

/**
 * useSearch — debounced lesson search with client-side fuzzy ranking fallback.
 *
 * @param {string} query - Raw search input
 * @returns {{ results, loading, error }}
 */
export default function useSearch(query) {
  const [debouncedQuery] = useDebounce(query, 250);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!debouncedQuery?.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const search = async () => {
      try {
        setLoading(true);
        setError(null);

        const isAuth = Boolean(localStorage.getItem('jwt'));
        const params = {
          query: debouncedQuery,
          limit: 20,
          ...(isAuth && { includeUnpublished: 'true' }),
        };

        const res = await client.get('/api/lessons', { params });
        let candidates = res.data.lessons || [];

        // If backend returns nothing, fetch all for client fuzzy fallback
        if (candidates.length === 0) {
          const fallback = await client.get('/api/lessons', {
            params: { limit: 50, ...(isAuth && { includeUnpublished: 'true' }) },
          });
          candidates = fallback.data.lessons || [];
        }

        const ranked = candidates
          .map((l) => ({ lesson: l, score: fuzzyScore(l, debouncedQuery) }))
          .filter((x) => x.score < Infinity)
          .sort((a, b) => a.score - b.score)
          .map((x) => x.lesson)
          .slice(0, 10);

        if (!cancelled) setResults(ranked);
      } catch (err) {
        if (!cancelled) setError('Search failed');
        console.error('useSearch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    search();
    return () => { cancelled = true; };
  }, [debouncedQuery]);

  return { results, loading, error };
}
