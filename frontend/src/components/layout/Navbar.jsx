import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button.jsx';
import kadhaLogo from '../../assets/kadha.svg';
import {
  FiEdit3, FiLogOut, FiSettings, FiTag,
  FiLogIn, FiBookOpen, FiSun, FiMoon,
  FiMenu, FiX, FiUser, FiSearch, FiZap,
} from 'react-icons/fi';

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

  const focusSearch = () => {
    const searchInput = document.querySelector('input[placeholder*="Search"]');
    if (searchInput) {
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      searchInput.focus();
    } else {
      navigate('/');
      setTimeout(() => {
        const input = document.querySelector('input[placeholder*="Search"]');
        if (input) input.focus();
      }, 300);
    }
  };

  return (
    <div className="sticky top-3 z-50 w-full max-w-5xl mx-auto px-4">
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full rounded-full bg-card/85 backdrop-blur-2xl border border-border/80 shadow-[0_12px_40px_rgba(0,0,0,0.35)] hover:border-primary/40 transition-all px-4 sm:px-6 h-14 flex items-center justify-between gap-4 relative overflow-hidden"
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        {/* Brand Logo & Title */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary via-emerald-400 to-teal-400 p-[1.5px] shadow-[0_0_15px_var(--neon-glow)] group-hover:scale-110 transition-transform">
              <div className="w-full h-full bg-card rounded-[10px] flex items-center justify-center p-1">
                <img src={kadhaLogo} alt="Notes" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-heading font-extrabold text-base text-foreground tracking-tight group-hover:text-primary transition-colors flex items-center gap-1">
                Notes<span className="text-primary font-black">.</span>
              </span>
            </div>
          </button>

          {/* Raycast-style Nav Tabs with Gliding Pill */}
          <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-full border border-border/60">
            {navLinks.map((n) => {
              const active = location.pathname === n.to;
              const Icon = n.icon;
              return (
                <button
                  key={n.to}
                  onClick={() => handleNavClick(n.to)}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 transition-colors cursor-pointer z-10 ${
                    active ? 'text-black font-black' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="navTabIndicator"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      className="absolute inset-0 bg-primary rounded-full shadow-[0_0_15px_var(--neon-glow)] -z-10"
                    />
                  )}
                  <Icon size={14} className={active ? 'text-black' : ''} />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Search Shortcut Pill */}
          <button
            onClick={focusSearch}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/80 bg-muted/30 hover:border-primary/50 text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="Search notes"
          >
            <FiSearch size={13} className="text-primary" />
            <span className="text-[11px] font-mono opacity-80">Search...</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-8 h-8 rounded-full border border-border/80 bg-card flex items-center justify-center hover:border-primary/50 hover:shadow-[0_0_10px_var(--neon-glow)] transition-all cursor-pointer text-primary shadow-xs"
            title="Toggle theme"
          >
            {isDark ? <FiSun size={15} /> : <FiMoon size={15} />}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="neon"
                size="sm"
                className="gap-1.5 rounded-full text-xs font-extrabold px-4 py-1.5 shadow-md shadow-primary/20"
                onClick={() => navigate('/editor')}
              >
                <FiEdit3 size={13} /> New Note
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-1 rounded-full text-xs text-red-400 hover:bg-red-500/10 px-3"
              >
                <FiLogOut size={13} /> Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/signin')}
              className="hidden md:flex rounded-full text-xs font-extrabold gap-1.5 px-4 hover:border-primary/50"
            >
              <FiLogIn size={13} className="text-primary" /> Sign In
            </Button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden w-8 h-8 rounded-full border border-border/80 bg-card flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all text-foreground"
          >
            {mobileOpen ? <FiX size={16} /> : <FiMenu size={16} />}
          </button>
        </div>
      </motion.header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border border-border/80 bg-card/95 backdrop-blur-2xl rounded-2xl mt-2 p-4 shadow-2xl"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((n) => {
                const active = location.pathname === n.to;
                const Icon = n.icon;
                return (
                  <button
                    key={n.to}
                    onClick={() => handleNavClick(n.to)}
                    className={`p-3 rounded-xl text-xs font-extrabold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                      active
                        ? 'bg-primary text-black shadow-xs'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon size={16} /> {n.label}
                  </button>
                );
              })}

              <button
                onClick={() => {
                  focusSearch();
                  setMobileOpen(false);
                }}
                className="p-3 rounded-xl text-xs font-extrabold flex items-center gap-2.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
              >
                <FiSearch size={16} className="text-primary" /> Search Library
              </button>

              <div className="pt-3 mt-1 border-t border-border/60 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="neon"
                      size="sm"
                      className="rounded-xl gap-2 justify-center py-2.5 font-extrabold"
                      onClick={() => {
                        navigate('/editor');
                        setMobileOpen(false);
                      }}
                    >
                      <FiEdit3 size={14} /> New Note
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="rounded-xl gap-2 text-red-400 justify-center"
                    >
                      <FiLogOut size={14} /> Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigate('/signin');
                      setMobileOpen(false);
                    }}
                    className="rounded-xl gap-2 justify-center py-2.5 font-extrabold"
                  >
                    <FiLogIn size={14} className="text-primary" /> Sign In
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
