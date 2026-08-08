import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button.jsx';
import kadhaLogo from '../../assets/kadha.svg';
import {
  FiEdit3, FiLogOut, FiSettings, FiTag,
  FiLogIn, FiBookOpen, FiSun, FiMoon,
  FiMenu, FiX, FiUser,
} from 'react-icons/fi';

/**
 * Navbar — sticky top navigation bar (renamed from Appbar).
 */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const isAuthenticated = Boolean(localStorage.getItem('jwt'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('jwt');
    navigate('/');
    setMobileOpen(false);
  };

  const navLinks = [
    { to: '/', icon: FiBookOpen, label: 'Explore' },
    ...(isAuthenticated
      ? [
          { to: '/profile', icon: FiUser, label: 'Profile' },
          { to: '/studio', icon: FiSettings, label: 'Studio' },
          { to: '/tags', icon: FiTag, label: 'Tags' },
        ]
      : []),
  ];

  const handleNavClick = (to) => {
    if (to === '/' && location.pathname === '/') {
      document.getElementById('notes-section')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(to);
    }
    setMobileOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-xs"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-emerald-400 to-cyan-400 p-[1px] shadow-[0_0_15px_var(--neon-glow)] group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-card rounded-[11px] flex items-center justify-center p-1.5">
                <img src={kadhaLogo} alt="Kadha" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-heading font-extrabold text-base md:text-lg text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                Notes<span className="text-primary font-black ml-1">.io</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                Tech & Engineering
              </span>
            </div>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1.5 ml-2">
            {navLinks.map((n) => {
              const active = location.pathname === n.to;
              const Icon = n.icon;
              return (
                <button
                  key={n.to}
                  onClick={() => handleNavClick(n.to)}
                  className={`px-3.5 py-1.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    active
                      ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_var(--neon-glow)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                  }`}
                >
                  <Icon size={15} /> {n.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-9 h-9 rounded-xl border border-border/80 bg-card/80 flex items-center justify-center hover:border-primary/50 transition-all cursor-pointer"
            title="Toggle theme"
          >
            {isDark ? <FiSun size={17} className="text-amber-400" /> : <FiMoon size={17} className="text-indigo-400" />}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="neon" size="sm" className="gap-1.5 rounded-xl text-xs" onClick={() => navigate('/editor')}>
                <FiEdit3 size={14} /> New Note
              </Button>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-1.5 rounded-xl text-xs text-red-500 hover:bg-red-500/10">
                <FiLogOut size={14} /> Sign Out
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => navigate('/signin')} className="hidden md:flex rounded-xl text-xs font-extrabold gap-1.5">
              <FiLogIn size={14} className="text-primary" /> Sign In
            </Button>
          )}

          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden w-9 h-9 rounded-xl border border-border/80 bg-card/80 flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all"
          >
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-border/80 bg-card/95 backdrop-blur-xl"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map((n) => {
                const active = location.pathname === n.to;
                const Icon = n.icon;
                return (
                  <button
                    key={n.to}
                    onClick={() => handleNavClick(n.to)}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                      active ? 'bg-primary/15 text-primary border border-primary/30' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon size={16} /> {n.label}
                  </button>
                );
              })}
              <div className="pt-2 mt-1 border-t border-border/60 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button variant="neon" size="sm" className="rounded-xl gap-2 justify-center" onClick={() => { navigate('/editor'); setMobileOpen(false); }}>
                      <FiEdit3 size={14} /> New Note
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="rounded-xl gap-2 text-red-500 justify-center">
                      <FiLogOut size={14} /> Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => { navigate('/signin'); setMobileOpen(false); }} className="rounded-xl gap-2 justify-center">
                    <FiLogIn size={14} className="text-primary" /> Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
