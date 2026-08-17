import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Tastefully styled ambient syntax tokens around the hero
const CODE_TOKENS = [
  // Left wing
  { text: "class",       type: "keyword",  top: "14%", left: "5%",   driftY: -5, driftX: 3, duration: 5.6, delay: 0.1 },
  { text: "{ }",         type: "bracket",  top: "22%", left: "17%",  driftY: 4,  driftX: -2, duration: 4.8, delay: 0.4 },
  { text: "threading",   type: "type",     top: "48%", left: "3%",   driftY: -5, driftX: 4, duration: 6.0, delay: 0.7 },
  { text: "??",          type: "operator", top: "54%", left: "15%",  driftY: 5,  driftX: -3, duration: 5.2, delay: 0.2 },
  { text: "async/await", type: "keyword",  top: "78%", left: "5%",   driftY: -6, driftX: 3, duration: 5.8, delay: 0.5 },

  // Right wing
  { text: "SELECT",      type: "keyword",  top: "14%", right: "5%",  driftY: 5,  driftX: -3, duration: 5.4, delay: 0.3 },
  { text: "[ ]",         type: "bracket",  top: "24%", right: "17%", driftY: -4, driftX: 2, duration: 4.6, delay: 0.6 },
  { text: "object",      type: "type",     top: "48%", right: "3%",  driftY: 6,  driftX: -4, duration: 6.2, delay: 0.2 },
  { text: "=>",          type: "operator", top: "56%", right: "15%", driftY: -5, driftX: 3, duration: 5.0, delay: 0.8 },
  { text: "Task<T>",     type: "type",     top: "76%", right: "6%",  driftY: 5,  driftX: -3, duration: 5.6, delay: 0.4 },
];

/**
 * KnowledgeConstellation — renders crisp, lightweight connecting filaments and nodes with Retina support.
 */
function KnowledgeConstellation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;
    const dpr = window.devicePixelRatio || 1;
    let width = canvas.offsetWidth;
    let height = canvas.offsetHeight;

    const resize = () => {
      if (!canvas) return;
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    // Subtle background constellation nodes
    const nodeCount = Math.min(20, Math.floor(width / 48));
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      radius: Math.random() * 1.5 + 1.1,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const isDark =
        document.body.classList.contains("dark-theme") ||
        document.documentElement.classList.contains("dark");
      const nodeColor = isDark
        ? "rgba(74, 222, 128, 0.45)"
        : "rgba(22, 101, 52, 0.35)";
      const lineColor = isDark ? "rgba(74, 222, 128, " : "rgba(22, 101, 52, ";

      // Connect filaments between nearby nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;

          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (isDark ? 0.18 : 0.12);
            ctx.beginPath();
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Update nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-80"
    />
  );
}

export default function HeroSection() {
  return (
    <section className="relative w-full pt-5 pb-5 sm:pt-7 sm:pb-7 md:pt-8 md:pb-8 overflow-hidden select-none">
      {/* Background Animated Constellation Filaments */}
      <KnowledgeConstellation />

      {/* Floating Syntax Highlighted Code Tokens */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
        {CODE_TOKENS.map((token, idx) => {
          let tokenStyles = "text-[var(--ink-2)] bg-[var(--surface-2)]/50 border-[var(--line)]/50";
          if (token.type === "keyword") {
            tokenStyles = "text-[var(--accent)] bg-[var(--accent-soft)]/15 border-[var(--accent)]/30";
          } else if (token.type === "operator" || token.type === "bracket") {
            tokenStyles = "text-[var(--muted)] bg-[var(--surface-2)]/30 border-[var(--line)]/30";
          }

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{
                opacity: [0.65, 0.85, 0.65],
                y: [0, token.driftY, 0],
                x: [0, token.driftX, 0],
              }}
              transition={{
                duration: token.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: token.delay,
              }}
              style={{
                top: token.top,
                left: token.left,
                right: token.right,
              }}
              className={`absolute hidden sm:inline-flex items-center px-2 py-0.5 rounded-[var(--radius-sm)] border text-[11px] font-mono tracking-tight shadow-2xs backdrop-blur-2xs ${tokenStyles}`}
            >
              <span>{token.text}</span>
            </motion.div>
          );
        })}
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 text-center space-y-2.5">
        {/* Compact Editorial Top Badge */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[var(--radius-sm)] text-[11px] font-mono font-medium bg-[var(--surface-2)]/90 text-[var(--accent)] border border-[var(--line)] shadow-xs"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          <span>Interactive Notes</span>
        </motion.div>

        {/* Clean Single-Line Display Headline: "Knowledge, written clearly." */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-1.5"
        >
          <h1 className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] text-[var(--ink)] tracking-[-0.03em] leading-tight">
            <span>Knowledge,</span>{" "}
            <span className="font-serif italic font-normal text-[var(--accent)] tracking-[-0.02em]">
              written clearly.
            </span>
          </h1>

          {/* Compact Subtitle */}
          <p className="text-xs sm:text-sm text-[var(--ink-2)] max-w-md mx-auto leading-relaxed font-normal">
            Distilled mental models, interactive diagrams, and deep dives into core concepts.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
