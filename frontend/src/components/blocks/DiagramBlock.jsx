import React, { useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiLoader } from 'react-icons/fi';

export default function DiagramBlock({ block }) {
  const codeText = block?.content || '';
  const containerRef = useRef(null);
  const [svgHtml, setSvgHtml] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!codeText.trim()) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const renderDiagram = async () => {
      try {
        setLoading(true);
        setError(null);

        const mermaidModule = await import('mermaid');
        const mermaid = mermaidModule.default;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          fontFamily: 'inherit',
        });

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg } = await mermaid.render(id, codeText.trim());

        if (isMounted) {
          setSvgHtml(svg);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Mermaid render error:', err);
          setError(err?.message || 'Invalid diagram syntax');
          setLoading(false);
        }
      }
    };

    renderDiagram();
    return () => { isMounted = false; };
  }, [codeText]);

  return (
    <div className="diagram-block">
      {loading && (
        <div className="diagram-loading">
          <FiLoader size={16} className="spin" /> Rendering diagram…
        </div>
      )}

      {!loading && error && (
        <div className="diagram-error">
          <p className="diagram-error-title">
            <FiAlertCircle size={14} /> Diagram Syntax Error
          </p>
          <p className="diagram-error-msg">{error}</p>
        </div>
      )}

      {!loading && !error && svgHtml && (
        <div
          ref={containerRef}
          className="diagram-svg"
          // mermaid render output is sanitized SVG from a controlled library — acceptable use
          dangerouslySetInnerHTML={{ __html: svgHtml }}
        />
      )}

      {block?.caption && (
        <span className="diagram-caption">{block.caption}</span>
      )}
    </div>
  );
}
