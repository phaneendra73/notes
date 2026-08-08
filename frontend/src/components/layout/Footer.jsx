import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBookOpen, FiArrowUp } from 'react-icons/fi';
import useTags from '../../hooks/useTags.js';
import kadhaLogo from '../../assets/kadha.svg';

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
    <footer className="w-full border-t border-border/80 bg-card/60 backdrop-blur-md mt-auto no-print">
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-12 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-cyan-400 p-[1px] shadow-[0_0_12px_var(--neon-glow)]">
                <div className="w-full h-full bg-card rounded-[11px] flex items-center justify-center p-1.5">
                  <img src={kadhaLogo} alt="Kadha" className="w-full h-full object-contain" />
                </div>
              </div>
              <span className="font-heading font-extrabold text-base text-foreground">
                Notes<span className="text-primary font-black ml-1">.io</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Interactive engineering study notes for C#, .NET Core, Algorithms, SQL, and System Design.
            </p>
          </div>

          {/* Topics */}
          <div className="flex flex-col gap-2.5 md:items-center">
            <span className="text-xs font-black uppercase text-primary tracking-wider">
              Core Topics
            </span>
            <div className="flex flex-wrap gap-1.5 md:justify-center">
              {topicTags.map((tag) => (
                <button
                  key={tag}
                  onClick={handleExploreClick}
                  className="px-3 py-1 rounded-xl text-xs font-bold bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60 transition-all cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-col gap-3 md:items-end">
            <span className="text-xs font-black uppercase text-primary tracking-wider">
              Quick Links
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExploreClick}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Explore Notes
              </button>
              <span className="text-border">•</span>
              <button
                onClick={() => navigate('/signin')}
                className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Author Studio
              </button>
              <span className="text-border">•</span>
              <button
                onClick={scrollToTop}
                className="w-8 h-8 rounded-xl border border-border/80 bg-card hover:border-primary/50 text-foreground flex items-center justify-center cursor-pointer transition-all"
                title="Back to Top"
              >
                <FiArrowUp size={14} />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground font-medium">
          <span>&copy; {year} Notes. All rights reserved.</span>
          <div className="flex items-center gap-2">
            <FiBookOpen size={14} className="text-primary" />
            <span>Learn • Code • Master</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
