import React from "react";
import { renderInlineText } from "../../lib/inline.js";

export default function StepsBlock({ block }) {
  if (!block) return null;
  const items = Array.isArray(block.items) ? block.items : [];
  const title = block.title || "";

  return (
    <div className="my-5 space-y-3">
      {title && (
        <h4 className="font-serif font-bold text-sm sm:text-base text-[var(--ink)]">{title}</h4>
      )}
      <ol className="list-none p-0 m-0 flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-start gap-3.5 p-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-sm)]"
          >
            <span className="shrink-0 w-6 h-6 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-on)] flex items-center justify-center text-xs font-bold font-mono">
              {i + 1}
            </span>
            <span className="flex-1 text-xs sm:text-sm leading-relaxed text-[var(--ink-2)] font-sans pt-0.5">
              {renderInlineText(item)}
            </span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-[var(--muted)] text-xs">No steps defined.</li>
        )}
      </ol>
    </div>
  );
}
