import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX, FiMenu, FiSun, FiMoon, FiList, FiHome,
  FiShare2, FiCheckCircle, FiBookOpen,
} from 'react-icons/fi';
import { useToast } from '../ui/Toast.jsx';

/**
 * ReaderNavbar — sticky top bar for the lesson reader.
 *
 * Shows lesson title, slide progress, outline toggle, theme toggle, share.
 * Auto-hides on scroll down, reappears on scroll up.
 *
 * @param {object} lesson - Lesson metadata
 * @param {number} currentSlideIndex - 0-based current slide index
 * @param {number} totalSlides - Total slide count
 * @param {object[]} slides - All slide objects (for outline)
 * @param {function} onSelectSlide - Called with (index) when outline item clicked
 * @param {Set} visitedSlides - Set of visited slide indices
 */
export default function ReaderNavbar({
  lesson,
  currentSlideIndex,
  totalSlides,
  slides = [],
  onSelectSlide,
  visitedSlides = new Set(),
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const [outlineOpen, setOutlineOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  const progress = Math.round(((currentSlideIndex + 1) / Math.max(1, totalSlides)) * 100);

  // Auto-hide on scroll down
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY.current + 15 && y > 50) {
        setVisible(false);
        setOutlineOpen(false);
      } else if (y < lastScrollY.current - 10 || y < 30) {
        setVisible(true);
      }
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: lesson?.title || 'Notes', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success('Link copied!'));
    }
  };

  return (
    <>
      <motion.header
        animate={{ y: visible ? 0 : -80 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="reader-navbar"
      >
        <div className="reader-navbar-inner">
          {/* Left: Back + Title */}
          <div className="reader-navbar-left">
            <button
              className="reader-nav-btn"
              onClick={() => navigate('/')}
              title="Back to Catalog"
            >
              <FiHome size={16} />
            </button>
            <span className="reader-lesson-title">{lesson?.title || 'Loading…'}</span>
          </div>

          {/* Center: Progress */}
          <div className="reader-progress">
            <span className="reader-progress-label">
              {currentSlideIndex + 1} / {totalSlides}
            </span>
            <div className="reader-progress-bar">
              <div className="reader-progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="reader-navbar-right">
            <button
              className="reader-nav-btn"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title="Toggle theme"
            >
              {isDark ? <FiSun size={16} /> : <FiMoon size={16} />}
            </button>
            <button className="reader-nav-btn" onClick={handleShare} title="Share lesson">
              <FiShare2 size={16} />
            </button>
            <button
              className={`reader-nav-btn ${outlineOpen ? 'active' : ''}`}
              onClick={() => setOutlineOpen((o) => !o)}
              title="Slide outline"
            >
              {outlineOpen ? <FiX size={16} /> : <FiList size={16} />}
            </button>
          </div>
        </div>

        {/* Progress bar underline */}
        <div className="reader-navbar-progress">
          <div className="reader-navbar-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </motion.header>

      {/* Slide Outline Drawer */}
      <AnimatePresence>
        {outlineOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="reader-outline"
          >
            <div className="reader-outline-header">
              <span><FiBookOpen size={14} /> Slides</span>
              <button onClick={() => setOutlineOpen(false)}><FiX size={14} /></button>
            </div>
            <div className="reader-outline-list">
              {slides.map((slide, idx) => {
                const visited = visitedSlides.has(idx);
                const active = idx === currentSlideIndex;
                return (
                  <button
                    key={slide.id || idx}
                    onClick={() => { onSelectSlide(idx); setOutlineOpen(false); }}
                    className={`reader-outline-item ${active ? 'active' : ''} ${visited ? 'visited' : ''}`}
                  >
                    <span className="reader-outline-num">{idx + 1}</span>
                    <span className="reader-outline-title">{slide.title || `Slide ${idx + 1}`}</span>
                    {visited && !active && <FiCheckCircle size={12} className="reader-outline-check" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outline backdrop */}
      <AnimatePresence>
        {outlineOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="reader-outline-backdrop"
            onClick={() => setOutlineOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
