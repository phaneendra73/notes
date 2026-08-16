import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import useTags from '../hooks/useTags.js';
import { Plus, Trash2, Loader2, AlertCircle, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TagManagerPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [newTagInput, setNewTagInput] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const { tags, loading, error } = useTags(refreshKey);

  useEffect(() => {
    if (!localStorage.getItem('jwt')) navigate('/signin');
  }, [navigate]);

  const handleCreate = async () => {
    const names = newTagInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (!names.length) return;
    setAdding(true);
    try {
      await client.post('/api/tags', { tags: names });
      setNewTagInput('');
      setRefreshKey((k) => k + 1);
      toast.success(`${names.length} tag(s) created`);
    } catch (err) {
      toast.error('Failed to create tags', err?.response?.data?.error);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (tagId, tagName) => {
    try {
      await client.delete(`/api/tags/${tagId}`);
      setRefreshKey((k) => k + 1);
      setDeleteConfirmId(null);
      toast.success(`Tag "${tagName}" deleted`);
    } catch (err) {
      toast.error('Failed to delete tag', err?.response?.data?.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] font-sans">
      <SEO title="Tag Manager — Notes" />
      <Navbar />

      <main className="flex-1 max-w-[var(--maxw)] w-full mx-auto px-4 md:px-6 py-8 md:py-10 space-y-6">

        {/* Page Header */}
        <div className="pb-6 border-b border-[var(--line)]">
          <span className="text-[11px] font-semibold uppercase tracking-widest
            text-[var(--accent)] flex items-center gap-1.5 mb-1">
            <Tag size={12} /> Topic Management
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[var(--ink)]">
            Tag Manager
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1 font-normal">
            Create or remove tags used to categorize notes.
          </p>
        </div>

        {/* Create Tags */}
        <div className="p-5 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] space-y-4">
          <div>
            <label
              htmlFor="new-tag"
              className="block text-xs font-bold text-[var(--ink)] mb-1"
            >
              Create New Tags
            </label>
            <p className="text-xs text-[var(--muted)] font-normal">
              Separate multiple tags with commas: C#, System Design, Async
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 flex items-center rounded-[var(--radius-md)]
              border border-[var(--line)] bg-[var(--bg)] px-3.5 gap-2
              focus-within:border-[var(--accent)] transition-colors">
              <Tag size={14} className="text-[var(--accent)] shrink-0" />
              <input
                id="new-tag"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                placeholder="C#, .NET, Docker…"
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                className="flex-1 py-2.5 bg-transparent text-sm text-[var(--ink)]
                  placeholder:text-[var(--muted)] outline-none font-normal"
              />
              {newTagInput && (
                <button
                  onClick={() => setNewTagInput('')}
                  className="p-1 rounded-[var(--radius-sm)] text-[var(--muted)]
                    hover:text-[var(--ink)] cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <Button
              onClick={handleCreate}
              disabled={adding || !newTagInput.trim()}
              className="rounded-[var(--radius-md)] font-bold text-xs gap-2
                bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)]
                hover:bg-[var(--accent-strong)] cursor-pointer px-5"
            >
              {adding
                ? <Loader2 size={13} className="animate-spin" />
                : <Plus size={13} />
              }
              Add
            </Button>
          </div>
        </div>

        {/* Tag list header */}
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg text-[var(--ink)]">
            Active Tags
            <span className="font-mono text-sm text-[var(--muted)] font-normal ml-2">
              ({tags.length})
            </span>
          </h2>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex items-center gap-3 p-4 rounded-[var(--radius-md)]
            border border-[var(--err-soft)] bg-[var(--err-soft)] text-[var(--err)] text-sm font-semibold">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Tags grid */}
        {!loading && !error && tags.length === 0 && (
          <div className="py-12 text-center rounded-[var(--radius-lg)]
            border border-[var(--line)] bg-[var(--surface)]">
            <Tag size={32} className="mx-auto text-[var(--muted)] opacity-40 mb-3" />
            <p className="text-sm text-[var(--muted)] font-normal">
              No tags yet. Create one above.
            </p>
          </div>
        )}

        {!loading && !error && tags.length > 0 && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          >
            <AnimatePresence>
              {tags.map((tag) => (
                <motion.div
                  key={tag.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  className="p-3.5 rounded-[var(--radius-md)] border border-[var(--line)]
                    bg-[var(--surface)] flex items-center justify-between gap-3
                    hover:border-[var(--line-strong)] transition-all group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Tag size={13} className="text-[var(--accent)] shrink-0" />
                    <span className="font-semibold text-sm text-[var(--ink)] truncate">
                      {tag.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteConfirmId(tag.id)}
                    className="p-1.5 rounded-[var(--radius-sm)] border border-[var(--err-soft)]
                      bg-[var(--err-soft)] text-[var(--err)] hover:bg-[var(--err)]
                      hover:text-white hover:border-[var(--err)] transition-all cursor-pointer
                      opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                    title={`Delete "${tag.name}"`}
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Footer />

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirmId && (() => {
          const tag = tags.find((t) => t.id === deleteConfirmId);
          return (
            <div
              className="modal-backdrop"
              onClick={() => setDeleteConfirmId(null)}
            >
              <motion.div
                initial={{ scale: 0.97, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.97, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="modal-box"
              >
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--line)]">
                  <span className="font-bold text-sm text-[var(--err)] flex items-center gap-2">
                    <AlertCircle size={16} /> Delete Tag?
                  </span>
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)]
                      hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-xs text-[var(--muted)] leading-relaxed font-normal mb-5">
                  Delete tag <strong className="text-[var(--ink)]">"{tag?.name}"</strong>?
                  Notes with this tag will not be deleted.
                </p>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}
                    className="rounded-[var(--radius-md)] text-xs font-bold cursor-pointer">
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(tag?.id, tag?.name)}
                    className="rounded-[var(--radius-md)] text-xs font-bold gap-1.5 cursor-pointer
                      bg-[var(--err)] text-white border-[var(--err)] hover:opacity-90"
                  >
                    <Trash2 size={13} /> Delete Tag
                  </Button>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
