import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BlockRenderer from '../blocks/BlockRenderer.jsx';
import ImageZoomModal from './ImageZoomModal.jsx';

const slideVariants = {
  initial: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  animate: { x: 0, opacity: 1, transition: { duration: 0.2, ease: [0.25, 1, 0.5, 1] } },
  exit: (dir) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.14, ease: 'easeIn' },
  }),
};

/**
 * SlideCanvas — displays the active slide's blocks with swipe support and image zoom.
 *
 * @param {object} slide - Current slide ({ title, blocks })
 * @param {number} slideIndex - Current slide index (used as animation key)
 * @param {number} direction - Animation direction (+1 = forward, -1 = backward)
 * @param {function} onNext - Called to advance to next slide
 * @param {function} onPrev - Called to go to previous slide
 */
export default function SlideCanvas({ slide, slideIndex, direction = 1, onNext, onPrev }) {
  const [zoomedImage, setZoomedImage] = useState(null);
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    // Don't swipe inside code blocks or scrollable areas
    if (e.target.closest('pre') || e.target.closest('.overflow-x-auto')) return;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dist = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dist) > 50) {
      if (dist > 0) onNext?.();
      else onPrev?.();
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="slide-canvas"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.div
          key={slideIndex}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="slide-content"
        >
          {slide?.title && (
            <h1 className="slide-title">{slide.title}</h1>
          )}

          <div className="slide-blocks">
            <BlockRenderer
              blocks={slide?.blocks}
              onImageClick={(src) => setZoomedImage(src)}
            />
          </div>
        </motion.div>
      </AnimatePresence>

      {zoomedImage && (
        <ImageZoomModal src={zoomedImage} onClose={() => setZoomedImage(null)} />
      )}
    </div>
  );
}
