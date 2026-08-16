import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../../api/client.js';
import { X, ArrowRight, Layers, Loader2, Sparkles, Clock } from 'lucide-react';

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
  if (diffInDays < 30) return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears > 1 ? 'over ' + diffInYears : 'over 1'} year${diffInYears > 1 ? 's' : ''} ago`;
}

/**
 * Slide / Track Preview Modal
 * Matches the track overview layout:
 * - Cover banner
 * - Title & description summary box
 * - Chapter count & relative date
 * - Scrollable chapter listing linking directly to slides
 * - Action button to start reading
 */
export default function LessonReaderModal({ lesson, isOpen, onClose }) {
  const navigate = useNavigate();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSlidesCount, setTotalSlidesCount] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Fetch all slides for the lesson
  useEffect(() => {
    if (isOpen && lesson?.id) {
      fetchLessonDetails();
    }
  }, [isOpen, lesson?.id]);

  const fetchLessonDetails = async () => {
    try {
      setLoading(true);
      const res = await client.get(`/api/lessons/${lesson.id}`, {
        params: { offset: 0, limit: 0 }, // limit=0 fetches all slides
      });
      const lessonData = res.data.lesson || res.data;
      const fetchedSlides = lessonData.slides || [];
      setSlides(fetchedSlides);
      setTotalSlidesCount(lessonData.totalSlidesCount || fetchedSlides.length || 1);
    } catch (error) {
      console.error('Failed to fetch lesson chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lesson) return null;

  const fallbackImage =
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200';
  const cover = lesson.coverUrl || lesson.imageUrl || fallbackImage;
  const tags = lesson.tagObjects || lesson.tags || [];
  const chaptersCount = totalSlidesCount || (slides.length > 0 ? slides.length : (lesson.totalSlidesCount || lesson.slidesCount || 1));
  const relativeDate = formatRelativeTime(lesson.createdAt);

  const handleStart = () => {
    onClose?.();
    navigate(`/read?id=${lesson.id}&slide=0`);
  };

  const handleChapterClick = (slideIndex) => {
    onClose?.();
    navigate(`/read?id=${lesson.id}&slide=${slideIndex}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/65 backdrop-blur-md"
        />

        {/* Modal Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-[var(--shadow-xl)] overflow-hidden flex flex-col my-auto z-10 max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-md transition-all cursor-pointer shadow-md"
            title="Close"
          >
            <X size={18} />
          </button>

          {/* Modal Body Container */}
          <div className="flex flex-col gap-4 p-5 sm:p-6 overflow-y-auto w-full custom-scrollbar">
            {/* 1. Cover Image */}
            <div className="relative w-full h-[22vh] sm:h-[24vh] min-h-[160px] rounded-xl overflow-hidden bg-[var(--surface-2)] shrink-0 border border-[var(--line)]">
              <img
                src={cover}
                alt={lesson.title || 'Track Cover'}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = fallbackImage;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {tags.length > 0 && (
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 z-10">
                  {tags.slice(0, 3).map((tag, idx) => (
                    <span
                      key={tag.id || idx}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/60 text-white backdrop-blur-md border border-white/10"
                    >
                      {tag.name || tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Title & Description Box */}
            <div className="flex flex-col gap-2.5 bg-[var(--accent-soft)]/20 border border-[var(--line)] rounded-xl p-4 sm:p-5">
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--ink)] tracking-tight leading-tight">
                {lesson.title}
              </h3>
              <p className="text-sm sm:text-base text-[var(--ink-2)] line-clamp-3 leading-relaxed">
                {lesson.excerpt ||
                  lesson.description ||
                  'This track introduces core concepts and progressively dives into hands-on code examples, diagrams, and architectural patterns.'}
              </p>
            </div>

            {/* 3. Chapters Header & Date */}
            <div className="flex flex-col gap-3 w-full">
              <div className="flex items-center justify-between gap-2 px-0.5">
                <p className="flex items-center gap-2 text-[var(--ink)] text-base sm:text-lg font-bold">
                  <Layers size={18} className="text-[var(--accent)]" />
                  <span>{chaptersCount} {chaptersCount === 1 ? 'Chapter' : 'Chapters'}</span>
                </p>
                {relativeDate && (
                  <p className="flex items-center gap-1.5 text-xs sm:text-sm text-[var(--muted)] font-medium">
                    <Clock size={13} />
                    <span>{relativeDate}</span>
                  </p>
                )}
              </div>

              {/* 4. Scrollable Chapters / Slides List */}
              <div className="max-h-[24vh] overflow-y-auto flex flex-col gap-2.5 w-full py-1 pr-1 custom-scrollbar">
                {loading ? (
                  <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-[var(--muted)]">
                    <Loader2 size={20} className="animate-spin text-[var(--accent)]" />
                    <span>Loading chapters...</span>
                  </div>
                ) : slides.length > 0 ? (
                  slides.map((slide, index) => {
                    const slideTitle = slide.title || `Chapter ${index + 1}`;
                    return (
                      <div
                        key={slide.id || index}
                        onClick={() => handleChapterClick(index)}
                        className="cursor-pointer group flex items-center justify-between bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--line)] hover:border-[var(--accent)] rounded-xl px-4 py-3 transition-all duration-200 shadow-sm hover:shadow hover:-translate-y-0.5 w-full"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                          <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-md shrink-0">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="text-sm font-medium text-[var(--ink)] group-hover:text-[var(--accent)] truncate transition-colors">
                            {slideTitle}
                          </span>
                        </div>
                        <ArrowRight
                          size={16}
                          className="shrink-0 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    );
                  })
                ) : (
                  <div
                    onClick={() => handleChapterClick(0)}
                    className="cursor-pointer group flex items-center justify-between bg-[var(--surface-2)] hover:bg-[var(--surface-3)] border border-[var(--line)] hover:border-[var(--accent)] rounded-xl px-4 py-3 transition-all duration-200 w-full"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-md">
                        01
                      </span>
                      <span className="text-sm font-medium text-[var(--ink)] group-hover:text-[var(--accent)]">
                        Introduction
                      </span>
                    </div>
                    <ArrowRight size={16} className="text-[var(--muted)] group-hover:text-[var(--accent)]" />
                  </div>
                )}
              </div>
            </div>

            {/* 5. Start Learning Action Button */}
            <div className="pt-2">
              <button
                onClick={handleStart}
                className="w-full h-11 rounded-xl bg-[var(--accent)] text-[var(--accent-on)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--accent-strong)] transition-all duration-200 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] active:scale-[0.99] cursor-pointer"
              >
                <span>Start Reading</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
