import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Type,
  AlignLeft,
  Code2,
  Zap,
  CheckSquare,
  GitBranch,
  Image as ImageIcon,
  Grid,
  Minus,
  List,
  Columns,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { BLOCK_LABELS, BLOCK_DESCRIPTIONS, BLOCK_PICKER_ORDER, createDefaultBlock } from "../../lib/blocks.js";

const CATEGORIES = [
  { id: "all", label: "All Blocks" },
  { id: "text", label: "Text & Headers", types: ["heading", "paragraph", "divider"] },
  { id: "code", label: "Code & Diagrams", types: ["code", "diagram"] },
  { id: "media", label: "Media & Tables", types: ["image", "table", "keyvalue"] },
  { id: "interactive", label: "Interactive", types: ["quiz", "callout", "steps"] },
];

const BLOCK_ICONS = {
  heading:   <Type size={16} />,
  paragraph: <AlignLeft size={16} />,
  code:      <Code2 size={16} />,
  callout:   <Zap size={16} />,
  quiz:      <CheckSquare size={16} />,
  diagram:   <GitBranch size={16} />,
  image:     <ImageIcon size={16} />,
  table:     <Grid size={16} />,
  divider:   <Minus size={16} />,
  steps:     <List size={16} />,
  keyvalue:  <Columns size={16} />,
};

/**
 * BlockPicker - Categorized popover command palette for adding blocks.
 */
export default function BlockPicker({ onAddBlock }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = BLOCK_PICKER_ORDER.filter((type) => {
    // Filter by category
    if (activeCategory !== "all") {
      const cat = CATEGORIES.find((c) => c.id === activeCategory);
      if (cat && cat.types && !cat.types.includes(type)) return false;
    }
    // Filter by search query
    if (!query) return true;
    const q = query.toLowerCase();
    return BLOCK_LABELS[type].toLowerCase().includes(q) || BLOCK_DESCRIPTIONS[type].toLowerCase().includes(q);
  });

  const handlePick = (type) => {
    onAddBlock(createDefaultBlock(type));
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative mt-3">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full py-3.5 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all hover:border-primary hover:bg-primary/15 hover:shadow-[0_0_20px_var(--neon-glow)]"
      >
        <Plus size={18} />
        Add Page Content Block
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-xs" onClick={() => { setOpen(false); setQuery(""); }} />

            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-[calc(100%+0.5rem)] left-0 right-0 z-[100] p-4 rounded-3xl border border-primary/40 bg-card/98 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] flex flex-col gap-3 max-h-[26rem]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-1">
                <span className="font-black text-xs text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" /> Add Content Block
                </span>
                <button
                  className="bg-transparent border-none text-muted-foreground cursor-pointer hover:text-foreground"
                  onClick={() => { setOpen(false); setQuery(""); }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex items-center rounded-xl border border-border bg-background px-3 py-2 text-xs">
                <Search size={14} className="text-primary mr-2 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search blocks (code, quiz, callout, diagram...)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-foreground outline-none font-medium placeholder:text-muted-foreground"
                />
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap items-center gap-1 pb-1 border-b border-border">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-colors cursor-pointer ${
                      activeCategory === cat.id
                        ? "bg-primary text-black"
                        : "bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Block List */}
              <div className="overflow-y-auto flex flex-col gap-1.5 pr-1">
                {filtered.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handlePick(type)}
                    className="w-full p-2.5 rounded-xl border border-transparent bg-muted/20 text-foreground flex items-center gap-3 text-left cursor-pointer transition-all hover:bg-primary/15 hover:border-primary/40 group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors shrink-0">
                      {BLOCK_ICONS[type]}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-black text-xs text-foreground group-hover:text-primary transition-colors">
                        {BLOCK_LABELS[type]}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium truncate">
                        {BLOCK_DESCRIPTIONS[type]}
                      </span>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="text-xs text-muted-foreground p-4 text-center">
                    No block types match "{query}"
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
