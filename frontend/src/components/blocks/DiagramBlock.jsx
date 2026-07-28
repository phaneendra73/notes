import React, { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
});

export default function DiagramBlock({ content = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;
    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

    try {
      mermaid.render(id, content.trim()).then(({ svg }) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      }).catch((err) => {
        console.error('Mermaid render error:', err);
      });
    } catch {
      /* ignore render errors */
    }
  }, [content]);

  return (
    <div className="my-6 p-4 rounded-2xl border border-border/80 bg-muted/20 flex flex-col items-center justify-center overflow-x-auto shadow-xs">
      <div ref={containerRef} className="w-full flex justify-center text-xs md:text-sm" />
    </div>
  );
}
