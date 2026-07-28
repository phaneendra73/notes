import React, { useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';

export default function CodeBlock({ language = 'csharp', content = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4 rounded-2xl overflow-hidden border border-border/80 bg-[#141923] shadow-md">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1b2230] border-b border-white/10 text-xs font-mono text-muted-foreground">
        <span className="font-bold text-primary uppercase tracking-wider">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 text-[11px] font-bold transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <FiCheck className="text-emerald-400" size={12} /> Copied!
            </>
          ) : (
            <>
              <FiCopy size={12} /> Copy
            </>
          )}
        </button>
      </div>

      <pre className="p-4 text-xs md:text-sm font-mono text-emerald-300/90 leading-relaxed overflow-x-auto whitespace-pre">
        <code>{content}</code>
      </pre>
    </div>
  );
}
