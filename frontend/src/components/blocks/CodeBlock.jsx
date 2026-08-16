import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);
  if (!block) return null;

  const code = block.content || '';
  const lang = (block.language || 'code').toUpperCase();
  const filename = block.filename || null;
  const lines = code.split('\n');

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--line)] bg-[#0d1117] font-mono shadow-[var(--shadow-md)] my-4 group">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 opacity-60">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-bold text-[var(--accent)] tracking-wider ml-1">{lang}</span>
          {filename && (
            <span className="text-[11px] text-[#8b949e] pl-2 border-l border-[#30363d]">{filename}</span>
          )}
        </div>

        <button
          onClick={handleCopy}
          title="Copy code"
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#21262d] border border-[#30363d] text-[#c9d1d9] text-xs font-semibold cursor-pointer transition-all hover:bg-[#30363d] hover:text-white"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400 font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with optional line numbering */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm leading-relaxed text-[#e6edf3]">
        <pre className="m-0 font-mono flex">
          {lines.length > 2 ? (
            <div className="select-none pr-4 text-right text-[#484f58] font-mono border-r border-[#30363d] mr-4 shrink-0">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          ) : null}
          <code className="flex-1 whitespace-pre">{code}</code>
        </pre>
      </div>
    </div>
  );
}
