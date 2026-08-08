import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import Navbar from '../components/layout/Navbar.jsx';
import Footer from '../components/layout/Footer.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import useTags from '../hooks/useTags.js';
import { FiPlus, FiTrash2, FiLoader, FiAlertCircle, FiTag } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function TagManagerPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [newTagInput, setNewTagInput] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [adding, setAdding] = useState(false);
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
      toast.success(`Tag "${tagName}" deleted`);
    } catch (err) {
      toast.error('Failed to delete tag', err?.response?.data?.error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <SEO title="Tag Manager — Notes" />
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-10">
        <h1 className="font-heading font-extrabold text-2xl md:text-3xl mb-1 flex items-center gap-2">
          <FiTag className="text-primary" /> Topic Tag Manager
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Create or remove tags used to categorize lessons.
        </p>

        <div className="p-5 rounded-[22px] border border-border/80 bg-card/80 mb-8">
          <Label htmlFor="new-tag" className="mb-2 block font-bold">
            Create New Tags
          </Label>
          <p className="text-xs text-muted-foreground mb-4">
            Separate multiple tags with commas: C#, System Design, Async
          </p>
          <div className="flex gap-3">
            <Input
              id="new-tag"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              placeholder="C#, .NET, Docker…"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="flex-1"
            />
            <Button onClick={handleCreate} disabled={adding || !newTagInput.trim()} variant="neon" className="gap-2">
              {adding ? <FiLoader size={14} className="spin" /> : <FiPlus size={14} />}
              Add
            </Button>
          </div>
        </div>

        <h2 className="font-heading font-extrabold text-lg mb-4">Active Tags ({tags.length})</h2>

        {loading && <div className="flex justify-center py-12"><FiLoader size={28} className="spin text-primary" /></div>}
        {!loading && error && (
          <div className="flex items-center gap-2 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            <FiAlertCircle size={16} /> {error}
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
                  className="p-3.5 rounded-2xl border border-border/80 bg-card flex items-center justify-between gap-3 hover:border-primary/40 transition-all"
                >
                  <span className="font-extrabold text-sm truncate">{tag.name}</span>
                  <button
                    onClick={() => handleDelete(tag.id, tag.name)}
                    className="p-1.5 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
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
