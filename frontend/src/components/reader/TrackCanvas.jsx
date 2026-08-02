import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CodeBlock from "../blocks/CodeBlock.jsx";
import CalloutBlock from "../blocks/CalloutBlock.jsx";
import QuizBlock from "../blocks/QuizBlock.jsx";
import DiagramBlock from "../blocks/DiagramBlock.jsx";
import { renderMarkdown, renderMermaidDiagrams } from "../../utils/markdown.js";
import ImageZoomModal from "./ImageZoomModal.jsx";
import { FiMaximize2 } from "react-icons/fi";

export default function TrackCanvas({
  currentSlide,
  currentSlideIndex,
  direction = 1,
  onNext,
  onPrev,
}) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Render mermaid diagrams on slide mount / slide index change (optimized for 60fps)
  useEffect(() => {
    const render = () => renderMermaidDiagrams();
    const rafId = requestAnimationFrame(render);
    const timer = setTimeout(render, 120);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timer);
    };
  }, [currentSlideIndex, currentSlide]);

  // Handle Mobile Swipe
  const handleTouchStart = (e) => {
    // Ignore swipe if we are interacting with a code block or horizontally scrollable element
    if (
      e.target.closest("pre") ||
      e.target.closest("code") ||
      e.target.closest(".overflow-x-auto")
    ) {
      return;
    }
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    if (touchStartX.current === null) return;
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 50;

    if (isSwipe) {
      if (distance > 0 && onNext) onNext(); // Swipe left -> Next slide
      if (distance < 0 && onPrev) onPrev(); // Swipe right -> Prev slide
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Event Delegation: Open Zoom Modal when clicking any image on the canvas
  const handleCanvasClick = (e) => {
    if (e.target && e.target.tagName === "IMG") {
      const src = e.target.getAttribute("src");
      if (src) {
        setZoomedImage(src);
      }
    }
  };

  // Render individual block component
  const renderBlock = (block, idx) => {
    if (!block) return null;

    switch (block.type) {
      case "heading":
      case "h2":
        return (
          <h2
            key={idx}
            className="font-heading font-extrabold text-xl md:text-2xl text-foreground mt-4 mb-2 tracking-tight"
          >
            {block.content}
          </h2>
        );
      case "h3":
        return (
          <h3
            key={idx}
            className="font-heading font-extrabold text-lg md:text-xl text-foreground mt-3 mb-1.5 tracking-tight"
          >
            {block.content}
          </h3>
        );
      case "paragraph":
      case "p":
        return (
          <div
            key={idx}
            className="text-base md:text-lg text-foreground/90 leading-relaxed my-2.5 [&_img]:my-3 [&_img]:max-h-[450px] [&_img]:rounded-2xl [&_img]:object-contain [&_img]:border [&_img]:border-border/70 [&_img]:shadow-sm [&_img]:cursor-pointer [&_img]:transition-transform hover:[&_img]:scale-[1.01]"
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(block.content || ""),
            }}
          />
        );
      case "code":
        return (
          <CodeBlock
            key={idx}
            language={block.language || "csharp"}
            content={block.content}
          />
        );
      case "callout":
        return <CalloutBlock key={idx} content={block.content} />;
      case "quiz":
        return (
          <QuizBlock
            key={idx}
            question={block.question}
            options={block.options || []}
            answer={block.answer || 0}
            explanation={block.explanation || ""}
          />
        );
      case "diagram":
      case "mermaid":
        return <DiagramBlock key={idx} content={block.content} />;
      case "image":
        return (
          <div
            key={idx}
            className="relative group my-4 rounded-2xl overflow-hidden border border-border/70 shadow-sm cursor-pointer"
            onClick={() => setZoomedImage(block.content)}
          >
            <img
              src={block.content}
              alt={block.caption || "Slide illustration"}
              className="w-full max-h-[380px] object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800";
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-extrabold gap-1.5">
              <FiMaximize2 size={16} /> Click to Expand
            </div>
          </div>
        );
      default:
        return (
          <div
            key={idx}
            dangerouslySetInnerHTML={{
              __html: renderMarkdown(block.content || ""),
            }}
          />
        );
    }
  };

  // Hardware-accelerated 60fps slide transition (pure GPU translate3d + opacity)
  const slideVariants = {
    initial: (dir) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.15, ease: [0.25, 1, 0.5, 1] },
    },
    exit: (dir) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
      transition: { duration: 0.1, ease: "easeIn" },
    }),
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleCanvasClick}
      className="w-full flex flex-col items-center justify-center select-text"
    >
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={currentSlideIndex}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-3xl flex flex-col gap-5 my-auto px-2 md:px-0"
        >


          {/* Slide Title */}
          {currentSlide?.title && (
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl lg:text-4xl text-foreground tracking-tight leading-snug">
              {currentSlide.title}
            </h1>
          )}

          {/* Slide Content Blocks or Markdown */}
          <div className="flex flex-col gap-4 text-foreground/95 text-base md:text-lg leading-relaxed mt-1 [&_img]:cursor-pointer [&_img]:transition-all hover:[&_img]:opacity-90">
            {currentSlide?.blocks &&
            Array.isArray(currentSlide.blocks) &&
            currentSlide.blocks.length > 0 ? (
              currentSlide.blocks.map((b, idx) => renderBlock(b, idx))
            ) : (
              <div
                className="prose prose-slate dark:prose-invert max-w-none [&_img]:cursor-pointer"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(currentSlide?.content || ""),
                }}
              />
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <ImageZoomModal
          src={zoomedImage}
          imageUrl={zoomedImage}
          onClose={() => setZoomedImage(null)}
        />
      )}
    </div>
  );
}
