import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button.jsx';
import { Input } from '../ui/Input.jsx';
import { Label } from '../ui/Label.jsx';
import MediaLibraryModal from '../MediaLibraryModal.jsx';
import {
  FiPlus,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiImage,
  FiCode,
  FiHelpCircle,
  FiMaximize2,
  FiMinimize2,
  FiEye,
  FiEdit3,
  FiGrid,
  FiClock,
  FiLayers,
  FiSave,
  FiCopy,
  FiBold,
  FiItalic,
  FiList,
  FiCheckSquare,
  FiZap,
  FiX,
  FiCheck,
  FiCornerDownLeft,
  FiType,
  FiSliders,
} from 'react-icons/fi';
import { renderMarkdown, calculateSlideReadingTime } from '../../utils/markdown.js';

export default function VisualSlideEditor({
  slides = [],
  onChangeSlides,
  title,
  onChangeTitle,
  imageUrl,
  onChangeImageUrl,
  onSave,
  saving = false,
}) {
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [coverMediaModalOpen, setCoverMediaModalOpen] = useState(false);
  const [fullScreen, setFullScreen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashQuery, setSlashQuery] = useState('');
  const [lastAutoSaved, setLastAutoSaved] = useState(null);
  const [hasRestorableDraft, setHasRestorableDraft] = useState(false);
  const textareaRef = useRef(null);

  // Check for restorable draft on initial load
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem('kadha_active_editor_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.slides?.length > 0 && (parsed.title || parsed.slides.length > 1)) {
          setHasRestorableDraft(true);
        }
      }
    } catch {}
  }, []);

  // Auto-save timer every 5 seconds
  useEffect(() => {
    if (!slides || slides.length === 0) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          'kadha_active_editor_draft',
          JSON.stringify({ title, imageUrl, slides, updatedAt: new Date().toISOString() })
        );
        const now = new Date();
        setLastAutoSaved(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } catch {}
    }, 5000);

    return () => clearTimeout(timer);
  }, [slides, title, imageUrl]);

  // Restore draft handler
  const handleRestoreDraft = () => {
    try {
      const savedDraft = localStorage.getItem('kadha_active_editor_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title && onChangeTitle) onChangeTitle(parsed.title);
        if (parsed.imageUrl && onChangeImageUrl) onChangeImageUrl(parsed.imageUrl);
        if (parsed.slides && onChangeSlides) onChangeSlides(parsed.slides);
        setHasRestorableDraft(false);
      }
    } catch {}
  };

  const handleDismissDraft = () => {
    try {
      localStorage.removeItem('kadha_active_editor_draft');
      setHasRestorableDraft(false);
    } catch {}
  };

  const activeSlide = slides[activeSlideIdx] || slides[0] || { title: 'Concept 1', content: '' };

  // Handle slide updates
  const updateActiveSlide = (key, value) => {
    const updated = slides.map((s, i) => (i === activeSlideIdx ? { ...s, [key]: value } : s));
    onChangeSlides(updated);
  };

  // Add new slide
  const handleAddSlide = () => {
    const nextNum = slides.length + 1;
    const newSlide = {
      step: nextNum,
      title: `Concept ${nextNum}: Core Learning Point`,
      content: `## Concept ${nextNum}\n\nWrite your educational explanation here...\n\n> 💡 **Key Takeaway**: Highlight essential lessons for learners.`,
    };
    onChangeSlides([...slides, newSlide]);
    setActiveSlideIdx(slides.length);
  };

  // Duplicate slide
  const handleDuplicateSlide = (idx, e) => {
    e.stopPropagation();
    const source = slides[idx];
    const duplicated = {
      ...source,
      title: `${source.title} (Copy)`,
      step: slides.length + 1,
    };
    const updated = [...slides];
    updated.splice(idx + 1, 0, duplicated);
    onChangeSlides(updated);
    setActiveSlideIdx(idx + 1);
  };

  // Remove slide
  const handleRemoveSlide = (idxToRemove, e) => {
    e.stopPropagation();
    if (slides.length <= 1) return;
    const updated = slides.filter((_, i) => i !== idxToRemove);
    onChangeSlides(updated);
    if (activeSlideIdx >= idxToRemove && activeSlideIdx > 0) {
      setActiveSlideIdx((p) => p - 1);
    }
  };

  // Reorder slides
  const handleMoveSlide = (idx, direction, e) => {
    e.stopPropagation();
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const copy = [...slides];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    onChangeSlides(copy);
    setActiveSlideIdx(targetIdx);
  };

  /**
   * Smart block insertion at cursor position.
   * If cursor is preceded by '/', it strips the '/' and inserts the block inline!
   */
  const insertBlockAtCursor = (snippet) => {
    if (!textareaRef.current) {
      const current = activeSlide.content || '';
      updateActiveSlide('content', current ? `${current}\n\n${snippet}` : snippet);
      return;
    }

    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = activeSlide.content || '';

    let before = text.substring(0, start);
    let after = text.substring(end);

    // Strip trailing '/' if present
    if (before.endsWith('/')) {
      before = before.slice(0, -1);
    }

    const needsLeadingNewline = before.length > 0 && !before.endsWith('\n\n');
    const leading = needsLeadingNewline ? (before.endsWith('\n') ? '\n' : '\n\n') : '';

    const newContent = `${before}${leading}${snippet}${after}`;
    updateActiveSlide('content', newContent);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursor = before.length + leading.length + snippet.length;
        textareaRef.current.setSelectionRange(newCursor, newCursor);
      }
    }, 50);
  };

  // Apply inline formatting (**bold**, *italic*, `code`)
  const applyInlineFormatting = (prefix, suffix = prefix) => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = activeSlide.content || '';

    const selected = text.substring(start, end) || 'text';
    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    updateActiveSlide('content', newContent);
  };

  // Slash Command Palette Items
  const slashCommands = [
    { label: 'Heading 2', icon: 'H2', desc: 'Main concept heading', action: () => insertBlockAtCursor('## Section Heading') },
    { label: 'Heading 3', icon: 'H3', desc: 'Sub-concept header', action: () => insertBlockAtCursor('### Subheading Concept') },
    { label: 'Callout Box', icon: '💡', desc: 'Highlighted key takeaway', action: () => insertBlockAtCursor('> 💡 **Key Takeaway**: Highlight essential concept or formula.') },
    { label: 'C# / .NET Code Block', icon: '💻', desc: 'Code snippet with syntax highlighting', action: () => insertBlockAtCursor('```csharp\n// C# .NET Code Example\npublic async Task<int> ProcessDataAsync()\n{\n    await Task.Delay(100);\n    return 42;\n}\n```') },
    { label: 'Mermaid Diagram', icon: '📊', desc: 'Flowchart or architecture diagram', action: () => insertBlockAtCursor('```mermaid\nsequenceDiagram\nClient->>API: HTTP GET /api/v1/notes\nAPI-->>Client: 200 OK (JSON Payload)\n```') },
    { label: 'Interactive Quiz', icon: '🎯', desc: 'Knowledge check question card', action: () => insertBlockAtCursor('```quiz\nquestion: What is the time complexity of lookup in a Dictionary<TKey, TValue> in C#?\noptions:\n  - O(1) Average Case\n  - O(N)\n  - O(N log N)\nanswer: 0\nexplanation: Hash tables provide O(1) average time complexity for lookups.\n```') },
    { label: 'Media Library Image', icon: '🖼️', desc: 'Insert WebP image from library', action: () => setMediaModalOpen(true) },
    { label: 'Task Checklist', icon: '☑️', desc: 'Checklist step', action: () => insertBlockAtCursor('- [ ] Review algorithm complexity\n- [ ] Write unit test') },
  ];

  const filteredCommands = slashCommands.filter(
    (cmd) => cmd.label.toLowerCase().includes(slashQuery.toLowerCase()) || cmd.desc.toLowerCase().includes(slashQuery.toLowerCase())
  );

  // Insert image selected from Media Library into slide content
  const handleInsertImageFromLibrary = (imgUrl, altName) => {
    insertBlockAtCursor(`![${altName || 'Course Diagram'}](${imgUrl})`);
  };

  return (
    <div className={`w-full flex flex-col gap-6 ${fullScreen ? 'fixed inset-0 z-50 bg-background p-6 overflow-y-auto' : ''}`}>
      {/* ── Studio Top Header Bar ── */}
      <div className="p-5 rounded-[24px] border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 shadow-[0_12px_40px_rgba(2,6,23,0.06)] backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 flex-1 min-w-[300px]">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary via-emerald-400 to-teal-500 text-black flex items-center justify-center font-black shadow-[0_0_22px_var(--neon-glow)] shrink-0">
            <FiLayers size={22} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 border border-primary/30 px-2.5 py-0.5 rounded-full shadow-sm">
                Interactive Lesson Studio
              </span>
            </div>
            <Input
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="e.g. Building High-Performance WebSockets in Node.js"
              className="h-11 text-lg font-extrabold tracking-tight border-transparent hover:border-border focus:border-primary bg-background/60 rounded-xl"
            />
            {imageUrl && (
              <div className="mt-2 flex items-center gap-3 p-2 rounded-xl bg-background/80 border border-primary/30 max-w-md">
                <img src={imageUrl} alt="Course Cover" className="w-12 h-12 rounded-lg object-cover border border-border" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">{imageUrl}</p>
                  <p className="text-[10px] text-primary font-semibold">Course Cover Image Attached</p>
                </div>
                <button
                  onClick={() => onChangeImageUrl && onChangeImageUrl('')}
                  className="p-1 text-red-400 hover:text-red-500 text-xs font-bold"
                  title="Remove cover image"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Auto-Saved Badge */}
          {lastAutoSaved && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Saved {lastAutoSaved}
            </span>
          )}

          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-muted/30 border border-border/80">
            <button
              onClick={() => setPreviewMode(false)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                !previewMode ? 'bg-primary text-black shadow-[0_0_14px_var(--neon-glow)]' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FiEdit3 size={13} /> Visual Editor
            </button>
            <button
              onClick={() => setPreviewMode(true)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                previewMode ? 'bg-primary text-black shadow-[0_0_14px_var(--neon-glow)]' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <FiEye size={13} /> Live Reader Preview
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setCoverMediaModalOpen(true)}
            className="rounded-xl gap-1.5 font-extrabold text-xs border-purple-500/30 text-purple-400 hover:bg-purple-500/10 shadow-sm"
          >
            <FiImage size={14} /> Course Cover Image
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setMediaModalOpen(true)}
            className="rounded-xl gap-1.5 font-extrabold text-xs border-primary/30 text-primary hover:bg-primary/10 shadow-sm"
          >
            <FiImage size={14} /> Media Library
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setFullScreen((v) => !v)}
            className="rounded-xl p-2.5"
            title={fullScreen ? 'Exit Fullscreen Focus' : 'Fullscreen Focus Mode'}
          >
            {fullScreen ? <FiMinimize2 size={16} /> : <FiMaximize2 size={16} />}
          </Button>

          <Button
            size="sm"
            variant="default"
            disabled={saving}
            onClick={onSave}
            className="rounded-xl gap-1.5 font-extrabold text-xs shadow-[0_0_20px_var(--neon-glow)]"
          >
            <FiSave size={14} /> {saving ? 'Publishing...' : 'Save & Publish'}
          </Button>
        </div>
      </div>

      {/* ── Main Studio Split Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* ── Left Sidebar: Slide Organizer Cards ── */}
        <div className="md:col-span-4 rounded-[24px] border border-border bg-card p-4 flex flex-col gap-3.5 shadow-sm sticky top-6">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2 font-heading font-extrabold text-sm text-foreground">
              <FiGrid size={16} className="text-primary" /> Slide Sequence ({slides.length})
            </div>
            <Button
              size="xs"
              variant="default"
              onClick={handleAddSlide}
              className="rounded-xl gap-1 font-extrabold text-[11px] shadow-[0_0_12px_rgba(0,201,110,0.25)]"
            >
              <FiPlus size={13} /> Add Slide
            </Button>
          </div>

          {/* Slide Cards List */}
          <div className="flex flex-col gap-2.5 max-h-[64vh] overflow-y-auto pr-1">
            {slides.map((s, idx) => {
              const isActive = idx === activeSlideIdx;
              const hasQuiz = (s.content || '').includes('```quiz');
              const readTime = calculateSlideReadingTime(s.content);

              return (
                <motion.div
                  key={idx}
                  onClick={() => setActiveSlideIdx(idx)}
                  whileHover={{ scale: 1.01 }}
                  className={`flex flex-col gap-2 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'border-primary bg-gradient-to-r from-primary/15 via-primary/5 to-transparent text-foreground shadow-[0_4px_24px_rgba(0,201,110,0.14)]'
                      : 'border-border/70 hover:border-primary/40 hover:bg-muted/30 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                          isActive ? 'bg-primary text-black' : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className={`truncate text-xs ${isActive ? 'font-extrabold text-foreground' : 'font-semibold'}`}>
                        {s.title || `Concept ${idx + 1}`}
                      </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 shrink-0">
                      <button
                        disabled={idx === 0}
                        onClick={(e) => handleMoveSlide(idx, -1, e)}
                        className="p-1 hover:text-primary disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <FiChevronUp size={13} />
                      </button>
                      <button
                        disabled={idx === slides.length - 1}
                        onClick={(e) => handleMoveSlide(idx, 1, e)}
                        className="p-1 hover:text-primary disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <FiChevronDown size={13} />
                      </button>
                      <button
                        onClick={(e) => handleDuplicateSlide(idx, e)}
                        className="p-1 hover:text-primary cursor-pointer"
                        title="Duplicate Slide"
                      >
                        <FiCopy size={12} />
                      </button>
                      {slides.length > 1 && (
                        <button
                          onClick={(e) => handleRemoveSlide(idx, e)}
                          className="p-1 text-red-400 hover:text-red-500 cursor-pointer"
                          title="Delete Slide"
                        >
                          <FiTrash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Meta */}
                  <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground pl-8">
                    <span className="flex items-center gap-1">
                      <FiClock size={10} className="text-primary" /> {readTime}
                    </span>
                    {hasQuiz && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-extrabold border border-amber-500/20">
                        Quiz Card
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── Right Work Area: Slide Visual Editor ── */}
        <div className="md:col-span-8 rounded-[24px] border border-border bg-card p-6 flex flex-col gap-5 shadow-sm">
          {/* Active Slide Title Header */}
          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/20 border border-border/80">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] text-primary font-black uppercase tracking-wider flex items-center gap-1.5">
                <FiZap size={14} /> Slide {activeSlideIdx + 1} Title
              </Label>
              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1 bg-background px-2.5 py-1 rounded-full border border-border">
                <FiClock size={12} className="text-primary" /> {calculateSlideReadingTime(activeSlide.content)}
              </span>
            </div>
            <Input
              value={activeSlide.title}
              onChange={(e) => updateActiveSlide('title', e.target.value)}
              placeholder="e.g. Concept 1: Why HTTP Isn't Enough for Realtime Apps"
              className="h-11 text-base font-extrabold tracking-tight rounded-xl bg-background border-border focus:border-primary"
            />
          </div>

          {/* Sleek Quick Blocks Insertion Toolbar */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-card via-muted/30 to-card border border-border flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                <FiZap size={12} /> Quick Insert Blocks:
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">
                Click to insert inline at cursor
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => insertBlockAtCursor('## Section Heading')}
                className="px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <FiType size={13} /> Heading
              </button>

              <button
                onClick={() => insertBlockAtCursor('> 💡 **Key Takeaway**: Summarize core lesson here.')}
                className="px-3 py-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span>💡</span> Callout
              </button>

              <button
                onClick={() => insertBlockAtCursor('```javascript\n// Code example\nconst socket = new WebSocket("wss://api.example.com");\n```')}
                className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <FiCode size={13} /> Code Block
              </button>

              <button
                onClick={() => setMediaModalOpen(true)}
                className="px-3 py-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <FiImage size={13} /> Media Library
              </button>

              <button
                onClick={() => insertBlockAtCursor('```mermaid\nsequenceDiagram\nClient->>Server: Handshake Request\nServer-->>Client: 101 Switching Protocols\n```')}
                className="px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <span>📊</span> Diagram
              </button>

              <button
                onClick={() => insertBlockAtCursor('```quiz\nquestion: What is the main advantage of WebSockets?\noptions:\n  - Full-duplex real-time communication\n  - Better SEO indexing\n  - Database caching\nanswer: 0\nexplanation: WebSockets provide bi-directional real-time communication.\n```')}
                className="px-3 py-1.5 rounded-xl border border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <FiHelpCircle size={13} /> Quiz Card
              </button>
            </div>
          </div>

          {/* Visual Editor Area OR Live Reader Preview */}
          {!previewMode ? (
            <div className="relative flex flex-col gap-3">
              {/* Text Formatting Toolbar */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-background border border-border text-xs flex-wrap gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => applyInlineFormatting('**')}
                    className="px-2 py-1 rounded hover:bg-muted font-bold text-foreground cursor-pointer flex items-center gap-1"
                    title="Bold (**text**)"
                  >
                    <FiBold size={13} /> Bold
                  </button>
                  <button
                    onClick={() => applyInlineFormatting('*')}
                    className="px-2 py-1 rounded hover:bg-muted text-foreground cursor-pointer flex items-center gap-1"
                    title="Italic (*text*)"
                  >
                    <FiItalic size={13} /> Italic
                  </button>
                  <button
                    onClick={() => applyInlineFormatting('`')}
                    className="px-2 py-1 rounded hover:bg-muted font-mono text-primary cursor-pointer flex items-center gap-1"
                    title="Inline Code (`code`)"
                  >
                    <FiCode size={13} /> Code
                  </button>
                  <button
                    onClick={() => setMediaModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 font-extrabold cursor-pointer flex items-center gap-1.5 transition-colors"
                    title="Insert image from Media Library into slide"
                  >
                    <FiImage size={13} /> Insert Image in Slide
                  </button>
                  <button
                    onClick={() => insertBlockAtCursor('- [ ] Task step')}
                    className="px-2 py-1 rounded hover:bg-muted text-foreground cursor-pointer flex items-center gap-1"
                    title="Checklist"
                  >
                    <FiCheckSquare size={13} /> Checklist
                  </button>
                </div>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  Type <kbd className="px-1.5 py-0.5 rounded bg-muted text-primary border border-border font-mono font-black">/</kbd> for menu
                </span>
              </div>

              {/* Slide Content Textarea */}
              <textarea
                ref={textareaRef}
                value={activeSlide.content}
                onChange={(e) => {
                  const val = e.target.value;
                  updateActiveSlide('content', val);
                  if (val.endsWith('/') || val.includes('/')) {
                    const cursor = e.target.selectionStart;
                    const charBeforeCursor = val.slice(cursor - 1, cursor);
                    if (charBeforeCursor === '/') {
                      setSlashMenuOpen(true);
                      setSlashQuery('');
                    }
                  } else {
                    setSlashMenuOpen(false);
                  }
                }}
                rows={15}
                className="w-full p-5 rounded-2xl bg-background border border-border text-foreground font-mono text-sm leading-relaxed focus:outline-none focus:border-primary resize-y min-h-[350px] shadow-inner"
                placeholder="Write slide educational content here... Tip: Click 'Insert Image in Slide' above or type '/' to drop images, diagrams, code blocks between paragraphs."
              />

              {/* Slide Embedded Images Preview Strip */}
              {(() => {
                const imgMatches = Array.from((activeSlide.content || '').matchAll(/!\[(.*?)\]\((.*?)\)/g));
                if (imgMatches.length === 0) return null;
                return (
                  <div className="p-3 rounded-2xl bg-muted/20 border border-border flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1">
                      <FiImage size={12} /> Embedded Slide Images ({imgMatches.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {imgMatches.map((m, i) => (
                        <div key={i} className="flex items-center gap-2 p-1.5 rounded-xl bg-card border border-border/80 text-xs">
                          <img src={m[2]} alt={m[1] || 'Slide image'} className="w-9 h-9 rounded-lg object-cover border border-border shrink-0" />
                          <span className="truncate max-w-[120px] font-semibold text-[11px] text-foreground">{m[1] || 'Image'}</span>
                          <button
                            onClick={() => {
                              const newText = activeSlide.content.replace(m[0], '');
                              updateActiveSlide('content', newText);
                            }}
                            className="p-1 text-red-400 hover:text-red-500 font-bold text-[10px]"
                            title="Remove image from slide"
                          >
                            <FiX size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Floating Slash Commands Menu */}
              {slashMenuOpen && (
                <div className="absolute top-16 left-4 z-40 w-80 rounded-2xl border border-primary/40 bg-card/95 backdrop-blur-xl p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-2">
                  <div className="px-2 py-1 border-b border-border text-[11px] font-black uppercase tracking-wider text-primary flex items-center justify-between">
                    <span>Block Insert Menu</span>
                    <button onClick={() => setSlashMenuOpen(false)} className="text-muted-foreground hover:text-foreground">
                      <FiX size={14} />
                    </button>
                  </div>

                  <Input
                    autoFocus
                    placeholder="Search blocks..."
                    value={slashQuery}
                    onChange={(e) => setSlashQuery(e.target.value)}
                    className="h-8 text-xs rounded-xl"
                  />

                  <div className="max-h-64 overflow-y-auto flex flex-col gap-1 pr-1">
                    {filteredCommands.map((cmd, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          cmd.action();
                          setSlashMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs text-foreground hover:bg-primary/15 hover:text-primary transition-colors text-left cursor-pointer font-medium border border-transparent hover:border-primary/30"
                      >
                        <span className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                          {cmd.icon}
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-xs">{cmd.label}</span>
                          <span className="text-[10px] text-muted-foreground truncate">{cmd.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Live Reader Preview Canvas */
            <div className="p-6 md:p-8 rounded-2xl border border-primary/40 bg-card shadow-[0_16px_50px_rgba(0,201,110,0.06)] min-h-[350px]">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/60">
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-extrabold tracking-wide uppercase">
                  Slide {activeSlideIdx + 1} Preview
                </span>
                <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <FiClock size={13} className="text-primary" /> {calculateSlideReadingTime(activeSlide.content)}
                </span>
              </div>

              <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-foreground mb-5 tracking-tight leading-snug">
                {activeSlide.title}
              </h1>

              <div
                className="article-content markdown-body"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(activeSlide.content) }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Media Library Integration Modal for Slide Content */}
      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelectImage={handleInsertImageFromLibrary}
      />

      {/* Media Library Integration Modal for Course Cover Image */}
      <MediaLibraryModal
        isOpen={coverMediaModalOpen}
        onClose={() => setCoverMediaModalOpen(false)}
        onSelectImage={(imgUrl) => {
          if (onChangeImageUrl) onChangeImageUrl(imgUrl);
          setCoverMediaModalOpen(false);
        }}
      />
    </div>
  );
}
