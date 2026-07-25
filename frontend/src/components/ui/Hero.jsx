import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from './Button.jsx';
import { FiArrowRight, FiFeather } from 'react-icons/fi';

export default function Hero() {
  const navigate = useNavigate();
  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '5rem 1.25rem 4rem', textAlign: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', left: '50%', top: '-5%',
          transform: 'translateX(-50%)',
          width: 460, height: 460, borderRadius: '50%',
          background: 'radial-gradient(circle, var(--neon-subtle) 0%, transparent 70%)',
          filter: 'blur(38px)',
        }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 1, maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <motion.span
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12 }}
          style={{
            marginBottom: '1.25rem',
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0.38rem 0.9rem', borderRadius: 9999,
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.72)',
            color: 'var(--fg-muted)',
            fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 24px rgba(2, 6, 23, 0.04)',
          }}
        >
          Personal notes • reflections • learnings
        </motion.span>

        <h1 style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 'clamp(2.15rem, 5.5vw, 3.5rem)',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
          marginBottom: '1rem',
          color: 'var(--fg)',
        }}>
          A calm place to keep what matters.
        </h1>

        <p style={{
          fontSize: '1rem', color: 'var(--fg-muted)', maxWidth: 620,
          lineHeight: 1.8, marginBottom: '2rem',
        }}>
          This is your personal journal of ideas, lessons, small wins, and thoughtful reflections — simple to write, easy to revisit, and pleasant to read.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.9rem' }}>
          <Button size="lg" className="btn-pill" onClick={() => navigate('/BlogPosts')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            Read Journal
            <FiArrowRight size={16} />
          </Button>
          <Button size="lg" variant="outline" className="btn-pill" onClick={() => navigate('/Editor')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <FiFeather size={16} style={{ color: 'var(--primary)' }} />
            Write Entry
          </Button>
        </div>
      </motion.div>
    </section>
  );
}
