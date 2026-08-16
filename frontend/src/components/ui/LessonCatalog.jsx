import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useLessons from '../../hooks/useLessons.js';
import useTags from '../../hooks/useTags.js';
import LessonCard from './LessonCard.jsx';
import { Pagination } from './Pagination.jsx';
import { Skeleton } from './Skeleton.jsx';
import LessonReaderModal from './LessonReaderModal.jsx';
import SearchCommandModal from './SearchCommandModal.jsx';
import {
  BookOpen, RefreshCw, AlertCircle, Search,
  ArrowRight, Loader2, X,
  LayoutGrid, List, ArrowUpDown, ChevronDown, Check, Clock, Eye, Sparkles, Filter
} from 'lucide-react';

const SORT_OPTIONS = [
  { value: 'recent', label: 'Newest First', icon: Clock },
  { value: 'views', label: 'Most Viewed', icon: Eye },
  { value: 'title', label: 'Title (A–Z)', icon: Sparkles },
];

export default function LessonCatalog() {
  const navigate = useNavigate();
  const location = useLocation();
  const catalogTopRef = useRef(null);
  const sortDropdownRef = useRef(null);

  // Parse URL search params
  const urlParams = new URLSearchParams(location.search);
  const tagParam = urlParams.get('tags') || urlParams.get('tag');
  const initialTagIds = tagParam
    ? tagParam.split(',').map((x) => parseInt(x.trim(), 10)).filter((x) => !isNaN(x))
    : [];

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [commandModalOpen, setCommandModalOpen] = useState(false);

  // Multi-select tags state (array of numbers)
  const [selectedTagIds, setSelectedTagIds] = useState(initialTagIds);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('list');
  const [sortBy, setSortBy] = useState('recent');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  // Sync URL tag param changes
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const t = p.get('tags') || p.get('tag');
    if (t) {
      const ids = t.split(',').map((x) => parseInt(x.trim(), 10)).filter((x) => !isNaN(x));
      setSelectedTagIds(ids);
    } else {
      setSelectedTagIds([]);
    }
    if (p.get('focus') === 'search') {
      setCommandModalOpen(true);
    }
  }, [location.search]);

  const { tags: backendTags, loading: tagsLoading } = useTags();
  const { lessons, loading, isFetching, error, pagination, refetch } = useLessons(
    selectedTagIds.length > 0 ? selectedTagIds : null,
    '',
    currentPage,
    10
  );

  const isLoading = loading || isFetching;

  // Toggle a single tag in multi-select mode
  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) => {
      const next = prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId];
      return next;
    });
    setCurrentPage(1);
  };

  const selectAllTags = () => {
    setSelectedTagIds([]);
    setCurrentPage(1);
  };

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
    setSelectedTagIds([]);
    setSortBy('recent');
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedTagIds.length > 0;

  return (
    <>
      <div ref={catalogTopRef} className="w-full max-w-[var(--maxw)] mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-5 sm:space-y-6 font-sans">
      
        {/* 🟢 Hero Section 🟢 */}
        <section className="space-y-2.5 sm:space-y-3 pb-1 sm:pb-2">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.75 rounded-full text-[10px] sm:text-[11px] font-mono font-medium bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/20 shadow-xs">
                <Sparkles size={12} /> Engineering Notes
              </div>
              <h1 className="font-serif font-bold text-2xl sm:text-4xl lg:text-5xl text-[var(--ink)] tracking-tight leading-[1.15]">
                Knowledge written clearly.
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-[var(--ink-2)] leading-relaxed">
                Concise technical notes and deep dives covering C#, .NET Core, Data Structures, SQL Indexing, and System Design.
              </p>
            </div>

            {/* Quick Spotlight Search Trigger in Hero */}
            <button
              onClick={() => setCommandModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-[var(--radius-lg)] bg-[var(--surface)] hover:bg-[var(--surface-2)] border border-[var(--line)] hover:border-[var(--accent)] text-xs text-[var(--muted)] hover:text-[var(--ink)] transition-all cursor-pointer shadow-xs shrink-0 group"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-[var(--accent)] group-hover:scale-110 transition-transform" />
                <span className="font-medium text-[var(--ink-2)] group-hover:text-[var(--ink)]">Search notes…</span>
              </div>
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                Ctrl+K
              </kbd>
            </button>
          </div>
        </section>

        {/* 🟢 Controls Toolbar: Multi-Select Topic Filter Pills + Sort & View Modes 🟢 */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-2 border-b border-[var(--line)]">
          {/* Topic Pills — with smooth horizontal scroll & clean padding */}
          <div className="flex items-center gap-2 overflow-x-auto py-2 px-0.5 no-scrollbar flex-1 min-w-0 relative z-10">
            {/* All Topics Button */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              onClick={selectAllTags}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1.5 ${
                selectedTagIds.length === 0
                  ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold shadow-[var(--shadow-sm)] ring-1 ring-[var(--accent)]/40'
                  : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]'
              }`}
            >
              {selectedTagIds.length === 0 && <Check size={12} className="stroke-[3]" />}
              <span>All</span>
            </motion.button>

            {/* Tags Loading Skeleton */}
            {tagsLoading ? (
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-7 w-16 sm:w-20 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] animate-pulse shrink-0"
                  />
                ))}
              </div>
            ) : (
              backendTags.map((tag) => {
                const isActive = selectedTagIds.includes(tag.id);
                return (
                  <motion.button
                    key={tag.id}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold shrink-0 transition-colors cursor-pointer border flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold shadow-[var(--shadow-sm)] ring-1 ring-[var(--accent)]/40'
                        : 'bg-[var(--surface)] border-[var(--line)] text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--accent)] hover:bg-[var(--surface-2)]'
                    }`}
                  >
                    {isActive && <Check size={12} className="stroke-[3]" />}
                    <span>{tag.name}</span>
                  </motion.button>
                );
              })
            )}
          </div>

          {/* Right Controls: Clear Filter + Sort + View Switcher */}
          <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={clearAllFilters}
                className="text-xs text-[var(--accent)] hover:underline font-semibold flex items-center gap-1 mr-1 cursor-pointer bg-[var(--accent-soft)] px-2.5 py-1 rounded-[var(--radius-md)] border border-[var(--accent)]/30"
                title="Clear selected tag filters"
              >
                <X size={12} />
                <span>Clear ({selectedTagIds.length})</span>
              </motion.button>
            )}

            {/* Custom Sort Dropdown */}
            <div ref={sortDropdownRef} className="relative">
              <button
                onClick={() => setSortDropdownOpen((prev) => !prev)}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)] text-xs font-semibold text-[var(--ink)] cursor-pointer shadow-[var(--shadow-sm)] transition-all select-none"
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
                    initial={{ opacity: 0, y: 4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1.5 w-44 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-md)] py-1 z-30 overflow-hidden"
                  >
                    {SORT_OPTIONS.map((opt) => {
                      const isSelected = sortBy === opt.value;
                      const IconComp = opt.icon;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setSortDropdownOpen(false);
                          }}
                          className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                              : 'text-[var(--ink)] hover:bg-[var(--surface-2)]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <IconComp size={14} className={isSelected ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />
                            <span>{opt.label}</span>
                          </div>
                          {isSelected && <Check size={14} className="text-[var(--accent)]" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* View Mode Toggle: List vs Grid */}
            <div className="flex items-center p-0.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                title="List View"
              >
                <List size={14} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-[var(--radius-sm)] transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[var(--accent)] text-[var(--accent-on)] shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--ink)]'
                }`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* 🟢 Error State 🟢 */}
        {error && (
          <div className="p-4 rounded-[var(--radius-md)] border border-[var(--err-line)] bg-[var(--err-soft)] text-[var(--err)] text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button
              onClick={refetch}
              className="font-bold underline hover:no-underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {/* 🟢 Loading Skeletons 🟢 */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" : "space-y-3 sm:space-y-4"}>
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="p-4 sm:p-5 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="w-16 h-4 rounded" />
                  <Skeleton className="w-12 h-4 rounded" />
                </div>
                <Skeleton className="w-3/4 h-5 sm:h-6 rounded" />
                <Skeleton className="w-full h-10 sm:h-12 rounded" />
                <div className="pt-2 flex justify-between items-center">
                  <Skeleton className="w-24 h-4 rounded" />
                  <Skeleton className="w-16 h-4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLessons.length > 0 ? (
          /* 🟢 Lessons List / Grid 🟢 */
          <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5" : "space-y-3 sm:space-y-4"}>
            {filteredLessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                viewMode={viewMode}
                onCardClick={handleCardClick}
                onReadClick={handleReadClick}
              />
            ))}
          </div>
        ) : (
          /* 🟢 Empty State 🟢 */
          <div className="text-center py-12 sm:py-16 space-y-4 bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-lg)] px-4">
            <div className="w-12 h-12 rounded-full bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center mx-auto text-[var(--muted)]">
              <BookOpen size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-serif font-bold text-[var(--ink)]">No notes found</h3>
              <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
                {hasActiveFilters
                  ? "No notes matched your selected tags. Try selecting different topics or clearing the filter."
                  : "No published study notes are available yet."}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs font-semibold px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-on)] cursor-pointer"
              >
                Reset Filter
              </button>
            )}
          </div>
        )}

        {/* 🟢 Pagination 🟢 */}
        {!isLoading && pagination && pagination.totalPages > 1 && (
          <div className="pt-4 sm:pt-6">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* 🟢 Modal Quick Reader 🟢 */}
      <LessonReaderModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        lesson={selectedLesson}
        onFullView={(lesson) => navigate(`/read?id=${lesson.id}`)}
      />

      {/* 🟢 Global Command Search Modal 🟢 */}
      <SearchCommandModal
        isOpen={commandModalOpen}
        onClose={() => setCommandModalOpen(false)}
      />
    </>
  );
}
