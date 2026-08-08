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
import { Badge } from './Badge.jsx';
import {
  FiBookOpen, FiTag, FiRefreshCw, FiAlertCircle, FiBookmark,
  FiSearch, FiArrowRight, FiLoader, FiX, FiZap, FiEye, FiLayers,
  FiCode, FiCpu, FiDatabase
} from 'react-icons/fi';

const PLACEHOLDERS = [
  "Search C# Task.WhenAll & Async/Await…",
  "Search Binary Trees, Graph BFS & Algorithms…",
  "Search Cache-Aside & System Design…",
  "Search B-Tree Indexing & SQL Queries…",
];

/* Animated Counter for stats */
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
    <span ref={ref} className="text-foreground font-black text-sm md:text-base leading-tight tabular-nums">
      {display}{suffix}
    </span>
  );
}

export default function LessonCatalog({ isBookmarkedOnly = false, bookmarkedIds = [] }) {
  const navigate = useNavigate();
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [stats, setStats] = useState({ totalLessons: 0, totalViews: 0, totalTags: 0 });

  const { bookmarks } = useBookmarks();
  const { tags, loading: tagsLoading } = useTags();
  const { results: searchDropdownResults, loading: searchDropdownLoading } = useSearch(searchQuery);
  const { lessons, loading, error, pagination, refetch } = useLessons(selectedTagId, searchQuery, currentPage, 9);

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

  // Escape key listener to clear search
  useEffect(() => {
    const handleKeyDown = (e) => {
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

  const handleTagClick = (tagId) => {
    setSelectedTagId(selectedTagId === tagId ? null : tagId);
    setShowSavedOnly(false);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedTagId(null);
    setShowSavedOnly(false);
    setSearchQuery('');
    setCurrentPage(1);
  };

  const activeTagName = tags.find((t) => t.id === selectedTagId)?.name;
  const isFiltered = Boolean(selectedTagId || showSavedOnly || searchQuery.trim());

  return (
    <div id="notes-section" className="w-full flex flex-col gap-8 scroll-mt-20">

      {/* ── UNIFIED MASTER CONTROL DECK ── */}
      <div className="relative p-5 sm:p-7 rounded-3xl bg-card/95 backdrop-blur-2xl border border-border/90 shadow-[0_16px_45px_rgba(0,0,0,0.35)] flex flex-col gap-6 overflow-hidden">
        
        {/* Top Glow Edge Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

        {/* 1. Header & Live Platform Stats Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/70">
          <div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight flex items-center gap-2.5">
              <FiLayers className="text-primary" size={24} />
              <span>Notes Library</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Slide-by-slide engineering guides &amp; visual tech notes
            </p>
          </div>

          {/* Live Platform Stats Pill */}
          <div className="flex items-center gap-4 sm:gap-6 bg-muted/40 p-2.5 px-4 rounded-2xl border border-border/60 shrink-0">
            <div className="flex items-center gap-2">
              <FiBookOpen size={15} className="text-primary" />
              <div className="flex flex-col text-left">
                <AnimatedCounter target={stats.totalLessons || 12} suffix="+" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Notes</span>
              </div>
            </div>

            <div className="w-[1px] h-6 bg-border/80" />

            <div className="flex items-center gap-2">
              <FiTag size={15} className="text-primary" />
              <div className="flex flex-col text-left">
                <AnimatedCounter target={stats.totalTags || 8} suffix="+" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Topics</span>
              </div>
            </div>

            <div className="w-[1px] h-6 bg-border/80" />

            <div className="flex items-center gap-2">
              <FiEye size={15} className="text-primary" />
              <div className="flex flex-col text-left">
                <AnimatedCounter target={stats.totalViews || 150} suffix="+" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase">Reads</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Spotlight Search Input Bar */}
        <div className="relative">
          <motion.div
            animate={{
              borderColor: searchFocused ? 'var(--primary)' : 'rgba(255,255,255,0.12)',
              boxShadow: searchFocused ? '0 0 25px var(--neon-glow)' : 'none',
            }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center rounded-2xl bg-muted/30 border transition-all"
          >
            <FiSearch size={18} className="absolute left-4 text-primary pointer-events-none" />
            
            <input
              type="text"
              placeholder={PLACEHOLDERS[placeholderIndex]}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-12 pr-20 h-13 sm:h-14 rounded-2xl bg-transparent text-foreground placeholder:text-muted-foreground/60 text-sm md:text-base font-extrabold focus:outline-none"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />

            <div className="absolute right-3 flex items-center gap-2">
              {!searchQuery && (
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border border-border/80 bg-muted/80 text-[10px] font-mono font-extrabold text-muted-foreground shadow-xs">
                  Esc
                </kbd>
              )}
              {searchDropdownLoading ? (
                <FiLoader size={18} className="text-primary animate-spin" />
              ) : searchQuery ? (
                <button
                  onClick={() => setSearchQuery('')}
                  className="pointer-events-auto text-muted-foreground hover:text-foreground p-1.5 rounded-xl bg-muted cursor-pointer transition-colors"
                  title="Clear search"
                >
                  <FiX size={15} />
                </button>
              ) : null}
            </div>
          </motion.div>

          {/* Instant Dropdown Preview for Search */}
          <AnimatePresence>
            {searchQuery.trim().length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-[calc(100%+8px)] left-0 right-0 bg-card/95 backdrop-blur-2xl border border-border/90 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] max-h-80 overflow-y-auto p-2 flex flex-col gap-1 z-50"
              >
                {searchDropdownResults.length === 0 && !searchDropdownLoading ? (
                  <div className="py-6 text-center text-xs text-muted-foreground font-bold">
                    No matching notes found for "{searchQuery}".
                  </div>
                ) : (
                  searchDropdownResults.map((blog) => (
                    <button
                      key={blog.id}
                      onClick={() => {
                        navigate(`/read?id=${blog.id}`);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/10 border border-transparent hover:border-primary/30 transition-all text-left group cursor-pointer"
                    >
                      <div className="flex flex-col gap-1 min-w-0 flex-1 pr-3">
                        <p className="font-extrabold text-xs sm:text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {blog.title}
                        </p>
                        <div className="flex gap-1.5 flex-wrap">
                          {blog.tags?.slice(0, 3).map((t) => (
                            <Badge key={t} className="text-[10px] py-0 font-bold bg-primary/10 text-primary border-primary/20">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <FiArrowRight size={15} className="text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 3. Raycast-style Sliding Track Pills */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <FiTag size={13} className="text-primary" /> Select Study Track:
            </span>

            {/* Filter status / Clear Filter Pill */}
            {isFiltered && (
              <button
                onClick={handleClearFilters}
                className="px-3 py-1 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black transition-all cursor-pointer shadow-xs flex items-center gap-1"
              >
                <span>Clear Filter</span>
                <FiX size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {/* All Tracks Pill */}
            <button
              onClick={() => { setSelectedTagId(null); setShowSavedOnly(false); }}
              className={`relative px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer z-10 ${
                selectedTagId === null && !showSavedOnly
                  ? 'text-black font-black'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              {selectedTagId === null && !showSavedOnly && (
                <motion.div
                  layoutId="activeTagBg"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_var(--neon-glow)] -z-10"
                />
              )}
              All Tracks
            </button>

            {/* Saved Bookmarks Pill */}
            {bookmarks.length > 0 && (
              <button
                onClick={() => { setShowSavedOnly((s) => !s); setSelectedTagId(null); }}
                className={`relative px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 z-10 ${
                  showSavedOnly
                    ? 'text-black font-black'
                    : 'text-primary hover:bg-primary/10'
                }`}
              >
                {showSavedOnly && (
                  <motion.div
                    layoutId="activeTagBg"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_var(--neon-glow)] -z-10"
                  />
                )}
                <FiBookmark size={13} /> Saved Bookmarks ({bookmarks.length})
              </button>
            )}

            {/* Dynamic Subject Tag Pills */}
            {tagsLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-8 w-24 rounded-full" />
                ))
              : tags.map((t) => {
                  const isActive = selectedTagId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleTagClick(t.id)}
                      className={`relative px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer z-10 ${
                        isActive
                          ? 'text-black font-black'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeTagBg"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_var(--neon-glow)] -z-10"
                        />
                      )}
                      {t.name}
                    </button>
                  );
                })}
          </div>
        </div>
      </div>

      {/* ── LESSON CARDS GRID ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-2xl border border-border bg-card p-4 flex flex-col gap-4">
              <Skeleton className="h-44 w-full rounded-xl" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-1/2 mt-auto" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-center flex flex-col items-center gap-3">
          <FiAlertCircle size={32} className="text-rose-400" />
          <h3 className="font-heading font-extrabold text-lg text-rose-300">Failed to Load Lessons</h3>
          <p className="text-xs text-rose-300/80">{error}</p>
          <button
            onClick={() => refetch(currentPage)}
            className="mt-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs flex items-center gap-2 hover:bg-rose-600 transition-colors cursor-pointer"
          >
            <FiRefreshCw size={13} /> Retry Loading
          </button>
        </div>
      ) : filteredLessons.length === 0 ? (
        <div className="p-12 rounded-3xl border border-border/80 bg-gradient-to-br from-card to-muted/20 text-center flex flex-col items-center gap-4 my-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-xs">
            <FiBookOpen size={32} />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-xl text-foreground mb-1">
              {searchQuery || selectedTagId ? 'No Notes Found for this Filter' : 'No Notes Available'}
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Try selecting another study track or clearing your search term.
            </p>
          </div>
        </div>
      ) : (
        <>
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredLessons.map((l) => (
                <motion.div
                  key={l.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                >
                  <LessonCard lesson={l} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-center">
              <Pagination
                currentPage={pagination.page || pagination.currentPage || 1}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
