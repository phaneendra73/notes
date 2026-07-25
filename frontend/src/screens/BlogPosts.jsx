import React, { useState } from 'react';
import { Appbar, Footer } from '../components/ui/index.js';
import BlogCard from '../components/ui/BlogCard.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import useBlogs from '../hooks/useBlogs.js';
import useTags from '../hooks/useTags.js';
import { FiSearch, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function BlogPosts() {
  const [page, setPage] = useState(1);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { blogs, totalPages, loading, error } = useBlogs(page, selectedTag ? [selectedTag] : [], searchQuery);
  const { tags } = useTags();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Appbar />
      <main style={{ flex: 1, maxWidth: 1280, margin: '0 auto', width: '100%', padding: '3rem 1.5rem' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: '2.5rem' }}
        >
          <h1
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.5rem', fontWeight: 800, color: 'var(--fg)', marginBottom: 4 }}
          >
            All Stories
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)' }}>
            Explore every article published here.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2.5rem', padding: '1rem', border: '1px solid var(--border)', borderRadius: 20, background: 'rgba(255,255,255,0.62)', backdropFilter: 'blur(10px)', boxShadow: '0 16px 40px rgba(2, 6, 23, 0.04)' }}
        >
          {/* Search bar */}
          <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
            <FiSearch size={15} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--fg-muted)', pointerEvents: 'none',
            }} />
            <Input
              type="text"
              placeholder="Search by title..."
              style={{ paddingLeft: 36 }}
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
            />
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {[{ id: '', name: 'All' }, ...tags].map(tag => (
              <Button
                key={tag.id}
                variant={selectedTag === tag.name || (tag.id === '' && selectedTag === '') ? 'default' : 'outline'}
                size="sm"
                className="btn-pill"
                onClick={() => { setSelectedTag(tag.id === '' ? '' : (selectedTag === tag.name ? '' : tag.name)); setPage(1); }}
              >
                {tag.name}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Skeleton style={{ height: 190, borderRadius: 8 }} />
                <div style={{ display: 'flex', gap: 6 }}>
                  <Skeleton style={{ width: 55, height: 18, borderRadius: 9999 }} />
                  <Skeleton style={{ width: 45, height: 18, borderRadius: 9999 }} />
                </div>
                <Skeleton style={{ width: '80%', height: 20 }} />
                <Skeleton style={{ width: '60%', height: 20 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <Skeleton style={{ width: 75, height: 14 }} />
                  <Skeleton style={{ width: 40, height: 14 }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '4rem 0' }}>
            <FiAlertCircle size={36} style={{ color: '#ef4444' }} />
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && blogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ textAlign: 'center', padding: '4rem 1.25rem', border: '1px dashed var(--border)', borderRadius: 24, background: 'rgba(255,255,255,0.45)', color: 'var(--fg-muted)' }}
          >
            <p style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--fg)', marginBottom: 8 }}>No stories match this view yet.</p>
            <p style={{ fontSize: '0.9rem' }}>Try a broader search or browse the full collection.</p>
          </motion.div>
        )}

        {/* Results grid */}
        {!loading && !error && blogs.length > 0 && (
          <>
            <motion.div
              key={`${selectedTag}-${page}-${searchQuery}`}
              initial="hidden"
              animate="show"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}
            >
              {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
            </motion.div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: '3rem' }}>
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
                  ← Previous
                </Button>
                <span style={{ fontSize: '0.875rem', color: 'var(--fg-muted)' }}>
                  Page <strong style={{ color: 'var(--fg)' }}>{page}</strong> of <strong style={{ color: 'var(--fg)' }}>{totalPages}</strong>
                </span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
