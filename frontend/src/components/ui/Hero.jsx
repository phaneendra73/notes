import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { getenv } from '../../utils/getenv.js';
import { Button } from './Button.jsx';
import { FiArrowRight, FiFeather, FiBookOpen, FiEye, FiTag } from 'react-icons/fi';

export default function Hero() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalBlogs: 3, totalViews: 1510, totalTags: 5 });

  useEffect(() => {
    axios
      .get(`${getenv('APIURL')}/blog/stats`)
      .then((res) => {
        if (res.data) {
          setStats({
            totalBlogs: res.data.totalBlogs || 3,
            totalViews: res.data.totalViews || 1510,
            totalTags: res.data.totalTags || 5,
          });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section style={{ position: 'relative', overflow: 'hidden', padding: '5rem 1.25rem 3.5rem', textAlign: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '-5%',
            transform: 'translateX(-50%)',
            width: 520,
            height: 520,
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--neon-subtle) 0%, transparent 70%)',
            filter: 'blur(45px)',
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
        style={{ position: 'relative', zIndex: 1, maxWidth: 840, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      >
        <motion.span
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.12 }}
          style={{
            marginBottom: '1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '0.38rem 0.9rem',
            borderRadius: 9999,
            border: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--fg-muted)',
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 10px 24px rgba(2, 6, 23, 0.04)',
          }}
        >
          Personal Engineering & Tech Notes
        </motion.span>

        <h1
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.2rem, 5.5vw, 3.6rem)',
            fontWeight: 800,
            lineHeight: 1.08,
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
            color: 'var(--fg)',
          }}
        >
          Master C#, .NET, DSA & SQL with Interactive Notes.
        </h1>

        <p
          style={{
            fontSize: '1.05rem',
            color: 'var(--fg-muted)',
            maxWidth: 640,
            lineHeight: 1.75,
            marginBottom: '2rem',
          }}
        >
          A personal study hub to review concepts in C#, .NET Core, Data Structures & Algorithms, SQL, and System Design.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.9rem', marginBottom: '3rem' }}>
          <Button
            size="lg"
            className="btn-pill font-extrabold cursor-pointer"
            onClick={() => {
              const el = document.getElementById('notes-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/#notes-section');
              }
            }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
          >
            Explore Notes
            <FiArrowRight size={16} />
          </Button>
          {Boolean(localStorage.getItem('jwt')) && (
            <Button size="lg" variant="outline" className="btn-pill font-extrabold" onClick={() => navigate('/editor')} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <FiFeather size={16} style={{ color: 'var(--primary)' }} />
              New Tech Note
            </Button>
          )}
        </div>

        {/* Live Platform Stats Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.25rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
            <FiBookOpen size={16} style={{ color: 'var(--primary)' }} />
            <strong style={{ color: 'var(--fg)', fontSize: '1rem' }}>{stats.totalBlogs}</strong> Tech Notes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
            <FiTag size={16} style={{ color: '#38bdf8' }} />
            <strong style={{ color: 'var(--fg)', fontSize: '1rem' }}>{stats.totalTags}</strong> Topics
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--fg-muted)' }}>
            <FiEye size={16} style={{ color: '#818cf8' }} />
            <strong style={{ color: 'var(--fg)', fontSize: '1rem' }}>{stats.totalViews}</strong> Reads
          </div>
        </div>
      </motion.div>
    </section>
  );
}
