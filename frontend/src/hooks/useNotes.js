import { useState, useEffect, useCallback } from 'react';
import client from '../api/client.js';

/**
 * useNotes — fetches a paginated list of notes from the API.
 *
 * @param {number|number[]|null} tagId - Filter by tag ID(s) (null = all)
 * @param {string} searchQuery - Text search query
 * @param {number} page - Current page (1-based)
 * @param {number} limit - Items per page
 * @param {boolean} includeUnpublished - Whether to fetch draft/unpublished notes
 * @param {string} sort - Sort order ('latest', 'views', 'oldest')
 * @returns {{ notes, loading, isFetching, error, pagination, refetch }}
 */
export default function useNotes(
  tagId = null,
  searchQuery = '',
  page = 1,
  limit = 10,
  includeUnpublished = false,
  sort = 'latest'
) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalCount: 0 });

  const fetchNotes = useCallback(async (pageNum = page) => {
    try {
      setLoading(true);
      setIsFetching(true);
      setError(null);

      const tagParam = Array.isArray(tagId) ? tagId.join(',') : tagId;
      const params = {
        page: pageNum,
        limit,
        ...(searchQuery && { query: searchQuery }),
        ...(tagId != null && { tags: tagParam }),
        ...(includeUnpublished && { includeUnpublished: 'true' }),
        ...(sort && { sort }),
      };

      const res = await client.get('/api/notes', { params });
      const data = res.data;

      setNotes(data.notes || []);
      setPagination(
        data.pagination || { page: pageNum, totalPages: 1, totalCount: 0, limit }
      );
    } catch (err) {
      console.error('useNotes error:', err);
      setError(err?.response?.data?.error || 'Failed to load notes');
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  }, [tagId, searchQuery, page, limit, includeUnpublished, sort]);

  useEffect(() => {
    fetchNotes(page);
  }, [fetchNotes, page]);

  return { notes, loading, isFetching, error, pagination, refetch: fetchNotes };
}
