import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './Input.jsx';
import { Badge } from './Badge.jsx';
import useSearch from '../../hooks/useSearch.js';
import { FiSearch, FiArrowRight, FiLoader, FiX } from 'react-icons/fi';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query);
  const navigate = useNavigate();

  // Listen for Escape key to clear search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setQuery('');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-2xl mx-auto mb-10 px-4 z-40">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <FiSearch
          size={16}
          className="absolute left-4 text-muted-foreground pointer-events-none"
        />
        <Input
          type="text"
          placeholder="Search tech notes by title, topic, or concept..."
          className="pl-10 pr-10 h-12 rounded-2xl bg-card/80 border-border/80 text-foreground placeholder:text-muted-foreground/60 shadow-xs focus:border-primary transition-all text-sm font-semibold"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {loading ? (
          <FiLoader
            size={16}
            className="absolute right-4 text-primary animate-spin"
          />
        ) : query ? (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 text-muted-foreground hover:text-foreground p-1 rounded-lg cursor-pointer"
            title="Clear search"
          >
            <FiX size={15} />
          </button>
        ) : null}
      </div>

      {/* Results Dropdown Menu */}
      <AnimatePresence>
        {query.trim().length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-[calc(100%+8px)] left-4 right-4 bg-card/95 backdrop-blur-xl border border-border/80 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-h-80 overflow-y-auto p-2 flex flex-col gap-1 z-50"
          >
            {results.length === 0 && !loading ? (
              <div className="py-8 text-center text-xs md:text-sm text-muted-foreground font-semibold">
                No matching tech notes found for "{query}".
              </div>
            ) : (
              results.map((blog) => (
                <button
                  key={blog.id}
                  onClick={() => {
                    navigate(`/read?id=${blog.id}`);
                    setQuery('');
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all text-left group cursor-pointer"
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1 pr-3">
                    <p className="font-extrabold text-xs md:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                      {blog.title}
                    </p>
                    <div className="flex gap-1.5 flex-wrap">
                      {blog.tags?.slice(0, 3).map((t) => (
                        <Badge key={t} className="text-[10px] py-0">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <FiArrowRight
                    size={15}
                    className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all"
                  />
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
