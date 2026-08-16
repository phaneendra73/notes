import React from "react";
import { Zap, AlertTriangle, Info, Bookmark } from "lucide-react";
import { renderInlineText } from "../../lib/inline.js";

const VARIANTS = {
  tip: {
    Icon: Zap,
    label: "Key Takeaway",
    wrapper: "border-[var(--accent-soft)] bg-[var(--accent-soft)] text-[var(--accent)]",
    header:  "text-[var(--accent)]",
  },
  warning: {
    Icon: AlertTriangle,
    label: "Warning",
    wrapper: "border-[var(--err-soft)] bg-[var(--err-soft)] text-[var(--err)]",
    header:  "text-[var(--err)]",
  },
  info: {
    Icon: Info,
    label: "Information",
    wrapper: "border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)]",
    header:  "text-[var(--accent)]",
  },
  note: {
    Icon: Bookmark,
    label: "Note",
    wrapper: "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)]",
    header:  "text-[var(--muted)]",
  },
};

export default function CalloutBlock({ block }) {
  if (!block) return null;
  const v = VARIANTS[block.variant] || VARIANTS.tip;
  const { Icon } = v;
  const label = block.title || v.label;

  return (
    <div className={`p-4 sm:p-5 rounded-[var(--radius-md)] border shadow-[var(--shadow-sm)] ${v.wrapper}`}>
      <div className={`flex items-center gap-2 mb-2 text-xs font-bold uppercase tracking-wider ${v.header}`}>
        <Icon size={14} />
        <span>{label}</span>
      </div>
      <div className="text-sm leading-relaxed text-[var(--ink)] font-normal">
        {renderInlineText(block.content || "")}
      </div>
    </div>
  );
}
