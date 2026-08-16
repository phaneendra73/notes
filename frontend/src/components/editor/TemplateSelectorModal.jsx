import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NOTE_TEMPLATES } from '../../lib/templates.js';
import {
  Sparkles, Layers, Code, Terminal, X,
  ArrowRight, Check, FileText
} from 'lucide-react';

const ICON_MAP = {
  Layers,
  Code,
  Sparkles,
  Terminal,
};

export default function TemplateSelectorModal({ isOpen, onClose, onSelectTemplate }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--line)] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 max-h-[88vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--line)] bg-[var(--surface)]">
            <div className="space-y-0.5">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[var(--ink)] flex items-center gap-2">
                <Sparkles size={18} className="text-[var(--accent)]" />
                <span>Note Templates</span>
              </h3>
              <p className="text-xs text-[var(--muted)]">
                Choose a pre-built template with structured slides, diagrams, and code snippets.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Templates Grid */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-3 custom-scrollbar">
            {NOTE_TEMPLATES.map((tmpl) => {
              const IconComp = ICON_MAP[tmpl.icon] || FileText;

              return (
                <motion.div
                  key={tmpl.id}
                  whileHover={{ scale: 1.01, y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => {
                    onSelectTemplate(tmpl);
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-2)]/50 hover:bg-[var(--surface-2)] hover:border-[var(--accent)] transition-all cursor-pointer group flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <IconComp size={20} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--accent)] transition-colors">
                          {tmpl.title}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-[var(--surface)] text-[var(--ink-2)] border border-[var(--line)]">
                          {tmpl.category}
                        </span>
                        <span className="text-[11px] font-mono text-[var(--muted)]">
                          {tmpl.slides.length} slides
                        </span>
                      </div>
                      <p className="text-xs text-[var(--ink-2)] leading-relaxed font-normal">
                        {tmpl.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="self-end sm:self-auto shrink-0 pl-2">
                    <button
                      className="px-3.5 py-1.5 rounded-lg bg-[var(--accent)] text-[var(--accent-on)] text-xs font-bold flex items-center gap-1.5 shadow-xs group-hover:shadow-md group-hover:bg-[var(--accent-strong)] transition-all cursor-pointer"
                    >
                      <span>Use Template</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-3 bg-[var(--surface-2)]/40 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
            <span>Applying a template pre-populates titles, diagrams, code blocks, and quizzes.</span>
            <button
              onClick={onClose}
              className="font-medium hover:text-[var(--ink)] cursor-pointer text-xs"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
