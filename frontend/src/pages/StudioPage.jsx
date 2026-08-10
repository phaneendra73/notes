import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { Pagination } from '../components/ui/Pagination.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  Plus, Edit2, Eye, Trash2, X, AlertCircle, Search, Sliders,
  BookOpen, Layers, Zap, Loader2, Globe, ShieldAlert
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
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-black">
      <SEO title="Author Studio — Notes" />
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
        {/* Studio Header Banner */}
        <div className="rounded-3xl border border-border bg-card/85 backdrop-blur-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary flex items-center gap-1.5 mb-2">
              <Zap size={14} /> Author Command Center
            </span>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-foreground">
              Author Studio Management
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-normal">
              Create, edit, organize, and publish visual study notes for Notes.phaneendramarri.com
            </p>
          </div>

          <Button
            onClick={() => navigate('/editor')}
            className="rounded-full font-bold text-xs sm:text-sm gap-2 px-6 py-3 bg-primary text-black hover:bg-primary/90 shadow-xs cursor-pointer"
          >
            <Plus size={18} /> Create New Note
          </Button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border">
          <div className="relative flex-1 flex items-center px-3">
            <Search size={16} className="text-primary mr-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              placeholder="Filter notes by title or tag..."
              className="w-full bg-transparent text-xs font-semibold text-foreground outline-none placeholder:text-muted-foreground py-2 font-normal"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Lessons List Table */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="p-6 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-semibold flex items-center gap-2">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-3">
            {lessons.length === 0 ? (
              <div className="p-12 text-center rounded-3xl border border-border bg-card/60 space-y-3">
                <BookOpen size={40} className="mx-auto text-muted-foreground opacity-40" />
                <h3 className="font-heading font-bold text-lg text-foreground">No Notes Found</h3>
                <p className="text-xs text-muted-foreground font-normal">
                  You haven't created any study notes matching this query yet.
                </p>
                <button
                  onClick={() => navigate('/editor')}
                  className="px-5 py-2 rounded-xl bg-primary text-black font-bold text-xs cursor-pointer hover:scale-105 transition-transform inline-block"
                >
                  Create First Note
                </button>
              </div>
            ) : (
              lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 sm:p-5 rounded-2xl border border-border bg-card flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-primary/50 shadow-xs"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      #{lesson.id}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="font-heading font-bold text-base text-foreground truncate hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/editor?id=${lesson.id}`)}>
                        {lesson.title}
                      </span>
                      <div className="flex gap-2 flex-wrap items-center mt-1 text-xs">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          lesson.published ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {lesson.published ? 'Published' : 'Draft'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground font-mono">
                          <Sliders size={12} className="text-primary" /> {lesson.totalSlidesCount || lesson.slidesCount || 4} Slides
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigate(`/read?id=${lesson.id}`)}
                      className="px-3 py-1.5 rounded-xl border border-border bg-background text-foreground text-xs font-semibold flex items-center gap-1.5 hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                      <Eye size={14} /> Read
                    </button>
                    <button
                      onClick={() => navigate(`/editor?id=${lesson.id}`)}
                      className="px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-xs font-semibold flex items-center gap-1.5 hover:bg-primary hover:text-black transition-all cursor-pointer"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleTogglePublish(lesson)}
                      className="px-3 py-1.5 rounded-xl border border-border bg-background text-muted-foreground text-xs font-semibold hover:text-foreground transition-colors cursor-pointer"
                    >
                      {lesson.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(lesson.id)}
                      className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
                      title="Delete Note"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {!loading && pagination?.totalPages > 1 && (
          <div className="flex justify-center pt-4">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs" onClick={() => setDeleteTargetId(null)}>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md p-6 rounded-3xl border border-rose-500/30 bg-card shadow-lg space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-base">
                  <ShieldAlert size={20} />
                  <span>Delete Visual Note Permanently?</span>
                </div>
                <button onClick={() => setDeleteTargetId(null)} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                This action is permanent and cannot be undone. All slide content inside this note will be deleted forever.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)} className="rounded-xl text-xs font-bold">
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-xl text-xs font-bold bg-rose-500 text-white hover:bg-rose-600 gap-1.5 cursor-pointer"
                >
                  {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  {deleting ? 'Deleting...' : 'Delete Permanently'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
