import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from './Card.jsx';
import { Badge } from './Badge.jsx';
import { FiClock, FiBookmark, FiChevronRight, FiEye } from 'react-icons/fi';
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

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="h-full select-none"
    >
      <Card className="h-full flex flex-col overflow-hidden border border-border/80 bg-card hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md group">
        <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
          <img
            src={cover}
            alt={item.title || 'Lesson'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-90" />

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleBookmark(item.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md border transition-all cursor-pointer ${
              bookmarked
                ? 'bg-primary text-black border-primary shadow-sm'
                : 'bg-black/40 text-white border-white/20 hover:bg-black/60 hover:scale-105'
            }`}
            title={bookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
          >
            <FiBookmark size={15} className={bookmarked ? 'fill-current' : ''} />
          </button>

          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="text-[11px] font-extrabold text-foreground/90 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-border/80 shadow-xs">
              By {item.authorName || 'Phaneendra'}
            </span>
          </div>
        </div>

        <CardContent className="p-5 flex flex-col flex-1 gap-3">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((t, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md border-border/60 bg-muted/60"
                >
                  {typeof t === 'string' ? t : t.name}
                </Badge>
              ))}
            </div>
          )}

          <h3 className="font-heading font-extrabold text-lg md:text-xl text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            <Link to={`/read?id=${item.id}`} className="hover:underline">
              {item.title}
            </Link>
          </h3>

          <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {item.excerpt || 'Interactive step-by-step visual tech note and code explanation.'}
          </p>

          <div className="mt-auto pt-4 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-primary">
                <FiClock size={13} /> {item.readingTime ? `${item.readingTime} min read` : '3 min read'}
              </span>
              {item.viewsCount !== undefined && (
                <span className="flex items-center gap-1 text-[11px] opacity-80">
                  <FiEye size={12} /> {item.viewsCount}
                </span>
              )}
            </div>

            <Link
              to={`/read?id=${item.id}`}
              className="flex items-center gap-1 text-xs font-extrabold text-foreground group-hover:text-primary transition-colors"
            >
              <span>Read Note</span>
              <FiChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
