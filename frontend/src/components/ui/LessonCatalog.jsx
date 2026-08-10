import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView, animate } from 'framer-motion';
import client from '../../api/client.js';
import useLessons from '../../hooks/useLessons.js';
import useTags from '../../hooks/useTags.js';
import useBookmarks from '../../hooks/useBookmarks.js';
import useSearch from '../../hooks/useSearch.js';
import LessonCard from './LessonCard.jsx';
import { Pagination } from './Pagination.jsx';
import { Skeleton } from './Skeleton.jsx';
import {
  BookOpen, RefreshCw, AlertCircle, Bookmark, Search,
  ArrowRight, Loader2, X, Zap, Eye, Tag, Sliders
} from 'lucide-react';

const PLACEHOLDERS = [
  "Search C# Task.WhenAll & Async/Await...",
  "Search Binary Trees, Graph BFS & Algorithms...",
  "Search Cache-Aside & System Design...",
  "Search B-Tree Indexing & SQL Queries...",
];

function AnimatedCounter({ target, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView || !target) return;
    const controls = animate(0, target, {
      duration: 1.2,
      ease: 'easeOut',
      onUpdate: (v) => setDisplay(Math.floor(v)),
    });
    return controls.stop;
  }, [inView, target]);

  return (
    <span ref={ref} className="text-[var(--ink)] font-bold text-sm md:text-base leading-tight tabular-nums font-mono">
      {display}{suffix}
    </span>
  );
}

export default function LessonCatalog({ isBookmarkedOnly = false, bookmarkedIds = [] }) {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  const [selectedTagId, setSelectedTagId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [stats, setStats] = useState({ totalLessons: 0, totalViews: 0, totalTags: 0 });

  const { bookmarks } = useBookmarks();
  const { tags: backendTags } = useTags();
  const { results: searchDropdownResults, loading: searchDropdownLoading } = useSearch(searchQuery);
  const { lessons, loading, isFetching, error, pagination, refetch } = useLessons(selectedTagId, searchQuery, currentPage, 9);

  // Fetch platform stats
  useEffect(() => {
    client
      .get('/api/lessons/stats')
      .then((res) => {
        if (res.data) {
          setStats({
            totalLessons: res.data.totalLessons || 0,
            totalViews: res.data.totalViews || 0,
            totalTags: res.data.totalTags || 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  // Cycle search placeholders
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  // Keyboard listener for Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') setSearchQuery('');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  let filteredLessons = lessons;
  if (isBookmarkedOnly || showSavedOnly) {
    const activeIds = isBookmarkedOnly ? bookmarkedIds : bookmarks;
    filteredLessons = lessons.filter((l) => activeIds.includes(l.id));
  }

  const clearAllFilters = () => {
    setSelectedTagId(null);
    setSearchQuery('');
    setShowSavedOnly(false);
    setCurrentPage(1);
  };

  return (
    <div id="notes-section" className="w-full space-y-8 py-8 max-w-[var(--maxw)] mx-auto px-4 sm:px-6">
      {/* Clean Editorial Catalog Header */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[var(--line)]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)] flex items-center gap-1.5 mb-1.5 font-sans">
              <Zap size={13} className="text-[var(--accent)]" /> Interactive Catalog
            </span>
            <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[var(--ink)]">
              Master Technical Notes
            </h2>
          </div>

          {/* Minimal Telemetry Counters */}
          <div className="flex items-center gap-5 text-xs font-semibold font-sans text-[var(--ink-2)]">
            <div className="flex items-center gap-2">
              <BookOpen size={15} className="text-[var(--accent)]" />
              <span><AnimatedCounter target={stats.totalLessons || 12} /> Notes</span>
            </div>
            <span className="text-[var(--line-strong)]">•</span>
            <div className="flex items-center gap-2">
              <Eye size={15} className="text-[var(--accent)]" />
              <span><AnimatedCounter target={stats.totalViews || 1420} suffix="+" /> Views</span>
            </div>
          </div>
        </div>

        {/* Clean Minimal Search Input */}
        <div className="relative w-full">
          <div className={`relative flex items-center rounded-[var(--radius-md)] border transition-colors duration-[var(--dur)] ${
            searchFocused ? 'border-[var(--accent)] bg-[var(--surface)]' : 'border-[var(--line)] bg-[var(--surface)]'
          }`}>
            <Search size={18} className="ml-4 text-[var(--accent)] shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              placeholder={PLACEHOLDERS[placeholderIndex]}
              className="w-full py-3.5 px-3.5 bg-transparent text-sm text-[var(--ink)] focus:outline-none placeholder:text-[var(--muted)] font-sans font-normal"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="mr-3 p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
              >
                <X size={16} />
              </button>
            ) : (
              <span className="mr-3.5 px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] text-[10px] font-mono text-[var(--accent)] font-bold border border-[var(--line)] hidden sm:inline-block">
                Ctrl+K
              </span>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {searchFocused && searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute top-full left-0 right-0 z-40 mt-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-md)] overflow-hidden p-2"
              >
                {searchDropdownLoading ? (
                  <div className="p-4 flex items-center justify-center gap-2 text-xs text-[var(--muted)] font-sans">
                    <Loader2 size={16} className="animate-spin text-[var(--accent)]" /> Searching notes...
                  </div>
                ) : searchDropdownResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchDropdownResults.slice(0, 5).map((res) => (
                      <button
                        key={res.id}
                        onClick={() => navigate(`/read?id=${res.id}`)}
                        className="w-full text-left p-3 rounded-[var(--radius-sm)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] transition-colors flex items-center justify-between text-xs font-semibold cursor-pointer text-[var(--ink)] font-sans"
                      >
                        <span className="truncate">{res.title}</span>
                        <ArrowRight size={14} className="shrink-0 text-[var(--accent)]" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--muted)] font-sans">
                    No matching visual notes found.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Dynamic Backend Topic Pills */}
        <div className="flex flex-wrap items-center gap-2 font-sans">
          <button
            onClick={() => { setSelectedTagId(null); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border ${
              selectedTagId === null
                ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold'
                : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]'
            }`}
          >
            <Sliders size={14} className={selectedTagId === null ? 'text-[var(--accent-on)]' : 'text-[var(--accent)]'} />
            <span>All Topics</span>
          </button>

          {backendTags.map((tag) => {
            const isActive = selectedTagId === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => { setSelectedTagId(isActive ? null : tag.id); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold'
                    : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]'
                }`}
              >
                <Tag size={13} className={isActive ? 'text-[var(--accent-on)]' : 'text-[var(--accent)]'} />
                <span>{tag.name}</span>
              </button>
            );
          })}

          {bookmarks.length > 0 && (
            <button
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={`px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer border ml-auto ${
                showSavedOnly
                  ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold'
                  : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]'
              }`}
            >
              <Bookmark size={14} className={showSavedOnly ? 'fill-current' : 'text-[var(--accent)]'} />
              <span>Saved ({bookmarks.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Content with Smooth AnimatePresence & Stable Min-Height */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[360px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-6 space-y-4">
              <Skeleton className="aspect-video w-full rounded-[var(--radius-sm)]" />
              <Skeleton className="h-6 w-3/4 rounded-[var(--radius-sm)]" />
              <Skeleton className="h-4 w-full rounded-[var(--radius-sm)]" />
              <Skeleton className="h-4 w-1/2 rounded-[var(--radius-sm)]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-md)] border border-[var(--err)] bg-[var(--err-soft)] p-8 text-center space-y-4 min-h-[360px] flex flex-col items-center justify-center">
          <AlertCircle size={40} className="mx-auto text-[var(--err)]" />
          <h3 className="font-serif font-bold text-lg text-[var(--err)]">{error}</h3>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-on)] font-bold text-xs cursor-pointer shadow-[var(--shadow-sm)] hover:bg-[var(--accent-strong)] transition-colors font-sans"
          >
            <RefreshCw size={14} /> Retry Loading
          </button>
        </div>
      ) : filteredLessons.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`page-${currentPage}-tag-${selectedTagId}-query-${searchQuery}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[360px]"
          >
            {filteredLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-12 text-center space-y-3 min-h-[360px] flex flex-col items-center justify-center">
          <BookOpen size={44} className="mx-auto text-[var(--muted)] opacity-60" />
          <h3 className="font-serif font-bold text-xl text-[var(--ink)]">No Notes Found</h3>
          <p className="text-xs text-[var(--ink-2)] max-w-md mx-auto leading-relaxed font-normal font-sans">
            We couldn't find any visual study notes matching your filter criteria. Try adjusting your query or clear filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-on)] font-bold text-xs cursor-pointer hover:bg-[var(--accent-strong)] transition-colors inline-block font-sans"
          >
            Reset Catalog
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      )}
    </div>
  );
}
