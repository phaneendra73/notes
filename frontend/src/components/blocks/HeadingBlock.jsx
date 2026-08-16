import React from "react";

export default function HeadingBlock({ block }) {
  if (!block?.content) return null;
  const level = block.level || 2;
  const text = block.content;

  const base = "font-serif font-bold text-[var(--ink)] tracking-tight leading-tight mt-3 mb-1";

  if (level === 1)
    return <h1 className={`${base} text-2xl sm:text-3xl md:text-4xl`}>{text}</h1>;
  if (level === 3)
    return <h3 className={`${base} text-lg sm:text-xl`}>{text}</h3>;
  return <h2 className={`${base} text-xl sm:text-2xl`}>{text}</h2>;
}
