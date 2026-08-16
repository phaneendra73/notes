import React, { useEffect, useRef, useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

export default function DiagramBlock({ block }) {
  const containerRef = useRef(null);
  const [svgHtml, setSvgHtml] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const codeText = block?.content || "";

  useEffect(() => {
    let isMounted = true;
    if (!codeText.trim()) {
      setLoading(false);
      return;
    }

    async function renderMermaid() {
      try {
        setLoading(true);
        setError(null);
        const mermaidModule = await import("mermaid");
        const mermaid = mermaidModule.default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "strict",
          fontFamily: "var(--font-mono)",
        });
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, codeText.trim());
        if (isMounted) {
          setSvgHtml(svg);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Mermaid render error:", err);
          setError("Diagram could not be rendered.");
          setLoading(false);
        }
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [codeText]);

  if (!codeText.trim()) return null;

  return (
    <div className="w-full my-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[#10100E] p-4 sm:p-6 overflow-hidden shadow-[var(--shadow-sm)]">
      {block?.title && (
        <h4 className="font-mono text-xs font-bold text-[var(--accent)] uppercase tracking-wider mb-4 pb-2 border-b border-[var(--line)]">
          {block.title}
        </h4>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12 gap-2 text-xs text-[var(--muted)]">
          <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
          <span>Rendering architecture diagram...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-8 gap-2 text-xs text-[var(--err)]">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      ) : (
        <div
          ref={containerRef}
          className="w-full flex items-center justify-center overflow-x-auto select-none [&>svg]:max-w-full [&>svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      )}
    </div>
  );
}
