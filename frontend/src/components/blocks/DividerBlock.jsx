import React from "react";

/**
 * DividerBlock — visual horizontal rule.
 * Block schema: { type: "divider", label, style: "solid"|"dashed"|"dotted" }
 */
export default function DividerBlock({ block }) {
  if (!block) return null;
  const label     = block.label || "";
  const style     = block.style || "solid";

  const borderStyle = style === "dashed" ? "border-dashed" : style === "dotted" ? "border-dotted" : "border-solid";

  if (label) {
    return (
      <div className="flex items-center gap-4 my-7 text-muted-foreground text-[0.78rem] uppercase tracking-widest">
        <span className={`flex-1 border-t ${borderStyle} border-border`} />
        <span className="whitespace-nowrap">{label}</span>
        <span className={`flex-1 border-t ${borderStyle} border-border`} />
      </div>
    );
  }

  return <hr className={`my-7 border-t ${borderStyle} border-border`} />;
}
