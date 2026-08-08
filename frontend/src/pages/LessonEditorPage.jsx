import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

/**
 * LessonEditorPage — visual block-based lesson authoring interface.
 *
 * Left panel: slide list
 * Right panel: selected slide editor (BlockListEditor) + lesson metadata
 */
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
      next[activeSlideIdx] = { ...next[activeSlideIdx], blocks: newBlocks };
      return next;
    });
  }, [activeSlideIdx]);

  // Update active slide's title
  const updateActiveTitle = useCallback((newTitle) => {
    setSlides((prev) => {
      const next = [...prev];
      next[activeSlideIdx] = { ...next[activeSlideIdx], title: newTitle };
      return next;
    });
  }, [activeSlideIdx]);

  // Add a new slide
  const addSlide = () => {
    const newSlide = {
      orderNumber: slides.length + 1,
      title: `Slide ${slides.length + 1}`,
      blocks: [createDefaultBlock('paragraph')],
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIdx(slides.length);
  };

  // Delete a slide
  const deleteSlide = (idx) => {
    if (slides.length <= 1) {
      toast.error('Cannot delete the only slide');
      return;
    }
    const next = slides.filter((_, i) => i !== idx);
    setSlides(next.map((s, i) => ({ ...s, orderNumber: i + 1 })));
    setActiveSlideIdx(Math.min(activeSlideIdx, next.length - 1));
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
      // Add or update image block on current slide
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
        toast.success('Lesson updated');
      } else {
        const res = await client.post('/api/lessons', payload);
        const newId = res.data.id;
        toast.success('Lesson created');
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
      <div className="editor-loading">
        <Skeleton className="h-14 w-full" />
        <div className="editor-loading-body">
          <Skeleton className="h-full w-56 rounded-2xl" />
          <Skeleton className="h-full flex-1 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="editor-page">
      <SEO title={lessonId ? 'Edit Lesson — Kadha' : 'New Lesson — Kadha'} />

      {/* Editor Header */}
      <header className="editor-header">
        <button className="editor-back-btn" onClick={() => navigate('/studio')}>
          <FiArrowLeft size={16} /> Studio
        </button>

        <input
          className="editor-title-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Lesson title…"
          maxLength={120}
        />

        <div className="editor-header-actions">
          <button
            className={`editor-publish-toggle ${published ? 'published' : 'draft'}`}
            onClick={() => setPublished((p) => !p)}
            title={published ? 'Click to set as draft' : 'Click to publish'}
          >
            {published ? <><FiEye size={13} /> Published</> : <><FiEyeOff size={13} /> Draft</>}
          </button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="editor-save-btn"
            variant="neon"
          >
            {saving ? <FiLoader size={14} className="spin" /> : <FiSave size={14} />}
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </header>

      <div className="editor-body">
        {/* Left: Slide List */}
        <aside className="editor-slide-list">
          <div className="slide-list-header">
            <span>Slides ({slides.length})</span>
            <button className="slide-list-add" onClick={addSlide} title="Add slide">
              <FiPlus size={14} />
            </button>
          </div>

          <div className="slide-list-items">
            {slides.map((slide, idx) => (
              <div
                key={idx}
                className={`slide-list-item ${idx === activeSlideIdx ? 'active' : ''}`}
                onClick={() => setActiveSlideIdx(idx)}
              >
                <span className="slide-list-num">{idx + 1}</span>
                <span className="slide-list-title">{slide.title || `Slide ${idx + 1}`}</span>
                <div className="slide-list-controls">
                  {idx > 0 && (
                    <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, -1); }} title="Move up">↑</button>
                  )}
                  {idx < slides.length - 1 && (
                    <button onClick={(e) => { e.stopPropagation(); moveSlide(idx, 1); }} title="Move down">↓</button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSlide(idx); }}
                    className="slide-delete-btn"
                    title="Delete slide"
                  >
                    <FiTrash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main: Active Slide Editor */}
        <main className="editor-main">
          <div className="editor-slide-header">
            <label className="field-label">Slide Title</label>
            <Input
              value={activeSlide?.title || ''}
              onChange={(e) => updateActiveTitle(e.target.value)}
              placeholder="Slide title…"
              className="editor-slide-title-input"
            />
          </div>

          <BlockListEditor
            blocks={activeSlide?.blocks || []}
            onChange={updateActiveBlocks}
            onOpenMediaLibrary={() => handleOpenMediaLibrary('slide')}
          />

          {/* Lesson Metadata (collapsible) */}
          <div className="editor-meta-section">
            <button
              className="editor-meta-toggle"
              onClick={() => setMetaExpanded((e) => !e)}
            >
              <FiTag size={14} /> Lesson Metadata
              {metaExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>

            {metaExpanded && (
              <div className="editor-meta-body">
                <div className="field-group">
                  <label className="field-label">
                    Excerpt <span className="field-hint">(shown in lesson card)</span>
                  </label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="A short description of what this lesson covers…"
                    rows={3}
                    className="field-textarea"
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Cover Image URL</label>
                  <div className="field-url-row">
                    <Input
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/…"
                      className="field-input"
                    />
                    <button
                      type="button"
                      className="field-media-btn"
                      onClick={() => handleOpenMediaLibrary('cover')}
                    >
                      <FiImage size={14} /> Media Library
                    </button>
                  </div>
                </div>

                <div className="field-group">
                  <label className="field-label">Subject Tags</label>
                  <div className="editor-tags">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                        onClick={() => toggleTag(tag.id)}
                        className="editor-tag-badge"
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {tags.length === 0 && (
                      <span className="editor-no-tags">
                        No tags yet. Create them in <a href="/tags">Tag Manager</a>.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <MediaLibraryModal
        isOpen={mediaModalOpen}
        onClose={() => setMediaModalOpen(false)}
        onSelectImage={handleSelectMediaImage}
        mode={mediaTargetMode}
      />
    </div>
  );
}
