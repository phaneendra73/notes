import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client.js';
import SEO from '../components/SEO.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import { Input } from '../components/ui/Input.jsx';
import BlockListEditor from '../components/editor/BlockListEditor.jsx';
import MediaLibraryModal from '../components/MediaLibraryModal.jsx';
import useTags from '../hooks/useTags.js';
import {
  FiArrowLeft, FiSave, FiPlus, FiTrash2, FiTag,
  FiEye, FiEyeOff, FiLoader, FiChevronDown, FiChevronUp, FiImage,
  FiSliders, FiLayers, FiCheck, FiArrowUp, FiArrowDown, FiX
} from 'react-icons/fi';
import { createDefaultBlock } from '../lib/blocks.js';

const DEFAULT_SLIDE = {
  orderNumber: 1,
  title: 'Introduction',
  blocks: [
    { type: 'heading', level: 2, content: 'Introduction' },
    { type: 'paragraph', content: 'Write your lesson content here.' },
  ],
};

export default function LessonEditorPage() {
  const [searchParams] = useSearchParams();
  const lessonId = searchParams.get('id');
  const navigate = useNavigate();
  const toast = useToast();

  const { tags } = useTags();

  // Lesson metadata
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [selectedTagIds, setSelectedTagIds] = useState([]);

  // Slides
  const [slides, setSlides] = useState([{ ...DEFAULT_SLIDE }]);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [metaExpanded, setMetaExpanded] = useState(false);
  const [mobileSlidesOpen, setMobileSlidesOpen] = useState(false);
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [mediaTargetMode, setMediaTargetMode] = useState('slide'); // 'slide' | 'cover'

  // Auth guard
  useEffect(() => {
    if (!localStorage.getItem('jwt')) navigate('/signin');
  }, [navigate]);

  // Load existing lesson for editing
  useEffect(() => {
    if (!lessonId) return;

    const fetchLesson = async () => {
      try {
        setLoading(true);
        const res = await client.get(`/api/lessons/${lessonId}`, { params: { offset: 0, limit: 0 } });
        const { lesson } = res.data;

        setTitle(lesson.title || '');
        setExcerpt(lesson.excerpt || '');
        setCoverUrl(lesson.coverUrl || lesson.imageUrl || '');
        setPublished(lesson.published !== undefined ? Boolean(lesson.published) : true);

        if (Array.isArray(lesson.tagObjects)) {
          setSelectedTagIds(lesson.tagObjects.map((t) => t.id));
        }

        if (Array.isArray(lesson.slides) && lesson.slides.length > 0) {
          setSlides(lesson.slides.map((s, i) => ({
            id: s.id,
            orderNumber: s.orderNumber || i + 1,
            title: s.title || `Slide ${i + 1}`,
            blocks: Array.isArray(s.blocks) && s.blocks.length > 0
              ? s.blocks
              : [{ type: 'paragraph', content: '' }],
          })));
        }
      } catch (err) {
        console.error('Editor fetch error:', err);
        toast.error('Failed to load lesson for editing');
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId]);

  // Update active slide's blocks
  const updateActiveBlocks = useCallback((newBlocks) => {
    setSlides((prev) => {
      const next = [...prev];
      if (next[activeSlideIdx]) {
        next[activeSlideIdx] = { ...next[activeSlideIdx], blocks: newBlocks };
      }
      return next;
    });
  }, [activeSlideIdx]);

  // Update active slide's title
  const updateActiveTitle = useCallback((newTitle) => {
    setSlides((prev) => {
      const next = [...prev];
      if (next[activeSlideIdx]) {
        next[activeSlideIdx] = { ...next[activeSlideIdx], title: newTitle };
      }
      return next;
    });
  }, [activeSlideIdx]);

  // Add a new slide
  const addSlide = () => {
    const newSlide = {
      orderNumber: slides.length + 1,
      title: `Slide ${slides.length + 1}`,
      blocks: [createDefaultBlock('heading'), createDefaultBlock('paragraph')],
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIdx(slides.length);
    toast.success(`Slide ${slides.length + 1} added`);
  };

  // Delete a slide
  const deleteSlide = (idx) => {
    if (slides.length <= 1) {
      toast.error('Lesson must have at least one slide');
      return;
    }
    const next = slides.filter((_, i) => i !== idx);
    setSlides(next.map((s, i) => ({ ...s, orderNumber: i + 1 })));
    setActiveSlideIdx(Math.min(activeSlideIdx, next.length - 1));
    toast.info('Slide removed');
  };

  // Move slide up/down
  const moveSlide = (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= slides.length) return;
    const next = [...slides];
    [next[idx], next[target]] = [next[target], next[idx]];
    setSlides(next.map((s, i) => ({ ...s, orderNumber: i + 1 })));
    setActiveSlideIdx(target);
  };

  // Toggle tag selection
  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleOpenMediaLibrary = (mode = 'slide') => {
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
      updateActiveBlocks([...(slides[activeSlideIdx]?.blocks || []), newBlock]);
      toast.success('Image block added to slide!');
    }
  };

  // Save lesson
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
        slides: slides.map((s, i) => ({
          id: s.id,
          orderNumber: i + 1,
          title: s.title || `Slide ${i + 1}`,
          blocks: s.blocks || [],
        })),
      };

      if (lessonId) {
        await client.put(`/api/lessons/${lessonId}`, payload);
        toast.success('Lesson updated successfully!');
      } else {
        const res = await client.post('/api/lessons', payload);
        const newId = res.data.id;
        toast.success('Lesson created!');
        navigate(`/editor?id=${newId}`, { replace: true });
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save lesson', err?.response?.data?.error);
    } finally {
      setSaving(false);
    }
  };

  const activeSlide = slides[activeSlideIdx];

  if (loading) {
    return (
      <div className="editor-loading p-6 space-y-4 max-w-6xl mx-auto">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <div className="editor-loading-body grid grid-cols-1 md:grid-cols-4 gap-6 h-[75vh]">
          <Skeleton className="h-full rounded-2xl col-span-1" />
          <Skeleton className="h-full rounded-2xl col-span-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page flex flex-col min-h-screen bg-background text-foreground">
      <SEO title={lessonId ? 'Edit Note — Notes' : 'Create Note — Notes'} />

      {/* ── Sleek Floating Sticky Top Bar ── */}
      <header className="editor-header sticky top-0 z-40 h-16 px-4 md:px-8 border-b border-border/80 bg-card/90 backdrop-blur-xl flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            className="editor-back-btn shrink-0"
            onClick={() => navigate('/studio')}
            title="Back to Studio"
          >
            <FiArrowLeft size={16} />
            <span className="hidden sm:inline">Studio</span>
          </button>

          <div className="h-5 w-[1px] bg-border shrink-0 hidden sm:block" />

          {/* Lesson Title Input */}
          <input
            className="editor-title-input flex-1 bg-transparent text-foreground font-heading font-extrabold text-base md:text-lg focus:outline-none placeholder:text-muted-foreground truncate"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled Tech Note…"
            maxLength={120}
          />
        </div>

        {/* Action Controls */}
        <div className="editor-header-actions flex items-center gap-3 shrink-0">
          <button
            className={`editor-publish-toggle px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              published ? 'published bg-primary/10 text-primary border border-primary/40' : 'draft bg-muted text-muted-foreground border border-border'
            }`}
            onClick={() => setPublished((p) => !p)}
            title={published ? 'Published to catalog' : 'Draft mode'}
          >
            {published ? <><FiEye size={13} /> Published</> : <><FiEyeOff size={13} /> Draft</>}
          </button>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="editor-save-btn rounded-full px-5 font-extrabold text-xs shadow-md shadow-primary/20"
            variant="neon"
          >
            {saving ? <FiLoader size={14} className="spin" /> : <FiSave size={14} />}
            {saving ? 'Saving…' : 'Save'}
          </Button>

          {/* Mobile slide drawer toggle */}
          <button
            className="md:hidden p-2 rounded-xl border border-border bg-card text-foreground"
            onClick={() => setMobileSlidesOpen(true)}
            title="Slides menu"
          >
            <FiLayers size={18} />
          </button>
        </div>
      </header>

      {/* ── Main Editor Canvas Layout ── */}
      <div className="editor-body flex-1 flex relative">
        {/* Left Desktop Panel: Slide Navigator */}
        <aside className="editor-slide-list w-64 hidden md:flex flex-col border-r border-border/80 bg-card/50 backdrop-blur-md shrink-0">
          <div className="slide-list-header px-4 py-3.5 border-b border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2 font-extrabold text-xs uppercase tracking-wider text-muted-foreground">
              <FiLayers size={14} className="text-primary" />
              <span>Slides ({slides.length})</span>
            </div>
            <button
              className="slide-list-add w-7 h-7 rounded-lg bg-primary text-black flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-xs"
              onClick={addSlide}
              title="Add new slide"
            >
              <FiPlus size={15} />
            </button>
          </div>

          <div className="slide-list-items flex-1 p-3 overflow-y-auto flex flex-col gap-2">
            {slides.map((slide, idx) => {
              const isActive = idx === activeSlideIdx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveSlideIdx(idx)}
                  className={`slide-list-item p-3 rounded-xl border transition-all cursor-pointer relative group flex items-center justify-between gap-2.5 ${
                    isActive
                      ? 'active bg-primary/10 border-primary shadow-[0_0_15px_var(--neon-subtle)] text-foreground font-bold'
                      : 'border-border/60 hover:border-primary/40 hover:bg-muted/50 text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className={`slide-list-num font-mono text-xs font-black px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-primary text-black' : 'bg-muted text-muted-foreground'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="slide-list-title text-xs font-bold truncate">
                      {slide.title || `Slide ${idx + 1}`}
                    </span>
                  </div>

                  {/* Slide controls */}
                  <div className="slide-list-controls opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    {idx > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSlide(idx, -1); }}
                        className="p-1 rounded bg-muted hover:text-primary"
                        title="Move up"
                      >
                        <FiArrowUp size={11} />
                      </button>
                    )}
                    {idx < slides.length - 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); moveSlide(idx, 1); }}
                        className="p-1 rounded bg-muted hover:text-primary"
                        title="Move down"
                      >
                        <FiArrowDown size={11} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }}
                      className="p-1 rounded bg-muted hover:text-red-400"
                      title="Delete slide"
                    >
                      <FiTrash2 size={11} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Main Canvas Writing Area ── */}
        <main className="editor-main flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full flex flex-col gap-6 overflow-y-auto">
          {/* Active Slide Header */}
          <div className="editor-slide-header bg-card p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col gap-2">
            <label className="field-label text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-2">
              <span>Slide {activeSlideIdx + 1} Title</span>
            </label>
            <Input
              value={activeSlide?.title || ''}
              onChange={(e) => updateActiveTitle(e.target.value)}
              placeholder="e.g. Memory Allocation in .NET CLR…"
              className="editor-slide-title-input text-lg font-heading font-extrabold"
            />
          </div>

          {/* Visual Block-based Editor */}
          <div className="bg-card p-5 md:p-7 rounded-2xl border border-border/80 shadow-sm">
            <BlockListEditor
              blocks={activeSlide?.blocks || []}
              onChange={updateActiveBlocks}
              onOpenMediaLibrary={() => handleOpenMediaLibrary('slide')}
            />
          </div>

          {/* ── Lesson Settings Drawer / Card ── */}
          <div className="editor-meta-section bg-card rounded-2xl border border-border/80 overflow-hidden shadow-xs">
            <button
              className="editor-meta-toggle w-full p-4 flex items-center justify-between font-extrabold text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={() => setMetaExpanded((e) => !e)}
            >
              <div className="flex items-center gap-2">
                <FiSliders size={15} className="text-primary" />
                <span>Note Settings &amp; Metadata</span>
              </div>
              {metaExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
            </button>

            {metaExpanded && (
              <div className="editor-meta-body p-5 border-t border-border/80 flex flex-col gap-5 bg-card/60">
                <div className="field-group">
                  <label className="field-label text-xs font-bold">
                    Excerpt / Short Summary <span className="field-hint text-muted-foreground font-normal">(displayed in lesson cards)</span>
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Provide a concise 1-2 sentence overview of this note…"
                    rows={2}
                    className="field-textarea p-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label text-xs font-bold">Cover Image Header</label>
                  <div className="field-url-row flex gap-2">
                    <Input
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/…"
                      className="field-input text-xs"
                    />
                    <button
                      type="button"
                      className="field-media-btn px-4 py-2 rounded-xl border border-border bg-muted text-xs font-bold flex items-center gap-1.5 hover:border-primary transition-all cursor-pointer shrink-0"
                      onClick={() => handleOpenMediaLibrary('cover')}
                    >
                      <FiImage size={14} /> Media Library
                    </button>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label text-xs font-bold">Subject Topics &amp; Tags</label>
                  <div className="editor-tags flex flex-wrap gap-2 pt-1">
                    {tags.map((tag) => {
                      const selected = selectedTagIds.includes(tag.id);
                      return (
                        <Badge
                          key={tag.id}
                          variant={selected ? 'default' : 'outline'}
                          onClick={() => toggleTag(tag.id)}
                          className={`editor-tag-badge cursor-pointer px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            selected ? 'bg-primary text-black shadow-xs' : 'hover:border-primary'
                          }`}
                        >
                          {tag.name}
                        </Badge>
                      );
                    })}
                    {tags.length === 0 && (
                      <span className="editor-no-tags text-xs text-muted-foreground">
                        No tags yet. Add tags in <Link to="/tags" className="text-primary underline">Tag Manager</Link>.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Mobile Slide Navigator Drawer ── */}
      <AnimatePresence>
        {mobileSlidesOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex justify-end md:hidden"
            onClick={() => setMobileSlidesOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-4/5 max-w-sm h-full bg-card border-l border-border flex flex-col p-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <span className="font-heading font-extrabold text-sm flex items-center gap-2">
                  <FiLayers className="text-primary" /> Slide Navigation
                </span>
                <button onClick={() => setMobileSlidesOpen(false)}>
                  <FiX size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-3 space-y-2">
                {slides.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveSlideIdx(idx);
                      setMobileSlidesOpen(false);
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                      idx === activeSlideIdx ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                    }`}
                  >
                    <span>{idx + 1}. {s.title || `Slide ${idx + 1}`}</span>
                    {idx === activeSlideIdx && <FiCheck size={14} />}
                  </div>
                ))}
              </div>

              <Button variant="neon" size="sm" onClick={addSlide} className="w-full gap-2 mt-2">
                <FiPlus size={14} /> Add New Slide
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelectImage={handleSelectMediaImage}
        mode={mediaTargetMode}
      />
    </div>
  );
}
