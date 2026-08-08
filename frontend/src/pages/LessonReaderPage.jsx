import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import client from '../api/client.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import SEO from '../components/SEO.jsx';
import ReaderNavbar from '../components/reader/ReaderNavbar.jsx';
import SlideCanvas from '../components/reader/SlideCanvas.jsx';
import ReaderDock from '../components/reader/ReaderDock.jsx';
import { FiAlertCircle } from 'react-icons/fi';

const BATCH_SIZE = 5;

/**
 * LessonReaderPage — the slide-by-slide lesson reading experience.
 *
 * Features:
 * - Lazy batched slide fetching (loads 5 slides at a time as user navigates)
 * - Keyboard navigation (ArrowRight/Space = next, ArrowLeft = prev)
 * - Touch swipe navigation (handled in SlideCanvas)
 * - Visited slide tracking (persisted to sessionStorage)
 * - Slide outline in ReaderNavbar
 * - Print/PDF via window.print()
 */
export default function LessonReaderPage() {
  const location = useLocation();
  const lessonId = new URLSearchParams(location.search).get('id') || '1';

  const [lesson, setLesson] = useState(null);
  const [slidesMap, setSlidesMap] = useState({}); // { [slideIndex]: slide }
  const [totalSlidesCount, setTotalSlidesCount] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchingBatch, setFetchingBatch] = useState(false);
  const [error, setError] = useState(null);

  // Restore visited slides from sessionStorage
  const [visitedSlides, setVisitedSlides] = useState(() => {
    if (!lessonId) return new Set([0]);
    try {
      const saved = sessionStorage.getItem(`kadha_visited_${lessonId}`);
      return saved ? new Set(JSON.parse(saved)) : new Set([0]);
    } catch {
      return new Set([0]);
    }
  });

  // Merge fetched slides batch into the map
  const mergeSlides = useCallback((slidesArray, startOffset) => {
    if (!Array.isArray(slidesArray)) return;
    setSlidesMap((prev) => {
      const next = { ...prev };
      slidesArray.forEach((slide, i) => {
        next[startOffset + i] = {
          ...slide,
          blocks: Array.isArray(slide.blocks) && slide.blocks.length > 0
            ? slide.blocks
            : [{ type: 'paragraph', content: 'No content.' }],
        };
      });
      return next;
    });
  }, []);

  // Initial load — fetch lesson metadata + first BATCH_SIZE slides
  useEffect(() => {
    if (!lessonId) {
      setError('No lesson ID specified in URL');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        setError(null);
        // Only increment view count ONCE per session view
        const sessionKey = `view_counted_${lessonId}`;
        const shouldIncrement = !sessionStorage.getItem(sessionKey);
        if (shouldIncrement) {
          sessionStorage.setItem(sessionKey, '1');
        }

        const res = await client.get(`/api/lessons/${lessonId}`, {
          params: {
            offset: 0,
            limit: BATCH_SIZE,
            ...(shouldIncrement ? { incrementView: 1 } : {}),
          },
        });
        const { lesson: lessonData } = res.data;

        if (!cancelled) {
          setLesson(lessonData);
          setTotalSlidesCount(lessonData.totalSlidesCount || lessonData.slidesCount || 1);
          if (Array.isArray(lessonData.slides)) {
            mergeSlides(lessonData.slides, 0);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('LessonReaderPage fetch error:', err);
          setError('Failed to load this lesson. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLesson();
    return () => { cancelled = true; };
  }, [lessonId, mergeSlides]);

  // Lazy-fetch next batch when approaching unloaded slides
  const fetchBatch = useCallback(async (offset) => {
    if (fetchingBatch || !lessonId) return;
    setFetchingBatch(true);
    try {
      const res = await client.get(`/api/lessons/${lessonId}`, {
        params: { offset, limit: BATCH_SIZE },
      });
      const slides = res.data?.lesson?.slides;
      if (slides) mergeSlides(slides, offset);
    } catch (err) {
      console.error(`Batch fetch error at offset ${offset}:`, err);
    } finally {
      setFetchingBatch(false);
    }
  }, [lessonId, fetchingBatch, mergeSlides]);

  useEffect(() => {
    if (loading || totalSlidesCount === 0) return;
    if (!slidesMap[currentSlideIndex]) {
      const batchStart = Math.floor(currentSlideIndex / BATCH_SIZE) * BATCH_SIZE;
      fetchBatch(batchStart);
    }
  }, [currentSlideIndex, slidesMap, totalSlidesCount, loading, fetchBatch]);

  // Build contiguous slides array with loading placeholders for unloaded slides
  const slides = useMemo(() => {
    const count = totalSlidesCount || Object.keys(slidesMap).length || 1;
    return Array.from({ length: count }, (_, i) =>
      slidesMap[i] || {
        title: `Slide ${i + 1}`,
        blocks: [{ type: 'paragraph', content: 'Loading…' }],
        isPlaceholder: true,
      }
    );
  }, [slidesMap, totalSlidesCount]);

  // Track visited slides
  useEffect(() => {
    setVisitedSlides((prev) => {
      if (prev.has(currentSlideIndex)) return prev;
      const next = new Set(prev);
      next.add(currentSlideIndex);
      if (lessonId) {
        try {
          sessionStorage.setItem(`kadha_visited_${lessonId}`, JSON.stringify([...next]));
        } catch {}
      }
      return next;
    });
  }, [currentSlideIndex, lessonId]);

  // Navigation handlers
  const goNext = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setDirection(1);
      setCurrentSlideIndex((i) => i + 1);
    }
  }, [currentSlideIndex, slides.length]);

  const goPrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      setDirection(-1);
      setCurrentSlideIndex((i) => i - 1);
    }
  }, [currentSlideIndex]);

  const goToSlide = useCallback((index) => {
    if (index >= 0 && index < slides.length) {
      setDirection(index > currentSlideIndex ? 1 : -1);
      setCurrentSlideIndex(index);
    }
  }, [currentSlideIndex, slides.length]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev]);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  if (loading) {
    return (
      <div className="reader-loading">
        <Skeleton className="h-14 w-full rounded-none" />
        <div className="reader-loading-content">
          <Skeleton className="h-10 w-3/4 rounded-xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
          <Skeleton className="h-5 w-1/2 rounded-lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="reader-error">
        <FiAlertCircle size={40} className="text-rose-400" />
        <h2>{error}</h2>
        <Link to="/" className="reader-error-back">Back to Catalog</Link>
      </div>
    );
  }

  return (
    <div className="reader-page">
      <SEO
        title={lesson ? `${lesson.title} — Notes` : 'Notes — Lesson Reader'}
        description={lesson?.excerpt || 'Interactive visual notes lesson'}
      />

      <ReaderNavbar
        lesson={lesson}
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlidesCount}
        slides={slides}
        onSelectSlide={goToSlide}
        visitedSlides={visitedSlides}
      />

      <main className="reader-main">
        <SlideCanvas
          slide={currentSlide}
          slideIndex={currentSlideIndex}
          direction={direction}
          onNext={goNext}
          onPrev={goPrev}
        />
      </main>

      <ReaderDock
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlidesCount}
        onNext={goNext}
        onPrev={goPrev}
        onGoToSlide={goToSlide}
        lessonId={lessonId}
        isAuthenticated={Boolean(localStorage.getItem('jwt'))}
      />

      {/* Print styles for PDF export */}
      <style>{`
        @media print {
          .reader-navbar, .reader-dock { display: none !important; }
          .reader-main { padding: 0; }
        }
      `}</style>
    </div>
  );
}
