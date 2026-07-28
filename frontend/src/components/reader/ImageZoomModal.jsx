import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZoomIn, FiZoomOut, FiMaximize2 } from 'react-icons/fi';

export default function ImageZoomModal({ src, alt, onClose }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(2, 6, 23, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        {/* Top Controls Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'var(--card)',
            border: '1px solid var(--border)',
            padding: '6px 14px',
            borderRadius: 999,
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          }}
        >
          <button
            onClick={() => setScale((s) => Math.min(s + 0.3, 3))}
            style={{ background: 'none', border: 'none', color: 'var(--fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
            title="Zoom In"
          >
            <FiZoomIn size={18} />
          </button>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--fg-muted)', minWidth: 40, textAlign: 'center' }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.3, 0.6))}
            style={{ background: 'none', border: 'none', color: 'var(--fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
            title="Zoom Out"
          >
            <FiZoomOut size={18} />
          </button>
          <button
            onClick={() => setScale(1)}
            style={{ background: 'none', border: 'none', color: 'var(--fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
            title="Reset Zoom"
          >
            <FiMaximize2 size={16} />
          </button>
          <div style={{ width: 1, height: 16, background: 'var(--border)', margin: '0 4px' }} />
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 }}
            title="Close"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Zoomable Image Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: '90vw',
            maxHeight: '82vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'auto',
          }}
        >
          <img
            src={src}
            alt={alt || 'Zoomed diagram or figure'}
            style={{
              maxWidth: '100%',
              maxHeight: '78vh',
              objectFit: 'contain',
              borderRadius: 16,
              transform: `scale(${scale})`,
              transition: 'transform 0.2s ease-out',
              boxShadow: '0 24px 70px rgba(0,0,0,0.5)',
              cursor: scale > 1 ? 'grab' : 'zoom-in',
            }}
          />
          {alt && (
            <p style={{ marginTop: 16, color: 'rgba(255,255,255,0.7)', fontSize: '0.875rem', fontWeight: 500, textAlign: 'center' }}>
              {alt}
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
