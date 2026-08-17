import React from "react";
import { renderInlineText } from "../../lib/inline.js";

export default function ParagraphBlock({ block }) {
  if (!block?.content) return null;
  return (
    <p className="text-[15px] sm:text-base leading-[1.7] sm:leading-relaxed text-[var(--ink-2)] font-normal font-sans">
      {renderInlineText(block.content)}
    </p>
  );
}
