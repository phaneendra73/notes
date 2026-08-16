import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Home, Edit2, Printer, HelpCircle } from "lucide-react";

export default function ReaderDock({
  currentSlideIndex,
  totalSlides,
  onNext,
  onPrev,
  onGoToSlide,
  onOpenHelp,
  lessonId,
  isAuthenticated = false,
}) {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastScrollY.current + 15 && y > 50) setVisible(false);
      else if (y < lastScrollY.current - 10 || y < 30) setVisible(true);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isFirst = currentSlideIndex === 0;
  const isLast  = currentSlideIndex >= totalSlides - 1;

  const btnBase = "p-2 sm:px-3.5 sm:py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed shadow-[var(--shadow-sm)]";

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <motion.div
        animate={{ y: visible ? 0 : 80, opacity: visible ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-auto flex items-center gap-2 p-2.5 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
      >
        <button className={btnBase} onClick={() => navigate("/")} title="Back to Catalog">
          <Home size={16} />
        </button>

        <div className="w-[1px] h-5 bg-[var(--line)]" />

        <button className={btnBase} disabled={isFirst} onClick={onPrev} title="Previous slide (←)">
          <ChevronLeft size={18} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Counter */}
        <div className="px-3 text-xs font-mono font-bold text-[var(--ink)] flex items-center gap-1">
          <span className="text-[var(--accent)] font-bold text-sm">{currentSlideIndex + 1}</span>
          <span className="text-[var(--muted)]">/</span>
          <span>{totalSlides}</span>
        </div>

        <button className={btnBase} disabled={isLast} onClick={onNext} title="Next slide (→)">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight size={18} />
        </button>

        <div className="w-[1px] h-5 bg-[var(--line)]" />

        <button className={btnBase} onClick={onOpenHelp} title="Keyboard Shortcuts (?)">
          <HelpCircle size={16} className="text-[var(--accent)]" />
        </button>

        {isAuthenticated && lessonId && (
          <button className={btnBase} onClick={() => navigate(`/editor?id=${lessonId}`)} title="Edit Lesson">
            <Edit2 size={16} />
          </button>
        )}

        <button className={btnBase} onClick={() => window.print()} title="Print / Export PDF">
          <Printer size={16} />
        </button>
      </motion.div>
    </div>
  );
}
