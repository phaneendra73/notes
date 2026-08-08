import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiType, FiAlignLeft, FiCode, FiZap, FiCheckSquare, FiGitBranch, FiImage, FiX } from 'react-icons/fi';
import { BLOCK_TYPES, BLOCK_LABELS, BLOCK_DESCRIPTIONS, BLOCK_PICKER_ORDER, createDefaultBlock } from '../../lib/blocks.js';

const BLOCK_ICONS = {
  heading:   <FiType size={16} />,
  paragraph: <FiAlignLeft size={16} />,
  code:      <FiCode size={16} />,
  callout:   <FiZap size={16} />,
  quiz:      <FiCheckSquare size={16} />,
  diagram:   <FiGitBranch size={16} />,
  image:     <FiImage size={16} />,
};

/**
 * BlockPicker — a popover button that lets the author add a new block of any type.
 *
 * @param {function} onAddBlock - Called with a new default Block object
 */
export default function BlockPicker({ onAddBlock }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const filtered = BLOCK_PICKER_ORDER.filter((type) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      BLOCK_LABELS[type].toLowerCase().includes(q) ||
      BLOCK_DESCRIPTIONS[type].toLowerCase().includes(q)
    );
  });

  const handlePick = (type) => {
    onAddBlock(createDefaultBlock(type));
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="block-picker-wrap">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="block-picker-trigger"
      >
        <FiPlus size={16} />
        Add Block
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="block-picker-backdrop"
              onClick={() => { setOpen(false); setQuery(''); }}
            />

            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className="block-picker-menu"
            >
              <div className="block-picker-header">
                <span className="block-picker-title">Add a Block</span>
                <button
                  className="block-picker-close"
                  onClick={() => { setOpen(false); setQuery(''); }}
                >
                  <FiX size={14} />
                </button>
              </div>

              <input
                autoFocus
                type="text"
                placeholder="Search block types…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="block-picker-search"
              />

              <div className="block-picker-list">
                {filtered.map((type) => (
                  <button
                    key={type}
                    type="button"
                    className="block-picker-item"
                    onClick={() => handlePick(type)}
                  >
                    <span className="block-picker-icon">{BLOCK_ICONS[type]}</span>
                    <div className="block-picker-info">
                      <span className="block-picker-label">{BLOCK_LABELS[type]}</span>
                      <span className="block-picker-desc">{BLOCK_DESCRIPTIONS[type]}</span>
                    </div>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <p className="block-picker-empty">No block types match "{query}"</p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
