import React from "react";
import { FiMaximize2 } from "react-icons/fi";

const ALIGN = {
  left:   "items-start",
  right:  "items-end",
  center: "items-center",
};

const SIZE = {
  small:  "max-w-[320px] w-full",
  medium: "max-w-[560px] w-full",
  large:  "max-w-[800px] w-full",
  full:   "w-full",
};

export default function ImageBlock({ block, onImageClick }) {
  if (!block?.content) return null;

  const src        = block.content;
  const caption    = block.caption || block.alt || "";
  const alignClass = ALIGN[block.align]  || ALIGN.center;
  const sizeClass  = SIZE[block.size]    || SIZE.medium;

  return (
    <figure className={`flex flex-col w-full my-4 ${alignClass}`}>
      <div
        className={`relative overflow-hidden rounded-[1.25rem] border border-border bg-card cursor-pointer transition-all duration-200 hover:border-primary group ${sizeClass}`}
        onClick={() => onImageClick?.(src)}
      >
        <img
          src={src}
          alt={caption || "Lesson image"}
          className="w-full h-auto max-h-[520px] object-contain block"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800";
          }}
        />
        {/* Zoom overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-[0.75rem] font-extrabold gap-1.5">
          <FiMaximize2 size={16} /> Expand
        </div>
      </div>
      {caption && (
        <figcaption className="mt-2 text-[0.75rem] font-semibold text-muted-foreground text-center">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
