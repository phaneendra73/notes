import React from "react";

export default function HeadingBlock({ block }) {
  if (!block?.content) return null;
  const level = block.level || 2;
  const text = block.content;

  const base = "font-heading font-extrabold text-foreground tracking-tight leading-tight mt-2";

  if (level === 1)
    return <h1 className={`${base} text-[clamp(1.75rem,3vw,2.25rem)]`}>{text}</h1>;
  if (level === 3)
    return <h3 className={`${base} text-[clamp(1.1rem,2vw,1.35rem)]`}>{text}</h3>;
  return <h2 className={`${base} text-[clamp(1.35rem,2.5vw,1.75rem)]`}>{text}</h2>;
}
