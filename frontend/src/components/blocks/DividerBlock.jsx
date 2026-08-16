import React from "react";

export default function DividerBlock({ block }) {
  if (!block) return null;
  const label     = block.label || "";
  const style     = block.style || "solid";

  const borderStyle = style === "dashed" ? "border-dashed" : style === "dotted" ? "border-dotted" : "border-solid";

  if (label) {
    return (
      <div className="flex items-center gap-4 my-6 text-[var(--muted)] text-[11px] font-mono uppercase tracking-widest">
        <span className={`flex-1 border-t ${borderStyle} border-[var(--line)]`} />
        <span className="whitespace-nowrap font-bold text-[var(--accent)]">{label}</span>
        <span className={`flex-1 border-t ${borderStyle} border-[var(--line)]`} />
      </div>
    );
  }

  return <hr className={`my-6 border-t ${borderStyle} border-[var(--line)]`} />;
}
