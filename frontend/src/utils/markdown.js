import { marked } from "marked";
import DOMPurify from "dompurify";

// Safe DOMPurify wrapper for browser & Node test environments
const sanitizeHtml = (html, config) => {
  if (DOMPurify && typeof DOMPurify.sanitize === "function") {
    return DOMPurify.sanitize(html, config);
  }
  if (typeof DOMPurify === "function") {
    try {
      const purify = DOMPurify({});
      if (purify && typeof purify.sanitize === "function") {
        return purify.sanitize(html, config);
      }
    } catch {}
  }
  return html;
};

// Configure marked for safe, well-formatted markdown rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
});

/**
 * Automatically detects unfenced raw Mermaid diagram blocks (e.g., graph TD, sequenceDiagram)
 * and wraps them in ```mermaid ... ``` code fences cleanly without swallowing normal text.
 */
export function autoWrapMermaid(markdownText = "") {
  if (!markdownText || typeof markdownText !== "string") return markdownText;

  const lines = markdownText.split("\n");
  const result = [];
  let inCodeBlock = false;
  let inRawMermaid = false;
  let mermaidBuffer = [];

  const mermaidStartRegex =
    /^\s*(graph(\s+[A-Za-z0-9_\-]+)?|flowchart(\s+[A-Za-z0-9_\-]+)?|sequenceDiagram|classDiagram|stateDiagram(-v2)?|erDiagram|gantt|pie|gitGraph|architecture-beta|mindmap|timeline|zenuml|quadrantChart|sankey|block-beta|kanban)/i;

  const isMermaidLine = (line) => {
    const trimmed = line.trim();
    if (!trimmed) return true; // empty line inside diagram is fine
    if (trimmed.startsWith("```")) return false;
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith(">") ||
      trimmed.startsWith("- ") ||
      trimmed.startsWith("* ") ||
      /^\d+\.\s/.test(trimmed)
    ) {
      return false;
    }
    if (
      trimmed.startsWith("graph ") ||
      trimmed === "graph" ||
      trimmed.startsWith("flowchart ") ||
      trimmed === "flowchart" ||
      trimmed.startsWith("sequenceDiagram") ||
      trimmed.startsWith("classDiagram") ||
      trimmed.startsWith("stateDiagram") ||
      trimmed.startsWith("erDiagram") ||
      trimmed.startsWith("gantt") ||
      trimmed.startsWith("pie") ||
      trimmed.startsWith("subgraph ") ||
      trimmed === "end" ||
      trimmed.includes("-->") ||
      trimmed.includes("->>") ||
      trimmed.includes("-->>") ||
      trimmed.includes("---") ||
      trimmed.includes("-.-") ||
      trimmed.includes("==>") ||
      trimmed.includes(":::") ||
      trimmed.startsWith("style ") ||
      trimmed.startsWith("classDef ") ||
      /^[A-Za-z0-9_\-\.\(\)]+(\s*\(\(|\s*\(\[|\s*\[\[|\s*\[\(|\s*\[|\s*\{|\s*\(\||>\s*|\s*\[\/|\s*\\|\s*-->|\s*->>|\s*---|:)/.test(
        trimmed,
      )
    ) {
      return true;
    }
    // Indented lines inside diagram
    if (line.startsWith("    ") || line.startsWith("\t")) {
      return true;
    }
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inRawMermaid) {
        result.push("```mermaid\n" + mermaidBuffer.join("\n").trim() + "\n```");
        mermaidBuffer = [];
        inRawMermaid = false;
      }
      inCodeBlock = !inCodeBlock;
      result.push(line);
      continue;
    }

    if (inCodeBlock) {
      result.push(line);
      continue;
    }

    if (!inRawMermaid && mermaidStartRegex.test(line)) {
      inRawMermaid = true;
      mermaidBuffer.push(line);
      continue;
    }

    if (inRawMermaid) {
      if (isMermaidLine(line)) {
        mermaidBuffer.push(line);
      } else {
        result.push("```mermaid\n" + mermaidBuffer.join("\n").trim() + "\n```");
        mermaidBuffer = [];
        inRawMermaid = false;
        result.push(line);
      }
      continue;
    }

    result.push(line);
  }

  if (inRawMermaid) {
    result.push("```mermaid\n" + mermaidBuffer.join("\n").trim() + "\n```");
  }

  return result.join("\n");
}

/**
 * Custom marked renderer for mermaid diagrams, quiz cards, and code blocks
 */
const renderer = new marked.Renderer();

renderer.code = (code, language, isEscaped) => {
  const rawCode = typeof code === "object" ? code.text : code;
  const langName =
    typeof code === "object" ? code.lang || language || "" : language || "";

  // Mermaid diagram code block: ```mermaid ... ```
  if (langName === "mermaid") {
    return `<div class="mermaid-wrapper my-6 p-4 rounded-2xl bg-card border border-border/80 flex flex-col items-center justify-center overflow-x-auto shadow-xs min-h-[140px]">
      <div class="mermaid w-full flex justify-center text-xs md:text-sm" data-code="${encodeURIComponent(rawCode)}">
        <div class="animate-pulse text-xs text-primary font-mono font-bold py-4">Rendering Diagram...</div>
      </div>
    </div>`;
  }

  // Quiz code block format: ```quiz ... ```
  if (langName === "quiz") {
    return `<div class="quiz-block-placeholder" data-quiz="${encodeURIComponent(rawCode)}"></div>`;
  }

  // Styled Code Block format for code snippets (javascript, csharp, etc.)
  const badgeLang = (langName || "code").toUpperCase();
  const escapedCode = sanitizeHtml(rawCode);

  return `<div class="relative group my-4 rounded-2xl overflow-hidden border border-border/80 bg-[#141923] shadow-md font-mono text-left">
    <div class="flex items-center justify-between px-4 py-2 bg-[#1b2230] border-b border-white/10 text-xs text-muted-foreground">
      <span class="font-bold text-primary uppercase tracking-wider text-[11px]">${badgeLang}</span>
      <button class="copy-code-btn flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white/90 text-[11px] font-bold transition-all cursor-pointer border border-white/10" data-code="${encodeURIComponent(rawCode)}">
        Copy
      </button>
    </div>
    <pre class="p-4 text-xs md:text-sm font-mono text-emerald-300/90 leading-relaxed overflow-x-auto whitespace-pre"><code>${escapedCode}</code></pre>
  </div>`;
};

/**
 * Custom image renderer supporting size & alignment options:
 * Example syntax: ![Caption | 300px | center](url)
 */
renderer.image = (href, title, text) => {
  const src = typeof href === "object" ? href.href : href;
  const rawAlt =
    typeof href === "object"
      ? href.text || href.title || ""
      : text || title || "";

  let widthCss = "max-width: 100%; width: 100%;";
  let alignContainerClass = "flex flex-col items-center justify-center my-6";
  let alignImgStyle = "margin: 0 auto;";
  let cleanAlt = rawAlt;

  if (rawAlt && rawAlt.includes("|")) {
    const parts = rawAlt.split("|").map((p) => p.trim());
    cleanAlt = parts[0];

    parts.slice(1).forEach((part) => {
      const p = part.toLowerCase();

      // Alignment check
      if (p === "center" || p === "align=center") {
        alignContainerClass = "flex flex-col items-center justify-center my-6";
        alignImgStyle = "margin: 0 auto;";
      } else if (p === "left" || p === "align=left") {
        alignContainerClass = "flex flex-col items-start justify-start my-6";
        alignImgStyle = "margin: 0;";
      } else if (p === "right" || p === "align=right") {
        alignContainerClass = "flex flex-col items-end justify-end my-6";
        alignImgStyle = "margin: 0 0 0 auto;";
      }

      // Size / Width check
      if (p === "small" || p === "250px" || p === "300px") {
        widthCss = "max-width: 300px; width: 100%;";
      } else if (p === "medium" || p === "500px" || p === "600px") {
        widthCss = "max-width: 550px; width: 100%;";
      } else if (p === "full" || p === "100%") {
        widthCss = "width: 100%;";
      } else if (
        p.startsWith("width=") ||
        p.endsWith("px") ||
        p.endsWith("%")
      ) {
        const val = p.replace("width=", "");
        widthCss = `max-width: ${val}; width: 100%;`;
      }
    });
  }

  const safeAlt = sanitizeHtml(cleanAlt);

  return `<div class="${alignContainerClass} group w-full">
    <div class="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/40" style="${widthCss}">
      <img src="${src}" alt="${safeAlt}" style="width: 100%; height: auto; max-height: 520px; object-fit: contain; ${alignImgStyle}" loading="lazy" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=800';" />
    </div>
    ${cleanAlt ? `<span class="mt-2 text-xs font-semibold text-muted-foreground/90 tracking-tight text-center max-w-xl">${safeAlt}</span>` : ""}
  </div>`;
};

marked.use({ renderer });

/**
 * Render markdown string to sanitized HTML.
 * Automatically wraps unfenced mermaid blocks, parses GFM markdown, and sanitizes HTML.
 */
export function renderMarkdown(markdown = "") {
  if (!markdown)
    return '<p class="text-muted-foreground">No content available.</p>';

  // Auto-wrap unfenced mermaid diagrams (e.g. graph TD pasted without ```mermaid)
  let processedMarkdown = autoWrapMermaid(markdown);

  // Transform raw data:image/... URIs into markdown images if not already inside ![alt](data:image...)
  if (typeof processedMarkdown === "string") {
    processedMarkdown = processedMarkdown.replace(
      /(?<!\]\()(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)/g,
      "![Image]($1)",
    );
  }

  const rawHtml = marked.parse(processedMarkdown);

  // Sanitize to prevent XSS — allow SVG/mermaid outputs, code blocks, and images
  const cleanHtml = sanitizeHtml(rawHtml, {
    ADD_DATA_URI_TAGS: ["img"],
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "hr",
      "strong",
      "em",
      "del",
      "code",
      "pre",
      "ul",
      "ol",
      "li",
      "blockquote",
      "a",
      "img",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "input",
      "label",
      "div",
      "span",
      "button",
      "svg",
      "g",
      "path",
      "text",
      "line",
      "rect",
      "circle",
      "polygon",
      "polyline",
      "defs",
      "marker",
      "foreignObject",
      "tspan",
      "style",
      "clippath",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "src",
      "alt",
      "title",
      "class",
      "id",
      "type",
      "checked",
      "disabled",
      "loading",
      "data-code",
      "data-quiz",
      "data-language",
      "data-rendered",
      "width",
      "height",
      "viewBox",
      "d",
      "fill",
      "stroke",
      "stroke-width",
      "stroke-dasharray",
      "marker-end",
      "transform",
      "style",
      "xmlns",
      "cx",
      "cy",
      "r",
      "x",
      "y",
      "x1",
      "y1",
      "x2",
      "y2",
    ],
    FORBID_TAGS: ["script", "iframe", "object", "embed"],
  });

  return cleanHtml;
}

/**
 * Dynamically initialize and render all Mermaid diagrams within a container or document.
 */
export async function renderMermaidDiagrams(containerNode = document) {
  if (typeof window === "undefined") return;

  const root = containerNode || document;
  const elements = root.querySelectorAll(".mermaid[data-code]");
  if (!elements || elements.length === 0) return;

  try {
    const mermaidModule = await import("mermaid");
    const mermaid = mermaidModule.default;
    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: "inherit",
    });

    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      if (el.getAttribute("data-rendered") === "true") continue;
      const rawCode = decodeURIComponent(el.getAttribute("data-code") || "");
      if (!rawCode.trim()) continue;

      const uniqueId = `mermaid-svg-${Math.random().toString(36).substring(2, 9)}-${Date.now()}-${i}`;
      try {
        const { svg } = await mermaid.render(uniqueId, rawCode.trim());
        el.innerHTML = svg;
        el.setAttribute("data-rendered", "true");
      } catch (err) {
        console.error("Mermaid render error for element:", err);
        el.innerHTML = `<div class="p-3 text-xs text-red-400 font-mono border border-red-500/30 rounded-xl bg-red-500/10 text-center">
          <p class="font-bold mb-1">⚠️ Diagram Syntax Error</p>
          <p class="text-[11px] opacity-80">${err?.message || "Check Mermaid diagram syntax"}</p>
        </div>`;
      }
    }
  } catch (err) {
    console.error("Failed to load Mermaid module:", err);
  }
}

/**
 * Global copy-to-clipboard listener for markdown code block copy buttons
 */
if (typeof window !== "undefined") {
  window.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-code-btn");
    if (btn) {
      const code = decodeURIComponent(btn.getAttribute("data-code") || "");
      if (code) {
        navigator.clipboard
          .writeText(code)
          .then(() => {
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span class="text-emerald-400">Copied!</span>';
            setTimeout(() => {
              btn.innerHTML = originalText;
            }, 2000);
          })
          .catch((err) => {
            console.error("Clipboard copy failed:", err);
          });
      }
    }
  });
}

/**
 * Calculate reading time for a text segment in minutes and seconds
 */
export function calculateSlideReadingTime(text = "") {
  const plainText = text
    .replace(/<[^>]+>/g, "")
    .replace(/[*#_~`>\[\]()!|-]/g, " ");
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  const seconds = Math.max(15, Math.ceil((words / 200) * 60));

  if (seconds < 60) {
    return `${seconds} sec read`;
  }
  const mins = Math.ceil(seconds / 60);
  return `${mins} min read`;
}
