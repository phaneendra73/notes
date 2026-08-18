import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client.js';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import SEO from '../components/SEO.jsx';
import ReaderNavbar from '../components/reader/ReaderNavbar.jsx';
import PageCanvas from '../components/reader/PageCanvas.jsx';
import ReaderDock from '../components/reader/ReaderDock.jsx';
import KeyboardHelpModal from '../components/reader/KeyboardHelpModal.jsx';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const BATCH_SIZE = 5;

/**
 * NoteReaderPage — the page-by-page note reading experience.
 */
export default function NoteReaderPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const noteId = searchParams.get('id') || '1';
  const pageParam = parseInt(searchParams.get('page'), 10);
  const targetInitialPage = !isNaN(pageParam) && pageParam > 1 ? pageParam - 1 : 0;

  const [note, setNote] = useState(null);
  const [pagesMap, setPagesMap] = useState({}); // { [pageIndex]: page }
  const [totalPagesCount, setTotalPagesCount] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(targetInitialPage);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchingBatch, setFetchingBatch] = useState(false);
  const [error, setError] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const readerRef = useRef(null);

  // Restore visited pages from sessionStorage
  const [visitedPages, setVisitedPages] = useState(() => {
    if (!noteId) return new Set([0]);
    try {
      const saved = sessionStorage.getItem(`notes_visited_${noteId}`);
      const set = saved ? new Set(JSON.parse(saved)) : new Set([0]);
      set.add(targetInitialPage);
      return set;
    } catch {
      return new Set([targetInitialPage]);
    }
  });

  // Merge fetched pages batch into the map
  const mergePages = useCallback((pagesArray, startOffset) => {
    if (!Array.isArray(pagesArray)) return;
    setPagesMap((prev) => {
      const next = { ...prev };
      pagesArray.forEach((page, i) => {
        next[startOffset + i] = {
          ...page,
          blocks: Array.isArray(page.blocks) && page.blocks.length > 0
            ? page.blocks
            : [{ type: 'paragraph', content: 'No content.' }],
        };
      });
      return next;
    });
  }, []);

  // Initial load — fetch note metadata + initial pages batch
  useEffect(() => {
    if (!noteId) {
      setError('No note ID specified in URL');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchNote = async () => {
      try {
        setLoading(true);
        setError(null);
        // Only increment view count ONCE per session view
        const sessionKey = `view_counted_${noteId}`;
        const shouldIncrement = !sessionStorage.getItem(sessionKey);
        if (shouldIncrement) {
          sessionStorage.setItem(sessionKey, '1');
        }

        const fetchLimit = Math.max(BATCH_SIZE, Math.floor(targetInitialPage / BATCH_SIZE) * BATCH_SIZE + BATCH_SIZE);
        
        const res = await client.get(`/api/notes/${noteId}`, {
          params: {
            offset: 0,
            limit: fetchLimit,
            ...(shouldIncrement ? { incrementView: 1 } : {}),
          },
        });

        const noteData = res.data.note || res.data;

        if (!cancelled) {
          setNote(noteData);
          const totalCount = noteData.totalPagesCount || noteData.pagesCount || 1;
          setTotalPagesCount(totalCount);
          const pagesList = noteData.pages;
          if (Array.isArray(pagesList)) {
            mergePages(pagesList, 0);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('NoteReaderPage fetch error:', err);
          setError(err.response?.data?.error || 'Failed to load visual note');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNote();
    return () => { cancelled = true; };
  }, [noteId, mergePages]);

  // Lazy-fetch additional batches when navigating near unfetched pages
  const fetchBatchIfNeeded = useCallback(async (targetIndex) => {
    if (pagesMap[targetIndex] || fetchingBatch) return;

    const batchOffset = Math.floor(targetIndex / BATCH_SIZE) * BATCH_SIZE;
    setFetchingBatch(true);

    try {
      const res = await client.get(`/api/notes/${noteId}/pages`, {
        params: { offset: batchOffset, limit: BATCH_SIZE },
      });
      const fetchedList = res.data.pages;
      if (Array.isArray(fetchedList)) {
        mergePages(fetchedList, batchOffset);
      }
    } catch (err) {
      console.error(`Failed to fetch pages batch at offset ${batchOffset}:`, err);
    } finally {
      setFetchingBatch(false);
    }
  }, [noteId, pagesMap, fetchingBatch, mergePages]);

  // Handle page navigation
  const goToPage = useCallback((newIndex) => {
    if (newIndex < 0 || (totalPagesCount > 0 && newIndex >= totalPagesCount)) return;
    setDirection(newIndex >= currentPageIndex ? 1 : -1);
    setCurrentPageIndex(newIndex);
    fetchBatchIfNeeded(newIndex);

    // Track visited pages
    setVisitedPages((prev) => {
      const next = new Set(prev).add(newIndex);
      try {
        sessionStorage.setItem(`notes_visited_${noteId}`, JSON.stringify([...next]));
      } catch {
        // ignore quota error
      }
      return next;
    });

    // Update hash router search params with 1-indexed page number (Page 1 -> omit, Page 2 -> page=2, Page 3 -> page=3)
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (newIndex > 0) {
          next.set('page', String(newIndex + 1));
        } else {
          next.delete('page');
        }
        return next;
      },
      { replace: true }
    );
  }, [currentPageIndex, totalPagesCount, noteId, fetchBatchIfNeeded, setSearchParams]);

  const goNext = useCallback(() => goToPage(currentPageIndex + 1), [goToPage, currentPageIndex]);
  const goPrev = useCallback(() => goToPage(currentPageIndex - 1), [goToPage, currentPageIndex]);

  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore keystrokes inside input / textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'j' || e.key === 'PageDown') {
        e.preventDefault();
        goNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'PageUp') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToPage(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToPage(totalPagesCount - 1);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFullscreen();
      } else if (e.key === '?') {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goNext, goPrev, goToPage, handleToggleFullscreen, totalPagesCount]);

  // Active page data (loaded or fallback skeleton)
  const activePage = useMemo(() => {
    return pagesMap[currentPageIndex] || {
      orderNumber: currentPageIndex + 1,
      title: `Page ${currentPageIndex + 1}`,
      blocks: [],
      isLoadingPlaceholder: true,
    };
  }, [pagesMap, currentPageIndex]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col font-sans">
        {/* Skeleton Navbar */}
        <div className="h-14 border-b border-[var(--line)] bg-[var(--surface)] px-4 flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded-[var(--radius-sm)]" />
          <Skeleton className="h-4 w-24 rounded-[var(--radius-sm)]" />
          <Skeleton className="h-8 w-20 rounded-[var(--radius-md)]" />
        </div>
        {/* Skeleton Canvas */}
        <div className="flex-1 flex items-center justify-center p-6 max-w-4xl mx-auto w-full">
          <div className="w-full space-y-6">
            <Skeleton className="h-8 w-2/3 rounded-[var(--radius-md)]" />
            <Skeleton className="h-24 w-full rounded-[var(--radius-md)]" />
            <Skeleton className="h-32 w-full rounded-[var(--radius-md)]" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 text-[var(--ink)] font-sans">
        <SEO title="Note Not Found — Notes" />
        <div className="p-8 rounded-[var(--radius-lg)] border border-[var(--err-soft)] bg-[var(--surface)] max-w-md w-full text-center space-y-4 shadow-[var(--shadow-md)]">
          <AlertCircle size={40} className="mx-auto text-[var(--err)]" />
          <h2 className="font-serif font-bold text-xl text-[var(--ink)]">Note Not Found</h2>
          <p className="text-xs text-[var(--muted)]">{error || 'Could not load this visual note.'}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-on)] text-xs font-bold hover:bg-[var(--accent-strong)] transition-colors"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={readerRef}
      className="reader-page min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--accent)] selection:text-[var(--accent-on)] font-sans"
    >
      <SEO
        title={`${activePage.title || `Page ${currentPageIndex + 1}`} — ${note.title} — Notes`}
        description={note.excerpt || `Study note on ${note.title}`}
        image={note.coverUrl}
      />

      {/* Reader Fixed Top Navbar */}
      <ReaderNavbar
        note={note}
        currentPageIndex={currentPageIndex}
        totalPages={totalPagesCount}
        pages={Array.from({ length: totalPagesCount }).map((_, idx) => pagesMap[idx] || { id: idx, orderNumber: idx + 1, title: `Page ${idx + 1}` })}
        visitedPages={visitedPages}
        onSelectPage={goToPage}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenHelp={() => setHelpOpen(true)}
      />

      {/* Main Page Canvas Workspace */}
      <main className="reader-main flex-1 flex flex-col items-center justify-center px-3 sm:px-6 py-6 pb-28 max-w-4xl mx-auto w-full overflow-x-hidden">
        <PageCanvas
          page={activePage}
          pageIndex={currentPageIndex}
          totalPages={totalPagesCount}
          direction={direction}
          note={note}
          onNext={goNext}
          onPrev={goPrev}
        />
      </main>

      {/* Reader Bottom Floating Dock */}
      <ReaderDock
        currentPageIndex={currentPageIndex}
        totalPages={totalPagesCount}
        onNext={goNext}
        onPrev={goPrev}
        onOpenHelp={() => setHelpOpen(true)}
        noteId={noteId}
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
