import { useState, useEffect } from 'react';
import client from '../api/client.js';

/**
 * useTags — fetches the full list of subject tags from the API.
 *
 * @param {number} [refreshKey] - Increment to force a re-fetch
 * @returns {{ tags, loading, error }}
 */
export default function useTags(refreshKey = 0) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await client.get('/api/tags');
        if (!cancelled) setTags(res.data.tags || []);
      } catch (err) {
        if (!cancelled) setError('Failed to load tags');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTags();
    return () => { cancelled = true; };
  }, [refreshKey]);

  return { tags, loading, error };
}
