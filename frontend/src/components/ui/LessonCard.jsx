import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from './Card.jsx';
import { Badge } from './Badge.jsx';
import { Clock, Bookmark, ChevronRight, Eye, Sliders } from 'lucide-react';
import useBookmarks from '../../hooks/useBookmarks.js';

export default function LessonCard({ lesson, blog }) {
  const item = lesson || blog;
  if (!item) return null;

  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(item.id);

  const fallbackImage =
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800';

  const tags = item.tagObjects || item.tags || [];
  const cover = item.coverUrl || item.imageUrl || fallbackImage;
  const slidesCount = item.totalSlidesCount || item.slidesCount || 4;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="h-full select-none"
    >
      <Card className="h-full flex flex-col overflow-hidden border border-[var(--line)] bg-[var(--surface)] hover:border-[var(--line-strong)] transition-all duration-[var(--dur)] ease-[var(--ease)] shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)] group rounded-[var(--radius-md)]">
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

          {/* Bookmark Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(item.id);
            }}
            className={`absolute top-3 right-3 p-1.5 rounded-[var(--radius-sm)] border transition-colors cursor-pointer ${
              bookmarked
                ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] shadow-[var(--shadow-sm)]'
                : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
            title={bookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
          >
            <Bookmark size={14} className={bookmarked ? 'fill-current' : ''} />
          </button>

          {/* Slide Count Badge Overlay */}
          <div className="absolute bottom-2.5 left-2.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--accent-on)] bg-[var(--accent)] px-2 py-0.5 rounded-[var(--radius-sm)] font-mono">
              <Sliders size={11} /> {slidesCount} Slides
            </span>
          </div>
        </div>

        {/* Card Body */}
        <CardContent className="p-5 flex flex-col flex-1 gap-2.5">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((t, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--line)] text-[var(--accent)] bg-[var(--accent-soft)] font-sans"
                >
                  {typeof t === 'string' ? t : t.name}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="font-serif font-bold text-lg text-[var(--ink)] line-clamp-2 leading-snug group-hover:text-[var(--accent)] transition-colors">
            <Link to={`/read?id=${item.id}`} className="hover:underline">
              {item.title}
            </Link>
          </h3>

          <p className="font-sans text-xs text-[var(--ink-2)] line-clamp-2 leading-relaxed font-normal">
            {item.excerpt || 'Interactive step-by-step visual tech note and production code breakdown.'}
          </p>

          <div className="mt-auto pt-3.5 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)] font-sans font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-[var(--accent)]">
                <Clock size={13} /> {item.readingTime ? `${item.readingTime} min read` : '3 min read'}
              </span>
              {item.viewsCount !== undefined && (
                <span className="flex items-center gap-1 text-[11px] font-mono text-[var(--muted)]">
                  <Eye size={12} /> {item.viewsCount}
                </span>
              )}
            </div>

            <Link
              to={`/read?id=${item.id}`}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)] hover:bg-[var(--accent)] hover:text-[var(--accent-on)] transition-colors font-semibold text-xs cursor-pointer"
            >
              <span>Read</span>
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
