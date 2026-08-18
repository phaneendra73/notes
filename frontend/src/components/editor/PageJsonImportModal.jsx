import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileJson, Sparkles, Copy, Check, CheckCircle2,
  AlertCircle, ArrowRight, Code, BookOpen
} from 'lucide-react';
import { Button } from '../ui/Button.jsx';
import {
  parseAndNormalizeJson,
  AI_PROMPT_TEMPLATE,
  SAMPLE_PAGE_JSON
} from '../../lib/jsonParser.js';

export default function PageJsonImportModal({
  isOpen,
  onClose,
  activePageIdx = 0,
  totalPages = 1,
  currentPageData = null,
  onApply,
}) {
  const [activeTab, setActiveTab] = useState('paste'); // 'paste' | 'prompt'
  const [rawText, setRawText] = useState('');
  const [targetMode, setTargetMode] = useState('active_page'); // 'active_page' | 'append' | 'replace_all'
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCurrent, setCopiedCurrent] = useState(false);

  const pageIndex = activePageIdx;
  const count = totalPages || 1;
  const pageData = currentPageData;

  // Real-time JSON validation & detection
  const parseResult = useMemo(() => {
    if (!rawText.trim()) return { status: 'idle' };
    try {
      const result = parseAndNormalizeJson(rawText);
      return { status: 'valid', result };
    } catch (err) {
      return { status: 'error', message: err.message || 'Invalid JSON syntax' };
    }
  }, [rawText]);

  // Auto-switch target mode if full note or multi-page is detected
  useEffect(() => {
    if (parseResult.status === 'valid') {
      if (parseResult.result.type === 'note') {
        setTargetMode('replace_all');
      } else if (parseResult.result.type === 'pages') {
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

  const handleCopyCurrentPageJson = async () => {
    if (!pageData) return;
    try {
      const jsonStr = JSON.stringify(
        {
          title: pageData.title || `Page ${pageIndex + 1}`,
          blocks: pageData.blocks || [],
        },
        null,
        2
      );
      await navigator.clipboard.writeText(jsonStr);
      setCopiedCurrent(true);
      setTimeout(() => setCopiedCurrent(false), 2500);
    } catch (err) {
      console.error('Clipboard error:', err);
    }
  };

  const handleLoadSample = () => {
    setRawText(JSON.stringify(SAMPLE_PAGE_JSON, null, 2));
  };

  const handleFormatJson = () => {
    if (parseResult.status === 'valid') {
      try {
        const parsed = JSON.parse(rawText);
        setRawText(JSON.stringify(parsed, null, 2));
      } catch {
        // no-op
      }
    }
  };

  const handleApply = () => {
    if (parseResult.status !== 'valid') return;
    onApply?.({
      targetMode,
      data: parseResult.result,
      activePageIdx: pageIndex,
    });
    setRawText('');
    onClose?.();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Modal Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-[var(--surface)] border border-[var(--line)] rounded-[var(--radius-xl)] shadow-2xl overflow-hidden z-10 my-auto flex flex-col max-h-[90vh]"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--line)] bg-[var(--surface-2)] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--accent-soft)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] font-bold">
                <FileJson size={17} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[var(--ink)] flex items-center gap-2">
                  <span>Import Page JSON & AI Generator</span>
                </h3>
                <p className="text-[11px] text-[var(--muted)] font-mono">
                  Paste structured JSON or copy AI generation prompts
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[var(--radius-md)] hover:bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--ink)] transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[var(--line)] bg-[var(--surface)] px-6 pt-2 gap-2 text-xs font-semibold shrink-0">
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'paste'
                  ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <FileJson size={14} /> Paste JSON Content
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`pb-2.5 px-3 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'prompt'
                  ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]'
              }`}
            >
              <Sparkles size={14} /> AI Prompt Template
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            {activeTab === 'paste' ? (
              <>
                {/* Target Destination Selector */}
                <div className="p-3 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="font-bold text-[var(--ink)]">Apply Target:</span>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setTargetMode('active_page')}
                      className={`px-3 py-1 rounded-[var(--radius-sm)] text-xs font-semibold transition-all cursor-pointer border ${
                        targetMode === 'active_page'
                          ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold shadow-xs'
                          : 'bg-[var(--surface)] text-[var(--ink-2)] border-[var(--line)] hover:border-[var(--line-strong)]'
                      }`}
                    >
                      Active Page ({pageIndex + 1})
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
                      Append New Page(s)
                    </button>
                    {parseResult.status === 'valid' && parseResult.result.type === 'note' && (
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
                      <Code size={13} className="text-[var(--accent)]" /> Page JSON / Blocks Array
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
                      placeholder={`Paste JSON here, e.g.:\n{\n  "title": "My Page Title",\n  "blocks": [\n    { "type": "heading", "level": 2, "content": "Hello World" },\n    { "type": "paragraph", "content": "Crisp page content here." },\n    { "type": "callout", "variant": "tip", "content": "Key insight here." }\n  ]\n}`}
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
                          {parseResult.result.type === 'single_page' && `Detected Page: "${parseResult.result.page.title}" with ${parseResult.result.page.blocks.length} block(s).`}
                          {parseResult.result.type === 'pages' && `Detected ${parseResult.result.count} page(s).`}
                          {parseResult.result.type === 'note' && `Detected full note with ${parseResult.result.pageCount} page(s).`}
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
                </div>
              </>
            ) : (
              /* Tab 2: AI Prompt Template */
              <div className="space-y-4 text-xs">
                <div className="p-3.5 rounded-[var(--radius-md)] bg-[var(--surface-2)] border border-[var(--line)] leading-relaxed text-[var(--ink-2)]">
                  <p className="font-semibold text-[var(--ink)] mb-1">How to use AI generation:</p>
                  <ol className="list-decimal list-inside space-y-1 text-[var(--muted)]">
                    <li>Copy the system prompt below to Claude, ChatGPT, Gemini, or DeepSeek.</li>
                    <li>Provide your topic (e.g. <em>"Explain C# Channels & Concurrency in 3 pages"</em>).</li>
                    <li>Copy the resulting JSON response and paste it into the <strong>Paste JSON Content</strong> tab.</li>
                  </ol>
                </div>

                <div className="relative">
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-mono text-xs text-[var(--muted)]">Prompt Template</span>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[var(--radius-sm)] bg-[var(--accent)] text-[var(--accent-on)] font-bold text-xs hover:bg-[var(--accent-strong)] transition-all cursor-pointer"
                    >
                      {copiedPrompt ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedPrompt ? 'Copied to Clipboard!' : 'Copy AI Prompt'}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-mono text-[11px] leading-relaxed overflow-x-auto max-h-72 custom-scrollbar">
                    {AI_PROMPT_TEMPLATE}
                  </pre>
                </div>

                {pageData && (
                  <div className="pt-2 flex items-center justify-between border-t border-[var(--line)]">
                    <span className="text-[var(--muted)] text-xs">Need current page JSON as an example?</span>
                    <button
                      type="button"
                      onClick={handleCopyCurrentPageJson}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      {copiedCurrent ? <Check size={13} /> : <Copy size={13} />}
                      <span>{copiedCurrent ? 'Page JSON Copied!' : `Copy Page ${pageIndex + 1} JSON`}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-6 py-3.5 border-t border-[var(--line)] bg-[var(--surface-2)] shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs cursor-pointer"
            >
              Cancel
            </Button>

            {activeTab === 'paste' && (
              <Button
                size="sm"
                onClick={handleApply}
                disabled={parseResult.status !== 'valid'}
                className="bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] text-xs font-bold gap-2 cursor-pointer shadow-xs"
              >
                <span>
                  {targetMode === 'active_page' && `Apply to Page ${pageIndex + 1}`}
                  {targetMode === 'append' && 'Append to Note'}
                  {targetMode === 'replace_all' && 'Replace Note Pages'}
                </span>
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
