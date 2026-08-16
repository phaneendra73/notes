import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Command, X } from 'lucide-react';

const SHORTCUTS = [
  { key: '→ / Space', action: 'Next Slide' },
  { key: '←', action: 'Previous Slide' },
  { key: 'F', action: 'Toggle Fullscreen Mode' },
  { key: '?', action: 'Open Keyboard Shortcuts' },
  { key: 'Esc', action: 'Close Modals / Overlays' },
];

export default function KeyboardHelpModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs"
          />

          {/* Modal Box */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow-lg)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--line)]">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-soft)]">
                    <Command size={16} />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[var(--ink)]">
                    Keyboard Shortcuts
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] cursor-pointer transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-2">
                {SHORTCUTS.map((sc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] text-xs font-semibold"
                  >
                    <span className="text-[var(--ink-2)] font-normal">{sc.action}</span>
                    <kbd className="px-2 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface)] border border-[var(--line)] text-[var(--accent)] font-mono text-[11px] font-bold shadow-[var(--shadow-sm)]">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-3 border-t border-[var(--line)] text-center">
                <p className="text-xs text-[var(--muted)] font-normal">
                  Press <kbd className="px-1.5 py-0.5 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--accent)] font-mono text-[11px]">Esc</kbd> anytime to close this modal.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
