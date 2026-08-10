import React from "react";
import { FiZap, FiAlertTriangle, FiInfo, FiBookmark } from "react-icons/fi";
import { renderInlineText } from "../../lib/inline.js";

const VARIANTS = {
  tip: {
    Icon: FiZap,
    label: "Key Takeaway",
    wrapper: "border-amber-500/35 bg-gradient-to-br from-amber-500/8 to-card text-amber-400",
    header:  "text-amber-400",
  },
  warning: {
    Icon: FiAlertTriangle,
    label: "Warning",
    wrapper: "border-rose-500/35 bg-gradient-to-br from-rose-500/8 to-card text-rose-400",
    header:  "text-rose-400",
  },
  info: {
    Icon: FiInfo,
    label: "Info",
    wrapper: "border-sky-500/35 bg-gradient-to-br from-sky-500/8 to-card text-sky-400",
    header:  "text-sky-400",
  },
  note: {
    Icon: FiBookmark,
    label: "Note",
    wrapper: "border-purple-500/35 bg-gradient-to-br from-purple-500/8 to-card text-purple-400",
    header:  "text-purple-400",
  },
};

export default function CalloutBlock({ block }) {
  if (!block) return null;
  const v = VARIANTS[block.variant] || VARIANTS.tip;
  const { Icon } = v;
  const label = block.title || v.label;

  return (
    <div className={`p-5 rounded-[1.25rem] border backdrop-blur-sm shadow-sm ${v.wrapper}`}>
      <div className={`flex items-center gap-2 mb-2 text-[0.75rem] font-black uppercase tracking-widest ${v.header}`}>
        <Icon size={15} />
        <span>{label}</span>
      </div>
      <div className="text-[0.95rem] leading-[1.65] text-foreground">
        {renderInlineText(block.content || "")}
      </div>
    </div>
  );
}
