import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Button } from '../components/ui/Button.jsx';
import BlockListEditor from '../components/editor/BlockListEditor.jsx';
import PageCanvas from '../components/reader/PageCanvas.jsx';
import MediaLibraryModal from '../components/MediaLibraryModal.jsx';
import TemplateSelectorModal from '../components/editor/TemplateSelectorModal.jsx';
import PageJsonImportModal from '../components/editor/PageJsonImportModal.jsx';
import useTags from '../hooks/useTags.js';
import {
  ArrowLeft, Save, Plus, Trash2, Tag,
  Eye, Loader2, ChevronDown, ChevronUp,
  Sliders, Sparkles, Layout, Monitor, Sun, Moon,
  FileJson
} from 'lucide-react';
import { createDefaultBlock } from '../lib/blocks.js';

const DEFAULT_PAGE = {
  orderNumber: 1,
  title: 'Introduction',
  blocks: [
    { type: 'heading', level: 2, content: 'Introduction' },
    { type: 'paragraph', content: 'Write your note content here.' },
  ],
};

export default function NoteEditorPage() {
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams();
  const noteId = paramId || searchParams.get('id');
  const navigate = useNavigate();
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  const { tags } = useTags();

  // Note metadata
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  // Pages
  const [pages, setPages] = useState([{ ...DEFAULT_PAGE }]);
  const [activePageIdx, setActivePageIdx] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [metaExpanded, setMetaExpanded] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTargetMode, setMediaTargetMode] = useState('page'); // 'page' | 'cover'
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [jsonModalOpen, setJsonModalOpen] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('jwt')) navigate('/signin');
  }, [navigate]);

  // Sync body.dark-theme class
  useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDark]);

  // Load existing note for editing
  useEffect(() => {
    if (!noteId) return;

    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await client.get(`/api/notes/${noteId}`, { params: { offset: 0, limit: 0 } });
        const note = res.data.note || res.data;

        setTitle(note.title || '');
        setExcerpt(note.excerpt || '');
        setCoverUrl(note.coverUrl || note.imageUrl || '');
        setPublished(note.published !== undefined ? Boolean(note.published) : (note.isPublished !== undefined ? Boolean(note.isPublished) : true));

        if (Array.isArray(note.tagObjects)) {
          setSelectedTagIds(note.tagObjects.map((t) => t.id));
        }

        const rawPages = note.pages;
        if (Array.isArray(rawPages) && rawPages.length > 0) {
          setPages(rawPages.map((p, i) => ({
            id: p.id,
            orderNumber: p.orderNumber || i + 1,
            title: p.title || `Page ${i + 1}`,
            blocks: Array.isArray(p.blocks) && p.blocks.length > 0
              ? p.blocks
              : [{ type: 'paragraph', content: '' }],
          })));
        }
      } catch (err) {
        console.error('Editor fetch error:', err);
        toast.error('Failed to load note for editing');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [noteId]);

  // Update active page's blocks
  const updateActiveBlocks = useCallback((newBlocks) => {
    setPages((prev) => {
      const next = [...prev];
      if (next[activePageIdx]) {
        next[activePageIdx] = { ...next[activePageIdx], blocks: newBlocks };
      }
      return next;
    });
  }, [activePageIdx]);

  // Update active page's title
  const updateActiveTitle = useCallback((newTitle) => {
    setPages((prev) => {
      const next = [...prev];
      if (next[activePageIdx]) {
        next[activePageIdx] = { ...next[activePageIdx], title: newTitle };
      }
      return next;
    });
  }, [activePageIdx]);

  // Add a new page
  const addPage = () => {
    const newPage = {
      orderNumber: pages.length + 1,
      title: `Page ${pages.length + 1}`,
      blocks: [createDefaultBlock('heading'), createDefaultBlock('paragraph')],
    };
    setPages((prev) => [...prev, newPage]);
    setActivePageIdx(pages.length);
    toast.success(`Page ${pages.length + 1} added`);
  };

  // Delete a page
  const deletePage = (idx) => {
    if (pages.length <= 1) {
      toast.error('Note must have at least one page');
      return;
    }
    const next = pages.filter((_, i) => i !== idx);
    setPages(next.map((p, i) => ({ ...p, orderNumber: i + 1 })));
    setActivePageIdx(Math.min(activePageIdx, next.length - 1));
    toast.info('Page removed');
  };

  // Move page up/down
  const movePage = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= pages.length) return;
    const next = [...pages];
    [next[idx], next[target]] = [next[target], next[idx]];
    setPages(next.map((p, i) => ({ ...p, orderNumber: i + 1 })));
    setActivePageIdx(target);
  };

  // Toggle tag selection
  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleOpenMediaLibrary = (mode = 'page') => {
    setMediaTargetMode(mode);
    setMediaModalOpen(true);
  };

  const handleSelectMediaImage = (url, filename, size, align) => {
    if (mediaTargetMode === 'cover') {
      setCoverUrl(url);
      toast.success('Cover image set!');
    } else {
      const newBlock = {
        type: 'image',
        content: url,
        caption: filename || '',
        size: size || 'medium',
        align: align || 'center',
      };
      updateActiveBlocks([...(pages[activePageIdx]?.blocks || []), newBlock]);
      toast.success('Image block added to page!');
    }
  };

  // Save note and redirect to Studio page
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        coverUrl,
        published,
        tagIds: selectedTagIds,
        pages: pages.map((p, i) => ({
          id: p.id,
          orderNumber: i + 1,
          title: p.title || `Page ${i + 1}`,
          blocks: p.blocks || [],
        })),
      };

      if (noteId) {
        await client.put(`/api/notes/${noteId}`, payload);
        toast.success('Visual note updated successfully!');
      } else {
        await client.post('/api/notes', payload);
        toast.success('Visual note created successfully!');
      }
      navigate('/studio');
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTemplate = (tmpl) => {
    if (!tmpl) return;
    if (!title || title === 'Untitled Note' || title.trim() === '') {
      setTitle(tmpl.defaultTitle);
    }
    if (!excerpt) {
      setExcerpt(tmpl.defaultExcerpt);
    }
    if (Array.isArray(tmpl.defaultTagIds) && tmpl.defaultTagIds.length > 0) {
      setSelectedTagIds((prev) => [...new Set([...prev, ...tmpl.defaultTagIds])]);
    }
    const templatePages = tmpl.pages || [];
    setPages(templatePages);
    setActivePageIdx(0);
    toast.success(`Template applied: ${tmpl.title}`);
  };

  const handleApplyJsonImport = ({ targetMode, data, activePageIdx: targetIdx }) => {
    if (!data) return;
    const resolvedIdx = typeof targetIdx === 'number' ? targetIdx : 0;

    if (data.type === 'blocks') {
      if (targetMode === 'append') {
        const newPage = {
          orderNumber: pages.length + 1,
          title: `Page ${pages.length + 1}`,
          blocks: data.blocks,
        };
        setPages((prev) => [...prev, newPage]);
        setActivePageIdx(pages.length);
        toast.success(`Page ${pages.length + 1} added with ${data.blocks.length} blocks!`);
      } else {
        setPages((prev) => {
          const next = [...prev];
          if (next[resolvedIdx]) {
            next[resolvedIdx] = { ...next[resolvedIdx], blocks: data.blocks };
          }
          return next;
        });
        toast.success(`Page ${resolvedIdx + 1} updated with ${data.blocks.length} blocks!`);
      }
    } else if (data.type === 'single_page') {
      const pageObj = data.page;
      if (targetMode === 'append') {
        const newPage = {
          orderNumber: pages.length + 1,
          title: pageObj.title,
          blocks: pageObj.blocks,
        };
        setPages((prev) => [...prev, newPage]);
        setActivePageIdx(pages.length);
        toast.success(`New page "${pageObj.title}" added!`);
      } else {
        setPages((prev) => {
          const next = [...prev];
          if (next[resolvedIdx]) {
            next[resolvedIdx] = {
              ...next[resolvedIdx],
              title: pageObj.title || next[resolvedIdx].title,
              blocks: pageObj.blocks,
            };
          }
          return next;
        });
        toast.success(`Page ${resolvedIdx + 1} updated successfully!`);
      }
    } else if (data.type === 'pages') {
      const incomingPages = data.pages;
      if (targetMode === 'replace_all') {
        setPages(incomingPages);
        setActivePageIdx(0);
        toast.success(`Replaced all pages (${incomingPages.length} pages loaded)!`);
      } else if (targetMode === 'append') {
        setPages((prev) => [
          ...prev,
          ...incomingPages.map((p, i) => ({ ...p, orderNumber: prev.length + i + 1 })),
        ]);
        setActivePageIdx(pages.length);
        toast.success(`Appended ${incomingPages.length} pages!`);
      } else {
        const first = incomingPages[0];
        const remaining = incomingPages.slice(1);
        setPages((prev) => {
          const next = [...prev];
          if (next[resolvedIdx]) {
            next[resolvedIdx] = { ...next[resolvedIdx], title: first.title, blocks: first.blocks };
          }
          if (remaining.length > 0) {
            remaining.forEach((p) => next.push(p));
          }
          return next.map((p, i) => ({ ...p, orderNumber: i + 1 }));
        });
        toast.success(`Applied ${incomingPages.length} page(s)!`);
      }
    } else if (data.type === 'note') {
      const noteObj = data.note;
      const notePages = noteObj.pages;
      if (targetMode === 'replace_all') {
        if (noteObj.title) setTitle(noteObj.title);
        if (noteObj.excerpt) setExcerpt(noteObj.excerpt);
        if (noteObj.coverUrl) setCoverUrl(noteObj.coverUrl);
        if (notePages?.length) {
          setPages(notePages);
          setActivePageIdx(0);
        }
        if (noteObj.tagIds?.length) {
          setSelectedTagIds(noteObj.tagIds);
        }
        toast.success(`Full note loaded (${notePages?.length || 0} pages)!`);
      } else if (targetMode === 'append') {
        if (notePages?.length) {
          setPages((prev) => [
            ...prev,
            ...notePages.map((p, i) => ({ ...p, orderNumber: prev.length + i + 1 })),
          ]);
          setActivePageIdx(pages.length);
          toast.success(`Appended ${notePages.length} pages from note JSON!`);
        }
      } else {
        if (notePages?.[0]) {
          const first = notePages[0];
          setPages((prev) => {
            const next = [...prev];
            if (next[resolvedIdx]) {
              next[resolvedIdx] = { ...next[resolvedIdx], title: first.title, blocks: first.blocks };
            }
            return next;
          });
          toast.success(`Page ${resolvedIdx + 1} updated from note JSON!`);
        }
      }
    }
  };

  const activePage = pages[activePageIdx] || pages[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-6 space-y-4 text-[var(--ink)]">
        <Loader2 size={36} className="text-[var(--accent)] animate-spin" />
        <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-widest">Loading Author Studio...</p>
      </div>
    );
  }

  return (
    <div className="editor-page min-h-screen flex flex-col bg-[var(--bg)] text-[var(--ink)] selection:bg-[var(--accent)] selection:text-[var(--accent-on)] font-sans">
      <SEO
        title={noteId ? `Edit: ${title || 'Note'} — Notes Author Studio` : 'Create Note — Notes Author Studio'}
      />

      {/* Editor Header Bar */}
      <header className="sticky top-0 z-50 h-14 border-b border-[var(--line)] bg-[var(--surface)] px-4 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/studio')}
            className="p-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer"
            title="Back to Author Studio"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="font-serif font-bold text-sm sm:text-base text-[var(--ink)] truncate max-w-xs">
            {noteId ? 'Edit Note' : 'Create New Note'}
          </span>
        </div>

        {/* Center: Live Preview Toggle */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[var(--surface-2)] p-1 rounded-[var(--radius-md)] border border-[var(--line)]">
          <button
            onClick={() => setShowLivePreview(false)}
            className={`px-3 py-1 rounded-[var(--radius-sm)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              !showLivePreview ? 'bg-[var(--accent)] text-[var(--accent-on)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Layout size={13} /> Full Form Editor
          </button>
          <button
            onClick={() => setShowLivePreview(true)}
            className={`px-3 py-1 rounded-[var(--radius-sm)] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showLivePreview ? 'bg-[var(--accent)] text-[var(--accent-on)] font-bold' : 'text-[var(--muted)] hover:text-[var(--ink)]'
            }`}
          >
            <Monitor size={13} /> Split Live Preview
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Paste JSON Modal Trigger */}
          <button
            onClick={() => setJsonModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] text-xs font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer shadow-xs"
            title="Import raw JSON or copy AI prompt template"
          >
            <FileJson size={13} className="text-[var(--accent)]" />
            <span>Paste JSON</span>
          </button>

          {/* Templates Selector Button */}
          <button
            onClick={() => setTemplateModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] text-xs font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer shadow-xs"
            title="Choose a pre-built engineering template"
          >
            <Sparkles size={13} className="text-[var(--accent)]" />
            <span>Templates</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="w-8.5 h-8.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] flex items-center justify-center text-[var(--ink)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all cursor-pointer"
            title="Toggle Light / Dark Theme"
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-[var(--ink-2)]" />}
          </button>

          {noteId && (
            <Link
              to={`/read?id=${noteId}`}
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] text-xs font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
            >
              <Eye size={14} className="text-[var(--accent)]" /> View Reader
            </Link>
          )}

          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="rounded-[var(--radius-md)] font-bold text-xs gap-1.5 px-4 bg-[var(--accent)] text-[var(--accent-on)] border border-[var(--accent-strong)] hover:bg-[var(--accent-strong)] cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save Note'}
          </Button>
        </div>
      </header>

      {/* Metadata Collapsible Bar */}
      <div className="border-b border-[var(--line)] bg-[var(--surface-2)] px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Visual Note Title..."
              className="bg-transparent font-serif font-bold text-base sm:text-lg text-[var(--ink)] outline-none w-full placeholder:text-[var(--muted)] truncate"
            />
          </div>

          <button
            onClick={() => setMetaExpanded(!metaExpanded)}
            className="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold flex items-center gap-1.5 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer text-[var(--ink)]"
          >
            <Tag size={13} className="text-[var(--accent)]" /> Settings & Tags
            {metaExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expanded Metadata Section */}
        <AnimatePresence>
          {metaExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-7xl mx-auto pt-3 mt-2 border-t border-[var(--line)] space-y-3 overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1 block">
                    Note Excerpt / Summary
                  </label>
                  <input
                    type="text"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Short summary for note catalog..."
                    className="w-full px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold outline-none focus:border-[var(--accent)] text-[var(--ink)]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1 block">
                    Cover Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-xs font-semibold outline-none focus:border-[var(--accent)] text-[var(--ink)]"
                    />
                    <button
                      type="button"
                      onClick={() => handleOpenMediaLibrary('cover')}
                      className="px-3 py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] text-xs font-semibold whitespace-nowrap hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
                    >
                      Library
                    </button>
                  </div>
                </div>
              </div>

              {/* Tag Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1 block">
                  Assign Category Tags
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => {
                    const selected = selectedTagIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => toggleTag(t.id)}
                        className={`px-3 py-1 rounded-[var(--radius-md)] text-xs font-semibold transition-all cursor-pointer border ${
                          selected
                            ? 'bg-[var(--accent)] text-[var(--accent-on)] border-[var(--accent-strong)] font-bold'
                            : 'bg-[var(--surface-2)] border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                        }`}
                      >
                        {t.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Page Navigation List */}
        <aside className="w-60 border-r border-[var(--line)] bg-[var(--surface-2)] p-4 flex flex-col justify-between hidden md:flex shrink-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] flex items-center gap-1.5">
                <Sliders size={14} /> Page Index ({pages.length})
              </span>
            </div>

            <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-14rem)] pr-1 custom-scrollbar">
              {pages.map((p, idx) => {
                const active = idx === activePageIdx;
                return (
                  <div
                    key={p.id || idx}
                    onClick={() => setActivePageIdx(idx)}
                    className={`p-2.5 rounded-[var(--radius-md)] border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer group ${
                      active
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
                        : 'border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--line-strong)] hover:text-[var(--ink)]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-mono text-[10px] text-[var(--accent)]">{idx + 1}.</span>
                      <span className="truncate">{p.title || `Page ${idx + 1}`}</span>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); movePage(idx, -1); }}
                        className="p-1 hover:text-[var(--accent)] cursor-pointer"
                        title="Move Up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); movePage(idx, 1); }}
                        className="p-1 hover:text-[var(--accent)] cursor-pointer"
                        title="Move Down"
                      >
                        ↓
                      </button>
                      {pages.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); deletePage(idx); }}
                          className="p-1 hover:text-[var(--err)] cursor-pointer"
                          title="Delete Page"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <Button
              size="sm"
              onClick={addPage}
              className="w-full rounded-[var(--radius-md)] font-semibold text-xs gap-1.5 bg-[var(--accent-soft)] border border-[var(--accent-soft)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--accent-on)] transition-all cursor-pointer"
            >
              <Plus size={14} /> Add New Page
            </Button>
            <button
              type="button"
              onClick={() => setJsonModalOpen(true)}
              className="w-full py-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--accent)] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Import JSON or paste page blocks"
            >
              <FileJson size={13} /> Import JSON
            </button>
          </div>
        </aside>

        {/* Center / Right: Form Editor & Split-Screen Live Preview */}
        <main className="flex-1 flex overflow-y-auto p-4 sm:p-6 gap-6 custom-scrollbar">
          {/* Page Form Editor */}
          <div className={`${showLivePreview ? 'w-full lg:w-1/2' : 'w-full max-w-4xl mx-auto'} space-y-6`}>
            <div className="p-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent)]">
                  Page {activePageIdx + 1} Title
                </label>
                <button
                  type="button"
                  onClick={() => setJsonModalOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] hover:underline cursor-pointer bg-[var(--accent-soft)]/50 px-2.5 py-1 rounded-[var(--radius-sm)] border border-[var(--accent)]/30 hover:bg-[var(--accent-soft)] transition-all"
                  title="Paste raw JSON for this page"
                >
                  <FileJson size={13} />
                  <span>Paste Page JSON</span>
                </button>
              </div>
              <input
                type="text"
                value={activePage.title || ''}
                onChange={(e) => updateActiveTitle(e.target.value)}
                placeholder="Enter page title..."
                className="w-full px-3.5 py-2.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--bg)] text-[var(--ink)] font-serif font-bold text-base outline-none focus:border-[var(--accent)]"
              />
            </div>

            {/* Page Block Form List */}
            <BlockListEditor
              blocks={activePage.blocks || []}
              onChange={updateActiveBlocks}
              onOpenMediaLibrary={() => handleOpenMediaLibrary('page')}
            />
          </div>

          {/* Split Live Canvas Preview */}
          {showLivePreview && (
            <div className="hidden lg:block w-1/2 sticky top-4 h-[calc(100vh-7rem)] overflow-y-auto p-4 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-md)] custom-scrollbar">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[var(--line)] text-xs">
                <span className="font-bold text-[var(--accent)] uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor size={14} /> Real-Time Page Canvas Preview
                </span>
                <span className="font-mono text-[10px] text-[var(--muted)]">Live Sync Active</span>
              </div>

              <PageCanvas
                page={activePage}
                pageIndex={activePageIdx}
                totalPages={pages.length}
                direction={1}
              />
            </div>
          )}
        </main>
      </div>

      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelect={handleSelectMediaImage}
      />

      <TemplateSelectorModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleApplyTemplate}
      />

      <PageJsonImportModal
        isOpen={jsonModalOpen}
        onClose={() => setJsonModalOpen(false)}
        activePageIdx={activePageIdx}
        totalPages={pages.length}
        currentPageData={activePage}
        onApply={handleApplyJsonImport}
      />
    </div>
  );
}
