import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Layers, Clock, Eye } from 'lucide-react';

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
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M reads`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k reads`;
  return `${num} ${num === 1 ? 'read' : 'reads'}`;
}

export default function LessonCard({
  lesson,
  blog,
  viewMode = 'list',
  onCardClick,
  onReadClick,
}) {
  const navigate = useNavigate();
  const item = lesson || blog;
  if (!item) return null;

  const fallbackImage =
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800';

  const tags = item.tagObjects || item.tags || [];
  const cover = item.coverUrl || item.imageUrl || fallbackImage;
  const slidesCount = item.totalSlidesCount || item.slidesCount || item.slides?.length || 1;
  const viewsCount = item.viewsCount ?? item.views ?? 0;
  const relativeDate = formatRelativeTime(item.createdAt);

  const handleCardClick = (e) => {
    // If clicked on direct read button, skip opening modal
    if (e.target.closest('[data-read-btn="true"]')) return;
    onCardClick?.(item);
  };

  const handleReadClick = (e) => {
    e.stopPropagation();
    if (onReadClick) {
      onReadClick(item, e);
    } else {
      navigate(`/read?id=${item.id}`);
    }
  };

  // 🟢 Row / List View (Stacked interactive track card)
  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={handleCardClick}
        className="w-full select-none cursor-pointer group"
      >
        <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-md)] transition-all duration-300 overflow-hidden">
          {/* Subtle Ambient Hover Glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-soft)]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

          {/* Left - Cover Image & Information */}
          <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1 relative z-10">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-[var(--line)] bg-[var(--surface-2)] shadow-sm">
              <img
                src={cover}
                alt={item.title || 'Note'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImage;
                }}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              {tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={tag.id || idx}
                      className="px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold bg-[var(--accent-soft)] text-[var(--accent)] tracking-wide"
                    >
                      {tag.name || tag}
                    </span>
                  ))}
                </div>
              )}

              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                {item.title}
              </h3>

              {item.excerpt && (
                <p className="text-xs sm:text-sm text-[var(--ink-2)] line-clamp-1 sm:line-clamp-2 leading-relaxed font-normal">
                  {item.excerpt}
                </p>
              )}
            </div>
          </div>

          {/* Right - Meta Badge & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--line)] shrink-0 relative z-10">
            <div className="flex flex-col sm:items-end gap-1">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] bg-[var(--surface-2)] border border-[var(--line)] px-2.5 py-1 rounded-lg">
                <Layers size={13} />
                <span>{slidesCount} {slidesCount === 1 ? 'Chapter' : 'Chapters'}</span>
              </span>

              <div className="flex items-center gap-2 text-[11px] text-[var(--muted)] font-medium">
                <span className="flex items-center gap-1" title={`${viewsCount} total reads`}>
                  <Eye size={12} className="text-[var(--accent)]" />
                  <span>{formatViewsCount(viewsCount)}</span>
                </span>
                {relativeDate && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{relativeDate}</span>
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                data-read-btn="true"
                onClick={handleReadClick}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-on)] font-bold text-xs sm:text-sm shadow-sm hover:bg-[var(--accent-strong)] hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                title="Start Reading"
              >
                <span>Read</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // 🟢 Grid View Mode
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      onClick={handleCardClick}
      className="h-full select-none cursor-pointer group"
    >
      <div className="h-full flex flex-col rounded-2xl border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-[var(--shadow-lg)] transition-all duration-300 overflow-hidden">
        {/* Banner Image */}
        <div className="relative h-44 sm:h-48 w-full bg-[var(--surface-2)] overflow-hidden shrink-0">
          <img
            src={cover}
            alt={item.title || 'Note'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

          {/* Overlay Chips */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
            {tags.length > 0 ? (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md border border-white/10 truncate">
                {tags[0].name || tags[0]}
              </span>
            ) : <span />}

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10 shrink-0">
              <Layers size={12} className="text-[var(--accent-soft)]" />
              <span>{slidesCount} {slidesCount === 1 ? 'Chapter' : 'Chapters'}</span>
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-2">
              {item.title}
            </h3>

            {item.excerpt && (
              <p className="text-xs sm:text-sm text-[var(--ink-2)] line-clamp-2 leading-relaxed font-normal">
                {item.excerpt}
              </p>
            )}
          </div>

          <div className="space-y-3 pt-2 border-t border-[var(--line)]">
            <div className="flex items-center justify-between text-[11px] text-[var(--muted)] font-medium">
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1" title={`${viewsCount} total reads`}>
                  <Eye size={12} className="text-[var(--accent)]" />
                  <span>{formatViewsCount(viewsCount)}</span>
                </span>
                {relativeDate && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {relativeDate}
                    </span>
                  </>
                )}
              </div>

              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onCardClick?.(item);
                }}
                className="font-semibold text-[var(--accent)] hover:underline cursor-pointer"
              >
                View Chapters
              </span>
            </div>

            <button
              data-read-btn="true"
              onClick={handleReadClick}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-on)] font-bold text-xs sm:text-sm shadow-sm hover:bg-[var(--accent-strong)] hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>Read</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
