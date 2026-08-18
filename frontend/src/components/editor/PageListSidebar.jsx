import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button.jsx';
import {
  Grid,
  Plus,
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  Clock,
} from 'lucide-react';

export default function PageListSidebar({
  pages = [],
  activePageIdx = 0,
  onSelectPage,
  onAddPage,
  onMovePage,
  onDuplicatePage,
  onRemovePage,
}) {
  return (
    <div className="md:col-span-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-4 flex flex-col gap-3.5 shadow-sm md:sticky md:top-6 max-h-[80vh]">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
        <div className="flex items-center gap-2 font-serif font-bold text-sm text-[var(--ink)]">
          <Grid size={16} className="text-[var(--accent)]" /> Page Sequence ({pages.length})
        </div>
        <Button
          size="xs"
          variant="default"
          onClick={onAddPage}
          className="rounded-[var(--radius-sm)] gap-1 font-bold text-[11px] shadow-sm cursor-pointer"
        >
          <Plus size={13} /> Add Page
        </Button>
      </div>

      {/* Page Cards List */}
      <div className="flex flex-col gap-2.5 max-h-[64vh] overflow-y-auto pr-1 custom-scrollbar">
        {pages.map((p, idx) => {
          const isActive = idx === activePageIdx;
          const hasQuiz = (p.content || '').includes('```quiz') || p.blocks?.some((b) => b.type === 'quiz');

          return (
            <motion.div
              layout
              key={p.id || idx}
              onClick={() => onSelectPage?.(idx)}
              className={`p-3 rounded-[var(--radius-sm)] border text-left cursor-pointer transition-all duration-200 flex flex-col gap-2 group ${
                isActive
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] shadow-sm'
                  : 'border-[var(--line)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] hover:border-[var(--line-strong)]'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      isActive
                        ? 'bg-[var(--accent)] text-[var(--accent-on)]'
                        : 'bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)]'
                    }`}
                  >
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="font-semibold text-xs text-[var(--ink)] truncate max-w-[130px]">
                    {p.title || `Page ${idx + 1}`}
                  </span>
                </div>

                {/* Page Action Controls */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovePage?.(idx, -1);
                    }}
                    disabled={idx === 0}
                    className="p-1 hover:text-[var(--accent)] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Move Up"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMovePage?.(idx, 1);
                    }}
                    disabled={idx === pages.length - 1}
                    className="p-1 hover:text-[var(--accent)] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Move Down"
                  >
                    <ArrowDown size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicatePage?.(idx);
                    }}
                    className="p-1 hover:text-[var(--accent)] cursor-pointer"
                    title="Duplicate Page"
                  >
                    <Copy size={12} />
                  </button>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemovePage?.(idx);
                      }}
                      className="p-1 hover:text-[var(--err)] cursor-pointer"
                      title="Delete Page"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Card Meta */}
              {hasQuiz && (
                <div className="flex items-center gap-2 text-[10px] font-medium text-[var(--muted)] pl-8">
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20">
                    Quiz Block
                  </span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
