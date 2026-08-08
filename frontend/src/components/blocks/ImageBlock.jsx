import React from 'react';
import { FiMaximize2 } from 'react-icons/fi';

const ALIGN_CLASS = {
  left:   'image-block-left',
  right:  'image-block-right',
  center: 'image-block-center',
};

const SIZE_CLASS = {
  small:  'image-size-small',
  medium: 'image-size-medium',
  large:  'image-size-large',
  full:   'image-size-full',
};

export default function ImageBlock({ block, onImageClick }) {
  if (!block?.content) return null;

  const src = block.content;
  const caption = block.caption || block.alt || '';
  const alignClass = ALIGN_CLASS[block.align] || ALIGN_CLASS.center;
  const sizeClass = SIZE_CLASS[block.size] || SIZE_CLASS.medium;

  return (
    <figure className={`image-block ${alignClass}`}>
      <div
        className={`image-wrapper ${sizeClass}`}
        onClick={() => onImageClick?.(src)}
      >
        <img
          src={src}
          alt={caption || 'Lesson image'}
          className="image-el"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800';
          }}
        />
        <div className="image-zoom-overlay">
          <FiMaximize2 size={16} /> Expand
        </div>
      </div>
      {caption && <figcaption className="image-caption">{caption}</figcaption>}
    </figure>
  );
}
