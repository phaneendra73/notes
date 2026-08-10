import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import BlockForm     from "./BlockForm.jsx";
import BlockPicker   from "./BlockPicker.jsx";
import BlockRenderer from "../blocks/BlockRenderer.jsx";
import { FiEye, FiEdit3 } from "react-icons/fi";

/**
 * BlockListEditor — the main content editing area for a single slide.
 */
export default function BlockListEditor({ blocks = [], onChange, onOpenMediaLibrary }) {
  const [previewMode, setPreviewMode] = React.useState(false);

  const updateBlock = (idx, updated) => { const n = [...blocks]; n[idx] = updated; onChange(n); };
  const deleteBlock = (idx)          => onChange(blocks.filter((_, i) => i !== idx));
  const moveBlock   = (idx, dir)     => {
    const n = [...blocks];
    const t = idx + dir;
    if (t < 0 || t >= n.length) return;
    [n[idx], n[t]] = [n[t], n[idx]];
    onChange(n);
  };
  const addBlock = (nb) => onChange([...blocks, nb]);

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <span className="text-[0.75rem] font-extrabold text-muted-foreground uppercase tracking-widest">
          {blocks.length} block{blocks.length !== 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => setPreviewMode((p) => !p)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[0.75rem] font-extrabold cursor-pointer transition-all ${
            previewMode
              ? "border-primary text-primary bg-[var(--neon-subtle)]"
              : "border-border bg-card text-foreground"
          }`}
        >
          {previewMode ? <><FiEdit3 size={14} /> Edit</> : <><FiEye size={14} /> Preview</>}
        </button>
      </div>

      {previewMode ? (
        /* Preview */
        <div className="p-6 rounded-[1.25rem] border border-border bg-card">
          <BlockRenderer blocks={blocks} />
        </div>
      ) : (
        /* Edit */
        <div className="flex flex-col gap-3">
          {blocks.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-[0.85rem] border border-dashed border-border rounded-[1rem]">
              <p>No blocks yet. Add one below.</p>
            </div>
          )}

          <AnimatePresence initial={false}>
            {blocks.map((block, idx) => (
              <motion.div
                key={block.id || idx}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
              >
                <BlockForm
                  block={block}
                  onChange={(updated) => updateBlock(idx, updated)}
                  onDelete={() => deleteBlock(idx)}
                  onMoveUp={() => moveBlock(idx, -1)}
                  onMoveDown={() => moveBlock(idx, 1)}
                  isFirst={idx === 0}
                  isLast={idx === blocks.length - 1}
                  onOpenMediaLibrary={onOpenMediaLibrary}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <BlockPicker onAddBlock={addBlock} />
        </div>
      )}
    </div>
  );
}
