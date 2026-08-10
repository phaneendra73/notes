import React from "react";

/**
 * KeyValueBlock — key/value pairs for definitions or comparisons.
 * Block schema: { type: "keyvalue", title, layout: "list"|"grid", pairs: [{key, value}] }
 */
export default function KeyValueBlock({ block }) {
  if (!block) return null;
  const pairs  = Array.isArray(block.pairs) ? block.pairs : [];
  const title  = block.title  || "";
  const layout = block.layout || "list";

  return (
    <div className="my-5 rounded-xl border border-border bg-card overflow-hidden">
      {title && (
        <p className="font-heading font-semibold text-[0.85rem] uppercase tracking-widest text-muted-foreground px-4 py-2.5 bg-muted border-b border-border m-0">
          {title}
        </p>
      )}
      <dl className={`m-0 p-0 ${layout === "grid" ? "grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))]" : ""}`}>
        {pairs.map((p, i) => (
          <div
            key={i}
            className={`flex border-b border-border last:border-b-0 ${
              layout === "grid"
                ? "flex-col gap-1 px-4 py-3 border-r border-border"
                : "items-baseline gap-3 px-4 py-2"
            }`}
          >
            <dt className={`font-semibold shrink-0 ${
              layout === "grid"
                ? "text-[0.75rem] uppercase tracking-wide text-muted-foreground"
                : "text-[0.82rem] text-primary min-w-[9rem]"
            }`}>
              {p.key}
            </dt>
            <dd className="text-[0.875rem] text-foreground leading-relaxed m-0">{p.value}</dd>
          </div>
        ))}
        {pairs.length === 0 && (
          <p className="text-muted-foreground text-sm p-4">No pairs yet.</p>
        )}
      </dl>
    </div>
  );
}
