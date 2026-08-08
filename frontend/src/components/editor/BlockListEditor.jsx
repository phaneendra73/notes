import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import BlockForm from './BlockForm.jsx';
import BlockPicker from './BlockPicker.jsx';
import BlockRenderer from '../blocks/BlockRenderer.jsx';
import { FiEye, FiEdit3 } from 'react-icons/fi';

/**
 * BlockListEditor — the main content editing area for a single slide.
 *
 * Shows the ordered list of blocks for the active slide.
 * Each block can be edited via BlockForm, moved, or deleted.
 * New blocks are added via BlockPicker.
 * A live preview of the rendered slide is togglable.
 *
 * @param {object[]} blocks - Current blocks array for the active slide
 * @param {function} onChange - Called with the updated blocks array
 * @param {function} [onOpenMediaLibrary] - Open media library modal (for image blocks)
 */
export default function BlockListEditor({ blocks = [], onChange, onOpenMediaLibrary }) {
  const [previewMode, setPreviewMode] = React.useState(false);

  const updateBlock = (idx, updatedBlock) => {
    const next = [...blocks];
    next[idx] = updatedBlock;
    onChange(next);
  };

  const deleteBlock = (idx) => {
    onChange(blocks.filter((_, i) => i !== idx));
  };

  const moveBlock = (idx, direction) => {
    const next = [...blocks];
    const target = idx + direction;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  const addBlock = (newBlock) => {
    onChange([...blocks, newBlock]);
  };

  return (
    <div className="block-list-editor">
      {/* Toolbar */}
      <div className="block-list-toolbar">
        <span className="block-list-count">
          {blocks.length} block{blocks.length !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          className={`block-list-preview-toggle ${previewMode ? 'active' : ''}`}
          onClick={() => setPreviewMode((p) => !p)}
        >
          {previewMode ? <><FiEdit3 size={14} /> Edit</> : <><FiEye size={14} /> Preview</>}
        </button>
      </div>

      {previewMode ? (
        /* ── Preview Mode ── */
        <div className="block-list-preview">
          <BlockRenderer blocks={blocks} />
        </div>
      ) : (
        /* ── Edit Mode ── */
        <div className="block-list-forms">
          {blocks.length === 0 && (
            <div className="block-list-empty">
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
