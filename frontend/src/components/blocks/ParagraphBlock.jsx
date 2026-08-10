import React from "react";
import { renderInlineText } from "../../lib/inline.js";

export default function ParagraphBlock({ block }) {
  if (!block?.content) return null;
  return (
    <p className="text-[clamp(0.95rem,1.5vw,1.05rem)] leading-[1.75] text-foreground/90">
      {renderInlineText(block.content)}
    </p>
  );
}
