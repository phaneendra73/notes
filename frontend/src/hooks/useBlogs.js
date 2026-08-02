import { useState, useEffect } from 'react';
import api from '../utils/api.js';
import { getenv } from '../utils/getenv.js';

/**
 * Unified hook for fetching study lessons.
 * Queries /lessons/getall REST API endpoint targeting lessons and slides tables.
 */
const useBlogs = (
  page = 1,
  selectedTags = [],
  searchQuery = '',
  sort = 'latest',
  { enabled = true, includeUnpublished = false, refreshTrigger = 0, limit } = {}
) => {
  const [blogs, setBlogs] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!enabled) return;

    const fetchLessons = async () => {
      const defaultLimit = getenv('BLOGSLIMIT');

      try {
        setLoading(true);
        setError(null);

        const params = {
          tags: selectedTags.join(','),
          query: searchQuery,
          sort,
          page,
          limit: limit || defaultLimit,
        };

        if (includeUnpublished) {
          params.includeUnpublished = 'true';
        }

        const response = await api.get('/lessons/getall', { params });
        setBlogs(response.data.lessons || response.data.blogs || []);
        setTotalCount(response.data.pagination?.totalCount || 0);
        setTotalPages(response.data.pagination?.totalPages || 1);
      } catch (err) {
        setError('Error fetching lessons');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [page, selectedTags.join(','), searchQuery, sort, enabled, includeUnpublished, refreshTrigger, limit]);

  return { blogs, totalCount, totalPages, loading, error };
};

export default useBlogs;
