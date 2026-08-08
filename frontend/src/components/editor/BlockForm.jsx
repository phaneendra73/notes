import React, { useState, useRef } from 'react';
import { FiChevronDown, FiChevronUp, FiTrash2, FiEdit3, FiCheck, FiX } from 'react-icons/fi';
import { CODE_LANGUAGES, CALLOUT_VARIANTS } from '../../lib/blocks.js';

/**
 * BlockForm — inline form editor for each block type.
 * Renders appropriate input fields based on block.type.
 *
 * @param {object} block - The block being edited
 * @param {function} onChange - Called with the updated block
 * @param {function} onDelete - Called to delete this block
 * @param {function} onMoveUp - Called to move block up
 * @param {function} onMoveDown - Called to move block down
 * @param {boolean} isFirst - Is this the first block (no move up)
 * @param {boolean} isLast - Is this the last block (no move down)
 * @param {function} [onOpenMediaLibrary] - Open media library (for image blocks)
 */
export default function BlockForm({
  block,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  onOpenMediaLibrary,
}) {
  const [expanded, setExpanded] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const update = (patch) => onChange({ ...block, ...patch });

  return (
    <div className="block-form">
      {/* Block form header — type label + collapse + reorder + delete */}
      <div className="block-form-header">
        <button
          type="button"
          className="block-form-expand"
          onClick={() => setExpanded((e) => !e)}
        >
          <span className="block-form-type">{block.type}</span>
          {expanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
        </button>

        <div className="block-form-actions">
          {!isFirst && (
            <button type="button" className="block-form-btn" onClick={onMoveUp} title="Move up">
              ↑
            </button>
          )}
          {!isLast && (
            <button type="button" className="block-form-btn" onClick={onMoveDown} title="Move down">
              ↓
            </button>
          )}
          {confirmDelete ? (
            <>
              <button
                type="button"
                className="block-form-btn block-form-btn-danger"
                onClick={onDelete}
                title="Confirm delete"
              >
                <FiCheck size={13} /> Delete
              </button>
              <button
                type="button"
                className="block-form-btn"
                onClick={() => setConfirmDelete(false)}
                title="Cancel delete"
              >
                <FiX size={13} />
              </button>
            </>
          ) : (
            <button
              type="button"
              className="block-form-btn block-form-btn-delete"
              onClick={() => setConfirmDelete(true)}
              title="Delete block"
            >
              <FiTrash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Block form body */}
      {expanded && (
        <div className="block-form-body">
          <BlockFields
            block={block}
            update={update}
            onOpenMediaLibrary={onOpenMediaLibrary}
          />
        </div>
      )}
    </div>
  );
}

/**
 * BlockFields — type-specific form fields.
 */
function BlockFields({ block, update, onOpenMediaLibrary }) {
  switch (block.type) {
    case 'heading':
      return (
        <div className="field-group">
          <div className="field-row">
            <label className="field-label">Level</label>
            <select
              value={block.level || 2}
              onChange={(e) => update({ level: parseInt(e.target.value) })}
              className="field-select field-select-sm"
            >
              <option value={1}>H1 — Page Title</option>
              <option value={2}>H2 — Section Heading</option>
              <option value={3}>H3 — Sub-section</option>
            </select>
          </div>
          <div className="field-row">
            <label className="field-label">Text</label>
            <input
              type="text"
              value={block.content || ''}
              onChange={(e) => update({ content: e.target.value })}
              placeholder="Heading text…"
              className="field-input"
            />
          </div>
        </div>
      );

    case 'paragraph':
      return (
        <div className="field-group">
          <label className="field-label">
            Content
            <span className="field-hint">Supports **bold**, *italic*, `code`, [text](url)</span>
          </label>
          <textarea
            value={block.content || ''}
            onChange={(e) => update({ content: e.target.value })}
            placeholder="Paragraph text with optional **bold**, *italic*, `code`, or [links](url)…"
            rows={5}
            className="field-textarea"
          />
        </div>
      );

    case 'code':
      return (
        <div className="field-group">
          <div className="field-row">
            <label className="field-label">Language</label>
            <select
              value={block.language || 'csharp'}
              onChange={(e) => update({ language: e.target.value })}
              className="field-select"
            >
              {CODE_LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <label className="field-label">Filename <span className="field-hint">(optional)</span></label>
            <input
              type="text"
              value={block.filename || ''}
              onChange={(e) => update({ filename: e.target.value })}
              placeholder="e.g. Program.cs"
              className="field-input"
            />
          </div>
          <label className="field-label">Code</label>
          <textarea
            value={block.content || ''}
            onChange={(e) => update({ content: e.target.value })}
            placeholder="Paste your code here…"
            rows={10}
            className="field-textarea field-textarea-code"
            spellCheck={false}
          />
        </div>
      );

    case 'callout':
      return (
        <div className="field-group">
          <div className="field-row">
            <label className="field-label">Variant</label>
            <select
              value={block.variant || 'tip'}
              onChange={(e) => update({ variant: e.target.value })}
              className="field-select field-select-sm"
            >
              {Object.entries(CALLOUT_VARIANTS).map(([key, v]) => (
                <option key={key} value={key}>{v.emoji} {v.label}</option>
              ))}
            </select>
          </div>
          <div className="field-row">
            <label className="field-label">Title <span className="field-hint">(optional)</span></label>
            <input
              type="text"
              value={block.title || ''}
              onChange={(e) => update({ title: e.target.value })}
              placeholder="Leave blank to use variant default"
              className="field-input"
            />
          </div>
          <label className="field-label">
            Content
            <span className="field-hint">Supports **bold**, *italic*, `code`, [text](url)</span>
          </label>
          <textarea
            value={block.content || ''}
            onChange={(e) => update({ content: e.target.value })}
            placeholder="Callout message…"
            rows={4}
            className="field-textarea"
          />
        </div>
      );

    case 'quiz':
      return <QuizFields block={block} update={update} />;

    case 'diagram':
    case 'mermaid':
      return (
        <div className="field-group">
          <label className="field-label">
            Mermaid Diagram Code
            <a
              href="https://mermaid.js.org/syntax/flowchart.html"
              target="_blank"
              rel="noopener noreferrer"
              className="field-link"
            >
              Mermaid docs ↗
            </a>
          </label>
          <textarea
            value={block.content || ''}
            onChange={(e) => update({ content: e.target.value })}
            placeholder="graph TD&#10;    A[Start] --> B[Process]&#10;    B --> C[End]"
            rows={8}
            className="field-textarea field-textarea-code"
            spellCheck={false}
          />
          <div className="field-row">
            <label className="field-label">Caption <span className="field-hint">(optional)</span></label>
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="Figure caption…"
              className="field-input"
            />
          </div>
        </div>
      );

    case 'image':
      return (
        <div className="field-group">
          <div className="field-row field-row-image">
            <label className="field-label">Image URL</label>
            <div className="field-url-row">
              <input
                type="url"
                value={block.content || ''}
                onChange={(e) => update({ content: e.target.value })}
                placeholder="https://… or pick from Media Library"
                className="field-input"
              />
              {onOpenMediaLibrary && (
                <button
                  type="button"
                  className="field-media-btn"
                  onClick={onOpenMediaLibrary}
                >
                  Media Library
                </button>
              )}
            </div>
          </div>
          <div className="field-row">
            <label className="field-label">Caption</label>
            <input
              type="text"
              value={block.caption || ''}
              onChange={(e) => update({ caption: e.target.value })}
              placeholder="Optional caption text…"
              className="field-input"
            />
          </div>
          <div className="field-row">
            <label className="field-label">Size</label>
            <select
              value={block.size || 'medium'}
              onChange={(e) => update({ size: e.target.value })}
              className="field-select field-select-sm"
            >
              <option value="small">Small (~320px)</option>
              <option value="medium">Medium (~560px)</option>
              <option value="large">Large (~800px)</option>
              <option value="full">Full Width</option>
            </select>
          </div>
          <div className="field-row">
            <label className="field-label">Alignment</label>
            <select
              value={block.align || 'center'}
              onChange={(e) => update({ align: e.target.value })}
              className="field-select field-select-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
      );

    default:
      return <p className="field-unknown">Unknown block type: {block.type}</p>;
  }
}

/**
 * QuizFields — dedicated form for quiz block's complex structure.
 */
function QuizFields({ block, update }) {
  const options = Array.isArray(block.options) ? block.options : ['', ''];

  const updateOption = (idx, value) => {
    const next = [...options];
    next[idx] = value;
    update({ options: next });
  };

  const addOption = () => update({ options: [...options, ''] });

  const removeOption = (idx) => {
    if (options.length <= 2) return;
    const next = options.filter((_, i) => i !== idx);
    const correctAnswer = block.answer >= next.length ? 0 : block.answer;
    update({ options: next, answer: correctAnswer });
  };

  return (
    <div className="field-group">
      <label className="field-label">Question</label>
      <textarea
        value={block.question || ''}
        onChange={(e) => update({ question: e.target.value })}
        placeholder="What is the output of…?"
        rows={2}
        className="field-textarea"
      />

      <label className="field-label">
        Answer Options
        <span className="field-hint">Click the ✓ to mark the correct answer</span>
      </label>
      {options.map((opt, idx) => (
        <div key={idx} className="quiz-field-option">
          <button
            type="button"
            title="Mark as correct answer"
            className={`quiz-correct-btn ${block.answer === idx ? 'quiz-correct-active' : ''}`}
            onClick={() => update({ answer: idx })}
          >
            ✓
          </button>
          <input
            type="text"
            value={opt}
            onChange={(e) => updateOption(idx, e.target.value)}
            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
            className="field-input"
          />
          <button
            type="button"
            className="block-form-btn block-form-btn-delete"
            onClick={() => removeOption(idx)}
            disabled={options.length <= 2}
            title="Remove option"
          >
            <FiX size={13} />
          </button>
        </div>
      ))}
      <button type="button" className="quiz-add-option" onClick={addOption}>
        + Add Option
      </button>

      <label className="field-label">
        Explanation <span className="field-hint">(shown after answer)</span>
      </label>
      <textarea
        value={block.explanation || ''}
        onChange={(e) => update({ explanation: e.target.value })}
        placeholder="Explain why the correct answer is correct…"
        rows={3}
        className="field-textarea"
      />
    </div>
  );
}
