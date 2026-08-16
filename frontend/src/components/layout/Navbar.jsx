import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button.jsx';
import kadhaLogo from '../../assets/kadha.svg';
import {
  Edit3, LogOut, Settings, Tag,
  Sun, Moon, Menu, X, User
} from 'lucide-react';

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

  const navLinks = isAuthenticated
    ? [
        { to: '/', label: 'All Notes' },
        { to: '/profile', icon: User, label: 'Profile' },
        { to: '/studio', icon: Settings, label: 'Studio' },
        { to: '/tags', icon: Tag, label: 'Tags' },
      ]
    : [];

  const handleNavClick = (to) => {
    navigate(to);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[var(--surface)] transition-colors duration-[var(--dur)]">
      <div className="max-w-[var(--maxw)] mx-auto px-4 sm:px-6 h-[var(--header-h)] flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--line)] p-1 flex items-center justify-center group-hover:border-[var(--accent)] transition-colors">
              <img src={kadhaLogo} alt="Notes" className="w-full h-full object-contain" />
            </div>
            <span className="font-serif font-bold text-xl text-[var(--ink)] tracking-tight group-hover:text-[var(--accent)] transition-colors">
              Notes<span className="text-[var(--accent)] font-bold">.</span>
            </span>
          </button>

          {/* Authenticated Author Links */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((n) => {
                const active = location.pathname === n.to;
                const Icon = n.icon;
                return (
                  <button
                    key={n.to}
                    onClick={() => handleNavClick(n.to)}
                    className={`px-3 py-1.5 rounded-[var(--radius-md)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)] font-bold'
                        : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] border border-transparent'
                    }`}
                  >
                    {Icon && <Icon size={13} className={active ? 'text-[var(--accent)]' : 'text-[var(--muted)]'} />}
                    <span>{n.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right: Theme Toggle & Author Controls */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Theme Toggle */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-9 h-9 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer"
            title="Toggle Light / Dark Theme"
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-[var(--ink-2)]" />}
          </button>

          {/* When authenticated, show Create Note button & Sign Out */}
          {isAuthenticated && (
            <div className="hidden sm:flex items-center gap-1.5">
              <Button
                size="sm"
                className="rounded-[var(--radius-md)] text-xs font-bold gap-1.5 px-3.5 cursor-pointer bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                onClick={() => navigate('/editor')}
              >
                <Edit3 size={13} /> New Note
              </Button>
              <button
                onClick={handleSignOut}
                className="p-2 rounded-[var(--radius-md)] text-[var(--muted)] hover:text-[var(--err)] hover:bg-[var(--err-soft)] transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle (Only when logged in or on mobile) */}
          {isAuthenticated && (
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-[var(--radius-md)] text-[var(--ink)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Drawer for Authenticated Users */}
      <AnimatePresence>
        {mobileOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden border-t border-[var(--line)] bg-[var(--surface)] p-4 space-y-3"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((n) => {
                const Icon = n.icon;
                return (
                  <button
                    key={n.to}
                    onClick={() => handleNavClick(n.to)}
                    className="w-full p-2.5 rounded-[var(--radius-md)] text-left text-xs font-semibold flex items-center gap-2.5 hover:bg-[var(--surface-2)] text-[var(--ink)] transition-colors"
                  >
                    {Icon && <Icon size={14} className="text-[var(--accent)]" />}
                    <span>{n.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between">
              <Button
                size="sm"
                className="rounded-[var(--radius-md)] text-xs font-bold gap-2 bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                onClick={() => {
                  navigate('/editor');
                  setMobileOpen(false);
                }}
              >
                <Edit3 size={13} /> New Note
              </Button>
              <button
                onClick={handleSignOut}
                className="text-xs text-[var(--err)] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <LogOut size={13} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
