import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiHome, FiEdit2, FiPrinter } from 'react-icons/fi';

/**
 * ReaderDock — floating bottom navigation dock for the lesson reader.
 *
 * Shows: Home | Prev | Slide counter | Next | (Edit if auth) | Print
 * Auto-hides on scroll down, reappears on scroll up.
 *
 * @param {number} currentSlideIndex
 * @param {number} totalSlides
 * @param {function} onNext
 * @param {function} onPrev
 * @param {function} onGoToSlide
 * @param {string} lessonId
 * @param {boolean} isAuthenticated
 */
export default function ReaderDock({
  currentSlideIndex,
  totalSlides,
  onNext,
  onPrev,
  onGoToSlide,
  lessonId,
  isAuthenticated = false,
}) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY.current + 15 && y > 50) setVisible(false);
      else if (y < lastScrollY.current - 10 || y < 30) setVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isFirst = currentSlideIndex === 0;
  const isLast = currentSlideIndex >= totalSlides - 1;

  return (
    <div className="reader-dock-wrap">
      <motion.div
        animate={{ y: visible ? 0 : 80, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.22 }}
        className="reader-dock"
      >
        <button
          className="reader-dock-btn"
          onClick={() => navigate('/')}
          title="Back to catalog"
        >
          <FiHome size={15} />
        </button>

        <div className="reader-dock-divider" />

        <button
          className="reader-dock-btn reader-dock-nav"
          disabled={isFirst}
          onClick={onPrev}
          title="Previous slide (←)"
        >
          <FiChevronLeft size={18} />
        </button>

        <span className="reader-dock-counter">
          {currentSlideIndex + 1} <span>/</span> {totalSlides}
        </span>

        <button
          className="reader-dock-btn reader-dock-nav"
          disabled={isLast}
          onClick={onNext}
          title="Next slide (→)"
        >
          <FiChevronRight size={18} />
        </button>

        {isAuthenticated && lessonId && (
          <>
            <div className="reader-dock-divider" />
            <button
              className="reader-dock-btn"
              onClick={() => navigate(`/editor?id=${lessonId}`)}
              title="Edit this lesson"
            >
              <FiEdit2 size={15} />
            </button>
          </>
        )}

        <div className="reader-dock-divider" />

        <button
          className="reader-dock-btn"
          onClick={() => window.print()}
          title="Print / Export PDF"
        >
          <FiPrinter size={15} />
        </button>
      </motion.div>
    </div>
  );
}
