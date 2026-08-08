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
import { FiPlus, FiEdit2, FiEye, FiTrash2, FiX, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import useLessons from '../hooks/useLessons.js';

/**
 * StudioPage — author dashboard for managing lessons.
 * Renamed from AdminPage to reflect its actual purpose.
 */
export default function StudioPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { lessons, loading, error, pagination, refetch } = useLessons(null, '', page, 10);

  useEffect(() => {
    if (!localStorage.getItem('jwt')) navigate('/signin');
  }, [navigate]);

  const handleTogglePublish = async (lesson) => {
    try {
      await client.put(`/api/lessons/${lesson.id}`, { published: !lesson.published });
      refetch(page);
      toast.success(lesson.published ? 'Lesson unpublished' : 'Lesson published');
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
      toast.success('Lesson deleted');
      setDeleteTargetId(null);
    } catch {
      toast.error('Failed to delete lesson');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO title="Author Studio — Notes" />
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="studio-header">
          <div>
            <h1 className="font-heading font-extrabold text-xl md:text-3xl">Author Studio</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create, edit, and manage your tech lesson notes.
            </p>
          </div>
          <Button variant="neon" onClick={() => navigate('/editor')} className="gap-2">
            <FiPlus size={15} /> New Lesson
          </Button>
        </div>

        {loading && (
          <div className="flex flex-col gap-3 mt-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="studio-error">
            <FiAlertCircle size={18} /> {error}
          </div>
        )}

        {!loading && !error && (
          <div className="flex flex-col gap-3 mt-6">
            {lessons.length === 0 ? (
              <div className="studio-empty">
                No lessons yet.{' '}
                <button onClick={() => navigate('/editor')} className="text-primary font-bold hover:underline">
                  Create your first lesson →
                </button>
              </div>
            ) : (
              lessons.map((lesson, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="studio-lesson-row"
                >
                  <div className="studio-lesson-info">
                    <div className="studio-lesson-id">#{lesson.id}</div>
                    <div className="studio-lesson-meta">
                      <span className="studio-lesson-title">{lesson.title}</span>
                      <div className="flex gap-1.5 flex-wrap">
                        <Badge variant={lesson.published ? 'default' : 'draft'}>
                          {lesson.published ? 'Published' : 'Draft'}
                        </Badge>
                        {lesson.tags?.map((t) => <Badge key={t}>{t}</Badge>)}
                      </div>
                    </div>
                  </div>
                  <div className="studio-lesson-actions">
                    <Button size="xs" variant="view" onClick={() => navigate(`/read?id=${lesson.id}`)}>
                      <FiEye size={12} /> View
                    </Button>
                    <Button size="xs" variant="edit" onClick={() => navigate(`/editor?id=${lesson.id}`)}>
                      <FiEdit2 size={12} /> Edit
                    </Button>
                    <Button
                      size="xs"
                      variant={lesson.published ? 'unpublish' : 'publish'}
                      onClick={() => handleTogglePublish(lesson)}
                    >
                      {lesson.published ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button
                      size="xs"
                      variant="delete"
                      onClick={() => setDeleteTargetId(lesson.id)}
                    >
                      <FiTrash2 size={12} />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}

        {!loading && pagination?.totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        )}
      </main>

      <Footer />

      {/* Delete confirmation modal */}
      {deleteTargetId && (
        <div className="modal-backdrop" onClick={() => setDeleteTargetId(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3><FiTrash2 className="text-red-500" /> Delete Lesson</h3>
              <button className="modal-close" onClick={() => setDeleteTargetId(null)}>
                <FiX size={16} />
              </button>
            </div>
            <p className="modal-body">
              This action is <strong className="text-red-500">permanent</strong> and cannot be undone.
              All slides will be deleted.
            </p>
            <div className="modal-footer">
              <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)}>Cancel</Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting…' : 'Delete Permanently'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
