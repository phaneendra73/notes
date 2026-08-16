import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Sun, Moon, List, Home,
  Share2, CheckCircle2, BookOpen, Maximize, HelpCircle,
} from "lucide-react";
import { useToast } from "../ui/Toast.jsx";

export default function ReaderNavbar({
  lesson,
  currentSlideIndex,
  totalSlides,
  slides = [],
  onSelectSlide,
  onToggleFullscreen,
  onOpenHelp,
  visitedSlides = new Set(),
}) {
  const navigate = useNavigate();
  const toast    = useToast();
  const { theme, setTheme } = useTheme();
  const isDark   = theme === "dark";

  const [outlineOpen, setOutlineOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  const progress = Math.round(((currentSlideIndex + 1) / Math.max(1, totalSlides)) * 100);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY.current + 15 && y > 50) { setVisible(false); setOutlineOpen(false); }
      else if (y < lastScrollY.current - 10 || y < 30) { setVisible(true); }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: lesson?.title || "Notes", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).then(() => toast.success("Note link copied to clipboard!"));
    }
  };

  const navBtn = "p-2 sm:px-3 sm:py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-semibold cursor-pointer transition-colors hover:border-[var(--line-strong)] hover:text-[var(--accent)] flex items-center justify-center";

  return (
    <>
      <motion.header
        animate={{ y: visible ? 0 : -80 }}
        transition={{ duration: 0.2 }}
        className="sticky top-0 z-50 w-full bg-[var(--surface)] border-b border-[var(--line)] shadow-[var(--shadow-sm)]"
      >
        <div className="max-w-[var(--maxw)] mx-auto px-4 sm:px-6 h-[var(--header-h)] flex items-center justify-between gap-4">
          {/* Left: Catalog Back + Lesson Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button className={navBtn} onClick={() => navigate("/")} title="Back to Catalog">
              <Home size={15} />
            </button>
            <h2 className="font-serif font-bold text-sm sm:text-base text-[var(--ink)] truncate max-w-xs sm:max-w-md md:max-w-xl">
              {lesson?.title || "Loading Study Notes..."}
            </h2>
          </div>

          {/* Center: Progress Counter, Estimate & Bar */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono font-bold text-[var(--accent)]">
              Slide {currentSlideIndex + 1} of {totalSlides}
            </span>
            <div className="w-28 h-2 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--line)] overflow-hidden p-[1px]">
              <div className="h-full bg-[var(--accent)] rounded-[var(--radius-sm)] transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-[11px] font-medium text-[var(--muted)] pl-1">
              ~{Math.max(1, Math.ceil((totalSlides - currentSlideIndex) * 1.5))}m left
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button className={navBtn} onClick={onOpenHelp} title="Keyboard Shortcuts (?)">
              <HelpCircle size={15} className="text-[var(--accent)]" />
            </button>

            <button className={navBtn} onClick={onToggleFullscreen} title="Toggle Fullscreen (F)">
              <Maximize size={15} />
            </button>

            <button className={navBtn} onClick={() => setTheme(isDark ? "light" : "dark")} title="Toggle Theme">
              {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-[var(--ink-2)]" />}
            </button>

            <button className={navBtn} onClick={handleShare} title="Share Note">
              <Share2 size={15} />
            </button>

            <button
              className={`${navBtn} ${outlineOpen ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-soft)]" : ""}`}
              onClick={() => setOutlineOpen((o) => !o)}
              title="Slide Index Outline"
            >
              {outlineOpen ? <X size={15} /> : <List size={15} />}
            </button>
          </div>
        </div>

        {/* Top Progress Line Accent */}
        <div className="w-full h-[2px] bg-[var(--surface-2)] relative overflow-hidden">
          <div className="h-full bg-[var(--accent)] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </motion.header>

      {/* Slide Outline Drawer */}
      <AnimatePresence>
        {outlineOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-4 z-60 w-80 max-h-[28rem] rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-lg)] flex flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between p-3.5 border-b border-[var(--line)] font-bold text-xs">
              <span className="flex items-center gap-2 text-[var(--ink)]">
                <BookOpen size={15} className="text-[var(--accent)]" /> Table of Contents
              </span>
              <button onClick={() => setOutlineOpen(false)} className="bg-transparent border-none text-[var(--muted)] cursor-pointer hover:text-[var(--ink)]">
                <X size={15} />
              </button>
            </div>
            <div className="p-2 overflow-y-auto flex flex-col gap-1">
              {slides.map((slide, idx) => {
                const visited = visitedSlides.has(idx);
                const active  = idx === currentSlideIndex;
                return (
                  <button
                    key={slide.id || idx}
                    onClick={() => { onSelectSlide(idx); setOutlineOpen(false); }}
                    className={`w-full p-2.5 rounded-[var(--radius-md)] border text-xs font-semibold text-left flex items-center gap-2.5 transition-colors cursor-pointer ${
                      active
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold"
                        : visited
                        ? "border-transparent bg-transparent text-[var(--ink)] hover:bg-[var(--surface-2)]"
                        : "border-transparent bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)]"
                    }`}
                  >
                    <span className="font-mono text-[11px] w-4 shrink-0 text-[var(--accent)] font-bold">{idx + 1}</span>
                    <span className="flex-1 truncate">{slide.title || `Slide ${idx + 1}`}</span>
                    {visited && !active && <CheckCircle2 size={13} className="text-[var(--accent)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawer Backdrop */}
      <AnimatePresence>
        {outlineOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 bg-black/40 backdrop-blur-xs"
            onClick={() => setOutlineOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
