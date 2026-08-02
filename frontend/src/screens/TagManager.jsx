import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api.js';
import { Appbar, Footer } from '../components/ui/index.js';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import useTags from '../hooks/useTags.js';
import { useToast } from '../components/Toaster.jsx';
import { FiPlus, FiTrash2, FiLoader, FiAlertCircle, FiTag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function TagManager() {
  const navigate = useNavigate();
  const toast = useToast();
  const [newTagInput, setNewTagInput] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [adding, setAdding] = useState(false);
  const { tags, loading, error } = useTags(refreshTrigger);

  useEffect(() => {
    if (!localStorage.getItem('jwt')) navigate('/signin');
  }, [navigate]);

  const handleCreate = async () => {
    const tagNames = newTagInput.split(',').map((t) => t.trim()).filter(Boolean);
    if (!tagNames.length) return;
    setAdding(true);
    try {
      await api.post('/lessons/tags/create', { tags: tagNames });
      setNewTagInput('');
      setRefreshTrigger((p) => p + 1);
      toast({ title: `${tagNames.length} tag(s) created successfully`, variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create tags', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (tagId) => {
    try {
      await api.delete(`/lessons/tags/${tagId}`);
      setRefreshTrigger((p) => p + 1);
      toast({ title: 'Tag deleted successfully', variant: 'success' });
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete tag',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Appbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-foreground mb-1 flex items-center gap-2">
            <FiTag className="text-primary" /> Topic Tag Manager
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mb-8">
            Create or remove topic tags used to categorize tech notes and study tracks.
          </p>
        </motion.div>

        {/* Create Form */}
        <div className="p-5 md:p-6 rounded-[22px] border border-border/80 bg-card/80 backdrop-blur-md mb-8 shadow-xs">
          <Label htmlFor="new-tag" className="mb-2 block font-extrabold text-sm">
            Create New Tags
          </Label>
          <p className="text-xs text-muted-foreground mb-4">
            Add one or multiple tags at once by separating them with commas (e.g., C#, System Design, Async).
          </p>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <Input
              id="new-tag"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="e.g. C#, .NET, Docker, SQL..."
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="flex-1 rounded-xl h-10 bg-background"
            />
            <Button
              onClick={handleCreate}
              disabled={adding || !newTagInput.trim()}
              className="rounded-xl h-10 px-5 font-extrabold gap-2 shrink-0"
              variant="neon"
            >
              {adding ? <FiLoader size={16} className="spin" /> : <FiPlus size={16} />}
              Add Tags
            </Button>
          </div>
        </div>

        {/* Tag List */}
        <h2 className="font-heading text-lg font-extrabold text-foreground mb-4">
          Active Subject Tags ({tags.length})
        </h2>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <FiLoader size={28} className="spin text-primary" />
          </div>
        )}

        {!loading && error && (
          <div className="flex items-center gap-2.5 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-bold">
            <FiAlertCircle size={18} /> {error}
          </div>
        )}

        {!loading && !error && (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          >
            <AnimatePresence>
              {tags.map((tag) => (
                <motion.div
                  key={tag.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="p-3.5 rounded-2xl border border-border/80 bg-card hover:border-primary/40 transition-all duration-200 shadow-xs flex items-center justify-between gap-3 group"
                >
                  <span className="text-xs md:text-sm font-extrabold text-foreground truncate flex-1">
                    {tag.name}
                  </span>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="p-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer shrink-0 flex items-center justify-center"
                    title="Delete tag"
                  >
                    <FiTrash2 size={13} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Footer />
    </div>
  );
}
