import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiChevronLeft, FiChevronRight, FiHome, FiEdit2 } from "react-icons/fi";

export default function TrackBottomDock({
  blogId,
  slides = [],
  currentSlideIndex,
  slidesCount,
  onPrev,
  onNext,
  onSelectSlide,
}) {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem("jwt"));
  const [jumpOpen, setJumpOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const jumpRef = useRef(null);
  const lastScrollY = useRef(0);

  // Auto-hide bottom dock on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current + 15 && currentScrollY > 50) {
        setVisible(false);
        setJumpOpen(false); // Close jump popup if scrolling down
      } else if (
        currentScrollY < lastScrollY.current - 10 ||
        currentScrollY < 30
      ) {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close Jump To popup when clicking outside
  useEffect(() => {
    if (!jumpOpen) return;
    const handler = (e) => {
      if (e.target && !document.contains(e.target)) return;
      if (jumpRef.current && !jumpRef.current.contains(e.target)) {
        setJumpOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [jumpOpen]);

  return (
    <div className="no-print fixed bottom-6 left-0 right-0 md:right-auto md:left-6 z-[100] flex justify-center pointer-events-none">
      <div
        className={`pointer-events-auto bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl px-3 py-1.5 flex items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-all duration-300 ease-out ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-20 opacity-0 pointer-events-none"
        }`}
      >
        {/* Back to Home Catalog */}
        <button
          onClick={() => navigate("/")}
          className="px-3 py-1.5 rounded-xl border border-border/80 bg-background/80 text-foreground hover:border-primary/50 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer"
          title="Back to Home Catalog"
        >
          <FiHome size={14} className="text-primary" />
          <span className="hidden sm:inline">Home</span>
        </button>

        <div className="w-[1px] h-4 bg-border/60" />

        {/* Previous Slide Button */}
        <button
          disabled={currentSlideIndex === 0}
          onClick={onPrev}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
            currentSlideIndex === 0
              ? "bg-muted/40 text-muted-foreground/40 cursor-not-allowed border border-transparent"
              : "bg-primary text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer active:scale-95"
          }`}
          title="Previous slide (Left Arrow)"
        >
          <FiChevronLeft size={16} />
          <span className="hidden sm:inline">Prev</span>
        </button>

        {/* Slide Counter (Clickable to jump) */}
        <div ref={jumpRef} className="relative">
          <button
            onClick={() => setJumpOpen((v) => !v)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-black text-foreground hover:bg-muted/60 transition-all flex items-center gap-1 cursor-pointer"
            title="Click to jump to slide"
          >
            <span>
              {currentSlideIndex + 1} / {slidesCount}
            </span>
          </button>

          {/* Jump to Slide Popup Menu */}
          {jumpOpen && slides && slides.length > 1 && (
            <div className="absolute bottom-[calc(100%+12px)] left-0 bg-card border border-border/80 rounded-2xl p-2 min-w-[220px] max-w-[280px] max-h-[260px] overflow-y-auto shadow-2xl flex flex-col gap-1 z-50">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectSlide(idx);
                    setJumpOpen(false);
                  }}
                  className={`p-2 rounded-xl text-xs font-bold text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${
                    idx === currentSlideIndex
                      ? "bg-primary/15 text-primary font-black border border-primary/30"
                      : "text-foreground hover:bg-muted/60 border border-transparent"
                  }`}
                >
                  <span className="truncate flex-1">
                    {idx + 1}. {s.title}
                  </span>
                  {idx === currentSlideIndex && (
                    <span className="text-[10px] font-black bg-primary text-primary-foreground px-2 py-0.5 rounded-full shrink-0">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Next Slide Button */}
        <button
          disabled={currentSlideIndex === slidesCount - 1}
          onClick={onNext}
          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all ${
            currentSlideIndex === slidesCount - 1
              ? "bg-muted/40 text-muted-foreground/40 cursor-not-allowed border border-transparent"
              : "bg-primary text-primary-foreground shadow-sm hover:opacity-90 cursor-pointer active:scale-95"
          }`}
          title="Next slide (Right Arrow)"
        >
          <span className="hidden sm:inline">Next</span>
          <FiChevronRight size={16} />
        </button>

        {/* Edit Note Button (Visible for logged-in author) */}
        {isAuthenticated && blogId && (
          <>
            <div className="w-[1px] h-4 bg-border/60 mx-0.5" />
            <button
              onClick={() => navigate(`/editor/${blogId}`)}
              className="px-3 py-1.5 rounded-xl border border-indigo-500/35 bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25 text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Edit this note directly in Studio"
            >
              <FiEdit2 size={14} />
              <span className="hidden sm:inline">Edit Note</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
