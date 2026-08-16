import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useSearch from '../../hooks/useSearch.js';
import useLessons from '../../hooks/useLessons.js';
import {
  Search, X, ArrowRight, BookOpen, Clock, Tag,
  Loader2, Sparkles
} from 'lucide-react';

export default function SearchCommandModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);

  // Search hook for dynamic live search
  const { results, loading } = useSearch(query);

  // Suggested / recent notes when search query is empty
  const { lessons: suggestedNotes, loading: suggestedLoading } = useLessons(null, '', 1, 6);

  const hasQuery = query.trim().length > 0;
  const displayList = hasQuery ? results : suggestedNotes || [];

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Reset selected index on query change
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global Esc & keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < displayList.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (displayList[selectedIndex]) {
          handleSelectNote(displayList[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, displayList, selectedIndex, onClose]);

  // Keep highlighted item in view
  useEffect(() => {
    if (resultsContainerRef.current) {
      const activeEl = resultsContainerRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedIndex]);

  const handleSelectNote = (note) => {
    navigate(`/read?id=${note.id}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden flex flex-col z-10 max-h-[85vh]"
          >
            {/* Header: Search Input & Close */}
            <div className="flex items-center px-4 sm:px-6 py-3.5 border-b border-[var(--line)] bg-[var(--surface)] gap-3">
              <Search size={18} className="text-[var(--accent)] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search notes, C#, .NET, DSA, SQL, System Design..."
                className="flex-1 bg-transparent text-sm sm:text-base text-[var(--ink)] placeholder:text-[var(--muted)] outline-none border-none shadow-none font-sans"
              />
              {loading && <Loader2 size={16} className="animate-spin text-[var(--accent)] shrink-0" />}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="p-1 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  title="Clear"
                >
                  <X size={15} />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-[var(--radius-md)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer ml-1"
                title="Close (Esc)"
              >
                <X size={18} />
              </button>
            </div>

            {/* Subheader / Section Tag */}
            <div className="px-4 sm:px-6 py-2 bg-[var(--surface-2)]/60 border-b border-[var(--line)] flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
              <span>
                {hasQuery
                  ? loading
                    ? 'Searching engineering notes…'
                    : `Search Results (${results.length})`
                  : 'Recommended Engineering Notes'}
              </span>
              <span className="hidden sm:inline">Use ↑ ↓ to navigate, Enter to open</span>
            </div>

            {/* Results List */}
            <div
              ref={resultsContainerRef}
              className="py-2 px-2 sm:px-3 overflow-y-auto max-h-[420px] divide-y divide-[var(--line)]/40 space-y-1"
            >
              {/* Show smooth skeletons while searching if no results are ready yet */}
              {loading && hasQuery && results.length === 0 ? (
                <div className="space-y-2 p-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="p-3 rounded-[var(--radius-lg)] flex items-center gap-3.5 bg-[var(--surface-2)]/40 animate-pulse border border-transparent"
                    >
                      <div className="w-12 h-12 rounded-[var(--radius-md)] bg-[var(--surface-2)] shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-[var(--surface-2)] rounded w-3/4" />
                        <div className="h-3 bg-[var(--surface-2)] rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayList.length > 0 ? (
                displayList.map((note, index) => {
                  const isSelected = selectedIndex === index;
                  const tags = note.tagObjects || (Array.isArray(note.tags) ? note.tags.map(t => typeof t === 'string' ? { name: t } : t) : []);
                  const hasCover = Boolean(note.coverUrl);

                  return (
                    <div
                      key={note.id || index}
                      data-index={index}
                      onClick={() => handleSelectNote(note)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`group p-2.5 sm:p-3 rounded-[var(--radius-lg)] flex items-center gap-3.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--accent-soft)] border border-[var(--accent)]/30 shadow-xs'
                          : 'hover:bg-[var(--surface-2)] border border-transparent'
                      }`}
                    >
                      {/* Photo / Thumbnail or Fallback Icon */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[var(--radius-md)] overflow-hidden shrink-0 border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-center">
                        {hasCover ? (
                          <img
                            src={note.coverUrl}
                            alt={note.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <BookOpen size={20} className="text-[var(--accent)]" />
                        )}
                      </div>

                      {/* Content: Title, excerpt, metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-xs sm:text-sm font-semibold truncate ${
                            isSelected ? 'text-[var(--accent)]' : 'text-[var(--ink)]'
                          }`}>
                            {note.title}
                          </h4>
                          <span className="shrink-0 text-[10px] font-mono text-[var(--muted)] flex items-center gap-1">
                            <Clock size={11} /> {note.readingTime || 1} min
                          </span>
                        </div>

                        {note.excerpt ? (
                          <p className="text-[11px] text-[var(--ink-2)] line-clamp-1 mt-0.5 font-normal">
                            {note.excerpt}
                          </p>
                        ) : null}

                        {/* Tags */}
                        {tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {tags.slice(0, 3).map((t, ti) => (
                              <span
                                key={ti}
                                className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[var(--surface-2)] text-[var(--ink-2)] border border-[var(--line)]"
                              >
                                {t.name || t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Arrow */}
                      <div className="shrink-0 pl-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[var(--accent)] text-[var(--accent-on)] scale-105'
                            : 'text-[var(--muted)] group-hover:text-[var(--ink)]'
                        }`}>
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : !loading && hasQuery && results.length === 0 ? (
                <div className="py-12 px-4 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-[var(--surface-2)] flex items-center justify-center text-[var(--muted)] mb-3">
                    <Search size={22} />
                  </div>
                  <h3 className="text-sm font-semibold text-[var(--ink)]">No matching notes found</h3>
                  <p className="text-xs text-[var(--muted)] mt-1 max-w-xs mx-auto">
                    Try searching for topics like "C#", "DSA", "Async", "B-Tree", or "System Design".
                  </p>
                </div>
              ) : null}
            </div>

            {/* Footer / Shortcuts */}
            <div className="px-4 sm:px-6 py-2.5 bg-[var(--surface-2)]/40 border-t border-[var(--line)] flex items-center justify-between text-[11px] text-[var(--muted)]">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)] font-mono text-[10px]">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--line)] font-mono text-[10px]">Esc</kbd> Close
                </span>
              </div>
              <span className="font-serif font-semibold text-[var(--ink-2)]">
                Notes<span className="text-[var(--accent)]">.</span>
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
