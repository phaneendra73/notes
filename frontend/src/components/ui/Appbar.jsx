import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./Button.jsx";
import {
  FiEdit3,
  FiLogOut,
  FiSettings,
  FiTag,
  FiLogIn,
  FiBookOpen,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiUser,
} from "react-icons/fi";

export default function Appbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const isAuthenticated = Boolean(localStorage.getItem("jwt"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem("jwt");
    navigate("/");
    setMobileOpen(false);
  };

  const navLinks = [
    { to: "/", icon: FiBookOpen, label: "Explore" },
    ...(isAuthenticated
      ? [
          { to: "/profile", icon: FiUser, label: "Profile" },
          { to: "/admin", icon: FiSettings, label: "Studio" },
          { to: "/tags", icon: FiTag, label: "Tags" },
        ]
      : []),
  ];

  const handleNavClick = (to) => {
    if (to === "/") {
      if (location.pathname === "/") {
        const el = document.getElementById("notes-section");
        if (el) el.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/#notes-section");
      }
    } else {
      navigate(to);
    }
  };

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-xs"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          {/* Logo Mark */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 bg-transparent border-none cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-emerald-400 to-cyan-400 p-[1px] shadow-[0_0_15px_var(--neon-glow)] transition-transform duration-200 group-hover:scale-105">
              <div className="w-full h-full bg-card rounded-[11px] flex items-center justify-center p-1.5">
                <img src="/assets/kadha.svg" alt="Kadha Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div className="flex flex-col text-left">
              <span className="font-heading font-extrabold text-base md:text-lg text-foreground tracking-tight leading-none group-hover:text-primary transition-colors">
                Kadha<span className="text-primary font-black ml-1">Notes</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">
                Tech & Engineering
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-2">
            {navLinks.map((n) => {
              const active = location.pathname === n.to;
              const Icon = n.icon;

              return (
                <button
                  key={n.to}
                  onClick={() => handleNavClick(n.to)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                    active
                      ? "bg-primary/15 text-primary border border-primary/30 shadow-[0_0_12px_var(--neon-glow)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon size={15} />
                  <span>{n.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-9 h-9 rounded-xl border border-border/80 bg-card/80 text-foreground flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/80 transition-all duration-200"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <FiSun size={17} className="text-amber-400 transition-transform duration-300 hover:rotate-45" />
            ) : (
              <FiMoon size={17} className="text-indigo-400 transition-transform duration-300 hover:-rotate-12" />
            )}
          </button>

          {/* Authenticated Desktop Actions */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="neon"
                size="sm"
                className="rounded-xl font-extrabold text-xs shadow-sm gap-1.5"
                onClick={() => navigate("/editor")}
              >
                <FiEdit3 size={14} /> New Note
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="rounded-xl text-xs font-bold text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-1.5"
              >
                <FiLogOut size={14} /> Sign Out
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/signin")}
              className="hidden md:flex rounded-xl text-xs font-extrabold border-border hover:border-primary/50 gap-1.5"
            >
              <FiLogIn size={14} className="text-primary" /> Author Sign In
            </Button>
          )}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="md:hidden w-9 h-9 rounded-xl border border-border/80 bg-card/80 text-foreground flex items-center justify-center cursor-pointer hover:border-primary/50 transition-all"
            title="Toggle Menu"
          >
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="md:hidden overflow-hidden border-t border-border/80 bg-card/95 backdrop-blur-xl"
          >
            <div className="p-4 flex flex-col gap-2">
              {navLinks.map((n) => {
                const active = location.pathname === n.to;
                const Icon = n.icon;
                return (
                  <button
                    key={n.to}
                    onClick={() => {
                      handleNavClick(n.to);
                      setMobileOpen(false);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
                      active
                        ? "bg-primary/15 text-primary font-extrabold border border-primary/30"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{n.label}</span>
                  </button>
                );
              })}

              <div className="pt-3 mt-1 border-t border-border/80 flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      variant="neon"
                      size="sm"
                      className="rounded-xl font-extrabold text-xs justify-center gap-2"
                      onClick={() => {
                        navigate("/editor");
                        setMobileOpen(false);
                      }}
                    >
                      <FiEdit3 size={15} /> New Note
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSignOut}
                      className="rounded-xl text-xs font-bold text-red-500 justify-center gap-2"
                    >
                      <FiLogOut size={15} /> Sign Out
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs font-extrabold justify-center gap-2"
                    onClick={() => {
                      navigate("/signin");
                      setMobileOpen(false);
                    }}
                  >
                    <FiLogIn size={15} className="text-primary" /> Author Sign In
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
