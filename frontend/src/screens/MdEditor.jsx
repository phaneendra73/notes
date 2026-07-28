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
import { FiArrowLeft, FiPlus, FiTag, FiCheck } from 'react-icons/fi';
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
  const [selectedTagIds, setSelectedTagIds] = useState([]);
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
        .get(`/blog/get/${id}`)
        .then((res) => {
          setTitle(res.data.title || '');
          setImageUrl(res.data.imageUrl || '');

          const raw = res.data.content || res.data.markdownContent || '';

          // Parse saved track steps by divider --- or headings
          let parsedSlides = [];
          if (raw.includes('\n---\n') || raw.includes('\n***\n')) {
            const parts = raw.split(/\n(?:---|[*]{3})\n/g);
            parsedSlides = parts.map((part, idx) => {
              const titleMatch = part.match(/^(#{1,3})\s+(.+)$/m);
              const titleStr = titleMatch ? titleMatch[2].trim() : `Concept ${idx + 1}`;
              return { step: idx + 1, title: titleStr, content: part.trim() };
            });
          } else if (raw.split(/(?=\n#{1,2}\s+)/g).length > 1) {
            const parts = raw.split(/(?=\n#{1,2}\s+)/g);
            parsedSlides = parts.map((part, idx) => {
              const titleMatch = part.match(/^(#{1,2})\s+(.+)$/m);
              const titleStr = titleMatch ? titleMatch[2].trim() : `Concept ${idx + 1}`;
              return { step: idx + 1, title: titleStr, content: part.trim() };
            });
          } else {
            parsedSlides = [{ step: 1, title: res.data.title || 'Concept 1', content: raw }];
          }

          setSlides(parsedSlides);

          // Restore tags
          if (res.data.tags && tags.length > 0) {
            const matchedTagIds = tags.filter((t) => res.data.tags.includes(t.name)).map((t) => t.id);
            setSelectedTagIds(matchedTagIds);
          }
        })
        .catch(() => toast({ title: 'Unable to load course data', variant: 'destructive' }))
        .finally(() => setLoading(false));
    } else {
      // Load saved local draft if creating new
      const savedTitle = localStorage.getItem('kadha_draft_title');
      const savedSlides = localStorage.getItem('kadha_draft_slides');
      if (savedTitle) setTitle(savedTitle);
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

  // Auto-save draft to localStorage every 4 seconds
  useEffect(() => {
    if (id) return; // Don't overwrite existing course draft
    const timer = setInterval(() => {
      if (title.trim() || slides.length > 0) {
        localStorage.setItem('kadha_draft_title', title);
        localStorage.setItem('kadha_draft_slides', JSON.stringify(slides));
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [id, title, slides]);

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
      const res = await api.post('/blog/tags/create', { tags: [tagName] });
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
          content: fullMarkdownContent,
          slides,
          tagIds: selectedTagIds,
        });
        toast({ title: 'Tech Note updated successfully!', variant: 'success' });
      } else {
        await api.post('/lessons/add', {
          title,
          imageUrl,
          content: fullMarkdownContent,
          slides,
          tagIds: selectedTagIds,
        });
        localStorage.removeItem('kadha_draft_title');
        localStorage.removeItem('kadha_draft_slides');
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <Appbar />

      <main style={{ flex: 1, maxWidth: 1360, margin: '0 auto', width: '100%', padding: '2rem 1.5rem 6rem' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button size="sm" variant="outline" onClick={() => navigate('/admin')} style={{ borderRadius: 12 }}>
              <FiArrowLeft size={16} /> Back to Studio
            </Button>
            <div>
              <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: 'var(--fg)' }}>
                {id ? 'Edit Learning Course' : 'Create New Course'}
              </h1>
              <p style={{ fontSize: '0.825rem', color: 'var(--fg-muted)' }}>
                Design interactive slide-based learning tracks with visual block tools and media management.
              </p>
            </div>
          </div>
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
