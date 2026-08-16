import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowUp, Terminal } from 'lucide-react';
import useTags from '../../hooks/useTags.js';
import phaneendraLogo from '../../../assets/phaneendramarri.svg';

export default function Footer() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();
  const { tags: dbTags } = useTags();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExploreClick = () => {
    if (window.location.pathname === '/') {
      document.getElementById('notes-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/#notes-section');
    }
  };

  const topicTags = (dbTags || [])
    .map((t) => (typeof t === 'object' ? t.name : t))
    .filter(Boolean);

  return (
    <footer className="w-full border-t border-[var(--line)] bg-[var(--surface)] mt-auto no-print">
      <div className="max-w-[var(--maxw)] mx-auto px-4 md:px-6 py-10 md:py-12 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-between">
          {/* Brand & Author Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--line)] p-1 flex items-center justify-center">
                <img src={phaneendraLogo} alt="Notes" className="w-full h-full object-contain" />
              </div>
              <span className="font-serif font-bold text-xl text-[var(--ink)]">
                Notes<span className="text-[var(--accent)] font-bold">.</span>
              </span>
            </div>
            <p className="font-sans text-xs text-[var(--ink-2)] leading-relaxed max-w-sm font-normal">
              Engineering study notes and technical deep dives covering C#, .NET Core 8, Data Structures, SQL Indexing, and System Design created by <strong className="text-[var(--ink)]">Phaneendra Marri</strong>.
            </p>

            {/* Author Social Links (GitHub, Twitter/X, YouTube, LinkedIn) */}
            <div className="flex items-center gap-2 pt-1">
              {/* GitHub */}
              <a
                href="https://github.com/phaneendramarri"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-[var(--radius-sm)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--line-strong)] transition-colors flex items-center justify-center"
                title="GitHub @phaneendramarri"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="https://x.com/phaneendramarri"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-[var(--radius-sm)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--line-strong)] transition-colors flex items-center justify-center"
                title="Twitter/X @phaneendramarri"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@phaneendramarri"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-[var(--radius-sm)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--err)] hover:border-[var(--err)] transition-colors flex items-center justify-center"
                title="YouTube @phaneendramarri"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/phaneendramarri"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-[var(--radius-sm)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--line-strong)] transition-colors flex items-center justify-center"
                title="LinkedIn @phaneendramarri"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Active Topics */}
          <div className="flex flex-col gap-2.5 md:items-center">
            <span className="text-xs font-bold uppercase text-[var(--accent)] tracking-widest flex items-center gap-1.5 font-sans">
              <Terminal size={13} /> Active Topics
            </span>
            <div className="flex flex-wrap gap-1.5 md:justify-center">
              {topicTags.map((tag) => (
                <button
                  key={tag}
                  onClick={handleExploreClick}
                  className="px-3 py-1 rounded-[var(--radius-sm)] text-xs font-semibold bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] border border-[var(--line)] transition-colors cursor-pointer text-[var(--ink-2)]"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links & Scroll to Top */}
          <div className="flex flex-col gap-3 md:items-end font-sans">
            <span className="text-xs font-bold uppercase text-[var(--accent)] tracking-widest">
              Quick Links
            </span>
            <div className="flex items-center gap-3 text-xs font-semibold text-[var(--muted)]">
              <button
                onClick={handleExploreClick}
                className="hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                All Notes
              </button>
              <span>•</span>
              <button
                onClick={() => navigate('/signin')}
                className="hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                Author Sign In
              </button>
            </div>

            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-semibold hover:border-[var(--line-strong)] hover:text-[var(--accent)] transition-colors cursor-pointer mt-2"
            >
              <span>Back to Top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)] gap-3 font-normal font-sans">
          <p>© {year} Notes. Created & curated by <strong className="text-[var(--ink)]">Phaneendra Marri</strong>.</p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-[var(--accent)] font-semibold">
            <span>Press ? in Reader for Shortcuts</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
