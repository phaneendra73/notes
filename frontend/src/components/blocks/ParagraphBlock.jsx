import React from "react";
import { renderInlineText } from "../../lib/inline.js";

export default function ParagraphBlock({ block }) {
  if (!block?.content) return null;
  return (
    <p className="text-sm sm:text-base leading-relaxed text-[var(--ink-2)] font-normal font-sans">
      {renderInlineText(block.content)}
    </p>
  );
}
