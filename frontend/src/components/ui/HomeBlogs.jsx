import React, { useState, useMemo, useRef, useEffect } from 'react';
import BlogCard from './BlogCard.jsx';
import useBlogs from '../../hooks/useBlogs.js';
import useTags from '../../hooks/useTags.js';
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
} from 'react-icons/fi';

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

  const { tags: dbTags } = useTags();

  const { blogs, totalPages, totalCount, loading, error } = useBlogs(
    page,
    selectedTag ? [selectedTag] : [],
    searchQuery,
    sortOption
  );

  // Dynamic tags list from DB ONLY
  const categories = useMemo(() => {
    if (!dbTags || !Array.isArray(dbTags)) return ['All'];

    const extracted = dbTags.map((t) => (typeof t === 'object' ? t.name : t)).filter(Boolean);
    return ['All', ...new Set(extracted)];
  }, [dbTags]);

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
        </div>
      </div>

      {/* Loading Skeletons */}
      {loading && (
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
      {!loading && error && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold text-sm text-center">
          Failed to load notes. Please check your connection.
        </div>
      )}

      {/* Notes Stack */}
      {!loading && !error && (
        <div className="flex flex-col gap-3.5">
          {blogs.length === 0 ? (
            <div className="p-12 text-center rounded-[24px] border border-border bg-card flex flex-col items-center gap-3">
              <FiBookOpen size={36} className="text-muted-foreground" />
              <h3 className="font-heading font-extrabold text-lg text-foreground">No notes available</h3>
              <p className="text-xs text-muted-foreground max-w-sm">
                Try adjusting your search query or topic filter.
              </p>
            </div>
          ) : (
            blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-10">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-extrabold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 transition-all cursor-pointer"
          >
            Previous
          </button>
          <span className="text-xs font-bold text-muted-foreground px-2">
            Page {page} of {totalPages} ({totalCount} notes)
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 rounded-xl border border-border bg-card text-xs font-extrabold text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary/50 transition-all cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
