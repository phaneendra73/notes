import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlockRenderer from "../blocks/BlockRenderer.jsx";
import ImageZoomModal from "./ImageZoomModal.jsx";
import { Sliders, Maximize2, ChevronRight, ChevronLeft } from "lucide-react";

const slideVariants = {
  initial: (dir) => ({ x: dir > 0 ? 30 : -30, opacity: 0 }),
  animate: { x: 0, opacity: 1, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({
    x: dir > 0 ? -30 : 30,
    opacity: 0,
    transition: { duration: 0.18, ease: "easeIn" },
  }),
};

export default function SlideCanvas({ lesson, slide, slideIndex, totalSlides = 1, direction = 1, onNext, onPrev }) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const touchStartX = useRef(null);
  const containerRef = useRef(null);

  // Scroll to top when slide changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
    // Also scroll window to top as fallback
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [slideIndex]);

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
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={slideIndex}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative p-4 sm:p-8 md:p-12 rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-lg)] overflow-hidden min-h-[480px] flex flex-col justify-between"
        >
          <div>
            {/* Slide Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              {/* Slide Counter */}
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] text-xs font-mono font-semibold text-[var(--accent)]">
                <Sliders size={13} /> Slide {slideIndex + 1} of {totalSlides}
              </span>

              {/* Keyboard Shortcuts Hint */}
              <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] text-[11px] font-mono text-[var(--muted)]">
                <span>Press</span>
                <kbd className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-on)] font-bold text-[10px]">←</kbd>
                <span>or</span>
                <kbd className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-on)] font-bold text-[10px]">→</kbd>
                <span>to navigate</span>
              </div>
            </div>

            {/* Note Overview / Excerpt (Slide 1 Intro) */}
            {slideIndex === 0 && lesson?.excerpt && (
              <div className="mb-5 sm:mb-6 p-4 sm:p-5 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-2)]/60 text-[13.5px] sm:text-sm leading-relaxed shadow-[var(--shadow-sm)]">
                <div className="flex items-center gap-2 mb-1.5 font-serif font-bold text-xs uppercase tracking-wider text-[var(--accent)]">
                  <span>💡</span>
                  <span>Note Overview</span>
                </div>
                <p className="m-0 text-[var(--ink-2)] font-sans leading-relaxed">
                  {lesson.excerpt}
                </p>
              </div>
            )}

            {/* Slide Title */}
            {slide?.title && (
              <h1 className="font-serif font-bold text-xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-tight leading-[1.2] mb-5 sm:mb-6 pb-3 sm:pb-4 border-b border-[var(--line)]">
                {slide.title}
              </h1>
            )}

            {/* Slide Blocks Rendering */}
            <div className="slide-blocks text-[var(--ink)] space-y-5 sm:space-y-6 font-sans">
              <BlockRenderer
                blocks={slide?.blocks}
                onImageClick={(src) => setZoomedImage(src)}
              />
            </div>
          </div>

          {/* Touch Side Tap Indicators for Mobile */}
          <div className="mt-6 pt-5 border-t border-[var(--line)] flex items-center justify-between md:hidden">
            <button
              onClick={onPrev}
              disabled={slideIndex === 0}
              className="flex items-center gap-2 text-[var(--accent)] disabled:opacity-40 disabled:text-[var(--muted)] disabled:cursor-not-allowed transition-colors font-semibold text-xs"
            >
              <ChevronLeft size={18} /> Previous
            </button>

            <span className="font-mono text-xs font-bold text-[var(--ink)]">
              {slideIndex + 1} / {totalSlides}
            </span>

            <button
              onClick={onNext}
              disabled={slideIndex === totalSlides - 1}
              className="flex items-center gap-2 text-[var(--accent)] disabled:opacity-40 disabled:text-[var(--muted)] disabled:cursor-not-allowed transition-colors font-semibold text-xs"
            >
              Next <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>

      {zoomedImage && (
        <ImageZoomModal src={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </div>
  );
}
