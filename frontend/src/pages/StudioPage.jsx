import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  Plus, Edit2, Eye, Trash2, X, AlertCircle, Search,
  BookOpen, Zap, Loader2, Globe, ShieldAlert, Sliders
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useLessons from '../hooks/useLessons.js';

export default function StudioPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { lessons, loading, error, pagination, refetch } = useLessons(null, searchQuery, page, 10);

  useEffect(() => {
    if (!localStorage.getItem('jwt')) navigate('/signin');
  }, [navigate]);

  const handleTogglePublish = async (lesson) => {
    try {
      await client.put(`/api/lessons/${lesson.id}`, { published: !lesson.published });
      refetch(page);
      toast.success(lesson.published ? 'Lesson unpublished' : 'Lesson published!');
    } catch {
      toast.error('Failed to update lesson status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await client.delete(`/api/lessons/${deleteTargetId}`);
      refetch(page);
      toast.success('Visual note deleted permanently');
      setDeleteTargetId(null);
    } catch {
      toast.error('Failed to delete visual note');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] font-sans">
      <SEO title="Author Studio — Notes" />
      <Navbar />

      <main className="flex-1 max-w-[var(--maxw)] w-full mx-auto px-4 md:px-6 py-8 md:py-10 space-y-6">

        {/* Studio Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4
          pb-6 border-b border-[var(--line)]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-widest
              text-[var(--accent)] flex items-center gap-1.5 mb-1">
              <Zap size={12} /> Author Studio
            </span>
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
              Manage Notes
            </h1>
            <p className="text-sm text-[var(--muted)] mt-1 font-normal">
              Create, edit, publish, and organize your visual study notes.
            </p>
          </div>
          <Button
            onClick={() => navigate('/editor')}
            className="shrink-0 rounded-[var(--radius-md)] font-bold text-xs gap-2
              px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-on)]
              border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]
              shadow-[var(--shadow-sm)] cursor-pointer"
          >
            <Plus size={15} /> Create New Note
          </Button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-md)]
          border border-[var(--line)] bg-[var(--surface)]">
          <Search size={15} className="text-[var(--accent)] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Filter notes by title or tag…"
            className="flex-1 bg-transparent text-sm text-[var(--ink)]
              placeholder:text-[var(--muted)] outline-none font-normal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-[var(--radius-sm)] text-[var(--muted)]
                hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-[72px] w-full rounded-[var(--radius-md)]" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)]
            border border-[var(--err-soft)] bg-[var(--err-soft)] text-[var(--err)] text-sm font-semibold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Notes list */}
        {!loading && !error && (
          <div className="flex flex-col gap-2">
            {lessons.length === 0 ? (
              <div className="p-12 text-center rounded-[var(--radius-lg)]
                border border-[var(--line)] bg-[var(--surface)] space-y-3">
                <BookOpen size={40} className="mx-auto text-[var(--muted)] opacity-50" />
                <h3 className="font-serif font-bold text-lg text-[var(--ink)]">No Notes Found</h3>
                <p className="text-xs text-[var(--muted)] font-normal">
                  {searchQuery
                    ? 'No notes match your search query.'
                    : "You haven't created any study notes yet."}
                </p>
                <button
                  onClick={() => navigate('/editor')}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-[var(--radius-md)]
                    bg-[var(--accent)] text-[var(--accent-on)] font-bold text-xs cursor-pointer
                    hover:bg-[var(--accent-strong)] transition-colors mt-1"
                >
                  <Plus size={14} /> Create First Note
                </button>
              </div>
            ) : (
              lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 sm:p-5 rounded-[var(--radius-md)] border border-[var(--line)]
                    bg-[var(--surface)] flex flex-col sm:flex-row sm:items-center
                    justify-between gap-4 transition-all hover:border-[var(--line-strong)]
                    hover:shadow-[var(--shadow-sm)]"
                >
                  {/* Left: meta */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--accent-soft)]
                      border border-[var(--accent-soft)] text-[var(--accent)] font-mono font-bold
                      text-xs flex items-center justify-center shrink-0">
                      #{lesson.id}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <button
                        onClick={() => navigate(`/editor?id=${lesson.id}`)}
                        className="font-serif font-bold text-base text-[var(--ink)] truncate text-left
                          hover:text-[var(--accent)] transition-colors cursor-pointer"
                      >
                        {lesson.title}
                      </button>
                      <div className="flex gap-2 flex-wrap items-center mt-1">
                        <span className={`px-2 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-bold
                          uppercase tracking-wider ${
                          lesson.published
                            ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)]'
                            : 'bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]'
                        }`}>
                          {lesson.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold
                          text-[var(--muted)] font-mono">
                          <Sliders size={11} className="text-[var(--accent)]" />
                          {lesson.totalSlidesCount || lesson.slidesCount || 4} slides
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/read?id=${lesson.id}`)}
                      className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)]
                        bg-[var(--bg)] text-[var(--ink)] text-xs font-semibold flex items-center
                        gap-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)]
                        transition-colors cursor-pointer"
                    >
                      <Eye size={13} /> Read
                    </button>
                    <button
                      onClick={() => navigate(`/editor?id=${lesson.id}`)}
                      className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--accent-soft)]
                        bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold
                        flex items-center gap-1.5 hover:bg-[var(--accent)] hover:text-[var(--accent-on)]
                        transition-all cursor-pointer"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleTogglePublish(lesson)}
                      className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)]
                        bg-[var(--bg)] text-[var(--muted)] text-xs font-semibold
                        hover:text-[var(--ink)] hover:border-[var(--line-strong)]
                        transition-colors cursor-pointer"
                    >
                      {lesson.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(lesson.id)}
                      className="p-2 rounded-[var(--radius-md)] border border-[var(--err-soft)]
                        bg-[var(--err-soft)] text-[var(--err)] hover:bg-[var(--err)]
                        hover:text-white transition-colors cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination?.totalPages > 1 && (
          <div className="flex justify-center pt-2">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <div
            className="modal-backdrop"
            onClick={() => setDeleteTargetId(null)}
          >
            <motion.div
              initial={{ scale: 0.97, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-box"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-2 text-[var(--err)] font-bold text-sm">
                  <ShieldAlert size={18} />
                  <span>Delete Note Permanently?</span>
                </div>
                <button
                  onClick={() => setDeleteTargetId(null)}
                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)]
                    hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
              <p className="text-xs text-[var(--muted)] leading-relaxed font-normal mb-5">
                This action is permanent and cannot be undone. All slide content inside
                this note will be deleted forever.
              </p>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteTargetId(null)}
                  className="rounded-[var(--radius-md)] text-xs font-bold cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-[var(--radius-md)] text-xs font-bold gap-1.5 cursor-pointer
                    bg-[var(--err)] text-white border-[var(--err)] hover:opacity-90"
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  {deleting ? 'Deleting…' : 'Delete Permanently'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
