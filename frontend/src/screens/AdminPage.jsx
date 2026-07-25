import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getenv } from '../utils/getenv.js';
import { Appbar, Footer } from '../components/ui/index.js';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import useAdminBlogs from '../hooks/useAdminBlogs.js';
import { useToast } from '../components/Toaster.jsx';
import { FiPlus, FiEdit2, FiCheckCircle, FiXCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { blogs, loading, error } = useAdminBlogs(1, [], '', true, refreshTrigger);

  React.useEffect(() => { if (!localStorage.getItem('jwt')) navigate('/Signin'); }, [navigate]);

  const handleToggle = async blog => {
    try {
      await axios.delete(`${getenv('APIURL')}/blog/delete/${blog.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      });
      setRefreshTrigger(p => p + 1);
      toast({ title: blog.published ? 'Unpublished' : 'Published', variant: 'success' });
    } catch {
      toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' });
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Appbar />
      <main style={{ flex: 1, maxWidth: 1024, margin: '0 auto', width: '100%', padding: '3rem 1.5rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2.2rem', padding: '1.1rem 1.2rem', border: '1px solid var(--border)', borderRadius: 20, background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)' }}>
          <div>
            <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.875rem', fontWeight: 800, color: 'var(--fg)', marginBottom: 4 }}>Story Manager</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)' }}>Create, edit, and toggle publication status.</p>
          </div>
          <Button onClick={() => navigate('/Editor')} className="rounded-xl">
            <FiPlus size={16} /> New Story
          </Button>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                <Skeleton style={{ width: 44, height: 44, borderRadius: 8 }} />
                <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skeleton style={{ width: '60%', height: 18 }} />
                  <Skeleton style={{ width: '40%', height: 14 }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Skeleton style={{ width: 80, height: 32, borderRadius: 6 }} />
                  <Skeleton style={{ width: 80, height: 32, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 16, borderRadius: 10, border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: '0.875rem', fontWeight: 600 }}>
            <FiAlertCircle size={18} /> {error}
          </div>
        )}

        {/* Card Row Items instead of raw Table */}
        {!loading && !error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {blogs.length === 0 ? (
              <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--fg-muted)', borderRadius: 20 }}>
                No stories yet.{' '}
                <button onClick={() => navigate('/Editor')} style={{ color: 'var(--neon)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Write your first one →
                </button>
              </div>
            ) : blogs.map((blog, i) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="card"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1.25rem',
                  padding: '1.25rem',
                  borderRadius: 18,
                  border: '1px solid var(--border)',
                  boxShadow: '0 10px 24px rgba(2, 6, 23, 0.04)',
                }}
              >
                {/* ID & Title info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 280 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 8,
                    background: 'var(--neon-subtle)', border: '1px solid var(--neon-border)',
                    display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.875rem', color: 'var(--neon)'
                  }}>
                    #{blog.id}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minWidth: 0 }}>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--fg)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {blog.title}
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                      <Badge variant={blog.published ? 'default' : 'draft'} style={{ marginRight: 6 }}>
                        {blog.published ? 'Published' : 'Draft'}
                      </Badge>
                      {blog.tags?.map(t => <Badge key={t} style={{ opacity: 0.85 }}>{t}</Badge>)}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'inline-flex', gap: 8, flexShrink: 0 }}>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/Editor/${blog.id}`)}>
                    <FiEdit2 size={13} style={{ color: 'var(--neon)' }} /> Edit
                  </Button>
                  <Button variant={blog.published ? 'ghost' : 'neon'} size="sm" onClick={() => handleToggle(blog)}>
                    {blog.published ? 'Unpublish' : 'Publish'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
