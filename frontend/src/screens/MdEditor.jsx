import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../utils/api.js';
import { Appbar, Footer } from '../components/ui/index.js';
import { Button } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Input } from '../components/ui/Input.jsx';
import useTags from '../hooks/useTags.js';
import { useToast } from '../components/Toaster.jsx';
import VisualSlideEditor from '../components/editor/VisualSlideEditor.jsx';
import { parseRawMarkdownToSlides } from '../utils/markdown.js';
import { FiArrowLeft, FiPlus, FiTag, FiCheck, FiAlignLeft } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function MdEditor() {
  const { id: paramId } = useParams();
  const location = useLocation();
  const searchId = useMemo(
    () => new URLSearchParams(location.search).get('id'),
    [location.search]
  );
  const id = paramId || searchId;
  const navigate = useNavigate();
  const toast = useToast();

  const [tagRefreshTrigger, setTagRefreshTrigger] = useState(0);
  const { tags } = useTags(tagRefreshTrigger);

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [noteTagNames, setNoteTagNames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // Structured Slides State
  const [slides, setSlides] = useState([
    {
      step: 1,
      title: 'Concept 1: Introduction & Goals',
      content: '## Introduction & Goals\n\nWelcome to this learning course! Write your educational concepts here.\n\n> 💡 **Tip**: Use `/` to insert code blocks, diagrams, callouts, or quizzes.',
    },
  ]);

  // Auth Check & Load Track Data
  useEffect(() => {
    if (!localStorage.getItem('jwt')) {
      toast({ title: 'Author authentication required', variant: 'destructive' });
      navigate('/signin');
      return;
    }

    if (id) {
      setLoading(true);
      api
        .get(`/lessons/get/${id}`)
        .then((res) => {
          setTitle(res.data.title || '');
          setImageUrl(res.data.imageUrl || '');
          setExcerpt(res.data.excerpt || '');

          const raw = res.data.content || res.data.markdownContent || '';
          let loadedSlides = [];
          if (Array.isArray(res.data.slides) && res.data.slides.length > 0) {
            loadedSlides = res.data.slides.map((s, idx) => ({
              id: s.id,
              step: s.step || s.orderNumber || idx + 1,
              title: s.title || `Concept ${idx + 1}`,
              content: s.content || (Array.isArray(s.blocks) ? s.blocks.map((b) => b.content || '').join('\n\n') : ''),
              blocks: s.blocks || [],
            }));
          } else {
            loadedSlides = parseRawMarkdownToSlides(raw);
          }

          setSlides(loadedSlides.length > 0 ? loadedSlides : [{ step: 1, title: res.data.title || 'Concept 1', content: raw }]);

          // Restore tags immediately if tagObjects returned by backend
          if (res.data.tagObjects && Array.isArray(res.data.tagObjects) && res.data.tagObjects.length > 0) {
            setSelectedTagIds(res.data.tagObjects.map((t) => t.id));
          }
          if (res.data.tags && Array.isArray(res.data.tags)) {
            setNoteTagNames(res.data.tags);
          }
        })
        .catch(() => toast({ title: 'Unable to load course data', variant: 'destructive' }))
        .finally(() => setLoading(false));
    } else {
      // Load saved local draft if creating new
      const savedTitle = localStorage.getItem('kadha_draft_title');
      const savedSlides = localStorage.getItem('kadha_draft_slides');
      const savedExcerpt = localStorage.getItem('kadha_draft_excerpt');
      if (savedTitle) setTitle(savedTitle);
      if (savedExcerpt) setExcerpt(savedExcerpt);
      if (savedSlides) {
        try {
          const parsed = JSON.parse(savedSlides);
          if (Array.isArray(parsed) && parsed.length > 0) setSlides(parsed);
        } catch {
          /* fallback */
        }
      }
    }
  }, [id, navigate, toast]);

  // Match loaded note tag names with tags array when tags finish loading asynchronously
  useEffect(() => {
    if (noteTagNames.length > 0 && tags.length > 0) {
      const matchedTagIds = tags
        .filter((t) => noteTagNames.includes(t.name))
        .map((t) => t.id);
      if (matchedTagIds.length > 0) {
        setSelectedTagIds((prev) => Array.from(new Set([...prev, ...matchedTagIds])));
      }
    }
  }, [noteTagNames, tags]);

  // Auto-save draft to localStorage every 4 seconds
  useEffect(() => {
    if (id) return; // Don't overwrite existing course draft
    const timer = setInterval(() => {
      if (title.trim() || slides.length > 0) {
        localStorage.setItem('kadha_draft_title', title);
        localStorage.setItem('kadha_draft_slides', JSON.stringify(slides));
        localStorage.setItem('kadha_draft_excerpt', excerpt);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [id, title, slides, excerpt]);

  // Toggle tag selection
  const toggleTag = (tagId) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  };

  // Quick Create Tag
  const handleCreateTag = async () => {
    const tagName = newTagInput.trim();
    if (!tagName) return;

    try {
      const res = await api.post('/lessons/tags/create', { tags: [tagName] });
      setNewTagInput('');
      setTagRefreshTrigger((p) => p + 1);
      toast({ title: `Tag '${tagName}' created`, variant: 'success' });
      if (res.data.tags?.[0]?.id) {
        setSelectedTagIds((prev) => [...prev, res.data.tags[0].id]);
      }
    } catch {
      toast({ title: 'Failed to create tag', variant: 'destructive' });
    }
  };

  // Save Lesson / Course Handler
  const handleSaveCourse = async () => {
    if (!title.trim()) {
      return toast({ title: 'Course title is required', variant: 'destructive' });
    }

    // Join slide contents with --- dividers for markdown backwards compatibility
    const fullMarkdownContent = slides
      .map((s) => s.content.trim())
      .join('\n\n---\n\n');

    setSaving(true);
    try {
      if (id) {
        await api.put(`/lessons/edit/${id}`, {
          title,
          imageUrl,
          excerpt,
          content: fullMarkdownContent,
          slides,
          tagIds: selectedTagIds,
        });
        toast({ title: 'Tech Note updated successfully!', variant: 'success' });
      } else {
        await api.post('/lessons/add', {
          title,
          imageUrl,
          excerpt,
          content: fullMarkdownContent,
          slides,
          tagIds: selectedTagIds,
        });
        localStorage.removeItem('kadha_draft_title');
        localStorage.removeItem('kadha_draft_slides');
        localStorage.removeItem('kadha_draft_excerpt');
        toast({ title: 'New Tech Note published successfully!', variant: 'success' });
      }
      navigate('/admin');
    } catch (err) {
      console.error('Save error:', err);
      toast({ title: 'Failed to save note', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Appbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-8 pb-24">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={() => navigate('/admin')} className="rounded-xl font-bold">
              <FiArrowLeft size={16} /> Back to Studio
            </Button>
            <div>
              <h1 className="font-heading text-xl md:text-2xl font-extrabold text-foreground">
                {id ? 'Edit Tech Note' : 'Create New Tech Note'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Design interactive slide-based learning tracks with visual block tools and media management.
              </p>
            </div>
          </div>

          {/* Auto-Save Draft Indicator */}
          {!id && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Auto-saved to local draft</span>
            </div>
          )}
        </div>

        {/* Tag & Topic Selector Section */}
        <div className="p-4 rounded-[24px] border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 mb-6 shadow-[0_10px_30px_rgba(2,6,23,0.04)] backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black text-primary uppercase tracking-wider flex items-center gap-1.5 mr-2 bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full shadow-sm">
              <FiTag size={13} /> Course Topics:
            </span>
            {tags.map((tag) => {
              const selected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                    selected
                      ? 'bg-primary text-black border-primary shadow-[0_0_14px_var(--neon-glow)]'
                      : 'bg-background hover:bg-muted text-muted-foreground border-border/80'
                  }`}
                >
                  {selected && <FiCheck size={13} className="text-black stroke-[3]" />}
                  {tag.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 bg-background/80 p-1.5 rounded-2xl border border-border">
            <Input
              placeholder="Create topic..."
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateTag()}
              className="h-8 text-xs w-36 rounded-xl bg-transparent border-transparent focus:border-primary"
            />
            <Button
              size="xs"
              variant="default"
              onClick={handleCreateTag}
              className="rounded-xl font-extrabold px-3 text-xs gap-1 shadow-sm"
            >
              <FiPlus size={13} /> Add Topic
            </Button>
          </div>
        </div>

        {/* Excerpt / Short Description */}
        <div className="p-4 rounded-[24px] border border-border/80 bg-card/80 mb-6 shadow-[0_10px_30px_rgba(2,6,23,0.04)] backdrop-blur-md">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 bg-muted/50 border border-border/60 px-3 py-1.5 rounded-full">
              <FiAlignLeft size={13} /> Note Description:
            </span>
          </div>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Write a short description or excerpt for this note... (shown on cards and search results)"
            maxLength={300}
            rows={2}
            className="w-full px-4 py-2.5 text-sm rounded-xl bg-background border border-border/80 text-foreground resize-none outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/60"
          />
          <div className="text-right mt-1">
            <span className={`text-[10px] font-bold ${excerpt.length > 250 ? 'text-amber-400' : 'text-muted-foreground/50'}`}>
              {excerpt.length}/300
            </span>
          </div>
        </div>

        {/* Visual Slide & Block Editor Component */}
        <VisualSlideEditor
          slides={slides}
          onChangeSlides={setSlides}
          title={title}
          onChangeTitle={setTitle}
          imageUrl={imageUrl}
          onChangeImageUrl={setImageUrl}
          onSave={handleSaveCourse}
          saving={saving}
        />
      </main>

      <Footer />
    </div>
  );
}
