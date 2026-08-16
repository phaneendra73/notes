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
  BookOpen, Loader2, ShieldAlert, Sliders, CheckCircle2,
  Clock, Globe, Lock
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

  const { lessons, loading, isFetching, error, pagination, refetch } = useLessons(null, searchQuery, page, 10);
  const isLoading = loading || isFetching;

  useEffect(() => {
    if (!localStorage.getItem('jwt')) navigate('/signin');
  }, [navigate]);

  const handleTogglePublish = async (lesson) => {
    try {
      await client.put(`/api/lessons/${lesson.id}`, { published: !lesson.published });
      refetch(page);
      toast.success(lesson.published ? 'Note set to Draft' : 'Note Published Live!');
    } catch {
      toast.error('Failed to update note status');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      await client.delete(`/api/lessons/${deleteTargetId}`);
      refetch(page);
      toast.success('Note deleted permanently');
      setDeleteTargetId(null);
    } catch {
      toast.error('Failed to delete note');
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div className="space-y-1">
            <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
              Studio
            </h1>
            <p className="text-xs sm:text-sm text-[var(--muted)] font-normal">
              Manage, edit, publish, and create your visual study notes.
            </p>
          </div>

          <Button
            onClick={() => navigate('/editor')}
            className="shrink-0 rounded-[var(--radius-md)] font-bold text-xs gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] shadow-[var(--shadow-sm)] cursor-pointer"
          >
            <Plus size={15} /> Create New Note
          </Button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex items-center gap-3 px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
          <Search size={16} className="text-[var(--accent)] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            placeholder="Search notes by title or tag…"
            className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--ink)] placeholder:text-[var(--muted)] outline-none font-normal"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Loading skeletons */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-1/3 rounded-[var(--radius-sm)]" />
                  <Skeleton className="h-3.5 w-1/2 rounded-[var(--radius-sm)]" />
                </div>
                <Skeleton className="h-8 w-48 rounded-[var(--radius-md)]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)] border border-[var(--err-soft)] bg-[var(--err-soft)] text-[var(--err)] text-xs sm:text-sm font-semibold">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lessons.length === 0 ? (
              <div className="p-12 text-center rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] space-y-3">
                <BookOpen size={36} className="mx-auto text-[var(--muted)] opacity-50" />
                <h3 className="font-serif font-bold text-lg text-[var(--ink)]">No Notes Found</h3>
                <p className="text-xs text-[var(--muted)] font-normal max-w-sm mx-auto">
                  {searchQuery
                    ? 'No notes match your search query.'
                    : "You haven't created any study notes yet. Click below to start your first note."}
                </p>
                <Button
                  onClick={() => navigate('/editor')}
                  className="rounded-[var(--radius-md)] text-xs font-bold gap-2 px-5 py-2 bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] mt-2 cursor-pointer"
                >
                  <Plus size={14} /> Create First Note
                </Button>
              </div>
            ) : (
              lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="p-4 sm:p-5 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-sm)]"
                >
                  {/* Left: Title & Overview */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Status Badge */}
                        <button
                          onClick={() => handleTogglePublish(lesson)}
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer border ${
                            lesson.published
                              ? 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-soft)] hover:border-[var(--accent)]'
                              : 'bg-[var(--surface-2)] text-[var(--muted)] border-[var(--line)] hover:text-[var(--ink)]'
                          }`}
                          title="Click to toggle Published / Draft"
                        >
                          {lesson.published ? <Globe size={10} /> : <Lock size={10} />}
                          <span>{lesson.published ? 'Published' : 'Draft'}</span>
                        </button>

                        <span className="text-xs font-mono text-[var(--muted)] flex items-center gap-1 font-medium">
                          <Sliders size={11} className="text-[var(--accent)]" /> {lesson.totalSlidesCount || lesson.slidesCount || 1} slides
                        </span>

                        {lesson.viewsCount !== undefined && (
                          <span className="text-xs font-mono text-[var(--muted)] flex items-center gap-1">
                            <Eye size={11} /> {lesson.viewsCount} reads
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => navigate(`/editor?id=${lesson.id}`)}
                        className="font-serif font-bold text-base sm:text-lg text-[var(--ink)] truncate cursor-pointer hover:text-[var(--accent)] transition-colors"
                      >
                        {lesson.title}
                      </h3>

                      {lesson.excerpt && (
                        <p className="text-xs text-[var(--muted)] line-clamp-1 font-normal">
                          {lesson.excerpt}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[var(--line)]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/read?id=${lesson.id}`)}
                      className="rounded-[var(--radius-md)] text-xs font-semibold gap-1.5 px-3 border-[var(--line)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] bg-[var(--surface)] cursor-pointer"
                    >
                      <Eye size={13} /> Read
                    </Button>

                    <Button
                      size="sm"
                      onClick={() => navigate(`/editor?id=${lesson.id}`)}
                      className="rounded-[var(--radius-md)] text-xs font-bold gap-1.5 px-3.5 bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] cursor-pointer"
                    >
                      <Edit2 size={13} /> Edit
                    </Button>

                    <button
                      onClick={() => setDeleteTargetId(lesson.id)}
                      className="p-2 rounded-[var(--radius-md)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--err)] hover:border-[var(--err-soft)] hover:bg-[var(--err-soft)] transition-colors cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && pagination?.totalPages > 1 && (
          <div className="flex justify-center pt-4">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              totalCount={pagination.totalCount}
              onPageChange={setPage}
            />
          </div>
        )}
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <div className="modal-backdrop" onClick={() => setDeleteTargetId(null)}>
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
                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-[var(--muted)] leading-relaxed font-normal mb-6">
                This action is permanent and cannot be undone. All slide content and blocks inside this note will be deleted forever.
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
                  className="rounded-[var(--radius-md)] text-xs font-bold gap-1.5 cursor-pointer bg-[var(--err)] text-white border-[var(--err)] hover:opacity-90"
                >
                  {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  <span>{deleting ? 'Deleting…' : 'Delete Permanently'}</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
