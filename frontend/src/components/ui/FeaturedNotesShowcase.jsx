import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import client from '../../api/client.js';
import LessonCard from './LessonCard.jsx';
import { FiTrendingUp, FiZap } from 'react-icons/fi';

export default function FeaturedNotesShowcase() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get('/api/lessons', { params: { limit: 3, sort: 'views' } })
      .then((res) => {
        if (res.data?.lessons) {
          setFeatured(res.data.lessons.slice(0, 3));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || featured.length === 0) return null;

  return (
    <section className="py-8 px-4 max-w-6xl mx-auto mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <FiTrendingUp size={18} />
          </div>
          <div>
            <h2 className="font-heading font-extrabold text-xl md:text-2xl text-foreground flex items-center gap-2">
              Featured Notes <FiZap size={16} className="text-primary" />
            </h2>
            <p className="text-xs text-muted-foreground">Most popular engineering tracks and visual guides</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featured.map((lesson) => (
          <LessonCard key={lesson.id} lesson={lesson} />
        ))}
      </div>
    </section>
  );
}
