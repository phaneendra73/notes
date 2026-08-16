import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useLessons from '../../hooks/useLessons.js';
import useTags from '../../hooks/useTags.js';
import useSearch from '../../hooks/useSearch.js';
import LessonCard from './LessonCard.jsx';
import { Pagination } from './Pagination.jsx';
import { Skeleton } from './Skeleton.jsx';
import {
  BookOpen, RefreshCw, AlertCircle, Search,
  ArrowRight, Loader2, X,
  LayoutGrid, List, ArrowUpDown
} from 'lucide-react';

const SEARCH_PLACEHOLDERS = [
  "Search notes (e.g. C# async, Binary Trees, SQL Indexing, Redis Cache)...",
  "Type a topic or title to search...",
  "Search any concept or code pattern...",
];

export default function LessonCatalog() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const catalogTopRef = useRef(null);

  const [selectedTagId, setSelectedTagId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'views' | 'title'

  const { tags: backendTags } = useTags();
  const { results: searchDropdownResults, loading: searchDropdownLoading } = useSearch(searchQuery);
  // Fetch 10 cards per page
  const { lessons, loading, isFetching, error, pagination, refetch } = useLessons(selectedTagId, searchQuery, currentPage, 10);

  const isLoading = loading || isFetching;

  // Cycle search placeholders slowly
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIdx((prev) => (prev + 1) % SEARCH_PLACEHOLDERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Global keyboard listener for Ctrl+K and Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setSearchQuery('');
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  let filteredLessons = [...lessons];

  // Client-side sorting
  if (sortBy === 'views') {
    filteredLessons.sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0));
  } else if (sortBy === 'title') {
    filteredLessons.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  }

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    catalogTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearAllFilters = () => {
    setSelectedTagId(null);
    setSearchQuery('');
    setSortBy('recent');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedTagId !== null || searchQuery !== '';

  return (
    <div ref={catalogTopRef} className="w-full max-w-[var(--maxw)] mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 font-sans">
      
      {/* 🟢 Compact, Simple Hero Section 🟢 */}
      <section className="p-6 sm:p-8 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)] space-y-4">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-tight">
            Notes
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] font-normal max-w-xl leading-relaxed">
            Visual notes on software architecture, code patterns, and systems.
          </p>
        </div>

        {/* Prominent Search Bar */}
        <div className="relative w-full">
          <div
            onClick={() => searchInputRef.current?.focus()}
            className={`flex items-center w-full px-3.5 py-2.5 sm:py-3 rounded-[var(--radius-md)] border bg-[var(--bg)] shadow-[var(--shadow-sm)] transition-all cursor-text ${
              searchFocused
                ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)]'
                : 'border-[var(--line)] hover:border-[var(--line-strong)]'
            }`}
          >
            <Search size={16} className="text-[var(--accent)] shrink-0 mr-2.5" />
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
              placeholder={SEARCH_PLACEHOLDERS[placeholderIdx]}
              className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--muted)] outline-none font-normal"
            />
            {searchQuery ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                className="p-1 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                title="Clear search"
              >
                <X size={14} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--line)] text-[10px] font-mono text-[var(--muted)] font-bold">
                Ctrl + K
              </kbd>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {searchFocused && searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute top-full left-0 right-0 z-40 mt-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-lg)] overflow-hidden p-2 text-left"
              >
                {searchDropdownLoading ? (
                  <div className="p-3 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
                    <Loader2 size={14} className="animate-spin text-[var(--accent)]" /> Searching notes...
                  </div>
                ) : searchDropdownResults.length > 0 ? (
                  <div className="space-y-1">
                    {searchDropdownResults.slice(0, 5).map((res) => (
                      <button
                        key={res.id}
                        onClick={() => navigate(`/read?id=${res.id}`)}
                        className="w-full text-left px-3 py-2 rounded-[var(--radius-sm)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] transition-colors flex items-center justify-between text-xs sm:text-sm font-semibold cursor-pointer text-[var(--ink)]"
                      >
                        <span className="truncate">{res.title}</span>
                        <ArrowRight size={13} className="shrink-0 text-[var(--accent)] ml-2" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-[var(--muted)]">
                    No matching notes found for "{searchQuery}".
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 🟢 Controls Toolbar: Topic Filter Pills + Sort & View Modes 🟢 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1 border-b border-[var(--line)]">
        {/* Topic Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
          <button
            onClick={() => { setSelectedTagId(null); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold shrink-0 transition-colors cursor-pointer border ${
              selectedTagId === null
                ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold shadow-[var(--shadow-sm)]'
                : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]'
            }`}
          >
            All
          </button>

          {backendTags.map((tag) => {
            const isActive = selectedTagId === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => { setSelectedTagId(isActive ? null : tag.id); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold shrink-0 transition-colors cursor-pointer border ${
                  isActive
                    ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold shadow-[var(--shadow-sm)]'
                    : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]'
                }`}
              >
                {tag.name}
              </button>
            );
          })}
        </div>

        {/* Right Controls: Clear + Sort + View Switcher */}
        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-auto">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[var(--accent)] hover:underline font-semibold flex items-center gap-1 mr-2 cursor-pointer"
            >
              <X size={12} /> Clear Filters
            </button>
          )}

          {/* Sort Dropdown */}
          <div className="flex items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-2.5 py-1.5 gap-1.5 text-xs text-[var(--ink-2)] shadow-[var(--shadow-sm)]">
            <ArrowUpDown size={12} className="text-[var(--muted)]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-[var(--ink)] outline-none border-none cursor-pointer pr-1 font-semibold"
            >
              <option value="recent">Newest</option>
              <option value="views">Most Viewed</option>
              <option value="title">Title A-Z</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-0.5 shadow-[var(--shadow-sm)]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[var(--surface-2)] text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
              title="Stacked Row List View"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-[var(--surface-2)] text-[var(--accent)]'
                  : 'text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 🟢 Notes Listing (Stacked Row List / Grid) 🟢 */}
      {isLoading ? (
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-h-[360px]" : "space-y-3.5 min-h-[360px]"}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 sm:p-5 flex gap-4 items-center">
              <Skeleton className="w-24 h-20 sm:w-32 sm:h-24 rounded-[var(--radius-md)] shrink-0" />
              <div className="flex-1 space-y-2.5">
                <Skeleton className="h-4 w-28 rounded-[var(--radius-sm)]" />
                <Skeleton className="h-5 w-3/4 rounded-[var(--radius-sm)]" />
                <Skeleton className="h-3.5 w-full rounded-[var(--radius-sm)]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-[var(--radius-lg)] border border-[var(--err)] bg-[var(--err-soft)] p-8 text-center space-y-4 min-h-[260px] flex flex-col items-center justify-center">
          <AlertCircle size={32} className="mx-auto text-[var(--err)]" />
          <h3 className="font-serif font-bold text-base text-[var(--err)]">{error}</h3>
          <button
            onClick={refetch}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-on)] font-bold text-xs cursor-pointer shadow-[var(--shadow-sm)] hover:bg-[var(--accent-strong)] transition-colors font-sans"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      ) : filteredLessons.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={`page-${currentPage}-tag-${selectedTagId}-query-${searchQuery}-mode-${viewMode}-sort-${sortBy}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 min-h-[360px]" : "space-y-3.5 min-h-[360px]"}
          >
            {filteredLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} viewMode={viewMode} />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-12 text-center space-y-3 min-h-[280px] flex flex-col items-center justify-center">
          <BookOpen size={36} className="mx-auto text-[var(--muted)] opacity-50" />
          <h3 className="font-serif font-bold text-lg text-[var(--ink)]">No Notes Found</h3>
          <p className="text-xs text-[var(--muted)] max-w-md mx-auto leading-relaxed font-normal">
            No notes matched your search query or selected topic.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-on)] font-bold text-xs cursor-pointer hover:bg-[var(--accent-strong)] transition-colors inline-block font-sans mt-2"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* 🟢 Pagination (Load 10 at a time) 🟢 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
