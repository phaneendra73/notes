import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button.jsx';
import kadhaLogo from '../../assets/kadha.svg';
import {
  Edit3, LogOut, Settings, Tag,
  Sun, Moon, Menu, X, User,
  Search, BookOpen, Lock, Sparkles
} from 'lucide-react';
import { FaGithub } from 'react-icons/fa';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const isAuthenticated = Boolean(localStorage.getItem('jwt'));
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sync body.dark-theme class for exact design system compliance
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  const handleSignOut = () => {
    localStorage.removeItem('jwt');
    navigate('/');
    setMobileOpen(false);
  };

  const handleNavClick = (to) => {
    navigate(to);
    setMobileOpen(false);
  };

  const handleSearchTrigger = () => {
    if (location.pathname === '/') {
      const searchInput = document.querySelector('input[type="search"], input[placeholder*="Search"]');
      if (searchInput) {
        searchInput.focus();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      navigate('/?focus=search');
    }
    setMobileOpen(false);
  };

  const authorNavLinks = [
    { to: '/studio', icon: Settings, label: 'Studio' },
    { to: '/tags', icon: Tag, label: 'Tags' },
    { to: '/profile', icon: User, label: 'Profile' },
  ];

  const popularTopics = [
    { name: 'C#', tagId: 1 },
    { name: '.NET Core', tagId: 2 },
    { name: 'DSA', tagId: 3 },
    { name: 'SQL', tagId: 4 },
    { name: 'System Design', tagId: 5 },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[var(--surface)]/95 backdrop-blur-md transition-colors duration-[var(--dur)] shadow-[var(--shadow-xs)]">
      <div className="max-w-[var(--maxw)] mx-auto px-4 sm:px-6 h-[var(--header-h)] flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Left: Brand Logo & Badges */}
        <div className="flex items-center gap-3 lg:gap-5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer group"
          >
            <div className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-[var(--radius-md)] bg-gradient-to-br from-[var(--accent-soft)] to-[var(--surface-2)] border border-[var(--line)] p-1 flex items-center justify-center group-hover:border-[var(--accent)] group-hover:scale-105 transition-all shadow-[var(--shadow-xs)]">
              <img src={kadhaLogo} alt="Notes" className="w-full h-full object-contain" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif font-bold text-xl sm:text-2xl text-[var(--ink)] tracking-tight group-hover:text-[var(--accent)] transition-colors">
                Notes<span className="text-[var(--accent)]">.</span>
              </span>
            </div>
          </button>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.75 rounded-full text-[10px] font-mono font-medium bg-[var(--surface-2)] text-[var(--ink-2)] border border-[var(--line)] shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Interactive Decks
          </span>

          {/* Primary Navigation for Guests */}
          <nav className="hidden lg:flex items-center gap-1 ml-1 pl-3 border-l border-[var(--line)]">
            <button
              onClick={() => handleNavClick('/')}
              className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                location.pathname === '/'
                  ? 'bg-[var(--surface-2)] text-[var(--ink)] border border-[var(--line)] shadow-xs'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] border border-transparent'
              }`}
            >
              <BookOpen size={13} className="text-[var(--accent)]" />
              <span>Catalog</span>
            </button>

            {/* Authenticated Author Links */}
            {isAuthenticated && authorNavLinks.map((n) => {
              const active = location.pathname === n.to;
              const Icon = n.icon;
              return (
                <button
                  key={n.to}
                  onClick={() => handleNavClick(n.to)}
                  className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] font-bold shadow-xs'
                      : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] border border-transparent'
                  }`}
                >
                  <Icon size={13} className={active ? 'text-[var(--accent-on)]' : 'text-[var(--muted)]'} />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Center: Interactive Search Trigger Button */}
        <div className="flex-1 max-w-xs md:max-w-sm hidden md:flex items-center justify-center">
          <button
            onClick={handleSearchTrigger}
            className="w-full flex items-center justify-between px-3.5 py-1.75 rounded-[var(--radius-lg)] bg-[var(--surface-2)] hover:bg-[var(--surface)] border border-[var(--line)] hover:border-[var(--accent)] text-[var(--muted)] hover:text-[var(--ink)] transition-all cursor-pointer group shadow-xs"
            title="Search notes (Ctrl+K)"
          >
            <div className="flex items-center gap-2 text-xs font-normal">
              <Search size={14} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
              <span className="truncate">Search notes, C#, DSA, SQL…</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface)] text-[var(--muted)] border border-[var(--line)] group-hover:border-[var(--accent-soft)]">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Right: Quick Links, Theme, Auth */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={handleSearchTrigger}
            className="md:hidden w-8.5 h-8.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-all cursor-pointer"
            title="Search notes"
          >
            <Search size={15} />
          </button>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/phaneendramarri/notes"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--accent)] transition-all cursor-pointer group"
            title="GitHub Repository"
          >
            <FaGithub size={14} className="text-[var(--ink-2)] group-hover:text-[var(--ink)] transition-colors" />
            <span className="hidden xl:inline">GitHub</span>
          </a>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-[var(--ink-2)]" />}
          </button>

          {/* Authenticated Author Actions */}
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-1.5">
              <Button
                size="sm"
                className="rounded-[var(--radius-lg)] text-xs font-bold gap-1.5 px-3.5 sm:px-4 cursor-pointer bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] shadow-xs hover:shadow-md"
                onClick={() => navigate('/editor')}
                title="Create New Note (Ctrl+N)"
              >
                <Edit3 size={13} /> <span className="hidden md:inline">New Note</span>
              </Button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-[var(--radius-md)] text-[var(--muted)] hover:text-[var(--err)] hover:bg-[var(--err-soft)] transition-all cursor-pointer"
                title="Sign Out (Ctrl+Q)"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/signin')}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-medium text-[var(--ink-2)] hover:text-[var(--accent)] bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] border border-[var(--line)] hover:border-[var(--accent)] transition-all cursor-pointer"
              title="Author Login"
            >
              <Lock size={12} />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-[var(--radius-md)] text-[var(--ink)] hover:text-[var(--accent)] hover:bg-[var(--surface-2)] transition-all cursor-pointer border border-[var(--line)]"
            title="Toggle Menu"
          >
            {mobileOpen ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-[var(--line)] bg-[var(--surface)] p-4 space-y-4 shadow-lg overflow-hidden"
          >
            {/* Quick Search */}
            <button
              onClick={handleSearchTrigger}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-[var(--radius-lg)] bg-[var(--surface-2)] border border-[var(--line)] text-xs text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Search size={14} className="text-[var(--accent)]" />
                <span>Search engineering notes…</span>
              </div>
              <span className="text-[10px] font-mono bg-[var(--surface)] px-1.5 py-0.5 rounded border border-[var(--line)]">Ctrl+K</span>
            </button>

            {/* Popular Topics Quick Filter */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--muted)]">Popular Subjects</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {popularTopics.map((topic) => (
                  <button
                    key={topic.tagId}
                    onClick={() => {
                      navigate(`/?tag=${topic.tagId}`);
                      setMobileOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--ink-2)] border border-[var(--line)] cursor-pointer transition-colors"
                  >
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="pt-2 border-t border-[var(--line)] flex flex-col gap-1">
              <button
                onClick={() => handleNavClick('/')}
                className="w-full p-2.5 rounded-[var(--radius-md)] text-left text-xs font-semibold flex items-center gap-2.5 hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer"
              >
                <BookOpen size={15} className="text-[var(--accent)]" />
                <span>Explore Catalog</span>
              </button>

              <a
                href="https://github.com/phaneendramarri/notes"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full p-2.5 rounded-[var(--radius-md)] text-left text-xs font-semibold flex items-center gap-2.5 hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer"
              >
                <FaGithub size={15} className="text-[var(--ink-2)]" />
                <span>GitHub Repository</span>
              </a>

              {/* Authenticated Links */}
              {isAuthenticated && (
                <>
                  {authorNavLinks.map((n) => {
                    const Icon = n.icon;
                    return (
                      <button
                        key={n.to}
                        onClick={() => handleNavClick(n.to)}
                        className="w-full p-2.5 rounded-[var(--radius-md)] text-left text-xs font-semibold flex items-center gap-2.5 hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors cursor-pointer"
                      >
                        <Icon size={15} className="text-[var(--accent)]" />
                        <span>{n.label}</span>
                      </button>
                    );
                  })}

                  <div className="pt-2 mt-1 border-t border-[var(--line)] space-y-2">
                    <Button
                      size="sm"
                      className="w-full rounded-[var(--radius-lg)] text-xs font-bold gap-2 bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                      onClick={() => {
                        navigate('/editor');
                        setMobileOpen(false);
                      }}
                    >
                      <Edit3 size={14} /> New Note
                    </Button>
                    <button
                      onClick={handleSignOut}
                      className="w-full text-xs text-[var(--err)] font-semibold flex items-center gap-2 py-2 px-3 rounded-[var(--radius-md)] hover:bg-[var(--err-soft)] transition-colors cursor-pointer"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </>
              )}

              {!isAuthenticated && (
                <div className="pt-2 border-t border-[var(--line)]">
                  <button
                    onClick={() => handleNavClick('/signin')}
                    className="w-full p-2.5 rounded-[var(--radius-md)] text-left text-xs font-semibold flex items-center gap-2.5 bg-[var(--surface-2)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--ink)] transition-colors cursor-pointer"
                  >
                    <Lock size={14} className="text-[var(--accent)]" />
                    <span>Author Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
