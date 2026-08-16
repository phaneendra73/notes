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

export default function SlideCanvas({ slide, slideIndex, totalSlides = 1, direction = 1, onNext, onPrev }) {
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
      className="w-full max-w-4xl mx-auto relative select-none"
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
          className="relative p-6 sm:p-10 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-md)] overflow-hidden min-h-[420px] flex flex-col justify-between"
        >
          <div>
            {/* Slide Header Telemetry */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[var(--line)] text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] border border-[var(--accent-soft)] text-[var(--accent)] font-semibold uppercase tracking-wider text-[11px]">
                <Sliders size={13} />
                <span>Slide {slideIndex + 1} of {totalSlides}</span>
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 text-[var(--muted)] font-mono text-[11px]">
                Swipe or press <kbd className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--line)] text-[10px] font-mono font-bold text-[var(--accent)]">←</kbd> <kbd className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--line)] text-[10px] font-mono font-bold text-[var(--accent)]">→</kbd>
              </span>
            </div>

            {/* Slide Title - Serif Fraunces Display */}
            {slide?.title && (
              <h1 className="font-serif font-bold text-2xl sm:text-3xl lg:text-4xl text-[var(--ink)] tracking-tight leading-tight mb-8 pb-4 border-b border-[var(--line)]">
                {slide.title}
              </h1>
            )}

            {/* Slide Blocks Rendering */}
            <div className="slide-blocks text-[var(--ink)] space-y-6 font-sans">
              <BlockRenderer
                blocks={slide?.blocks}
                onImageClick={(src) => setZoomedImage(src)}
              />
            </div>
          </div>

          {/* Touch Side Tap Indicators for Mobile */}
          <div className="mt-8 pt-4 border-t border-[var(--line)] flex items-center justify-between md:hidden text-xs text-[var(--muted)] font-semibold">
            <button
              onClick={onPrev}
              disabled={slideIndex === 0}
              className="flex items-center gap-1 text-[var(--accent)] disabled:opacity-30 disabled:text-[var(--muted)] cursor-pointer"
            >
              <ChevronLeft size={16} /> Prev Slide
            </button>

            <span className="font-mono text-[11px] text-[var(--ink)]">
              {slideIndex + 1} / {totalSlides}
            </span>

            <button
              onClick={onNext}
              disabled={slideIndex === totalSlides - 1}
              className="flex items-center gap-1 text-[var(--accent)] disabled:opacity-30 disabled:text-[var(--muted)] cursor-pointer"
            >
              Next Slide <ChevronRight size={16} />
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
