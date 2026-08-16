import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Badge } from './Badge.jsx';
import { Clock, ChevronRight, Eye, Sliders } from 'lucide-react';

export default function LessonCard({ lesson, blog, viewMode = 'list' }) {
  const navigate = useNavigate();
  const item = lesson || blog;
  if (!item) return null;

  const fallbackImage =
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800';

  const tags = item.tagObjects || item.tags || [];
  const cover = item.coverUrl || item.imageUrl || fallbackImage;
  const slidesCount = item.totalSlidesCount || item.slidesCount || 1;

  const handleCardClick = (e) => {
    // If the click was on an anchor tag or button, let default action happen
    if (e.target.closest('a') || e.target.closest('button')) {
      return;
    }
    navigate(`/read?id=${item.id}`);
  };

  // 🟢 Row / List View (One-by-one stacked card structure)
  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        onClick={handleCardClick}
        className="w-full select-none cursor-pointer"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-md)] transition-all duration-[var(--dur)] group">
          {/* Left Cover Image & Note Overview */}
          <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
            {/* Note Thumbnail */}
            <div className="relative w-24 h-20 sm:w-32 sm:h-24 shrink-0 rounded-[var(--radius-md)] overflow-hidden bg-[var(--surface-2)] border border-[var(--line)] group-hover:border-[var(--accent)] transition-colors">
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
              <div className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-[10px] font-mono text-[var(--accent)] px-1.5 py-0.5 rounded-[var(--radius-sm)] flex items-center gap-1 font-bold">
                <Sliders size={10} /> {slidesCount}
              </div>
            </div>

            {/* Information */}
            <div className="min-w-0 flex-1 space-y-1.5">
              {/* Tags & Slide Count */}
              <div className="flex items-center gap-2 flex-wrap">
                {tags.slice(0, 2).map((t, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--accent-soft)] text-[var(--accent)] bg-[var(--accent-soft)] font-sans"
                  >
                    {typeof t === 'string' ? t : t.name}
                  </Badge>
                ))}
                <span className="text-xs font-mono text-[var(--muted)] flex items-center gap-1 font-medium">
                  <Sliders size={11} className="text-[var(--accent)]" /> {slidesCount} {slidesCount === 1 ? 'slide' : 'slides'}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] leading-snug group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                {item.title}
              </h3>

              {/* Excerpt / Summary */}
              <p className="text-xs sm:text-sm text-[var(--ink-2)] line-clamp-2 leading-relaxed font-normal">
                {item.excerpt || 'Interactive visual note explaining key concepts with code and diagrams.'}
              </p>
            </div>
          </div>

          {/* Right Meta & Read Action */}
          <div className="flex items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-3 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-[var(--line)] text-xs text-[var(--muted)]">
            <div className="flex items-center gap-3 font-mono text-xs">
              <span className="flex items-center gap-1 text-[var(--accent)] font-semibold">
                <Clock size={12} /> {item.readingTime ? `${item.readingTime}m read` : '3m read'}
              </span>
              {item.viewsCount !== undefined && (
                <span className="flex items-center gap-1 text-[var(--muted)]">
                  <Eye size={12} /> {item.viewsCount}
                </span>
              )}
            </div>

            <button
              onClick={() => navigate(`/read?id=${item.id}`)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] transition-colors font-bold text-xs cursor-pointer shadow-[var(--shadow-sm)] font-sans"
            >
              <span>Read Note</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 🟢 Grid View Mode
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      onClick={handleCardClick}
      className="h-full select-none cursor-pointer"
    >
      <div className="h-full flex flex-col overflow-hidden border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] transition-all duration-[var(--dur)] ease-[var(--ease)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] group rounded-[var(--radius-lg)]">
        {/* Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-[var(--surface-2)]">
          <img
            src={cover}
            alt={item.title || 'Note'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
          />

          {/* Slide Count Badge */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-on)] bg-[var(--accent)] px-2.5 py-0.5 rounded-[var(--radius-sm)] font-mono shadow-[var(--shadow-sm)]">
              <Sliders size={11} /> {slidesCount} {slidesCount === 1 ? 'slide' : 'slides'}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-5 flex flex-col flex-1 gap-2.5">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((t, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--accent-soft)] text-[var(--accent)] bg-[var(--accent-soft)] font-sans"
                >
                  {typeof t === 'string' ? t : t.name}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="font-serif font-bold text-lg text-[var(--ink)] line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors">
            {item.title}
          </h3>

          <p className="font-sans text-xs text-[var(--ink-2)] line-clamp-2 leading-relaxed font-normal">
            {item.excerpt || 'Interactive visual note explaining key concepts with code and diagrams.'}
          </p>

          <div className="mt-auto pt-3.5 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)] font-sans font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-[var(--accent)]">
                <Clock size={13} /> {item.readingTime ? `${item.readingTime}m` : '3m'}
              </span>
              {item.viewsCount !== undefined && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--muted)]">
                  <Eye size={12} /> {item.viewsCount}
                </span>
              )}
            </div>

            <button
              onClick={() => navigate(`/read?id=${item.id}`)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] transition-colors font-bold text-xs cursor-pointer shadow-[var(--shadow-sm)]"
            >
              <span>Read</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
