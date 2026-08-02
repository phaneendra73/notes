import { useState, useEffect } from 'react';
import api from '../utils/api.js';

const useTags = (refreshTrigger = 0) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get('/lessons/tags');
        setTags(response.data.tags || []);
      } catch (err) {
        setError('Error fetching tags');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [refreshTrigger]);

  return { tags, loading, error };
};

export default useTags;
