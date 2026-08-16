import { useState, useEffect, useCallback } from 'react';
import client from '../api/client.js';

/**
 * useLessons — fetches a paginated list of lessons from the API.
 *
 * @param {number|null} tagId - Filter by tag ID (null = all)
 * @param {string} searchQuery - Text search query
 * @param {number} page - Current page (1-based)
 * @param {number} limit - Items per page
 * @returns {{ lessons, loading, isFetching, error, pagination, refetch }}
 */
export default function useLessons(tagId = null, searchQuery = '', page = 1, limit = 10) {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  const fetchLessons = useCallback(async (pageNum = page) => {
    try {
      setLoading(true);
      setIsFetching(true);
      setError(null);

      const isAuth = Boolean(localStorage.getItem('jwt'));
      const tagParam = Array.isArray(tagId) ? tagId.join(',') : tagId;
      const params = {
        page: pageNum,
        limit,
        ...(searchQuery && { query: searchQuery }),
        ...(tagId != null && { tags: tagParam }),
        ...(isAuth && { includeUnpublished: 'true' }),
      };

      const res = await client.get('/api/lessons', { params });
      const data = res.data;

      setLessons(data.lessons || []);
      setPagination(
        data.pagination || { page: pageNum, totalPages: 1, totalCount: 0, limit }
      );
    } catch (err) {
      console.error('useLessons error:', err);
      setError(err?.response?.data?.error || 'Failed to load lessons');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [tagId, searchQuery, page, limit]);

  useEffect(() => {
    fetchLessons(page);
  }, [fetchLessons, page]);

  return { lessons, loading, isFetching, error, pagination, refetch: fetchLessons };
}
