import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiZoomIn, FiZoomOut, FiMaximize2 } from 'react-icons/fi';

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
        className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-8"
      >
        {/* Top Controls Bar */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-5 right-5 flex items-center gap-2 bg-card/90 border border-border/80 px-3.5 py-1.5 rounded-full shadow-2xl backdrop-blur-md"
        >
          <button
            onClick={() => setScale((s) => Math.min(s + 0.35, 3.5))}
            className="p-1.5 text-foreground hover:text-primary transition-colors cursor-pointer"
            title="Zoom In"
          >
            <FiZoomIn size={18} />
          </button>
          <span className="text-xs font-black text-muted-foreground min-w-[42px] text-center font-mono">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.35, 0.5))}
            className="p-1.5 text-foreground hover:text-primary transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <FiZoomOut size={18} />
          </button>
          <button
            onClick={() => setScale(1)}
            className="p-1.5 text-foreground hover:text-primary transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <FiMaximize2 size={16} />
          </button>
          <div className="w-[1px] h-4 bg-border/80 mx-1" />
          <button
            onClick={onClose}
            className="p-1.5 text-red-500 hover:text-red-600 transition-colors cursor-pointer"
            title="Close Lightbox"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Zoomable Image Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-[92vw] max-h-[85vh] flex flex-col items-center justify-center overflow-auto p-2"
        >
          <img
            src={imageSrc}
            alt={alt || 'Zoomed figure or diagram'}
            style={{ transform: `scale(${scale})` }}
            className="max-w-full max-h-[80vh] object-contain rounded-2xl transition-transform duration-200 ease-out shadow-[0_24px_80px_rgba(0,0,0,0.6)] border border-border/40 select-none cursor-grab active:cursor-grabbing"
          />
          {alt && (
            <p className="mt-4 text-xs md:text-sm font-semibold text-white/80 text-center max-w-md">
              {alt}
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
