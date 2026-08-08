import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

export default function CodeBlock({ block }) {
  const [copied, setCopied] = useState(false);
  if (!block) return null;

  const code = block.content || '';
  const lang = (block.language || 'code').toUpperCase();
  const filename = block.filename || null;

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="code-meta">
          <span className="code-lang">{lang}</span>
          {filename && <span className="code-filename">{filename}</span>}
        </div>
        <button onClick={handleCopy} className="code-copy-btn" title="Copy code">
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
      <pre className="code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
