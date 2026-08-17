import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  ArrowDown,
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

  const btnIcon = "flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] border border-border bg-background text-muted-foreground cursor-pointer transition-colors hover:text-primary hover:border-primary active:scale-95";
  const btnBase = "flex items-center gap-1 px-2.5 py-1 rounded-[var(--radius-sm)] border border-border bg-background text-muted-foreground text-[0.72rem] font-extrabold cursor-pointer transition-colors hover:text-foreground hover:border-primary";
  const btnDanger = "text-rose-400 border-rose-500/40 bg-rose-500/10";

  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-card overflow-hidden transition-all hover:border-primary/50 shadow-sm">
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
            <button type="button" className={btnIcon} onClick={onMoveUp} title="Move block up">
              <ArrowUp size={13} />
            </button>
          )}
          {!isLast && (
            <button type="button" className={btnIcon} onClick={onMoveDown} title="Move block down">
              <ArrowDown size={13} />
            </button>
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
              className={`${btnIcon} hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10`}
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
const inputCls   = "w-full px-3.5 py-2.5 rounded-[var(--radius-sm)] border border-border bg-background text-foreground text-xs font-semibold outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary";
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

    case "table": {
      const headers = Array.isArray(block.headers) && block.headers.length > 0 ? block.headers : ["Column 1", "Column 2", "Column 3"];
      const rows = Array.isArray(block.rows) && block.rows.length > 0 ? block.rows : [["", "", ""]];

      const updateHeader = (colIdx, value) => {
        const nextHeaders = [...headers];
        nextHeaders[colIdx] = value;
        update({ headers: nextHeaders });
      };

      const addColumn = () => {
        const newColName = `Column ${headers.length + 1}`;
        const nextHeaders = [...headers, newColName];
        const nextRows = rows.map((r) => [...(Array.isArray(r) ? r : []), ""]);
        update({ headers: nextHeaders, rows: nextRows });
      };

      const removeColumn = (colIdx) => {
        if (headers.length <= 1) return;
        const nextHeaders = headers.filter((_, i) => i !== colIdx);
        const nextRows = rows.map((r) => (Array.isArray(r) ? r.filter((_, i) => i !== colIdx) : []));
        update({ headers: nextHeaders, rows: nextRows });
      };

      const updateCell = (rowIdx, colIdx, value) => {
        const nextRows = rows.map((r, ri) => {
          if (ri !== rowIdx) return r;
          const newRow = Array.isArray(r) ? [...r] : [];
          newRow[colIdx] = value;
          return newRow;
        });
        update({ rows: nextRows });
      };

      const addRow = () => {
        const newRow = headers.map(() => "");
        update({ rows: [...rows, newRow] });
      };

      const removeRow = (rowIdx) => {
        if (rows.length <= 1) return;
        const nextRows = rows.filter((_, i) => i !== rowIdx);
        update({ rows: nextRows });
      };

      return (
        <div className={fieldGroup}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={fieldRow}>
              <label className={label}>Table Caption <span className={hint}>(optional)</span></label>
              <input
                type="text"
                value={block.caption || ""}
                onChange={(e) => update({ caption: e.target.value })}
                placeholder="e.g. Time Complexity Comparison"
                className={inputCls}
              />
            </div>
            <div className="flex items-center gap-4 pt-4 sm:pt-6">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-[var(--ink)]">
                <input
                  type="checkbox"
                  checked={block.striped !== false}
                  onChange={(e) => update({ striped: e.target.checked })}
                  className="rounded accent-[var(--accent)] cursor-pointer"
                />
                Striped Rows
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer select-none text-[var(--ink)]">
                <input
                  type="checkbox"
                  checked={block.bordered !== false}
                  onChange={(e) => update({ bordered: e.target.checked })}
                  className="rounded accent-[var(--accent)] cursor-pointer"
                />
                Bordered Grid
              </label>
            </div>
          </div>

          {/* Table Column Headers */}
          <div className={fieldRow}>
            <div className="flex items-center justify-between mb-1">
              <label className={label}>Column Headers ({headers.length})</label>
              <button
                type="button"
                onClick={addColumn}
                className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                <Plus size={13} /> Add Column
              </button>
            </div>
            <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(100px, 1fr))` }}>
              {headers.map((h, ci) => (
                <div key={ci} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={h}
                    onChange={(e) => updateHeader(ci, e.target.value)}
                    placeholder={`Header ${ci + 1}`}
                    className={`${inputCls} font-bold text-xs`}
                  />
                  {headers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColumn(ci)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer border-none bg-transparent"
                      title="Delete column"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Table Data Rows */}
          <div className={fieldRow}>
            <div className="flex items-center justify-between mb-1">
              <label className={label}>Data Rows ({rows.length})</label>
              <button
                type="button"
                onClick={addRow}
                className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                <Plus size={13} /> Add Row
              </button>
            </div>
            <div className="space-y-2">
              {rows.map((row, ri) => (
                <div key={ri} className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[var(--muted)] w-5 shrink-0 text-right">{ri + 1}.</span>
                  <div className="grid gap-2 flex-1" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(100px, 1fr))` }}>
                    {headers.map((_, ci) => (
                      <input
                        key={ci}
                        type="text"
                        value={(Array.isArray(row) ? row[ci] : "") || ""}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        placeholder={`Cell (${ri + 1}, ${ci + 1})`}
                        className={`${inputCls} text-xs`}
                      />
                    ))}
                  </div>
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(ri)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer border-none bg-transparent"
                      title="Delete row"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "quiz": {
      const options = Array.isArray(block.options) && block.options.length > 0 ? block.options : ["Option A", "Option B", "Option C", "Option D"];
      const answer = block.answer ?? 0;

      const updateOption = (idx, val) => {
        const next = [...options];
        next[idx] = val;
        update({ options: next });
      };

      const addOption = () => {
        update({ options: [...options, `Option ${String.fromCharCode(65 + options.length)}`] });
      };

      const removeOption = (idx) => {
        if (options.length <= 2) return;
        const next = options.filter((_, i) => i !== idx);
        const newAnswer = answer >= next.length ? next.length - 1 : answer;
        update({ options: next, answer: newAnswer });
      };

      return (
        <div className={fieldGroup}>
          <div className={fieldRow}>
            <label className={label}>Quiz Question</label>
            <input
              type="text"
              value={block.question || ""}
              onChange={(e) => update({ question: e.target.value })}
              placeholder="e.g. What is the time complexity of Binary Search?"
              className={inputCls}
            />
          </div>

          <div className={fieldRow}>
            <div className="flex items-center justify-between mb-1">
              <label className={label}>Multiple Choice Options (Select radio for correct answer)</label>
              {options.length < 6 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
                >
                  <Plus size={13} /> Add Option
                </button>
              )}
            </div>
            <div className="space-y-2">
              {options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`quiz-correct-${block.id || 'current'}`}
                    checked={answer === oi}
                    onChange={() => update({ answer: oi })}
                    className="accent-[var(--accent)] cursor-pointer"
                    title="Mark as correct answer"
                  />
                  <span className="font-mono text-xs font-bold text-[var(--accent)] w-4 text-center">
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(oi, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    className={`${inputCls} flex-1`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(oi)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer border-none bg-transparent"
                      title="Remove option"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className={fieldRow}>
            <label className={label}>Answer Explanation <span className={hint}>(shown after user submits answer)</span></label>
            <textarea
              value={block.explanation || ""}
              onChange={(e) => update({ explanation: e.target.value })}
              placeholder="Explain why this answer is correct..."
              rows={3}
              className={textareaCls}
            />
          </div>
        </div>
      );
    }

    case "steps": {
      const items = Array.isArray(block.items) && block.items.length > 0 ? block.items : ["Step 1", "Step 2", "Step 3"];
      const updateStep = (idx, val) => {
        const next = [...items];
        next[idx] = val;
        update({ items: next });
      };
      const addStep = () => {
        update({ items: [...items, "Next step"] });
      };
      const removeStep = (idx) => {
        if (items.length <= 1) return;
        update({ items: items.filter((_, i) => i !== idx) });
      };

      return (
        <div className={fieldGroup}>
          <div className={fieldRow}>
            <label className={label}>Steps Title <span className={hint}>(optional)</span></label>
            <input
              type="text"
              value={block.title || ""}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="e.g. Implementation Steps"
              className={inputCls}
            />
          </div>
          <div className={fieldRow}>
            <div className="flex items-center justify-between mb-1">
              <label className={label}>Numbered Steps ({items.length})</label>
              <button
                type="button"
                onClick={addStep}
                className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                <Plus size={13} /> Add Step
              </button>
            </div>
            <div className="space-y-2">
              {items.map((step, si) => (
                <div key={si} className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[var(--accent)] w-6 text-center">{si + 1}.</span>
                  <input
                    type="text"
                    value={step}
                    onChange={(e) => updateStep(si, e.target.value)}
                    placeholder={`Step ${si + 1} description`}
                    className={`${inputCls} flex-1`}
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(si)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer border-none bg-transparent"
                      title="Remove step"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case "keyvalue": {
      const pairs = Array.isArray(block.pairs) && block.pairs.length > 0 ? block.pairs : [{ key: "Term", value: "Definition" }];
      const updatePair = (idx, field, val) => {
        const next = pairs.map((p, i) => i === idx ? { ...p, [field]: val } : p);
        update({ pairs: next });
      };
      const addPair = () => {
        update({ pairs: [...pairs, { key: "", value: "" }] });
      };
      const removePair = (idx) => {
        if (pairs.length <= 1) return;
        update({ pairs: pairs.filter((_, i) => i !== idx) });
      };

      return (
        <div className={fieldGroup}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={fieldRow}>
              <label className={label}>Section Title <span className={hint}>(optional)</span></label>
              <input
                type="text"
                value={block.title || ""}
                onChange={(e) => update({ title: e.target.value })}
                placeholder="e.g. Key Terminology"
                className={inputCls}
              />
            </div>
            <div className={fieldRow}>
              <label className={label}>Display Layout</label>
              <CustomSelect
                value={block.layout || "list"}
                onValueChange={(val) => update({ layout: val })}
                options={[
                  { value: "list", label: "List View (Key on Left, Value on Right)" },
                  { value: "grid", label: "Grid View (Card Tiles)" },
                ]}
              />
            </div>
          </div>
          <div className={fieldRow}>
            <div className="flex items-center justify-between mb-1">
              <label className={label}>Key / Value Pairs ({pairs.length})</label>
              <button
                type="button"
                onClick={addPair}
                className="text-[11px] font-bold text-[var(--accent)] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
              >
                <Plus size={13} /> Add Pair
              </button>
            </div>
            <div className="space-y-2">
              {pairs.map((pair, pi) => (
                <div key={pi} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pair.key}
                    onChange={(e) => updatePair(pi, 'key', e.target.value)}
                    placeholder="Key / Term"
                    className={`${inputCls} w-1/3 font-semibold text-xs`}
                  />
                  <input
                    type="text"
                    value={pair.value}
                    onChange={(e) => updatePair(pi, 'value', e.target.value)}
                    placeholder="Value / Definition"
                    className={`${inputCls} flex-1 text-xs`}
                  />
                  {pairs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePair(pi)}
                      className="p-1 rounded text-rose-400 hover:bg-rose-500/10 cursor-pointer border-none bg-transparent"
                      title="Remove pair"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    default:
      return <p className="text-xs text-muted-foreground">Editing default fields for block type: {block.type}</p>;
  }
}
