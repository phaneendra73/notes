import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useLessons from '../../hooks/useLessons.js';
import useTags from '../../hooks/useTags.js';
import useSearch from '../../hooks/useSearch.js';
import LessonCard from './LessonCard.jsx';
import { Pagination } from './Pagination.jsx';
import { Skeleton } from './Skeleton.jsx';
import LessonReaderModal from './LessonReaderModal.jsx';
import {
  BookOpen, RefreshCw, AlertCircle, Search,
  ArrowRight, Loader2, X,
  LayoutGrid, List, ArrowUpDown, ChevronDown, Check, Clock, Eye, Sparkles
} from 'lucide-react';

const SEARCH_PLACEHOLDERS = [
  "Search notes (e.g. C# async, Binary Trees, SQL Indexing, Redis Cache)...",
  "Type a topic or title to search...",
  "Search any concept or code pattern...",
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest First', icon: Clock },
  { value: 'views', label: 'Most Viewed', icon: Eye },
  { value: 'title', label: 'Title (A–Z)', icon: Sparkles },
];

export default function LessonCatalog() {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const catalogTopRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const [selectedTagId, setSelectedTagId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('recent');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const { tags: backendTags } = useTags();
  const { results: searchDropdownResults, loading: searchDropdownLoading } = useSearch(searchQuery);
  const { lessons, loading, isFetching, error, pagination, refetch } = useLessons(selectedTagId, searchQuery, currentPage, 10);

  const isLoading = loading || isFetching;

  const handleCardClick = (lesson) => {
    setSelectedLesson(lesson);
    setModalOpen(true);
  };

  const handleReadClick = (lesson, e) => {
    e.stopPropagation();
    navigate(`/read?id=${lesson.id}`);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedLesson(null);
  };

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

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target)) {
        setSortDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    <>
      <div ref={catalogTopRef} className="w-full max-w-[var(--maxw)] mx-auto px-4 sm:px-6 py-6 md:py-8 space-y-6 font-sans">
      
      {/* 🟢 Purposeful Hero Section 🟢 */}
      <section className="mb-2">
        {/* Title & Subtitle */}
        <div className="mb-6 space-y-2">
          <h1 className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-[var(--ink)] tracking-tight leading-[1.1]">
            Knowledge written clearly.
          </h1>
          <p className="text-base sm:text-lg text-[var(--ink-2)] leading-relaxed max-w-2xl">
            Slide-based learning notes on software architecture, code patterns, and systems.
          </p>
        </div>

        {/* Prominent Search Bar */}
        <div className="relative w-full max-w-xl mx-auto">
          <div
            onClick={() => searchInputRef.current?.focus()}
            className={`flex items-center w-full px-4 py-3.5 rounded-[var(--radius-lg)] border bg-[var(--bg)] shadow-[var(--shadow-md)] transition-all cursor-text ${
              searchFocused
                ? 'border-[var(--accent)] ring-2 ring-[var(--accent-soft)]'
                : 'border-[var(--line)] hover:border-[var(--line-strong)]'
            }`}
          >
            <Search size={18} className="text-[var(--accent)] shrink-0 mr-3" />
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
              placeholder="Search for topics, titles, or code patterns..."
              className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--muted)] outline-none font-normal"
            />
            {searchQuery ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery('');
                }}
                className="p-1.5 rounded-[var(--radius-md)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-all cursor-pointer"
                title="Clear search"
              >
                <X size={15} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-block px-2 py-1 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] text-[10px] font-mono text-[var(--muted)] font-bold">
                Ctrl + K
              </kbd>
            )}
          </div>

          {/* Search Results Count */}
          {searchFocused && searchQuery.length >= 2 && !searchDropdownLoading && searchDropdownResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 px-2 text-xs text-[var(--muted)] font-medium">
              {searchDropdownResults.length} result{searchDropdownResults.length !== 1 ? 's' : ''} found
            </div>
          )}

          {/* Autocomplete Dropdown */}
          <AnimatePresence>
            {searchFocused && searchQuery.length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="absolute top-full left-0 right-0 z-40 mt-2 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-lg)] overflow-hidden"
              >
                {searchDropdownLoading ? (
                  <div className="p-4 flex items-center justify-center gap-2 text-xs text-[var(--muted)]">
                    <Loader2 size={14} className="animate-spin text-[var(--accent)]" /> Loading...
                  </div>
                ) : searchDropdownResults.length > 0 ? (
                  <div className="max-h-[300px] overflow-y-auto">
                    {searchDropdownResults.slice(0, 8).map((res) => (
                      <button
                        key={res.id}
                        onClick={() => navigate(`/read?id=${res.id}`)}
                        className="w-full text-left px-4 py-3 rounded-[var(--radius-md)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)] transition-colors flex items-center justify-between text-sm font-semibold cursor-pointer text-[var(--ink)] border-b border-[var(--line)] last:border-0"
                      >
                        <span className="truncate flex-1">{res.title}</span>
                        <ArrowRight size={15} className="shrink-0 text-[var(--accent)] ml-3" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-[var(--muted)]">
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
                onClick={() => {
                  setSelectedTagId(isActive ? null : tag.id);
                  setCurrentPage(1);
                }}
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

          {/* Custom Sort Dropdown */}
          <div ref={sortDropdownRef} className="relative">
            <button
              onClick={() => setSortDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--ink)] cursor-pointer shadow-[var(--shadow-sm)] transition-all select-none"
              title="Sort Notes"
            >
              {(() => {
                const currentOpt = SORT_OPTIONS.find((opt) => opt.value === sortBy) || SORT_OPTIONS[0];
                const IconComp = currentOpt.icon;
                return (
                  <>
                    <IconComp size={13} className="text-[var(--accent)]" />
                    <span>{currentOpt.label}</span>
                  </>
                );
              })()}
              <ChevronDown
                size={13}
                className={`text-[var(--muted)] transition-transform duration-200 ${
                  sortDropdownOpen ? 'rotate-180 text-[var(--accent)]' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {sortDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-xl)] p-1 space-y-0.5 backdrop-blur-xl"
                >
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = sortBy === opt.value;
                    const OptIcon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value);
                          setSortDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors text-left ${
                          isSelected
                            ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
                            : 'text-[var(--ink)] hover:bg-[var(--surface-2)]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <OptIcon size={13} className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check size={13} className="text-[var(--accent)]" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
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
        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]" : "space-y-4 min-h-[400px]"}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-5 sm:p-6 flex gap-4 sm:gap-5 items-center">
              <Skeleton className="w-28 h-22 sm:w-36 sm:h-28 rounded-[var(--radius-lg)] shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-32 sm:w-40 rounded-[var(--radius-md)]" />
                <Skeleton className="h-6 w-3/4 rounded-[var(--radius-md)]" />
                <Skeleton className="h-4 w-full rounded-[var(--radius-sm)]" />
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
              <LessonCard 
                key={lesson.id} 
                lesson={lesson} 
                viewMode={viewMode} 
                selectedLesson={selectedLesson}
                modalOpen={modalOpen}
                onCardClick={handleCardClick}
                onReadClick={handleReadClick}
                onModalClose={handleModalClose}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] p-12 sm:p-16 text-center space-y-5 min-h-[320px] flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-[var(--muted)] opacity-60" />
          </div>
          <h3 className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)]">
            No notes found
          </h3>
          <p className="text-sm text-[var(--muted)] max-w-md mx-auto leading-relaxed font-normal">
            No notes matched your search query or selected topic. Try adjusting your search terms or clear the filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-on)] font-bold text-xs sm:text-sm cursor-pointer hover:bg-[var(--accent-strong)] transition-all duration-[var(--dur)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]"
          >
            <RefreshCw size={14} /> Reset Filters
          </button>
        </div>
      )}

      {/* 🟢 Pagination (Load 10 at a time) 🟢 */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>

    <LessonReaderModal 
      lesson={selectedLesson} 
      isOpen={modalOpen} 
      onClose={handleModalClose} 
    />
    </>
  );
}
