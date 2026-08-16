import React from "react";

export default function KeyValueBlock({ block }) {
  if (!block) return null;
  const pairs  = Array.isArray(block.pairs) ? block.pairs : [];
  const title  = block.title  || "";
  const layout = block.layout || "list";

  return (
    <div className="my-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-[var(--shadow-sm)]">
      {title && (
        <p className="font-serif font-bold text-xs uppercase tracking-wider text-[var(--accent)] px-4 py-2.5 bg-[var(--surface-2)] border-b border-[var(--line)] m-0">
          {title}
        </p>
      )}
      <dl className={`m-0 p-0 ${layout === "grid" ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : ""}`}>
        {pairs.map((p, i) => (
          <div
            key={i}
            className={`flex border-b border-[var(--line)] last:border-b-0 ${
              layout === "grid"
                ? "flex-col gap-1 p-3.5 border-r border-[var(--line)]"
                : "items-baseline justify-between gap-4 px-4 py-2.5"
            }`}
          >
            <dt className={`font-semibold shrink-0 text-xs font-mono ${
              layout === "grid"
                ? "text-[var(--accent)]"
                : "text-[var(--accent)] min-w-[8rem]"
            }`}>
              {p.key}
            </dt>
            <dd className="text-xs sm:text-sm text-[var(--ink)] leading-relaxed m-0 font-sans">{p.value}</dd>
          </div>
        ))}
        {pairs.length === 0 && (
          <p className="text-[var(--muted)] text-xs p-4">No key-value pairs added.</p>
        )}
      </dl>
    </div>
  );
}
