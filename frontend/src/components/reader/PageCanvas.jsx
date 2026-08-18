import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import BlockRenderer from "../blocks/BlockRenderer.jsx";
import ImageZoomModal from "./ImageZoomModal.jsx";
import { Sliders, ChevronRight, ChevronLeft, BookOpen, Heart, Coffee, Share2 } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────────
 * TRANSITION PHILOSOPHY
 *
 * Inspired by the spatial continuity of Linear, the material depth of Apple
 * interfaces, and the crisp immediacy of Vercel dashboards.
 *
 * The transition is designed as a **single cohesive motion sequence**:
 *
 *   EXIT:  Current page fades and drifts away from the navigation direction.
 *   ENTER: New page slides in from the navigation direction with a subtle scale.
 *
 * Timing:  Exit ~160ms, Enter ~260ms. Crisp and immediate.
 * Easing:  Exit: [0.32, 0, 0.67, 0], Enter: [0.16, 1, 0.3, 1]
 * ──────────────────────────────────────────────────────────────────────────── */

const SHIFT_PX = 24;

const pageVariants = {
  initial: (dir) => ({
    x: dir > 0 ? SHIFT_PX : -SHIFT_PX,
    opacity: 0,
    scale: 0.99,
  }),
  animate: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.26,
      ease: [0.16, 1, 0.3, 1],
    },
  },
  exit: (dir) => ({
    x: dir > 0 ? -SHIFT_PX * 0.5 : SHIFT_PX * 0.5,
    opacity: 0,
    scale: 0.99,
    transition: {
      duration: 0.16,
      ease: [0.32, 0, 0.67, 0],
    },
  }),
};

// For users with prefers-reduced-motion: instant crossfade, no spatial movement
const reducedMotionVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.15 } },
  exit:    { opacity: 0, transition: { duration: 0.1 } },
};

export default function PageCanvas({
  note,
  page,
  pageIndex = 0,
  totalPages = 1,
  direction = 1,
  onNext,
  onPrev,
}) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const touchStartX = useRef(null);
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const count = totalPages || 1;

  const activeVariants = prefersReducedMotion ? reducedMotionVariants : pageVariants;

  // Scroll to top when page changes — instant, no scroll animation
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pageIndex]);

  // Touch swipe handling (ignore on code blocks / scrollable areas)
  const handleTouchStart = (e) => {
    if (e.target.closest("pre") || e.target.closest(".overflow-x-auto")) return;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dist = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dist) > 50) {
      if (dist > 0) onNext?.();
      else onPrev?.();
    }
    touchStartX.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-4xl mx-auto relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={pageIndex}
          custom={direction}
          variants={activeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ willChange: "transform, opacity" }}
          className="relative p-4 sm:p-8 md:p-12 rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.2),0_8px_24px_rgba(0,0,0,0.25)] overflow-hidden min-h-[480px] flex flex-col justify-between"
        >
          <div>
            {/* Page Header — compact, unobtrusive */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono font-semibold text-[var(--accent)]">
                <Sliders size={13} /> Page {pageIndex + 1} of {count}
              </span>

              {/* Keyboard hint — desktop only */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] text-[11px] font-mono text-[var(--muted)]">
                <kbd className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--line)] font-bold text-[10px] text-[var(--ink-2)]">←</kbd>
                <kbd className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--line)] font-bold text-[10px] text-[var(--ink-2)]">→</kbd>
                <span className="ml-0.5">to navigate</span>
              </div>
            </div>

            {/* Note Overview / Excerpt (first page only) */}
            {pageIndex === 0 && note?.excerpt && (
              <div className="mb-5 sm:mb-6 p-4 sm:p-5 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-2)]/60 text-[13.5px] sm:text-sm leading-relaxed shadow-[var(--shadow-sm)]">
                <div className="flex items-center gap-2 mb-1.5 font-serif font-bold text-xs uppercase tracking-wider text-[var(--accent)]">
                  <BookOpen size={14} />
                  <span>Note Overview</span>
                </div>
                <p className="m-0 text-[var(--ink-2)] font-sans leading-relaxed">
                  {note.excerpt}
                </p>
              </div>
            )}

            {/* Page Title */}
            {page?.title && (
              <h1 className="font-serif font-bold text-xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-tight leading-[1.2] mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-[var(--line)]">
                {page.title}
              </h1>
            )}

            {/* Page Blocks */}
            <div className="page-blocks text-[var(--ink)] space-y-5 sm:space-y-6 font-sans">
              <BlockRenderer
                blocks={page?.blocks}
                onImageClick={(src) => setZoomedImage(src)}
              />
            </div>

            {/* Final Page Author Support & Completion Card */}
            {pageIndex === count - 1 && count > 0 && (
              <div className="mt-12 sm:mt-16 pt-8 border-t border-[var(--line)] space-y-6">
                <div className="p-6 sm:p-8 rounded-[var(--radius-xl)] bg-gradient-to-b from-[var(--surface-2)]/80 to-[var(--surface-2)]/40 border border-[var(--line)] shadow-sm text-center space-y-5">
                  <div className="w-12 h-12 rounded-full bg-pink-500/15 border border-pink-500/30 flex items-center justify-center mx-auto text-pink-500">
                    <Heart size={22} className="fill-current animate-pulse" />
                  </div>

                  <div className="max-w-lg mx-auto space-y-1.5">
                    <h3 className="font-serif font-bold text-lg sm:text-2xl text-[var(--ink)]">
                      Support Free & Open Engineering Notes
                    </h3>
                    <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed font-normal">
                      These interactive visual notes are crafted to make complex software engineering, .NET, and system design intuitive and free for everyone. If this helped you, consider sponsoring or buying me a coffee!
                    </p>
                  </div>

                  {/* Dual Support Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    {/* GitHub Sponsors Button */}
                    <a
                      href="https://github.com/sponsors/phaneendramarri"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-[#db61a2] hover:bg-[#c94a90] text-white font-bold text-xs transition-all shadow-sm hover:scale-105"
                    >
                      <Heart size={15} className="fill-white" />
                      <span>Sponsor on GitHub</span>
                    </a>

                    {/* Buy Me a Coffee Button */}
                    <a
                      href="https://buymeacoffee.com/phaneendramarri"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-md)] bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-sm hover:scale-105"
                    >
                      <Coffee size={15} />
                      <span>Buy Me a Coffee</span>
                    </a>

                    {/* Share Button */}
                    <button
                      onClick={() => {
                        const url = window.location.href;
                        if (navigator.share) {
                          navigator.share({ title: note?.title || "Notes", url }).catch(() => {});
                        } else {
                          navigator.clipboard.writeText(url);
                          alert("Note link copied to clipboard!");
                        }
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-md)] bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] font-semibold text-xs hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer shadow-2xs"
                    >
                      <Share2 size={14} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Bottom Navigation */}
          <div className="mt-6 pt-5 border-t border-[var(--line)] flex items-center justify-between md:hidden">
            <button
              onClick={onPrev}
              disabled={pageIndex === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--accent)] disabled:opacity-35 disabled:text-[var(--muted)] disabled:cursor-not-allowed transition-colors font-semibold text-xs cursor-pointer"
            >
              <ChevronLeft size={16} /> Prev
            </button>

            <span className="font-mono text-xs font-bold text-[var(--ink)]">
              {pageIndex + 1} / {count}
            </span>

            <button
              onClick={onNext}
              disabled={pageIndex === count - 1}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--accent)] disabled:opacity-35 disabled:text-[var(--muted)] disabled:cursor-not-allowed transition-colors font-semibold text-xs cursor-pointer"
            >
              Next <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {zoomedImage && (
        <ImageZoomModal
          src={zoomedImage}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </div>
  );
}
