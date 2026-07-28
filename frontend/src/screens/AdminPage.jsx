import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getenv } from '../utils/getenv.js';
import { Appbar, Footer } from '../components/ui/index.js';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import useBlogs from '../hooks/useBlogs.js';
import { useToast } from '../components/Toaster.jsx';
import { FiPlus, FiEdit2, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

/**
 * ============================================================================
 * ADMIN STUDIO DASHBOARD (Kadha v3.0)
 * ============================================================================
 * 
 * Overview:
 * - Single-author dashboard for managing educational tech notes.
 * - Allows author to create new notes, edit existing slides, and toggle publication status.
 */
export default function AdminPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch all notes (including drafts) for the author studio
  const { blogs: notes, loading, error } = useBlogs(1, [], '', 'latest', {
    includeUnpublished: true,
    refreshTrigger,
  });

  // Guard: Protect route for authenticated admin author
  useEffect(() => {
    if (!localStorage.getItem('jwt')) {
      navigate('/signin');
    }
  }, [navigate]);

  /**
   * Toggle published / draft status for a lesson note
   */
  const handleTogglePublish = async (note) => {
    try {
      await axios.put(
        `${getenv('APIURL')}/lessons/edit/${note.id}`,
        { isPublished: !note.published },
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
      );
      setRefreshTrigger((p) => p + 1);
      toast({
        title: note.published ? 'Note Unpublished' : 'Note Published',
        variant: 'success',
      });
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update note status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Appbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Top Header Card */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-[22px] border border-border bg-card backdrop-blur-md mb-8 shadow-sm">
          <div>
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground mb-1">
              Author Studio & Notes Manager
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              Create, edit, reorder slides, and manage your C#, .NET, DSA, and SQL study notes.
            </p>
          </div>
          <Button onClick={() => navigate('/editor')} className="rounded-xl font-extrabold gap-1.5">
            <FiPlus size={16} /> New Tech Note
          </Button>
        </div>

        {/* Loading Skeletons State */}
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 rounded-[20px] border border-border bg-card flex flex-wrap gap-4 items-center">
                <Skeleton className="w-11 h-11 rounded-xl" />
                <div className="flex-1 min-w-[200px] flex flex-col gap-2">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="w-20 h-8 rounded-xl" />
                  <Skeleton className="w-20 h-8 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-bold">
            <FiAlertCircle size={18} /> {error}
          </div>
        )}

        {/* Notes List Stack */}
        {!loading && !error && (
          <div className="flex flex-col gap-3">
            {notes.length === 0 ? (
              <div className="p-12 text-center rounded-[24px] border border-border bg-card text-muted-foreground">
                No tech notes created yet.{' '}
                <button
                  onClick={() => navigate('/editor')}
                  className="text-primary font-bold hover:underline cursor-pointer bg-transparent border-0"
                >
                  Create your first note →
                </button>
              </div>
            ) : (
              notes.map((note, i) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="p-4 md:p-5 rounded-[22px] border border-border/80 bg-card hover:border-primary/40 transition-all duration-200 shadow-sm flex flex-wrap items-center justify-between gap-4"
                >
                  {/* Note Details */}
                  <div className="flex items-center gap-3.5 flex-1 min-w-[280px]">
                    <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-extrabold text-sm text-primary shrink-0">
                      #{note.id}
                    </div>
                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                      <span className="font-heading font-extrabold text-base text-foreground truncate">
                        {note.title}
                      </span>
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <Badge variant={note.published ? 'default' : 'draft'}>
                          {note.published ? 'Published' : 'Draft'}
                        </Badge>
                        {note.tags?.map((t) => (
                          <Badge key={t} className="opacity-80">
                            {t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => navigate(`/read?id=${note.id}`)}>
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/editor/${note.id}`)}>
                      <FiEdit2 size={13} className="text-primary" /> Edit Slides
                    </Button>
                    <Button
                      variant={note.published ? 'ghost' : 'neon'}
                      size="sm"
                      onClick={() => handleTogglePublish(note)}
                    >
                      {note.published ? 'Unpublish' : 'Publish'}
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
