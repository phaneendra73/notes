import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CodeBlock from '../blocks/CodeBlock.jsx';
import CalloutBlock from '../blocks/CalloutBlock.jsx';
import QuizBlock from '../blocks/QuizBlock.jsx';
import DiagramBlock from '../blocks/DiagramBlock.jsx';
import { renderMarkdown, calculateSlideReadingTime, renderMermaidDiagrams } from '../../utils/markdown.js';
import ImageZoomModal from './ImageZoomModal.jsx';
import { FiClock, FiMaximize2 } from 'react-icons/fi';

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

  const readingTime = calculateSlideReadingTime(currentSlide?.content || '');

  // Render mermaid diagrams on slide mount / slide index change (staggered for Framer Motion transition)
  useEffect(() => {
    const render = () => renderMermaidDiagrams();
    render();
    const t1 = setTimeout(render, 60);
    const t2 = setTimeout(render, 180);
    const t3 = setTimeout(render, 350);
    const t4 = setTimeout(render, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [currentSlideIndex, currentSlide]);

  // Handle Mobile Swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isSwipe = Math.abs(distance) > 50;

    if (isSwipe) {
      if (distance > 0 && onNext) onNext(); // Swipe left -> Next slide
      if (distance < 0 && onPrev) onPrev(); // Swipe right -> Prev slide
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Render individual block component
  const renderBlock = (block, idx) => {
    if (!block) return null;

    switch (block.type) {
      case 'heading':
      case 'h2':
        return (
          <h2 key={idx} className="font-heading font-extrabold text-xl md:text-2xl text-foreground mt-4 mb-2 tracking-tight">
            {block.content}
          </h2>
        );
      case 'h3':
        return (
          <h3 key={idx} className="font-heading font-extrabold text-lg md:text-xl text-foreground mt-3 mb-1.5 tracking-tight">
            {block.content}
          </h3>
        );
      case 'paragraph':
      case 'p':
        return (
          <div
            key={idx}
            className="text-base md:text-lg text-foreground/90 leading-relaxed my-2.5 [&_img]:my-3 [&_img]:max-h-[420px] [&_img]:rounded-2xl [&_img]:object-contain [&_img]:border [&_img]:border-border/70 [&_img]:shadow-sm"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content || '') }}
          />
        );
      case 'code':
        return <CodeBlock key={idx} language={block.language || 'csharp'} content={block.content} />;
      case 'callout':
        return <CalloutBlock key={idx} content={block.content} />;
      case 'quiz':
        return (
          <QuizBlock
            key={idx}
            question={block.question}
            options={block.options || []}
            answer={block.answer || 0}
            explanation={block.explanation || ''}
          />
        );
      case 'diagram':
      case 'mermaid':
        return <DiagramBlock key={idx} content={block.content} />;
      case 'image':
        return (
          <div key={idx} className="relative group my-4 rounded-2xl overflow-hidden border border-border/70 shadow-sm cursor-pointer" onClick={() => setZoomedImage(block.content)}>
            <img
              src={block.content}
              alt={block.caption || 'Slide illustration'}
              className="w-full max-h-[380px] object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800';
              }}
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-extrabold gap-1.5">
              <FiMaximize2 size={16} /> Click to Expand
            </div>
          </div>
        );
      default:
        return (
          <div key={idx} dangerouslySetInnerHTML={{ __html: renderMarkdown(block.content || '') }} />
        );
    }
  };

  const slideVariants = {
    initial: (dir) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0,
      scale: 0.98,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: { duration: 0.22, ease: 'easeOut' },
    },
    exit: (dir) => ({
      x: dir > 0 ? -60 : 60,
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.16, ease: 'easeIn' },
    }),
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="w-full flex flex-col items-center justify-center select-text"
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlideIndex}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-3xl flex flex-col gap-5 my-auto px-2 md:px-0"
        >
          {/* Top Slide Meta Line */}
          <div className="flex items-center justify-between pb-3 border-b border-border/40 text-xs font-extrabold text-muted-foreground">
            <span className="font-heading uppercase tracking-wider text-primary font-black">
              Slide {currentSlideIndex + 1}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground/80 font-medium">
              <FiClock className="text-primary w-3.5 h-3.5" />
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Slide Title */}
          {currentSlide?.title && (
            <h1 className="font-heading font-extrabold text-2xl md:text-3xl lg:text-4xl text-foreground tracking-tight leading-snug">
              {currentSlide.title}
            </h1>
          )}

          {/* Slide Content Blocks or Markdown */}
          <div className="flex flex-col gap-4 text-foreground/95 text-base md:text-lg leading-relaxed mt-1">
            {currentSlide?.blocks && Array.isArray(currentSlide.blocks) && currentSlide.blocks.length > 0
              ? currentSlide.blocks.map((b, idx) => renderBlock(b, idx))
              : <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(currentSlide?.content || '') }} />}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <ImageZoomModal imageUrl={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </div>
  );
}
