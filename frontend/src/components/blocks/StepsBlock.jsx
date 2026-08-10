import React from "react";
import { renderInlineText } from "../../lib/inline.js";

/**
 * StepsBlock — numbered step-by-step list.
 * Block schema: { type: "steps", title, items: string[] }
 */
export default function StepsBlock({ block }) {
  if (!block) return null;
  const items = Array.isArray(block.items) ? block.items : [];
  const title = block.title || "";

  return (
    <div className="my-5">
      {title && (
        <p className="font-heading font-semibold text-[0.9rem] mb-3 text-foreground">{title}</p>
      )}
      <ol className="list-none p-0 m-0 flex flex-col gap-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3.5">
            <span className="shrink-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[0.75rem] font-black font-heading mt-0.5">
              {i + 1}
            </span>
            <span className="flex-1 text-[0.9rem] leading-[1.6] pt-[0.15rem] text-foreground">
              {renderInlineText(item)}
            </span>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-muted-foreground text-sm">No steps yet.</li>
        )}
      </ol>
    </div>
  );
}
