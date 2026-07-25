import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Separator } from './Separator.jsx';
import { FiBook } from 'react-icons/fi';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: '1px solid var(--border)', background: 'linear-gradient(180deg, transparent 0%, rgba(0,201,110,0.03) 100%)' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--primary), #00b4d8)', color: '#000',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: 14,
              boxShadow: '0 8px 24px var(--neon-glow)',
            }}>K</div>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '0.875rem', color: 'var(--fg)' }}>
              Kadha 2.0 — Edge Publishing
            </span>
          </div>

          {/* Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {[
              { label: 'Explore Stories', action: () => navigate('/BlogPosts') },
              { label: Boolean(localStorage.getItem('jwt')) ? 'Write a Story' : 'Sign In', action: () => navigate(Boolean(localStorage.getItem('jwt')) ? '/Editor' : '/Signin') },
            ].map(l => (
              <button
                key={l.label}
                onClick={l.action}
                style={{ background: 'none', border: 'none', fontSize: '0.875rem', color: 'var(--fg-muted)', cursor: 'pointer', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--neon)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--fg-muted)'}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        <Separator style={{ margin: '1.5rem 0' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--fg-muted)' }}>
          <span>&copy; {year} Kadha 2.0. All rights reserved.</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <FiBook size={13} style={{ color: 'var(--neon)' }} />
            Write, Read, Inspire.
          </span>
        </div>
      </div>
    </footer>
  );
}
