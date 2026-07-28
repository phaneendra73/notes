import React, { useState } from 'react';
import { FiCheckCircle, FiSearch, FiHelpCircle, FiClock, FiBookOpen } from 'react-icons/fi';
import { calculateSlideReadingTime } from '../../utils/markdown.js';

export default function TrackSidebar({
  slides,
  currentSlideIndex,
  onSelectSlide,
  visitedSlides = new Set(),
}) {
  const [filterQuery, setFilterQuery] = useState('');

  if (!slides || slides.length <= 1) return null;

  const filteredSlides = slides
    .map((s, originalIdx) => ({ ...s, originalIdx }))
    .filter((s) => s.title.toLowerCase().includes(filterQuery.toLowerCase()));

  return (
    <div
      style={{
        padding: '1.25rem 1rem',
        borderRadius: 20,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        position: 'sticky',
        top: 80,
        maxHeight: 'calc(100vh - 100px)',
        overflowY: 'auto',
        boxShadow: '0 16px 40px rgba(2, 6, 23, 0.05)',
      }}
    >
      {/* Sidebar Header */}
      <div style={{ display: 'flex', items: 'center', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.875rem', fontWeight: 800, color: 'var(--fg)', fontFamily: 'Outfit, sans-serif' }}>
          <FiBookOpen size={16} style={{ color: 'var(--primary)' }} />
          Course Outline
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--fg-muted)', background: 'var(--bg)', padding: '2px 8px', borderRadius: 999 }}>
          {slides.length} Slides
        </span>
      </div>

      {/* Filter Input */}
      {slides.length > 3 && (
        <div style={{ position: 'relative' }}>
          <FiSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)' }} />
          <input
            type="text"
            placeholder="Search slides..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              width: '100%',
              paddingLeft: 32,
              paddingRight: 10,
              paddingTop: 6,
              paddingBottom: 6,
              borderRadius: 10,
              border: '1px solid var(--border)',
              background: 'var(--bg)',
              color: 'var(--fg)',
              fontSize: '0.8rem',
              outline: 'none',
            }}
          />
        </div>
      )}

      {/* Slide List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filteredSlides.map((s) => {
          const idx = s.originalIdx;
          const active = idx === currentSlideIndex;
          const isVisited = visitedSlides.has(idx);
          const hasQuiz = (s.content || '').includes('```quiz') || (s.content || '').includes(':::quiz');
          const readTime = calculateSlideReadingTime(s.content || '');

          return (
            <button
              key={idx}
              onClick={() => onSelectSlide(idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 8,
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid',
                borderColor: active ? 'var(--primary)' : 'transparent',
                background: active ? 'rgba(0, 201, 110, 0.12)' : 'transparent',
                color: active ? 'var(--fg)' : 'var(--fg-muted)',
                fontWeight: active ? 800 : 500,
                fontSize: '0.85rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                boxShadow: active ? '0 4px 14px rgba(0, 201, 110, 0.15)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'var(--neon-subtle)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {/* Index / Checkmark */}
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    flexShrink: 0,
                    background: active ? 'var(--primary)' : isVisited ? 'rgba(0, 201, 110, 0.2)' : 'var(--border)',
                    color: active ? '#000' : isVisited ? 'var(--primary)' : 'var(--fg-muted)',
                  }}
                >
                  {isVisited && !active ? <FiCheckCircle size={13} /> : idx + 1}
                </span>

                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.title}
                </span>
              </div>

              {/* Badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                {hasQuiz && (
                  <FiHelpCircle size={14} style={{ color: '#f59e0b' }} title="Quiz included" />
                )}
                <span style={{ fontSize: '0.7rem', color: 'var(--fg-muted)' }}>
                  {readTime.split(' ')[0]}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
