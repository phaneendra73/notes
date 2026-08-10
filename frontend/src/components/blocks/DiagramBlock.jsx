import React, { useEffect, useRef, useState } from "react";
import { FiAlertCircle, FiLoader } from "react-icons/fi";

export default function DiagramBlock({ block }) {
  const codeText    = block?.content || "";
  const containerRef = useRef(null);
  const [svgHtml, setSvgHtml] = useState("");
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!codeText.trim()) { setLoading(false); return; }
    let isMounted = true;

    const renderDiagram = async () => {
      try {
        setLoading(true);
        setError(null);
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;
        mermaid.initialize({ startOnLoad: false, theme: "dark", securityLevel: "loose", fontFamily: "inherit" });
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, codeText.trim());
        if (isMounted) { setSvgHtml(svg); setLoading(false); }
      } catch (err) {
        if (isMounted) {
          console.error("Mermaid render error:", err);
          setError(err?.message || "Invalid diagram syntax");
          setLoading(false);
        }
      }
    };

    renderDiagram();
    return () => { isMounted = false; };
  }, [codeText]);

  return (
    <div className="p-6 rounded-[1.25rem] bg-card border border-border flex flex-col items-center justify-center min-h-[140px] overflow-x-auto">
      {loading && (
        <div className="flex items-center gap-2 text-[0.8rem] text-primary font-mono">
          <FiLoader size={16} className="animate-spin" /> Rendering diagram…
        </div>
      )}

      {!loading && error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center w-full">
          <p className="font-extrabold text-red-400 text-[0.8rem] flex items-center justify-center gap-1.5">
            <FiAlertCircle size={14} /> Diagram Syntax Error
          </p>
          <p className="text-[0.75rem] text-red-300 mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && svgHtml && (
        <div
          ref={containerRef}
          className="w-full flex justify-center overflow-x-auto"
          // mermaid render output is sanitized SVG from a controlled library — acceptable use
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      )}

      {block?.caption && (
        <span className="mt-3 text-[0.75rem] font-semibold text-muted-foreground text-center">
          {block.caption}
        </span>
      )}
    </div>
  );
}
