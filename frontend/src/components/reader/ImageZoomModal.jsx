import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

export default function ImageZoomModal({ src, imageUrl, alt, onClose }) {
  const [scale, setScale] = useState(1);
  const imageSrc = src || imageUrl;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!imageSrc) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-8"
      >
        {/* Top Controls Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-5 right-5 flex items-center gap-2 bg-[var(--surface)] border border-[var(--line)] px-3.5 py-1.5 rounded-[var(--radius-md)] shadow-[var(--shadow-lg)]"
        >
          <button
            onClick={() => setScale((s) => Math.min(s + 0.35, 3.5))}
            className="p-1 text-[var(--ink)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn size={16} />
          </button>
          <span className="text-xs font-bold text-[var(--muted)] min-w-[38px] text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.35, 0.5))}
            className="p-1 text-[var(--ink)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={() => setScale(1)}
            className="p-1 text-[var(--ink)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <Maximize2 size={15} />
          </button>
          <div className="w-[1px] h-4 bg-[var(--line)] mx-1" />
          <button
            onClick={onClose}
            className="p-1 text-[var(--err)] hover:opacity-80 transition-colors cursor-pointer"
            title="Close Lightbox"
          >
            <X size={17} />
          </button>
        </div>

        {/* Zoomable Image Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-[92vw] max-h-[85vh] flex flex-col items-center justify-center overflow-auto p-2"
        >
          <img
            src={imageSrc}
            alt={alt || 'Zoomed visual diagram'}
            style={{ transform: `scale(${scale})` }}
            className="max-w-full max-h-[80vh] object-contain rounded-[var(--radius-md)] transition-transform duration-200 ease-out shadow-[var(--shadow-lg)] border border-[var(--line)] select-none cursor-grab active:cursor-grabbing"
          />
          {alt && (
            <p className="mt-4 text-xs font-semibold text-white/90 text-center max-w-md">
              {alt}
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
