import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useLessons from '../../hooks/useLessons.js';
import useTags from '../../hooks/useTags.js';
import useBookmarks from '../../hooks/useBookmarks.js';
import LessonCard from './LessonCard.jsx';
import { Pagination } from './Pagination.jsx';
import { Skeleton } from './Skeleton.jsx';
import {
  FiBookOpen, FiTag, FiRefreshCw, FiAlertCircle, FiBookmark,
  FiSliders, FiCheck, FiX, FiLayers
} from 'react-icons/fi';

export default function LessonCatalog({ searchQuery = '', isBookmarkedOnly = false, bookmarkedIds = [] }) {
  const [selectedTagId, setSelectedTagId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const { bookmarks } = useBookmarks();
  const { tags, loading: tagsLoading } = useTags();
  const { lessons, loading, error, pagination, refetch } = useLessons(selectedTagId, searchQuery, currentPage, 9);

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

  const activeTagName = tags.find((t) => t.id === selectedTagId)?.name;

  return (
    <div id="notes-section" className="w-full flex flex-col gap-6 scroll-mt-20">
      {/* ── Catalog Section Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight flex items-center gap-2.5">
            <FiLayers className="text-primary" size={24} />
            <span>Notes Library</span>
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Slide-by-slide engineering guides &amp; visual tech notes
          </p>
        </div>

        {/* Active Filter Clear Pill */}
        {(selectedTagId || showSavedOnly || searchQuery) && (
          <button
            onClick={() => { setSelectedTagId(null); setShowSavedOnly(false); }}
            className="self-start sm:self-auto px-4 py-1.5 rounded-full text-xs font-extrabold bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-black transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <span>Clear Active Filter</span>
            <FiX size={14} />
          </button>
        )}
      </div>

      {/* ── Raycast-style Glassmorphic Tag Filter Dock ── */}
      <div className="p-4 sm:p-5 rounded-3xl bg-card/90 backdrop-blur-2xl border border-border/80 shadow-[0_12px_40px_rgba(0,0,0,0.3)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <FiTag size={13} className="text-primary" /> Select Study Track:
          </span>

          {/* Active Filter Status Indicator */}
          <span className="text-xs font-bold text-muted-foreground">
            {activeTagName ? (
              <span className="text-primary font-black">Filtered by: {activeTagName}</span>
            ) : showSavedOnly ? (
              <span className="text-primary font-black">Filtered by: Saved Bookmarks</span>
            ) : searchQuery ? (
              <span className="text-primary font-black">Query: "{searchQuery}"</span>
            ) : (
              <span>Showing all notes</span>
            )}
          </span>
        </div>

        {/* Track Pills Container */}
        <div className="flex flex-wrap gap-2 pt-1">
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

          {/* Dynamic Tag Pills */}
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

      {/* ── Lesson Cards Grid with Layout Morph Animations ── */}
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
              Try choosing another topic track or clear the search query.
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
