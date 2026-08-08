import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button.jsx';
import {
  FiGrid,
  FiPlus,
  FiChevronUp,
  FiChevronDown,
  FiCopy,
  FiTrash2,
  FiClock,
} from 'react-icons/fi';
import { calculateSlideReadingTime } from '../../utils/contentModel.js';

export default function SlideListSidebar({
  slides = [],
  activeSlideIdx = 0,
  onSelectSlide,
  onAddSlide,
  onMoveSlide,
  onDuplicateSlide,
  onRemoveSlide,
}) {
  return (
    <div className="md:col-span-4 rounded-[24px] border border-border bg-card p-4 flex flex-col gap-3.5 shadow-sm md:sticky md:top-6 max-h-[80vh]">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2 font-heading font-extrabold text-sm text-foreground">
          <FiGrid size={16} className="text-primary" /> Slide Sequence ({slides.length})
        </div>
        <Button
          size="xs"
          variant="default"
          onClick={onAddSlide}
          className="rounded-xl gap-1 font-extrabold text-[11px] shadow-sm"
        >
          <FiPlus size={13} /> Add Slide
        </Button>
      </div>

      {/* Slide Cards List */}
      <div className="flex flex-col gap-2.5 max-h-[64vh] overflow-y-auto pr-1">
        {slides.map((s, idx) => {
          const isActive = idx === activeSlideIdx;
          const hasQuiz = (s.content || '').includes('```quiz') || s.blocks?.some((b) => b.type === 'quiz');
          const readTime = calculateSlideReadingTime(s.content);

          return (
            <motion.div
              key={idx}
              onClick={() => onSelectSlide(idx)}
              whileHover={{ scale: 1.01 }}
              className={`flex flex-col gap-2 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'border-primary bg-gradient-to-r from-primary/15 via-primary/5 to-transparent text-foreground shadow-sm'
                  : 'border-border/70 hover:border-primary/40 hover:bg-muted/30 text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                      isActive ? 'bg-primary text-black' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <span className={`truncate text-xs ${isActive ? 'font-extrabold text-foreground' : 'font-semibold'}`}>
                    {s.title || `Concept ${idx + 1}`}
                  </span>
                </div>

                {/* Slide Quick Controls */}
                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    disabled={idx === 0}
                    onClick={(e) => { e.stopPropagation(); onMoveSlide(idx, -1); }}
                    className="p-1 hover:text-primary disabled:opacity-20 cursor-pointer"
                    title="Move Up"
                  >
                    <FiChevronUp size={13} />
                  </button>
                  <button
                    disabled={idx === slides.length - 1}
                    onClick={(e) => { e.stopPropagation(); onMoveSlide(idx, 1); }}
                    className="p-1 hover:text-primary disabled:opacity-20 cursor-pointer"
                    title="Move Down"
                  >
                    <FiChevronDown size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDuplicateSlide(idx); }}
                    className="p-1 hover:text-primary cursor-pointer"
                    title="Duplicate Slide"
                  >
                    <FiCopy size={12} />
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onRemoveSlide(idx); }}
                      className="p-1 text-red-400 hover:text-red-500 cursor-pointer"
                      title="Delete Slide"
                    >
                      <FiTrash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Meta */}
              <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground pl-8">
                <span className="flex items-center gap-1">
                  <FiClock size={10} className="text-primary" /> {readTime}
                </span>
                {hasQuiz && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-extrabold border border-amber-500/20">
                    Quiz Card
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
