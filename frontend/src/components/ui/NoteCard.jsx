import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from './Badge.jsx';
import { Eye, Layers, ChevronRight, BookOpen, Sparkles } from 'lucide-react';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears > 1 ? 'over ' + diffInYears : 'over 1'}y ago`;
}

function formatViewsCount(count) {
  const num = Number(count) || 0;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return `${num}`;
}

export default function NoteCard({
  note,
  lesson,
  index = 0,
  onCardClick,
  onReadClick,
}) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const item = note || lesson;
  if (!item) return null;

  const tags = item.tagObjects || item.tags || [];
  const rawCover = (item.coverUrl || item.imageUrl || '').trim();
  const hasCover = Boolean(rawCover) && !imageError;
  const pagesCount = item.totalPagesCount || item.pagesCount || item.slidesCount || item.pages?.length || 1;
  const viewsCount = item.viewsCount ?? item.views ?? 0;
  const relativeDate = formatRelativeTime(item.createdAt);

  const handleCardClick = (e) => {
    // If clicked on direct read button, skip opening modal
    if (e.target.closest('[data-read-btn="true"]')) return;
    if (onCardClick) {
      onCardClick(item);
    } else {
      navigate(`/read?id=${item.id}`);
    }
  };

  const handleReadClick = (e) => {
    e.stopPropagation();
    if (onReadClick) {
      onReadClick(item, e);
    } else {
      navigate(`/read?id=${item.id}`);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      whileHover={{ y: -3, scale: 1.004 }}
      whileTap={{ scale: 0.996 }}
      transition={{
        type: 'spring',
        stiffness: 380,
        damping: 26,
      }}
      onClick={handleCardClick}
      className="w-full select-none cursor-pointer group min-w-0"
    >
      <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5 p-4 sm:p-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] group-hover:border-[var(--accent)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 overflow-hidden">
        {/* Glowing Interactive Left Accent Line Indicator */}
        <div className="absolute left-0 top-0 bottom-0 w-[3.5px] bg-[var(--accent)] scale-y-0 group-hover:scale-y-100 transition-transform duration-300 ease-out origin-center rounded-r-sm" />

        {/* Ambient Gradient Glow Sweep on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-soft)]/20 via-[var(--accent-soft)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />

        {/* Left Section: Thumbnail + Note Info */}
        <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1 relative z-10 pl-1 sm:pl-1.5">
          {/* Thumbnail Tile with Subtle Zoom Animation & Glass Frame */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[var(--radius-sm)] overflow-hidden shrink-0 border border-[var(--line)] bg-[var(--surface-2)] shadow-xs flex items-center justify-center group-hover:border-[var(--accent)]/60 group-hover:shadow-sm transition-all duration-300">
            {hasCover ? (
              <>
                <img
                  src={rawCover}
                  alt={item.title || 'Note'}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out select-none"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
                {/* Subtle glass reflection overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </>
            ) : (
              <div className="w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-br from-[var(--surface-2)] via-[var(--surface-2)] to-[var(--accent-soft)]/40 group-hover:to-[var(--accent-soft)]/80 transition-colors duration-300 select-none">
                <BookOpen size={14} className="text-[var(--accent)] group-hover:scale-110 transition-transform duration-300" />
                <span className="font-serif font-bold text-[10px] sm:text-[11px] text-[var(--ink)] leading-tight line-clamp-2 group-hover:text-[var(--accent)] transition-colors duration-200">
                  {item.title}
                </span>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            {/* Tag Pills */}
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.slice(0, 3).map((tag, idx) => (
                  <Badge
                    key={tag.id || idx}
                    variant="secondary"
                    className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--line)] text-[var(--accent)] bg-[var(--accent-soft)] font-sans group-hover:border-[var(--accent)]/40 transition-colors duration-200"
                  >
                    {typeof tag === 'string' ? tag : tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Note Title */}
            <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors duration-200 line-clamp-1">
              {item.title}
            </h3>

            {/* Excerpt */}
            {item.excerpt && (
              <p className="font-sans text-xs text-[var(--ink-2)] line-clamp-1 sm:line-clamp-2 leading-relaxed font-normal">
                {item.excerpt}
              </p>
            )}
          </div>
        </div>

        {/* Right Section: Metadata + Read Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--line)] shrink-0 relative z-10">
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-[var(--muted)]">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent)] bg-[var(--surface-2)] border border-[var(--line)] group-hover:border-[var(--accent)]/40 px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors duration-200">
              <Layers size={11} className="group-hover:rotate-12 transition-transform duration-300" />
              <span>{pagesCount} {pagesCount === 1 ? 'Page' : 'Pages'}</span>
            </span>

            <span className="hidden md:inline-flex items-center gap-1 text-[11px]" title={`${viewsCount} reads`}>
              <Eye size={12} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
              <span>{formatViewsCount(viewsCount)}</span>
            </span>

            {relativeDate && (
              <span className="hidden lg:inline-flex text-[11px] text-[var(--muted)]" title={`Posted ${relativeDate}`}>
                • {relativeDate}
              </span>
            )}
          </div>

          {/* Animated Read Button */}
          <button
            data-read-btn="true"
            onClick={handleReadClick}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)] group-hover:bg-[var(--accent)] group-hover:text-[var(--accent-on)] group-hover:border-[var(--accent-strong)] hover:shadow-sm active:scale-95 transition-all duration-200 font-semibold text-xs cursor-pointer shadow-xs shrink-0"
            title="Start Reading"
          >
            <span>Read</span>
            <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
