import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from './Input.jsx';
import { Badge } from './Badge.jsx';
import useSearch from '../../hooks/useSearch.js';
import { FiSearch, FiArrowRight, FiLoader } from 'react-icons/fi';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { results, loading } = useSearch(query);
  const navigate = useNavigate();

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 640, margin: '0 auto 3rem', padding: '0 1rem', zIndex: 40 }}>
      {/* Search input */}
      <div style={{ position: 'relative' }}>
        <FiSearch size={16} style={{
          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
          color: 'var(--fg-muted)', pointerEvents: 'none',
        }} />
        <Input
          type="text"
          placeholder="Search articles by title..."
          style={{ paddingLeft: 38, paddingRight: 38, height: 44, borderRadius: 9999 }}
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {loading && (
          <FiLoader size={16} style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--neon)', animation: 'spin 0.9s linear infinite',
          }} />
        )}
      </div>

      {/* Results dropdown */}
      <AnimatePresence>
        {query.trim().length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', top: 'calc(100% + 8px)',
              left: '1rem', right: '1rem',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
              maxHeight: 340, overflowY: 'auto',
              padding: 8,
            }}
          >
            {results.length === 0 && !loading ? (
              <p style={{ padding: '2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--fg-muted)' }}>
                No matching stories found.
              </p>
            ) : (
              results.map(blog => (
                <button
                  key={blog.id}
                  onClick={() => { navigate(`/read?id=${blog.id}`); setQuery(''); }}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.625rem 0.75rem', borderRadius: 10, border: 'none',
                    background: 'transparent', cursor: 'pointer', textAlign: 'left',
                    transition: 'background 0.12s ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--neon-subtle)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--fg)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {blog.title}
                    </p>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {blog.tags?.slice(0, 3).map(t => <Badge key={t}>{t}</Badge>)}
                    </div>
                  </div>
                  <FiArrowRight size={14} style={{ flexShrink: 0, marginLeft: 8, color: 'var(--neon)' }} />
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
