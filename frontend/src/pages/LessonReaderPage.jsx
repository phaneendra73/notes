import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import client from '../api/client.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import SEO from '../components/SEO.jsx';
import ReaderNavbar from '../components/reader/ReaderNavbar.jsx';
import SlideCanvas from '../components/reader/SlideCanvas.jsx';
import ReaderDock from '../components/reader/ReaderDock.jsx';
import KeyboardHelpModal from '../components/reader/KeyboardHelpModal.jsx';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const BATCH_SIZE = 5;

/**
 * LessonReaderPage — the slide-by-slide lesson reading experience.
 */
export default function LessonReaderPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const lessonId = searchParams.get('id') || '1';
  const initialSlideParam = parseInt(searchParams.get('slide'), 10);
  const targetInitialSlide = !isNaN(initialSlideParam) && initialSlideParam >= 0 ? initialSlideParam : 0;

  const [lesson, setLesson] = useState(null);
  const [slidesMap, setSlidesMap] = useState({}); // { [slideIndex]: slide }
  const [totalSlidesCount, setTotalSlidesCount] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(targetInitialSlide);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchingBatch, setFetchingBatch] = useState(false);
  const [error, setError] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerRef = useRef(null);

  // Restore visited slides from sessionStorage
  const [visitedSlides, setVisitedSlides] = useState(() => {
    if (!lessonId) return new Set([0]);
    try {
      const saved = sessionStorage.getItem(`kadha_visited_${lessonId}`);
      const set = saved ? new Set(JSON.parse(saved)) : new Set([0]);
      set.add(targetInitialSlide);
      return set;
    } catch {
      return new Set([targetInitialSlide]);
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

  // Initial load — fetch lesson metadata + initial slides batch
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

        const fetchLimit = Math.max(BATCH_SIZE, Math.floor(targetInitialSlide / BATCH_SIZE) * BATCH_SIZE + BATCH_SIZE);
        const res = await client.get(`/api/lessons/${lessonId}`, {
          params: {
            offset: 0,
            limit: fetchLimit,
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
          setError(err.response?.data?.error || 'Failed to load visual note');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchLesson();
    return () => { cancelled = true; };
  }, [lessonId, mergeSlides]);

  // Lazy-fetch additional batches when navigating near unfetched slides
  const fetchBatchIfNeeded = useCallback(async (targetIndex) => {
    if (slidesMap[targetIndex] || fetchingBatch) return;

    const batchOffset = Math.floor(targetIndex / BATCH_SIZE) * BATCH_SIZE;
    setFetchingBatch(true);

    try {
      const res = await client.get(`/api/lessons/${lessonId}/slides`, {
        params: { offset: batchOffset, limit: BATCH_SIZE },
      });
      if (Array.isArray(res.data.slides)) {
        mergeSlides(res.data.slides, batchOffset);
      }
    } catch (err) {
      console.error(`Failed to fetch slides batch at offset ${batchOffset}:`, err);
    } finally {
      setFetchingBatch(false);
    }
  }, [lessonId, slidesMap, fetchingBatch, mergeSlides]);

  // Persist visited slides and last read note state for the workbench
  useEffect(() => {
    if (!lessonId) return;
    try {
      sessionStorage.setItem(`kadha_visited_${lessonId}`, JSON.stringify([...visitedSlides]));
    } catch {
      // ignore quota errors
    }
  }, [visitedSlides, lessonId]);

  useEffect(() => {
    if (lesson) {
      try {
        localStorage.setItem('kadha_last_read', JSON.stringify({
          id: lesson.id,
          title: lesson.title,
          coverUrl: lesson.coverUrl || lesson.imageUrl,
          slideIndex: currentSlideIndex,
          totalSlides: totalSlidesCount,
          timestamp: Date.now()
        }));
      } catch {}
    }
  }, [lesson, currentSlideIndex, totalSlidesCount]);

  // Pre-fetch next batch if user is within 2 slides of un-fetched range
  useEffect(() => {
    if (totalSlidesCount === 0) return;
    const nextUnfetchedIndex = currentSlideIndex + 1;
    if (nextUnfetchedIndex < totalSlidesCount && !slidesMap[nextUnfetchedIndex]) {
      fetchBatchIfNeeded(nextUnfetchedIndex);
    }
  }, [currentSlideIndex, totalSlidesCount, slidesMap, fetchBatchIfNeeded]);

  // Build ordered slides array for navigation
  const slides = useMemo(() => {
    const list = [];
    for (let i = 0; i < totalSlidesCount; i++) {
      list.push(slidesMap[i] || {
        id: `skeleton-${i}`,
        title: `Slide ${i + 1}`,
        blocks: [{ type: 'paragraph', content: 'Loading slide details...' }],
      });
    }
    return list.length > 0 ? list : [{ title: 'Slide 1', blocks: [] }];
  }, [totalSlidesCount, slidesMap]);

  const markVisited = (idx) => {
    setVisitedSlides((prev) => {
      const next = new Set(prev);
      next.add(idx);
      return next;
    });
  };

  const goToSlide = useCallback((index) => {
    if (index < 0 || index >= totalSlidesCount) return;
    setDirection(index > currentSlideIndex ? 1 : -1);
    setCurrentSlideIndex(index);
    markVisited(index);
    fetchBatchIfNeeded(index);
  }, [currentSlideIndex, totalSlidesCount, fetchBatchIfNeeded]);

  const goNext = useCallback(() => {
    if (currentSlideIndex < totalSlidesCount - 1) {
      goToSlide(currentSlideIndex + 1);
    }
  }, [currentSlideIndex, totalSlidesCount, goToSlide]);

  const goPrev = useCallback(() => {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }, [currentSlideIndex, goToSlide]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      readerRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev(); }
      else if (e.key === '?' || (e.shiftKey && e.key === '/')) { e.preventDefault(); setHelpOpen((o) => !o); }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFullscreen(); }
      else if (e.key === 'Escape') { setHelpOpen(false); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, toggleFullscreen]);

  const currentSlide = slides[currentSlideIndex] || slides[0];

  // Exact Slide Canvas Skeleton Loading UI
  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col justify-between select-none">
        {/* Reader Header Skeleton */}
        <div className="h-[var(--header-h)] border-b border-[var(--line)] bg-[var(--surface)] px-6 flex items-center justify-between">
          <Skeleton className="h-6 w-36 rounded-[var(--radius-sm)]" />
          <Skeleton className="h-6 w-48 rounded-[var(--radius-sm)] hidden sm:block" />
          <Skeleton className="h-8 w-20 rounded-[var(--radius-md)]" />
        </div>

        {/* Slide Canvas Skeleton Card */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
          <div className="w-full rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 sm:p-10 shadow-[var(--shadow-md)] space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
              <Skeleton className="h-5 w-28 rounded-[var(--radius-sm)]" />
              <Skeleton className="h-4 w-36 rounded-[var(--radius-sm)] hidden sm:block" />
            </div>

            <Skeleton className="h-9 w-3/4 rounded-[var(--radius-sm)] mb-6" />

            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-full rounded-[var(--radius-sm)]" />
              <Skeleton className="h-4 w-11/12 rounded-[var(--radius-sm)]" />
              <Skeleton className="h-4 w-4/5 rounded-[var(--radius-sm)]" />
            </div>

            <Skeleton className="h-40 w-full rounded-[var(--radius-md)] mt-6" />
          </div>
        </main>

        {/* Bottom Dock Skeleton */}
        <div className="pb-6 flex justify-center">
          <Skeleton className="h-12 w-72 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle size={48} className="text-[var(--err)]" />
        <h2 className="font-serif font-bold text-2xl mt-4 text-[var(--ink)]">{error}</h2>
        <Link
          to="/"
          className="mt-6 inline-flex items-center gap-2 bg-[var(--accent)] text-[var(--accent-on)] font-bold px-6 py-2.5 rounded-[var(--radius-md)] hover:bg-[var(--accent-strong)] transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div ref={readerRef} className="reader-page relative bg-[var(--bg)] min-h-screen flex flex-col justify-between selection:bg-[var(--accent)] selection:text-[var(--accent-on)]">
      <SEO
        title={lesson ? `${lesson.title} — Notes` : 'Notes — Visual Lesson Reader'}
        description={lesson?.excerpt || 'Interactive visual engineering study note deck'}
      />

      <ReaderNavbar
        lesson={lesson}
        currentSlideIndex={currentSlideIndex}
        totalSlides={totalSlidesCount}
        slides={slides}
        onSelectSlide={goToSlide}
        onToggleFullscreen={toggleFullscreen}
        onOpenHelp={() => setHelpOpen(true)}
        visitedSlides={visitedSlides}
      />

      <main className="reader-main flex-1 flex items-center justify-center py-8">
        <SlideCanvas
          slide={currentSlide}
          slideIndex={currentSlideIndex}
          totalSlides={totalSlidesCount}
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
        onOpenHelp={() => setHelpOpen(true)}
        lessonId={lessonId}
        isAuthenticated={Boolean(localStorage.getItem('jwt'))}
      />

      <KeyboardHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
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
