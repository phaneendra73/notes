import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);
  if (!block) return null;

  const code     = block.content  || "";
  const lang     = (block.language || "code").toUpperCase();
  const filename = block.filename  || null;

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-[var(--radius-md)] overflow-hidden border border-[var(--line)] bg-[#10100E] font-mono shadow-[var(--shadow-sm)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181714] border-b border-[var(--line)]">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-wider">{lang}</span>
          {filename && (
            <span className="text-[11px] text-[var(--muted)] pl-2 border-l border-[var(--line)]">{filename}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          title="Copy code"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-[var(--radius-sm)] bg-[var(--surface-2)] border border-[var(--line)] text-[var(--ink)] text-xs font-semibold cursor-pointer transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          {copied ? (
            <>
              <Check size={12} className="text-[var(--ok)]" />
              <span className="text-[var(--ok)]">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code Body */}
      <pre className="p-4 m-0 text-xs sm:text-sm leading-relaxed text-[#00E57A] overflow-x-auto whitespace-pre font-mono selection:bg-[var(--accent-soft)]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
