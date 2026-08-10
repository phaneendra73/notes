import React, { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

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
    <div className="rounded-[1.25rem] overflow-hidden border border-border bg-[#0d1117] font-mono shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-[0.6rem] bg-[#161b22] border-b border-white/[0.08]">
        <div className="flex items-center gap-2">
          <span className="text-[0.7rem] font-black text-primary uppercase tracking-widest">{lang}</span>
          {filename && (
            <span className="text-[0.7rem] text-[#8b949e] pl-2 border-l border-white/10">{filename}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          title="Copy code"
          className="flex items-center gap-1.5 px-[0.6rem] py-1 rounded-lg bg-white/[0.07] border border-white/10 text-[#c9d1d9] text-[0.7rem] font-bold cursor-pointer transition-all hover:bg-white/15"
        >
          {copied ? (
            <>
              <FiCheck size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <FiCopy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code */}
      <pre className="p-5 m-0 text-[0.88rem] leading-[1.7] text-[#7ee787] overflow-x-auto whitespace-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
