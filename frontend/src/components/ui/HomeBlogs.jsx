import React, { useState, useMemo, useRef, useEffect } from 'react';
import BlogCard from './BlogCard.jsx';
import { Pagination } from './Pagination.jsx';
import useBlogs from '../../hooks/useBlogs.js';
import useTags from '../../hooks/useTags.js';
import api from '../../utils/api.js';
import { Skeleton } from './Skeleton.jsx';
import { Input } from './Input.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiBookOpen,
  FiSearch,
  FiSliders,
  FiCheck,
  FiChevronDown,
  FiZap,
  FiTrendingUp,
  FiClock,
  FiBookmark,
} from 'react-icons/fi';
import useBookmarks from '../../hooks/useBookmarks.js';

const sortOptions = [
  { id: 'latest', label: 'Latest Created', icon: FiZap, color: 'text-amber-400' },
  { id: 'views', label: 'Most Viewed', icon: FiTrendingUp, color: 'text-rose-400' },
  { id: 'oldest', label: 'Oldest Created', icon: FiClock, color: 'text-sky-400' },
];

function SortDropdown({ sortOption, onSelect }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const activeSort = sortOptions.find((o) => o.id === sortOption) || sortOptions[0];
  const ActiveIcon = activeSort.icon;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-10 px-3.5 rounded-xl border border-border/80 bg-background/90 hover:bg-muted/80 text-foreground text-xs md:text-sm font-extrabold flex items-center gap-2 cursor-pointer transition-all duration-200 shadow-xs hover:border-primary/50"
      >
        <FiSliders size={13} className="text-primary" />
        <ActiveIcon size={14} className={activeSort.color} />
        <span>{activeSort.label}</span>
        <FiChevronDown
          size={14}
          className={`text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180 text-primary' : ''}`}
        />
      </button>

      {/* Floating Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-48 rounded-2xl border border-border/80 bg-card/95 backdrop-blur-xl shadow-xl z-50 p-1.5 flex flex-col gap-1"
          >
            {sortOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = opt.id === sortOption;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelect(opt.id);
                    setOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-xl text-xs md:text-sm font-extrabold flex items-center justify-between transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={opt.color} />
                    <span>{opt.label}</span>
                  </div>
                  {isSelected && <FiCheck size={14} className="text-primary" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomeBlogs() {
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('latest');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(false);

  const { tags: dbTags } = useTags();
  const { bookmarks, isBookmarked } = useBookmarks();

  const { blogs, totalPages, totalCount, loading, error } = useBlogs(
    page,
    selectedTag ? [selectedTag] : [],
    searchQuery,
    sortOption,
    { enabled: !showBookmarksOnly }
  );

  // Dynamic tags list from DB ONLY
  const categories = useMemo(() => {
    if (!dbTags || !Array.isArray(dbTags)) return ['All'];

    const extracted = dbTags.map((t) => (typeof t === 'object' ? t.name : t)).filter(Boolean);
    return ['All', ...new Set(extracted)];
  }, [dbTags]);

  // Fetch bookmarked notes directly from backend using stored IDs
  useEffect(() => {
    if (!showBookmarksOnly) return;
    if (!bookmarks || bookmarks.length === 0) {
      setBookmarkedBlogs([]);
      return;
    }

    let isMounted = true;
    const fetchBookmarkedLessons = async () => {
      try {
        setLoadingBookmarks(true);
        const promises = bookmarks.map((id) =>
          api.get(`/lessons/get/${id}`).catch(() => null)
        );
        const responses = await Promise.all(promises);
        if (!isMounted) return;

        const validBlogs = responses
          .filter((r) => r && r.data && (r.data.id || r.data.lesson || r.data.blog))
          .map((r) => r.data.lesson || r.data.blog || r.data);

        setBookmarkedBlogs(validBlogs);
      } catch (err) {
        console.error('Error fetching bookmarked notes:', err);
      } finally {
        if (isMounted) setLoadingBookmarks(false);
      }
    };

    fetchBookmarkedLessons();
    return () => {
      isMounted = false;
    };
  }, [showBookmarksOnly, JSON.stringify(bookmarks)]);

  const displayedBlogs = useMemo(() => {
    if (showBookmarksOnly) {
      return bookmarkedBlogs.filter((b) => isBookmarked(b.id));
    }
    return blogs;
  }, [blogs, bookmarkedBlogs, showBookmarksOnly, isBookmarked]);

  const isLoading = showBookmarksOnly ? loadingBookmarks : loading;

  return (
    <section id="notes-section" className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12 scroll-mt-20">
      {/* ─── Controls Header: Search, Topic Pills & Custom Sort Dropdown ─── */}
      <div className="flex flex-col gap-5 mb-8">
        {/* Search & Sort Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card/80 backdrop-blur-md p-2 md:p-3 rounded-2xl border border-border/80 shadow-xs">
          {/* Live Search Input */}
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search notes by title or content..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-10 text-xs md:text-sm rounded-xl bg-background border-border/80 focus:border-primary"
            />
          </div>

          {/* Custom Animated Sort Dropdown */}
          <SortDropdown
            sortOption={sortOption}
            onSelect={(val) => {
              setSortOption(val);
              setPage(1);
            }}
          />
        </div>

        {/* Dynamic Database Topic Pills */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-muted/30 border border-border/60 flex-wrap">
          {categories.map((cat) => {
            const isActive = (cat === 'All' && !selectedTag) || selectedTag === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedTag(cat === 'All' ? '' : cat);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-card text-foreground shadow-xs border border-border/80 font-black'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {isActive && <FiCheck size={13} className="text-primary" />}
                <span>{cat}</span>
              </button>
            );
          })}

          {/* Bookmarks Filter Pill */}
          <button
            onClick={() => {
              setShowBookmarksOnly((prev) => !prev);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ml-1 border ${
              showBookmarksOnly
                ? 'bg-primary/15 text-primary border-primary/40 shadow-[0_0_10px_var(--neon-glow)] font-black'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-transparent'
            }`}
          >
            <FiBookmark
              size={13}
              className={showBookmarksOnly ? 'text-primary' : ''}
              fill={showBookmarksOnly ? 'currentColor' : 'none'}
            />
            <span>Bookmarks{bookmarks.length > 0 ? ` (${bookmarks.length})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 rounded-[22px] border border-border bg-card flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && !showBookmarksOnly && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm text-center">
          Failed to load notes. Please check your connection.
        </div>
      )}

      {/* Notes Stack */}
      {!isLoading && (
        <div className="flex flex-col gap-3.5">
          {displayedBlogs.length === 0 ? (
            <div className="p-12 text-center rounded-[24px] border border-border bg-card flex flex-col items-center gap-3">
              <FiBookOpen size={36} className="text-muted-foreground" />
              <h3 className="font-heading font-extrabold text-lg text-foreground">
                {showBookmarksOnly ? 'No bookmarked notes yet' : 'No notes available'}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                {showBookmarksOnly
                  ? 'Click the bookmark icon on any note card to save it here.'
                  : 'Try adjusting your search query or topic filter.'}
              </p>
            </div>
          ) : (
            displayedBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && !showBookmarksOnly && totalPages > 0 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          onPageChange={setPage}
          className="mt-10"
        />
      )}
    </section>
  );
}
