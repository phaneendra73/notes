import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getenv } from '../utils/getenv.js';
import { Appbar, Footer } from '../components/ui/index.js';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Label } from '../components/ui/Label.jsx';
import useTags from '../hooks/useTags.js';
import { useToast } from '../components/Toaster.jsx';
import { FiPlus, FiTrash2, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function TagManager() {
  const navigate = useNavigate();
  const toast = useToast();
  const [newTagInput, setNewTagInput] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [adding, setAdding] = useState(false);
  const { tags, loading, error } = useTags(refreshTrigger);

  useEffect(() => { if (!localStorage.getItem('jwt')) navigate('/Signin'); }, [navigate]);

  const handleCreate = async () => {
    const tagNames = newTagInput.split(',').map(t => t.trim()).filter(Boolean);
    if (!tagNames.length) return;
    setAdding(true);
    try {
      await axios.post(
        `${getenv('APIURL')}/blog/tags/create`,
        { tags: tagNames },
        { headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` } }
      );
      setNewTagInput('');
      setRefreshTrigger(p => p + 1);
      toast({ title: `${tagNames.length} tag(s) created`, variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to create tags', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async tagId => {
    try {
      await axios.delete(`${getenv('APIURL')}/blog/tags/${tagId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      });
      setRefreshTrigger(p => p + 1);
      toast({ title: 'Tag deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to delete tag', variant: 'destructive' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Appbar />
      <main style={{ flex: 1, maxWidth: 1024, margin: '0 auto', width: '100%', padding: '3rem 1.5rem' }}>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.875rem', fontWeight: 800, color: 'var(--fg)', marginBottom: 4 }}
          >
            Tag Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', marginBottom: '2.5rem' }}>
            Create or remove tags used to categorise your stories.
          </p>
        </motion.div>

        {/* Create form */}
        <div className="card" style={{ padding: '1.4rem', marginBottom: '2rem', border: '1px solid var(--border)', borderRadius: 20, background: 'linear-gradient(145deg, var(--card), rgba(255,255,255,0.7))', boxShadow: '0 18px 40px rgba(2, 6, 23, 0.05)' }}>
          <Label htmlFor="new-tag" style={{ marginBottom: 8, display: 'block', fontWeight: 700 }}>Create tags</Label>
          <p style={{ fontSize: '0.86rem', color: 'var(--fg-muted)', marginBottom: '0.9rem' }}>Add one or more tags at once, separated by commas.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
            <Input
              id="new-tag"
              value={newTagInput}
              onChange={e => setNewTagInput(e.target.value)}
              placeholder="e.g. Serverless, Cloudflare, React..."
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              style={{ flex: 1, minWidth: 260, borderRadius: 10 }}
            />
            <Button onClick={handleCreate} disabled={adding || !newTagInput.trim()} style={{ borderRadius: 10 }}>
              {adding ? <FiLoader size={16} className="spin" /> : <FiPlus size={16} />}
              Add Tags
            </Button>
          </div>
        </div>

        {/* Tag list */}
        <h2
          style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.25rem', fontWeight: 700, color: 'var(--fg)', marginBottom: '1.25rem' }}
        >
          All Tags ({tags.length})
        </h2>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem 0' }}>
            <FiLoader size={28} className="spin" style={{ color: 'var(--neon)' }} />
          </div>
        )}
        {!loading && error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
            <FiAlertCircle size={18} /> {error}
          </div>
        )}

        {!loading && !error && (
          <motion.div
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.9rem' }}
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          >
            <AnimatePresence>
              {tags.map(tag => (
                <motion.div
                  key={tag.id}
                  layout
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.85rem 1rem', borderRadius: 14, border: '1px solid var(--border)',
                    background: 'var(--card)', boxShadow: '0 10px 24px rgba(2, 6, 23, 0.04)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tag.name}</span>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    style={{
                      marginLeft: 8, flexShrink: 0, padding: '0.4rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.05)',
                      color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    title="Delete tag"
                  >
                    <FiTrash2 size={14} />
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
