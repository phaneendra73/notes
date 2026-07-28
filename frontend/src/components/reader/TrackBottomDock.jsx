import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
} from 'react-icons/fi';

export default function TrackBottomDock({
  slides = [],
  currentSlideIndex,
  slidesCount,
  onPrev,
  onNext,
  onSelectSlide,
}) {
  const navigate = useNavigate();
  const [jumpOpen, setJumpOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const jumpRef = useRef(null);
  const lastScrollY = useRef(0);

  // Auto-hide bottom dock on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 15 && currentScrollY > 50) {
        setVisible(false);
        setJumpOpen(false); // Close jump popup if scrolling down
      } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY < 30) {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close Jump To popup when clicking outside
  useEffect(() => {
    if (!jumpOpen) return;
    const handler = (e) => {
      if (e.target && !document.contains(e.target)) return;
      if (jumpRef.current && !jumpRef.current.contains(e.target)) {
        setJumpOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [jumpOpen]);

  const dockBtnPrimary = {
    padding: '8px 16px',
    borderRadius: 12,
    border: 'none',
    background: 'var(--fg)',
    color: 'var(--bg)',
    fontSize: '0.85rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s ease',
  };

  const dockBtnSecondary = {
    padding: '8px 14px',
    borderRadius: 12,
    border: '1px solid var(--border)',
    background: 'var(--card)',
    color: 'var(--fg)',
    fontSize: '0.85rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s ease',
  };

  return (
    <div
      className="no-print"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 100,
        background: 'var(--card)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--border)',
        borderRadius: 20,
        padding: '6px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        whiteSpace: 'nowrap',
        transform: visible ? 'translateY(0)' : 'translateY(80px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s ease, opacity 0.25s ease',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Back to Home Catalog */}
      <button
        onClick={() => navigate('/')}
        style={dockBtnSecondary}
        title="Back to Home"
      >
        <FiHome size={15} style={{ color: 'var(--primary)' }} />
        <span>Home</span>
      </button>

      <div style={{ width: 1, height: 20, background: 'var(--border)', opacity: 0.6 }} />

      {/* Previous Slide Button */}
      <button
        disabled={currentSlideIndex === 0}
        onClick={onPrev}
        style={{
          ...dockBtnPrimary,
          background: currentSlideIndex === 0 ? 'var(--muted)' : 'var(--fg)',
          color: currentSlideIndex === 0 ? 'var(--fg-muted)' : 'var(--bg)',
          cursor: currentSlideIndex === 0 ? 'not-allowed' : 'pointer',
          opacity: currentSlideIndex === 0 ? 0.4 : 1,
        }}
      >
        <FiChevronLeft size={18} />
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Slide Counter (Clickable to jump) */}
      <div ref={jumpRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setJumpOpen((v) => !v)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--fg)',
            fontSize: '0.82rem',
            fontWeight: 800,
            padding: '6px 10px',
            borderRadius: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          title="Click to jump to slide"
        >
          <span>{currentSlideIndex + 1} / {slidesCount}</span>
        </button>

        {jumpOpen && slides && slides.length > 1 && (
          <div
            style={{
              position: 'absolute',
              bottom: 'calc(100% + 14px)',
              left: 0,
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              padding: '8px',
              minWidth: 240,
              boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              maxHeight: 280,
              overflowY: 'auto',
            }}
          >
            {slides.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  onSelectSlide(idx);
                  setJumpOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: idx === currentSlideIndex ? 'rgba(0,201,110,0.15)' : 'transparent',
                  color: idx === currentSlideIndex ? 'var(--primary)' : 'var(--fg)',
                  fontWeight: idx === currentSlideIndex ? 800 : 500,
                  fontSize: '0.82rem',
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.12s',
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {idx + 1}. {s.title}
                </span>
                {idx === currentSlideIndex && (
                  <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'var(--primary)', color: '#000', padding: '2px 6px', borderRadius: 999 }}>Active</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Next Slide Button */}
      <button
        disabled={currentSlideIndex === slidesCount - 1}
        onClick={onNext}
        style={{
          ...dockBtnPrimary,
          background: currentSlideIndex === slidesCount - 1 ? 'var(--muted)' : 'var(--fg)',
          color: currentSlideIndex === slidesCount - 1 ? 'var(--fg-muted)' : 'var(--bg)',
          cursor: currentSlideIndex === slidesCount - 1 ? 'not-allowed' : 'pointer',
          opacity: currentSlideIndex === slidesCount - 1 ? 0.4 : 1,
        }}
      >
        <span className="hidden sm:inline">Next</span>
        <FiChevronRight size={18} />
      </button>
    </div>
  );
}
