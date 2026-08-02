import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiX,
  FiMenu,
  FiSun,
  FiMoon,
  FiFileText,
  FiCommand,
  FiBookOpen,
  FiCheckCircle,
  FiHome,
  FiSearch,
  FiShare2,
} from "react-icons/fi";
import { useToast } from "../Toaster.jsx";

export default function TrackHeader({
  blog,
  currentSlideIndex,
  slidesCount,
  slides = [],
  onSelectSlide,
  visitedSlides = new Set(),
  onDownload,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const [menuOpen, setMenuOpen] = useState(false);
  const [showKeymap, setShowKeymap] = useState(false);
  const [outlineQuery, setOutlineQuery] = useState("");
  const [visible, setVisible] = useState(true);
  const headerRef = useRef(null);
  const lastScrollY = useRef(0);

  const progressPercent = Math.round(
    ((currentSlideIndex + 1) / Math.max(1, slidesCount)) * 100
  );

  // Auto-hide top button on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 15 && currentScrollY > 50) {
        setVisible(false);
        setMenuOpen(false); // Close menu if scrolling down
      } else if (currentScrollY < lastScrollY.current - 10 || currentScrollY < 30) {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Robust click outside & escape listener
  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (e) => {
      if (e.target && !document.contains(e.target)) return;
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setShowKeymap(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div ref={headerRef} className="no-print">
      {/* Top Thin Progress Line */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-border/20 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-primary to-cyan-400 shadow-[0_0_10px_var(--neon-glow)]"
        />
      </div>

      {/* Simple Floating Hamburger Icon Only (No Text) */}
      <motion.button
        initial={false}
        animate={{
          y: visible ? 0 : -60,
          opacity: visible ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        onClick={() => setMenuOpen((prev) => !prev)}
        className={`fixed top-4 left-4 md:left-6 z-50 w-11 h-11 rounded-2xl border flex items-center justify-center cursor-pointer transition-colors duration-200 shadow-[0_10px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl ${
          menuOpen
            ? "bg-primary text-black border-primary shadow-[0_0_16px_var(--neon-glow)]"
            : "bg-card/90 text-foreground border-border/80 hover:border-primary/60 hover:bg-card"
        }`}
        title={menuOpen ? "Close Menu" : "Open Reader Menu"}
      >
        {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </motion.button>

      {/* Clean Floating Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-16 left-4 md:left-6 right-4 md:right-auto md:w-[460px] z-50 bg-card/95 backdrop-blur-2xl border border-border/90 rounded-3xl p-5 shadow-[0_24px_60px_rgba(0,0,0,0.4)] max-h-[82vh] overflow-y-auto flex flex-col gap-4"
          >
            {/* Track Title & Author */}
            <div className="flex flex-col gap-2 pb-3 border-b border-border/80">
              <span className="text-[10px] font-black uppercase text-primary tracking-wider">
                Track Overview
              </span>
              <h3 className="font-heading font-extrabold text-base md:text-lg text-foreground leading-snug">
                {blog?.title || "Educational Track"}
              </h3>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-2">
                  <img
                    src={
                      blog?.authorAvatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
                    }
                    alt="Author"
                    className="w-5 h-5 rounded-full object-cover border border-primary"
                  />
                  <strong className="text-foreground">{blog?.authorName || "Phaneendra"}</strong>
                </span>

                <span className="font-bold text-foreground">
                  Slide <strong className="text-primary">{currentSlideIndex + 1}</strong> of {slidesCount} ({progressPercent}%)
                </span>
              </div>
            </div>

            {/* Reader Action Controls */}
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-border/80">
              {/* Back to Home */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/");
                }}
                className="p-2.5 rounded-xl border border-border bg-background/80 text-xs font-bold text-foreground hover:border-primary/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiHome size={14} className="text-primary" /> Home
              </button>

              {/* Theme Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTheme(isDark ? "light" : "dark");
                }}
                className="p-2.5 rounded-xl border border-border bg-background/80 text-xs font-bold text-foreground hover:border-primary/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDark ? (
                  <FiSun size={14} className="text-amber-400" />
                ) : (
                  <FiMoon size={14} className="text-indigo-400" />
                )}
                <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
              </button>

              {/* Keyboard Shortcuts */}
              <button
                onClick={() => {
                  setShowKeymap(true);
                  setMenuOpen(false);
                }}
                className="p-2.5 rounded-xl border border-border bg-background/80 text-xs font-bold text-foreground hover:border-primary/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiCommand size={14} className="text-primary" /> Shortcuts
              </button>

              {/* Export PDF */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDownload();
                  toast({ title: "Opening PDF Export Dialog...", variant: "success" });
                }}
                className="p-2.5 rounded-xl border border-border bg-background/80 text-xs font-bold text-foreground hover:border-primary/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FiFileText size={14} className="text-cyan-400" /> Export PDF
              </button>

              {/* Share / Copy Link */}
              <button
                onClick={async () => {
                  const shareUrl = window.location.href;
                  const shareData = {
                    title: blog?.title || "Kadha Note",
                    text: blog?.excerpt || `Check out "${blog?.title}" on Kadha Notes`,
                    url: shareUrl,
                  };

                  try {
                    if (navigator.share && navigator.canShare?.(shareData)) {
                      await navigator.share(shareData);
                      toast({ title: "Shared successfully!", variant: "success" });
                    } else {
                      await navigator.clipboard.writeText(shareUrl);
                      toast({ title: "Link copied to clipboard!", variant: "success" });
                    }
                  } catch (err) {
                    if (err.name !== "AbortError") {
                      try {
                        await navigator.clipboard.writeText(shareUrl);
                        toast({ title: "Link copied to clipboard!", variant: "success" });
                      } catch {
                        toast({ title: "Unable to share", variant: "destructive" });
                      }
                    }
                  }
                  setMenuOpen(false);
                }}
                className="p-2.5 rounded-xl border border-border bg-background/80 text-xs font-bold text-foreground hover:border-primary/50 transition-all flex items-center justify-center gap-2 cursor-pointer col-span-2"
              >
                <FiShare2 size={14} className="text-emerald-400" /> Share Note
              </button>
            </div>

            {/* Slide Outline Navigation with Live Filter */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-black uppercase text-primary tracking-wider mb-1">
                <span className="flex items-center gap-1.5">
                  <FiBookOpen size={14} /> Slide Outline ({slides.length})
                </span>
                <span className="text-muted-foreground font-normal lowercase">Click to jump</span>
              </div>

              {/* Outline Filter Input */}
              <div className="relative mb-1">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Filter slides by title..."
                  value={outlineQuery}
                  onChange={(e) => setOutlineQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-background border border-border/80 text-foreground outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5 max-h-[260px] overflow-y-auto pr-1">
                {slides
                  .map((s, idx) => ({ s, idx }))
                  .filter(({ s }) =>
                    !outlineQuery.trim() ||
                    (s.title || "").toLowerCase().includes(outlineQuery.toLowerCase())
                  )
                  .map(({ s, idx }) => {
                    const active = idx === currentSlideIndex;
                    const isVisited = visitedSlides.has(idx);

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectSlide(idx);
                          setMenuOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all duration-150 cursor-pointer ${
                          active
                            ? "bg-primary/15 border-primary text-foreground font-extrabold shadow-[0_0_10px_var(--neon-glow)]"
                            : "bg-background/60 hover:bg-muted border-border/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-extrabold shrink-0 ${
                            active
                              ? "bg-primary text-black"
                              : isVisited
                              ? "bg-primary/20 text-primary border border-primary/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isVisited && !active ? <FiCheckCircle size={12} /> : idx + 1}
                        </span>
                        <span className="text-xs truncate font-medium flex-1">
                          {s.title}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeymap && (
          <div
            onClick={() => setShowKeymap(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-2xl flex flex-col gap-4"
            >
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-extrabold text-base text-foreground flex items-center gap-2">
                  <FiCommand className="text-primary" /> Keyboard Shortcuts
                </h3>
                <button
                  onClick={() => setShowKeymap(false)}
                  className="p-1 rounded-lg hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  <FiX size={16} />
                </button>
              </div>

              <div className="flex flex-col gap-2.5 text-xs text-foreground">
                <div className="flex justify-between items-center p-2 rounded-xl bg-muted/40">
                  <span>Next Slide</span>
                  <kbd className="px-2 py-1 rounded-md bg-card border border-border font-mono text-[10px] font-bold">→</kbd>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-muted/40">
                  <span>Previous Slide</span>
                  <kbd className="px-2 py-1 rounded-md bg-card border border-border font-mono text-[10px] font-bold">←</kbd>
                </div>
                <div className="flex justify-between items-center p-2 rounded-xl bg-muted/40">
                  <span>Toggle Menu</span>
                  <kbd className="px-2 py-1 rounded-md bg-card border border-border font-mono text-[10px] font-bold">Esc</kbd>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
