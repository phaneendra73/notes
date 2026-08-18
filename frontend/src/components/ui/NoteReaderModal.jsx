import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../../api/client.js';
import {
  X,
  BookOpen,
  ArrowRight,
  Layers,
  Clock,
  Sparkles,
  Loader2,
} from 'lucide-react';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  const now = new Date();
  const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays} days ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} mo ago`;
  return `${Math.floor(diffInMonths / 12)} yr ago`;
}

/**
 * NoteReaderModal — clean preview modal for notes.
 * Layout:
 * - Cover banner
 * - Title & description summary box
 * - Page count & relative date
 * - Scrollable pages listing linking directly to pages
 * - Action button to start reading
 */
export default function NoteReaderModal({ note, isOpen, onClose }) {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPagesCount, setTotalPagesCount] = useState(0);
  const [imageError, setImageError] = useState(false);

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

  // Fetch all pages when opened with a new note
  useEffect(() => {
    if (isOpen && note?.id) {
      setPages([]);
      setTotalPagesCount(0);
      setImageError(false);
      setLoading(true);
      
      let cancelled = false;

      const fetchNoteDetails = async () => {
        try {
          const res = await client.get(`/api/notes/${note.id}`, {
            params: { offset: 0, limit: 0 },
          });
          if (cancelled) return;
          const noteData = res.data.note || res.data;
          const fetchedPages = noteData.pages || [];
          setPages(fetchedPages);
          setTotalPagesCount(noteData.totalPagesCount || noteData.pagesCount || fetchedPages.length || 1);
        } catch (error) {
          if (cancelled) return;
          console.error('Failed to fetch note pages:', error);
        } finally {
          if (!cancelled) setLoading(false);
        }
      };

      fetchNoteDetails();

      return () => {
        cancelled = true;
      };
    }
  }, [isOpen, note?.id]);

  if (!isOpen || !note) return null;

  const rawCover = (note.coverUrl || note.imageUrl || '').trim();
  const hasCover = Boolean(rawCover) && !imageError;
  const tags = note.tagObjects || note.tags || [];
  const pagesCount = totalPagesCount || (pages.length > 0 ? pages.length : (note.totalPagesCount || note.pagesCount || 1));
  const relativeDate = formatRelativeTime(note.createdAt);

  const handleStart = () => {
    onClose?.();
    navigate(`/read?id=${note.id}`);
  };

  const handleSelectPage = (pageIndex) => {
    onClose?.();
    const targetPage = pageIndex > 0 ? `&page=${pageIndex + 1}` : '';
    navigate(`/read?id=${note.id}${targetPage}`);
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
          className="fixed inset-0 bg-black/65 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 z-20 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10"
            title="Close (Esc)"
          >
            <X size={16} />
          </button>

          {/* 1. Cover Banner */}
          {hasCover ? (
            <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-[var(--surface-2)] shrink-0">
              <img
                src={rawCover}
                alt={note.title}
                onError={() => setImageError(true)}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--surface)] via-[var(--surface)]/40 to-transparent" />
            </div>
          ) : (
            <div className="h-16 bg-gradient-to-r from-[var(--accent)] via-emerald-500 to-[var(--accent-strong)] shrink-0" />
          )}

          {/* Modal Scrollable Body */}
          <div className="p-5 sm:p-7 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
            {/* 2. Top Metadata Row */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {tags.map((t, idx) => {
                  const tagName = typeof t === 'string' ? t : t.name;
                  return (
                    <span
                      key={t.id || idx}
                      className="px-2.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider bg-[var(--surface-2)] text-[var(--accent)] border border-[var(--line)]"
                    >
                      {tagName}
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-[var(--muted)]">
                <span className="flex items-center gap-1">
                  <Layers size={13} className="text-[var(--accent)]" />
                  {pagesCount} {pagesCount === 1 ? 'Page' : 'Pages'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="text-[var(--accent)]" />
                  {note.readingTime || 1} min read
                </span>
                {relativeDate && (
                  <span className="hidden sm:inline">
                    • {relativeDate}
                  </span>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <h2 className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] leading-snug">
                {note.title}
              </h2>
              {note.excerpt && (
                <p className="mt-2 text-xs sm:text-sm text-[var(--muted)] leading-relaxed font-normal">
                  {note.excerpt}
                </p>
              )}
            </div>


            {/* 4. Pages Listing */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs border-b border-[var(--line)] pb-2">
                <span className="font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                  <Sparkles size={13} /> Pages Outline ({pages.length > 0 ? pages.length : pagesCount})
                </span>
                <span className="text-[11px] font-mono text-[var(--muted)]">
                  Click any page to jump
                </span>
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar">
                {loading ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-xs text-[var(--muted)]">
                    <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
                    <span>Loading pages outline...</span>
                  </div>
                ) : pages.length > 0 ? (
                  pages.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      onClick={() => handleSelectPage(idx)}
                      className="group flex items-center justify-between p-2.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)]/60 hover:bg-[var(--accent-soft)] hover:border-[var(--accent)]/40 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--surface)] px-2 py-0.5 rounded-[var(--radius-sm)] border border-[var(--line)]">
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                        <span className="text-xs font-semibold text-[var(--ink)] group-hover:text-[var(--accent)] truncate">
                          {p.title || `Page ${idx + 1}`}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => handleSelectPage(0)}
                    className="group flex items-center justify-between p-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] hover:border-[var(--accent)] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-2 py-0.5 rounded-[var(--radius-sm)]">
                        01
                      </span>
                      <span className="text-sm font-medium text-[var(--ink)] group-hover:text-[var(--accent)]">
                        Page 1
                      </span>
                    </div>
                    <ArrowRight size={16} className="text-[var(--muted)] group-hover:text-[var(--accent)]" />
                  </div>
                )}
              </div>
            </div>

            {/* 5. Start Reading Action Button */}
            <div className="pt-2">
              <button
                onClick={handleStart}
                className="w-full h-11 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-on)] font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--accent-strong)] transition-all duration-200 shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] active:scale-[0.99] cursor-pointer"
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
