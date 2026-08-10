import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  X,
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
  Sparkles,
  Copy,
  Plus,
} from "lucide-react";
import { CustomSelect } from "../ui/Select.jsx";
import { CODE_LANGUAGES, CALLOUT_VARIANTS } from "../../lib/blocks.js";

const HEADING_OPTIONS = [
  { value: 1, label: "H1 - Page Title" },
  { value: 2, label: "H2 - Section Heading" },
  { value: 3, label: "H3 - Sub-section Heading" },
];

const CODE_LANG_OPTIONS = CODE_LANGUAGES.map((l) => ({ value: l.value, label: l.label }));

const CALLOUT_OPTIONS = Object.entries(CALLOUT_VARIANTS).map(([key, v]) => ({
  value: key,
  label: `${v.emoji} ${v.label}`,
}));

const IMAGE_SIZE_OPTIONS = [
  { value: "small", label: "Small (~320px)" },
  { value: "medium", label: "Medium (~560px)" },
  { value: "large", label: "Large (~800px)" },
  { value: "full", label: "Full Width" },
];

const IMAGE_ALIGN_OPTIONS = [
  { value: "left", label: "Left Aligned" },
  { value: "center", label: "Center Aligned" },
  { value: "right", label: "Right Aligned" },
];

const DIVIDER_STYLE_OPTIONS = [
  { value: "solid", label: "Solid Line" },
  { value: "dashed", label: "Dashed Line" },
  { value: "dotted", label: "Dotted Line" },
];

/**
 * BlockForm - Radix UI-powered inline form editor for each slide block.
 */
export default function BlockForm({ block, onChange, onDelete, onMoveUp, onMoveDown, isFirst, isLast, onOpenMediaLibrary }) {
  const [expanded, setExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const update = (patch) => onChange({ ...block, ...patch });

  const btnBase = "flex items-center gap-1 px-2.5 py-1 rounded-lg border border-border bg-background text-muted-foreground text-[0.72rem] font-extrabold cursor-pointer transition-colors hover:text-foreground hover:border-primary";
  const btnDanger = "text-rose-400 border-rose-500/40 bg-rose-500/10";

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden transition-all hover:border-primary/50 shadow-sm">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-muted/40 border-b border-border">
        <button
          type="button"
          className="flex items-center gap-2 bg-transparent border-none cursor-pointer text-foreground"
          onClick={() => setExpanded((e) => !e)}
        >
          <span className="text-[0.75rem] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
            <Zap size={14} /> {block.type}
          </span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className="flex items-center gap-1.5">
          {!isFirst && (
            <button type="button" className={btnBase} onClick={onMoveUp} title="Move block up">^</button>
          )}
          {!isLast && (
            <button type="button" className={btnBase} onClick={onMoveDown} title="Move block down">v</button>
          )}
          {confirmDelete ? (
            <>
              <button type="button" className={`${btnBase} ${btnDanger}`} onClick={onDelete} title="Confirm delete">
                <Check size={13} /> Delete Block
              </button>
              <button type="button" className={btnBase} onClick={() => setConfirmDelete(false)} title="Cancel">
                <X size={13} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className={`${btnBase} hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10`}
              onClick={() => setConfirmDelete(true)}
              title="Delete block"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Body Controls */}
      {expanded && (
        <div className="p-4 sm:p-5">
          <BlockFields block={block} update={update} onOpenMediaLibrary={onOpenMediaLibrary} />
        </div>
      )}
    </div>
  );
}

/* -- Shared field primitives -- */
const fieldGroup = "flex flex-col gap-3.5";
const fieldRow   = "flex flex-col gap-1.5";
const label      = "text-[0.75rem] font-black text-foreground flex items-center justify-between uppercase tracking-wider";
const hint       = "text-[0.7rem] font-semibold text-muted-foreground normal-case tracking-normal";
const inputCls   = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-semibold outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary";
const textareaCls = `${inputCls} resize-y leading-relaxed`;
const codeTaCls  = `${textareaCls} font-mono text-[0.82rem] leading-relaxed bg-[#090d16] text-[#00e57a] border-primary/25`;

function BlockFields({ block, update, onOpenMediaLibrary }) {
  switch (block.type) {
    case "heading":
      return (
        <div className={fieldGroup}>
          <div className={fieldRow}>
            <label className={label}>Heading Level</label>
            <CustomSelect
              value={block.level || 2}
              onValueChange={(val) => update({ level: parseInt(val) })}
              options={HEADING_OPTIONS}
              className="w-full sm:w-64"
            />
          </div>
          <div className={fieldRow}>
            <label className={label}>Heading Content Text</label>
            <input
              type="text"
              value={block.content || ""}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="e.g. C# Async State Machine Execution"
              className={inputCls}
            />
          </div>
        </div>
      );

    case "paragraph":
      return (
        <div className={fieldGroup}>
          <label className={label}>
            Paragraph Text
            <span className={hint}>Supports **bold**, *italic*, `code`, [text](url)</span>
          </label>
          <textarea
            value={block.content || ""}
            onChange={(e) => update({ content: e.target.value })}
            placeholder="Write paragraph content here..."
            rows={5}
            className={textareaCls}
          />
        </div>
      );

    case "code":
      return (
        <div className={fieldGroup}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={fieldRow}>
              <label className={label}>Programming Language</label>
              <CustomSelect
                value={block.language || "csharp"}
                onValueChange={(val) => update({ language: val })}
                options={CODE_LANG_OPTIONS}
              />
            </div>
            <div className={fieldRow}>
              <label className={label}>Filename <span className={hint}>(optional)</span></label>
              <input
                type="text"
                value={block.filename || ""}
                onChange={(e) => update({ filename: e.target.value })}
                placeholder="e.g. Program.cs"
                className={inputCls}
              />
            </div>
          </div>
          <div className={fieldRow}>
            <label className={label}>Production Code Snippet</label>
            <textarea
              value={block.content || ""}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="Paste code snippet here..."
              rows={9}
              className={codeTaCls}
              spellCheck={false}
            />
          </div>
        </div>
      );

    case "callout":
      return (
        <div className={fieldGroup}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={fieldRow}>
              <label className={label}>Callout Variant Theme</label>
              <CustomSelect
                value={block.variant || "tip"}
                onValueChange={(val) => update({ variant: val })}
                options={CALLOUT_OPTIONS}
              />
            </div>
            <div className={fieldRow}>
              <label className={label}>Custom Title <span className={hint}>(optional)</span></label>
              <input
                type="text"
                value={block.title || ""}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="Callout title header..."
                className={inputCls}
              />
            </div>
          </div>
          <div className={fieldRow}>
            <label className={label}>Callout Description</label>
            <textarea
              value={block.content || ""}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="Write callout message..."
              rows={4}
              className={textareaCls}
            />
          </div>
        </div>
      );

    case "diagram":
    case "mermaid":
      return (
        <div className={fieldGroup}>
          <label className={label}>
            Mermaid Diagram Code Syntax
            <a
              href="https://mermaid.js.org/syntax/flowchart.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.7rem] text-primary underline"
            >
              Mermaid Docs
            </a>
          </label>
          <textarea
            value={block.content || ""}
            onChange={(e) => update({ content: e.target.value })}
            placeholder={"graph TD\n    A[Client] --> B[Cache]\n    B --> C[DB]"}
            rows={8}
            className={codeTaCls}
            spellCheck={false}
          />
          <div className={fieldRow}>
            <label className={label}>Diagram Caption <span className={hint}>(optional)</span></label>
            <input
              type="text"
              value={block.caption || ""}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="Figure caption..."
              className={inputCls}
            />
          </div>
        </div>
      );

    case "image":
      return (
        <div className={fieldGroup}>
          <div className={fieldRow}>
            <label className={label}>Image URL Address</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={block.content || ""}
                onChange={(e) => update({ content: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className={inputCls}
              />
              {onOpenMediaLibrary && (
                <button
                  type="button"
                  onClick={onOpenMediaLibrary}
                  className="px-3.5 py-2.5 rounded-xl border border-border bg-muted text-foreground text-xs font-black whitespace-nowrap cursor-pointer hover:border-primary hover:text-primary transition-colors"
                >
                  Media Library
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={fieldRow}>
              <label className={label}>Image Display Size</label>
              <CustomSelect
                value={block.size || "medium"}
                onValueChange={(val) => update({ size: val })}
                options={IMAGE_SIZE_OPTIONS}
              />
            </div>
            <div className={fieldRow}>
              <label className={label}>Alignment Position</label>
              <CustomSelect
                value={block.align || "center"}
                onValueChange={(val) => update({ align: val })}
                options={IMAGE_ALIGN_OPTIONS}
              />
            </div>
          </div>
        </div>
      );

    case "divider":
      return (
        <div className={fieldGroup}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={fieldRow}>
              <label className={label}>Optional Divider Label</label>
              <input
                type="text"
                value={block.label || ""}
                onChange={(e) => update({ label: e.target.value })}
                placeholder="e.g. - Summary -"
                className={inputCls}
              />
            </div>
            <div className={fieldRow}>
              <label className={label}>Border Line Style</label>
              <CustomSelect
                value={block.style || "solid"}
                onValueChange={(val) => update({ style: val })}
                options={DIVIDER_STYLE_OPTIONS}
              />
            </div>
          </div>
        </div>
      );

    default:
      return <p className="text-xs text-muted-foreground">Editing default fields for block type: {block.type}</p>;
  }
}
