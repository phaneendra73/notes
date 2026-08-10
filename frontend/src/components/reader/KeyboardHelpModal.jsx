import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCommand, FiArrowRight, FiArrowLeft, FiMaximize, FiHelpCircle } from 'react-icons/fi';

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
            className="fixed inset-0 z-[100] bg-black/75 backdrop-blur-md"
          />

          {/* Modal Box */}
          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-3xl border border-primary/40 bg-card p-6 shadow-[0_25px_80px_rgba(0,0,0,0.6)] relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/30">
                    <FiCommand size={18} />
                  </div>
                  <h3 className="font-heading font-black text-lg text-foreground">
                    Keyboard Shortcuts
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                >
                  <FiX size={18} />
                </button>
              </div>

              <div className="space-y-2.5">
                {SHORTCUTS.map((sc, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-2xl bg-muted/40 border border-border/70 text-xs font-bold"
                  >
                    <span className="text-muted-foreground">{sc.action}</span>
                    <kbd className="px-2.5 py-1 rounded-lg bg-card border border-primary/30 text-primary font-mono text-[11px] shadow-sm">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 text-center">
                <p className="text-[11px] text-muted-foreground font-semibold">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-primary font-mono">Esc</kbd> anytime to close this helper modal.
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
