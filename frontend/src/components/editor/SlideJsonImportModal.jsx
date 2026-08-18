import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Copy, Check, Sparkles, X, FileJson,
  AlertCircle, CheckCircle2, RotateCcw, ArrowDownCircle, Layers
} from 'lucide-react';
import {
  parseAndNormalizeJson,
  AI_PROMPT_TEMPLATE,
  SAMPLE_SLIDE_JSON
} from '../../lib/jsonParser.js';

export default function SlideJsonImportModal({
  isOpen,
  onClose,
  activeSlideIdx = 0,
  totalSlides = 1,
  onApply,
  currentSlideData = null,
}) {
  const [rawText, setRawText] = useState('');
  const [targetMode, setTargetMode] = useState('active_slide'); // 'active_slide' | 'append' | 'replace_all'
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCurrent, setCopiedCurrent] = useState(false);

  // Initialize with current active slide if empty when opened
  useEffect(() => {
    if (isOpen && !rawText && currentSlideData) {
      const cleanData = {
        title: currentSlideData.title || `Slide ${activeSlideIdx + 1}`,
        blocks: currentSlideData.blocks || [],
      };
      setRawText(JSON.stringify(cleanData, null, 2));
    }
  }, [isOpen]);

  // Real-time validation & detection
  const parseResult = useMemo(() => {
    if (!rawText.trim()) {
      return { status: 'empty', message: 'Paste JSON or a blocks array below' };
    }
    try {
      const result = parseAndNormalizeJson(rawText);
      return { status: 'valid', result };
    } catch (err) {
      return { status: 'error', message: err.message || 'Invalid JSON syntax' };
    }
  }, [rawText]);

  // Auto-switch target mode if full lesson or multi-slide is detected
  useEffect(() => {
    if (parseResult.status === 'valid') {
      if (parseResult.result.type === 'lesson') {
        setTargetMode('replace_all');
      } else if (parseResult.result.type === 'slides') {
        setTargetMode('append');
      }
    }
  }, [parseResult]);

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT_TEMPLATE);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2500);
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  };

  const handleCopyCurrentSlideJson = async () => {
    if (!currentSlideData) return;
    try {
      const slideJson = JSON.stringify(
        {
          title: currentSlideData.title || `Slide ${activeSlideIdx + 1}`,
          blocks: currentSlideData.blocks || [],
        },
        null,
        2
      );
      await navigator.clipboard.writeText(slideJson);
      setCopiedCurrent(true);
      setTimeout(() => setCopiedCurrent(false), 2000);
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  };

  const handleFormatJson = () => {
    try {
      let clean = rawText.trim();
      if (clean.startsWith('```')) {
        clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }
      const parsed = JSON.parse(clean);
      setRawText(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // ignore if invalid
    }
  };

  const handleLoadSample = () => {
    setRawText(JSON.stringify(SAMPLE_SLIDE_JSON, null, 2));
    setTargetMode('active_slide');
  };

  const handleApply = () => {
    if (parseResult.status !== 'valid') return;
    onApply({
      targetMode,
      data: parseResult.result,
      activeSlideIdx,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-3xl bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-md)] shadow-2xl overflow-hidden flex flex-col z-10 max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--line)] bg-[var(--surface)] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent)]/30 flex items-center justify-center shrink-0">
                <FileJson size={18} />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[var(--ink)] flex items-center gap-2">
                  <span>Import / Edit Slide JSON</span>
                  <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-[var(--surface-2)] text-[var(--muted)] border border-[var(--line)]">
                    Slide {activeSlideIdx + 1} of {totalSlides}
                  </span>
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  Paste structured JSON directly to populate slide blocks without manual typing.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-[var(--radius-sm)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* AI Prompt Copy Banner */}
          <div className="px-5 py-3 bg-[var(--surface-2)]/70 border-b border-[var(--line)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[var(--accent)] shrink-0" />
              <div className="text-xs text-[var(--ink)]">
                <strong className="font-semibold">Need AI to write the JSON?</strong>
                <span className="text-[var(--muted)] ml-1">Copy our exact schema prompt and paste your raw notes into ChatGPT or Claude.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  copiedPrompt
                    ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-bold'
                    : 'bg-[var(--surface)] text-[var(--accent)] border-[var(--line)] hover:border-[var(--accent)] shadow-xs'
                }`}
              >
                {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy AI Prompt'}</span>
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {/* Target Scope Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)]/40">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-2)] flex items-center gap-1.5">
                <Layers size={14} className="text-[var(--accent)]" /> Apply Target:
              </span>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setTargetMode('active_slide')}
                  className={`px-3 py-1 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer border ${
                    targetMode === 'active_slide'
                      ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold shadow-xs'
                      : 'bg-[var(--surface)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--line-strong)]'
                  }`}
                >
                  Active Slide ({activeSlideIdx + 1})
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMode('append')}
                  className={`px-3 py-1 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer border ${
                    targetMode === 'append'
                      ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold shadow-xs'
                      : 'bg-[var(--surface)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--line-strong)]'
                  }`}
                >
                  Append New Slide(s)
                </button>
                {parseResult.status === 'valid' && parseResult.result.type === 'lesson' && (
                  <button
                    type="button"
                    onClick={() => setTargetMode('replace_all')}
                    className={`px-3 py-1 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer border ${
                      targetMode === 'replace_all'
                        ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold shadow-xs'
                        : 'bg-[var(--surface)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--line-strong)]'
                    }`}
                  >
                    Replace Entire Note
                  </button>
                )}
              </div>
            </div>

            {/* JSON Code Input Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-semibold text-[var(--muted)] flex items-center gap-1.5">
                  <Code size={13} className="text-[var(--accent)]" /> Slide JSON / Blocks Array
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleFormatJson}
                    className="text-[11px] font-mono text-[var(--ink-2)] hover:text-[var(--accent)] hover:underline cursor-pointer"
                    title="Prettify JSON indentation"
                  >
                    Prettify
                  </button>
                  <span className="text-[var(--line)]">|</span>
                  <button
                    type="button"
                    onClick={handleLoadSample}
                    className="text-[11px] font-mono text-[var(--accent)] hover:underline cursor-pointer"
                  >
                    Load Sample
                  </button>
                  <span className="text-[var(--line)]">|</span>
                  <button
                    type="button"
                    onClick={() => setRawText('')}
                    className="text-[11px] font-mono text-[var(--muted)] hover:text-[var(--err)] cursor-pointer"
                  >
                    Clear
                  </button>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Paste JSON here, e.g.:\n{\n  "title": "My Slide Title",\n  "blocks": [\n    { "type": "heading", "level": 2, "content": "Hello World" },\n    { "type": "paragraph", "content": "Crisp slide content here." },\n    { "type": "callout", "variant": "tip", "content": "Key insight here." }\n  ]\n}`}
                  rows={14}
                  spellCheck={false}
                  className="w-full p-3.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-mono text-xs leading-relaxed outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all resize-y"
                />
              </div>
            </div>

            {/* Live Validation & Detection Status Feedback */}
            <div className="text-xs">
              {parseResult.status === 'valid' && (
                <div className="p-3 rounded-[var(--radius-md)] bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
                    <span>
                      <strong>Valid JSON! </strong>
                      {parseResult.result.type === 'blocks' && `Detected ${parseResult.result.count} block(s).`}
                      {parseResult.result.type === 'single_slide' && `Detected Slide: "${parseResult.result.slide.title}" with ${parseResult.result.slide.blocks.length} block(s).`}
                      {parseResult.result.type === 'slides' && `Detected ${parseResult.result.count} slide(s).`}
                      {parseResult.result.type === 'lesson' && `Detected full note with ${parseResult.result.slideCount} slide(s).`}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] uppercase font-bold opacity-80">Ready to Apply</span>
                </div>
              )}

              {parseResult.status === 'error' && (
                <div className="p-3 rounded-[var(--radius-md)] bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-rose-500" />
                  <span>
                    <strong>JSON Syntax Error:</strong> {parseResult.message}
                  </span>
                </div>
              )}

              {parseResult.status === 'empty' && (
                <p className="text-[11px] text-[var(--muted)] italic">
                  Tip: You can paste a single slide, an array of blocks, or a complete lesson object.
                </p>
              )}
            </div>
          </div>

          {/* Modal Footer Bar */}
          <div className="px-5 py-3.5 border-t border-[var(--line)] bg-[var(--surface)] flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleCopyCurrentSlideJson}
              className="text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--accent)] flex items-center gap-1.5 cursor-pointer"
            >
              {copiedCurrent ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copiedCurrent ? 'Copied Active Slide!' : 'Export Active Slide as JSON'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] text-xs font-semibold text-[var(--ink-2)] hover:text-[var(--ink)] hover:border-[var(--line-strong)] transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleApply}
                disabled={parseResult.status !== 'valid'}
                className="px-5 py-2 rounded-[var(--radius-md)] bg-[var(--accent)] text-[var(--accent-on)] text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--accent-strong)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shadow-xs"
              >
                <ArrowDownCircle size={15} />
                <span>
                  {targetMode === 'active_slide' && `Apply to Slide ${activeSlideIdx + 1}`}
                  {targetMode === 'append' && 'Append New Slide(s)'}
                  {targetMode === 'replace_all' && 'Apply Entire Note'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
