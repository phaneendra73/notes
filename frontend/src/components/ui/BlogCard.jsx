import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiClock, FiLayers, FiBookmark } from 'react-icons/fi';
import useBookmarks from '../../hooks/useBookmarks.js';

import { parseRawMarkdownToSlides } from '../../utils/markdown.js';

export default function BlogCard({ blog, onBookmarkChange }) {
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  // Calculate relative time
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return 'Recently';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays} days ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} mo ago`;
    return `${Math.floor(diffInDays / 365)} yr ago`;
  };

  // Get real slide/chapter count from DB field slidesCount or parse raw markdown
  const countSlides = (b) => {
    if (typeof b.slidesCount === 'number' && b.slidesCount > 0) return b.slidesCount;
    if (typeof b.chaptersCount === 'number' && b.chaptersCount > 0) return b.chaptersCount;
    if (Array.isArray(b.slides) && b.slides.length > 0) return b.slides.length;
    const raw = b.content || b.markdownContent || '';
    if (!raw) return 1;
    const parsed = parseRawMarkdownToSlides(raw);
    return Math.max(1, parsed.length);
  };

  const slidesCount = countSlides(blog);
  const viewsCount = blog.viewsCount || 0;
  const readingTime = blog.readingTime ? `${blog.readingTime} min` : '3 min';

  const handleCardClick = () => {
    navigate(`/read?id=${blog.id}`);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.008, y: -2 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      onClick={handleCardClick}
      className="cursor-pointer w-full group"
    >
      <div className="p-3.5 sm:p-5 rounded-[22px] border border-border/80 bg-muted/30 hover:bg-card hover:border-primary/50 transition-all duration-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        {/* Left: Thumbnail & Title Info */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full sm:w-auto sm:flex-1">
          <img
            src={blog.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=300'}
            alt={blog.title}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl object-cover border border-border/60 shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-sm"
            loading="lazy"
          />

          {/* Title & Tags */}
          <div className="flex flex-col gap-1 min-w-0 flex-1">
            <h3 className="font-heading font-extrabold text-sm sm:text-lg text-foreground leading-snug tracking-tight truncate group-hover:text-primary transition-colors">
              {blog.title}
            </h3>

            {blog.tags && Array.isArray(blog.tags) && blog.tags.length > 0 && (
              <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap mt-0.5">
                {blog.tags.slice(0, 3).map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[9px] sm:text-[10px] font-black uppercase tracking-wider"
                  >
                    {typeof tag === 'object' ? tag.name : tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bookmark Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBookmark(blog.id);
              if (onBookmarkChange) onBookmarkChange(blog.id);
            }}
            className={`p-2 rounded-xl border transition-all duration-200 cursor-pointer shrink-0 flex items-center justify-center ${
              isBookmarked(blog.id)
                ? 'bg-primary/15 border-primary/40 text-primary shadow-[0_0_10px_var(--neon-glow)]'
                : 'bg-transparent border-transparent text-muted-foreground hover:text-primary hover:border-border'
            }`}
            title={isBookmarked(blog.id) ? 'Remove bookmark' : 'Bookmark this note'}
          >
            <FiBookmark
              size={16}
              fill={isBookmarked(blog.id) ? 'currentColor' : 'none'}
            />
          </button>
        </div>

        {/* Right / Bottom Stats */}
        <div className="flex items-center sm:flex-col justify-between sm:justify-center w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-border/40 sm:border-0 text-right gap-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[11px] sm:text-sm font-black text-foreground bg-primary/15 px-2 sm:px-2.5 py-0.5 rounded-xl border border-primary/30">
              <FiLayers size={12} className="text-primary" />
              {slidesCount} {slidesCount === 1 ? 'Slide' : 'Slides'}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1" title="Views">
              <FiEye size={11} className="text-sky-400" />
              {viewsCount}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1" title="Reading Time">
              <FiClock size={11} className="text-amber-400" />
              {readingTime}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{getRelativeTime(blog.createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
