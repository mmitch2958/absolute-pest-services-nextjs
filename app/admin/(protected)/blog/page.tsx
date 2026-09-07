'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { Search, Plus, X, Loader2, Globe, FileText, Sparkles, ImageIcon, Bot, CheckCircle2, AlertCircle, Clock, PenLine, Trash2, Rss, RefreshCw } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  featured_image: string | null;
  category: string;
  tags: string[] | null;
  is_published: boolean;
  published_at: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
}

function generateSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function PostModal({ post, onSave, onClose, onDelete }: {
  post: BlogPost | null;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    author: post?.author || 'Absolute Pest Services',
    category: post?.category || 'General Pests',
    tags: post?.tags?.join(', ') || '',
    isPublished: post?.is_published || false,
    metaTitle: post?.meta_title || '',
    metaDescription: post?.meta_description || '',
    featuredImage: post?.featured_image || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [error, setError] = useState('');
  const [genError, setGenError] = useState('');
  const [imageGenError, setImageGenError] = useState('');

  function handleTitleChange(val: string) {
    setForm(f => ({ ...f, title: val, slug: f.slug || generateSlug(val) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.excerpt || !form.content || !form.author || !form.category) {
      setError('Title, excerpt, content, author, and category are required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        ...form,
        tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save');
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!post) return;
    setDeleting(true);
    await onDelete(post.id);
  }

  async function handleAIGenerate() {
    if (!form.title) {
      setGenError('Enter a title first so AI knows what to write about.');
      return;
    }
    setGenError('');
    setGenerating(true);
    try {
      const res = await fetch('/api/admin/blog/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category || undefined,
          excerpt: form.excerpt || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'AI generation failed');
      }
      const data = await res.json();
      setForm(f => ({
        ...f,
        content: data.content ?? f.content,
        excerpt: data.excerpt ?? f.excerpt,
        tags: data.tags ? data.tags.join(', ') : f.tags,
        metaTitle: data.metaTitle ?? f.metaTitle,
        metaDescription: data.metaDescription ?? f.metaDescription,
      }));
    } catch (err: any) {
      setGenError(err.message || 'AI generation failed. Try again.');
    } finally {
      setGenerating(false);
    }
  }

  async function handleAIGenerateImage() {
    if (!form.title) {
      setImageGenError('Enter a title first so AI knows what image to generate.');
      return;
    }
    setImageGenError('');
    setGeneratingImage(true);
    try {
      const res = await fetch('/api/admin/blog/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          category: form.category || undefined,
          excerpt: form.excerpt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image generation failed');
      setForm(f => ({ ...f, featuredImage: data.imageUrl }));
    } catch (err: any) {
      setImageGenError(err.message || 'Image generation failed. Try again.');
    } finally {
      setGeneratingImage(false);
    }
  }

  const fieldClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm !text-gray-900 placeholder-gray-400 !bg-white focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">{post ? 'Edit Post' : 'New Blog Post'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                className="w-4 h-4 border-gray-300 rounded text-green-600 focus:ring-green-500" />
              <span className="text-sm font-medium text-gray-700">
                {form.isPublished ? <Globe className="w-4 h-4 inline text-green-600 mr-1" /> : <FileText className="w-4 h-4 inline text-gray-400 mr-1" />}
                {form.isPublished ? 'Published' : 'Draft'}
              </span>
            </label>
            <button
              type="button"
              onClick={handleAIGenerate}
              disabled={generating}
              className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {generating ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating…</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" />AI Generate</>
              )}
            </button>
          </div>

          {genError && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2">{genError}</div>
          )}
          <p className="text-xs text-gray-400">
            Article generation uses GPT-4o mini and returns editable HTML, excerpt, tags, and SEO fields.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input value={form.title} onChange={e => handleTitleChange(e.target.value)} className={fieldClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
            <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              className={fieldClass} placeholder="auto-generated-from-title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt *</label>
            <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
              className={fieldClass + ' resize-none'} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea rows={10} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className={fieldClass + ' resize-y font-mono text-xs'} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
              <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={fieldClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              className={fieldClass} placeholder="pest control, ants, prevention" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">Featured Image URL</label>
              <button
                type="button"
                onClick={handleAIGenerateImage}
                disabled={generatingImage}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {generatingImage ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />Generating…</>
                ) : (
                  <><ImageIcon className="w-3.5 h-3.5" />AI Generate Image</>
                )}
              </button>
            </div>
            {imageGenError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded-lg px-3 py-2 mb-2">{imageGenError}</div>
            )}
            <p className="text-xs text-gray-400 mb-2">
              Images are timeout-bound and optional, so a slow provider will not block post editing.
            </p>
            <input value={form.featuredImage} onChange={e => setForm(f => ({ ...f, featuredImage: e.target.value }))}
              className={fieldClass} placeholder="https://..." />
            {form.featuredImage && (
              <div className="relative mt-2 rounded-lg overflow-hidden border border-gray-200 h-32 bg-gray-50">
                <NextImage src={form.featuredImage} alt="Featured image preview" fill sizes="(max-width: 768px) 100vw, 600px" className="object-cover" unoptimized />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input value={form.metaTitle} onChange={e => setForm(f => ({ ...f, metaTitle: e.target.value }))} className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <input value={form.metaDescription} onChange={e => setForm(f => ({ ...f, metaDescription: e.target.value }))} className={fieldClass} />
            </div>
          </div>

          <div className="flex justify-between pt-2">
            {post && (
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50">
                <Trash2 className="w-4 h-4" />{deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving}
                className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Batch AI Create Modal ────────────────────────────────────────────────────

interface Topic {
  title: string;
  category: string;
  angle: string;
  seoKeywords: string[];
  imagePrompt: string;
}

type SlotStatus = 'queued' | 'writing' | 'imaging' | 'saving' | 'saved' | 'error';

interface PostSlot {
  index: number;
  title: string;
  category: string;
  status: SlotStatus;
  id?: number;
  slug?: string;
  imageSource?: string;
  imageStyle?: 'realistic' | 'cartoon';
  errorMsg?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Wildlife Control': 'bg-amber-100 text-amber-800',
  'Termites': 'bg-red-100 text-red-800',
  'Stinging Insects': 'bg-yellow-100 text-yellow-800',
  'Rodents': 'bg-orange-100 text-orange-800',
  'Bed Bugs': 'bg-pink-100 text-pink-800',
  'General Pests': 'bg-blue-100 text-blue-800',
  'Seasonal Tips': 'bg-green-100 text-green-800',
};

function SlotStatusIcon({ status }: { status: SlotStatus }) {
  if (status === 'saved') return <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />;
  if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
  if (status === 'queued') return <Clock className="w-4 h-4 text-gray-400 shrink-0" />;
  return <Loader2 className="w-4 h-4 text-purple-500 animate-spin shrink-0" />;
}

function slotLabel(slot: PostSlot): string {
  if (slot.status === 'queued') return 'Queued…';
  if (slot.status === 'writing') return 'Writing article…';
  if (slot.status === 'imaging') return 'Generating hero image…';
  if (slot.status === 'saving') return 'Saving to database…';
  if (slot.status === 'saved') return `Published live ✓${slot.imageSource ? ` · ${slot.imageStyle === 'cartoon' ? 'cartoon' : 'photo'} image via ${slot.imageSource === 'dalle3' ? 'DALL-E 3' : slot.imageSource === 'gemini-2.5-flash' ? 'Gemini' : 'FLUX'}` : ' · no image'}`;
  return slot.errorMsg ?? 'Error';
}

// ─── RSS Syndicate Modal ──────────────────────────────────────────────────────

type SyndicateDetail = { title: string; status: 'imported' | 'skipped' | 'error'; reason?: string };

function RssSyndicateModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [feedUrl, setFeedUrl] = useState('https://pestmgt.com/feed/');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ message: string; details: SyndicateDetail[] } | null>(null);
  const [error, setError] = useState('');

  async function handleImport() {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/admin/blog/syndicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setResult({ message: data.message, details: data.results?.details ?? [] });
      if ((data.results?.imported ?? 0) > 0) onComplete();
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Rss className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">Import RSS Feed</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Feed URL</label>
            <input
              type="url"
              value={feedUrl}
              onChange={e => setFeedUrl(e.target.value)}
              placeholder="https://pestmgt.com/feed/"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              disabled={loading}
            />
            <p className="text-xs text-gray-400 mt-1">
              Imports all articles from the feed. Existing posts (matched by slug) are skipped.
              Posts are imported as <strong>published</strong>.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                {result.message}
              </p>
              {result.details.length > 0 && (
                <div className="max-h-52 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
                  {result.details.map((d, i) => (
                    <div key={i} className={`flex items-start gap-2 px-3 py-2 text-xs ${
                      d.status === 'imported' ? 'bg-green-50' :
                      d.status === 'skipped' ? 'bg-gray-50' : 'bg-red-50'
                    }`}>
                      <span className={`mt-0.5 font-bold shrink-0 ${
                        d.status === 'imported' ? 'text-green-600' :
                        d.status === 'skipped' ? 'text-gray-400' : 'text-red-600'
                      }`}>
                        {d.status === 'imported' ? '✓' : d.status === 'skipped' ? '–' : '✗'}
                      </span>
                      <span className="truncate text-gray-700">{d.title}</span>
                      {d.reason && <span className="text-gray-400 shrink-0">· {d.reason}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={handleImport}
              disabled={loading || !feedUrl.trim()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rss className="w-4 h-4" />}
              {loading ? 'Importing…' : 'Import Posts'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors">
              {result ? 'Done' : 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Batch AI Create Modal ────────────────────────────────────────────────────

function BatchCreateModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'loading_topics' | 'select' | 'generating' | 'done' | 'fatal'>('idle');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [slots, setSlots] = useState<PostSlot[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [fatalMsg, setFatalMsg] = useState('');
  const [includeImages, setIncludeImages] = useState(true);

  function updateSlot(index: number, patch: Partial<PostSlot>) {
    setSlots(prev => prev.map(s => s.index === index ? { ...s, ...patch } : s));
  }

  function toggleSelect(i: number) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  async function loadTopics() {
    setPhase('loading_topics');
    try {
      const res = await fetch('/api/admin/blog/ai-topics', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate topics');
      const data = await res.json();
      if (!Array.isArray(data.topics)) throw new Error('Invalid response');
      setTopics(data.topics);
      setSelected(new Set(data.topics.map((_: any, i: number) => i)));
      setPhase('select');
    } catch (err: any) {
      setFatalMsg(err.message ?? 'Failed to load topics');
      setPhase('fatal');
    }
  }

  async function createSelected() {
    const chosen = topics.filter((_, i) => selected.has(i));
    if (chosen.length === 0) return;

    setSlots(chosen.map((t, i) => ({ index: i, title: t.title, category: t.category, status: 'queued' })));
    setPhase('generating');
    setStatusMsg(`Creating ${chosen.length} post${chosen.length !== 1 ? 's' : ''}…`);

    try {
      const res = await fetch('/api/admin/blog/ai-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topics: chosen, includeImages }),
      });
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try { handleEvent(JSON.parse(line.slice(6))); } catch { /* skip */ }
        }
      }
    } catch (err: any) {
      setFatalMsg(err.message ?? 'Generation failed');
      setPhase('fatal');
    }
  }

  function handleEvent(event: any) {
    switch (event.type) {
      case 'start': setStatusMsg(event.message); break;
      case 'post_start': updateSlot(event.index, { status: 'writing', title: event.title, category: event.category }); break;
      case 'post_writing': updateSlot(event.index, { status: 'writing' }); break;
      case 'post_image': updateSlot(event.index, { status: 'imaging' }); break;
      case 'post_image_done': updateSlot(event.index, { imageSource: event.source, imageStyle: event.style }); break;
      case 'post_saving': updateSlot(event.index, { status: 'saving' }); break;
      case 'post_saved': updateSlot(event.index, { status: 'saved', id: event.id, slug: event.slug, imageSource: event.imageSource }); break;
      case 'post_error': updateSlot(event.index, { status: 'error', errorMsg: event.message }); break;
      case 'complete':
        setSavedCount(event.savedCount);
        setStatusMsg(`Done! ${event.savedCount} post${event.savedCount !== 1 ? 's' : ''} published live.`);
        setPhase('done');
        break;
    }
  }

  const canClose = phase !== 'generating';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Blog Post Creator</h2>
          </div>
          {canClose && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto flex-1">

          {/* ── Phase: idle ── */}
          {phase === 'idle' && (
            <div className="text-center py-6">
              <Bot className="w-14 h-14 text-purple-400 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 text-xl mb-2">AI Blog Post Creator</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                First, AI generates <strong>6 topic ideas</strong> tailored for SE PA pest control.
                You pick the ones you want, then it writes cleaner local articles. Hero images are optional.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6 text-xs text-gray-600">
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                  <Sparkles className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <div className="font-semibold">Step 1</div>
                  <div className="text-gray-500">Generate 6 topic ideas (~10s)</div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <FileText className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <div className="font-semibold">Step 2</div>
                  <div className="text-gray-500">You choose which to create</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <div className="font-semibold">Step 3</div>
                  <div className="text-gray-500">Publish with optional images</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-6">
                Uses GPT-4o mini for topics and writing. Images use Gemini via OpenRouter first, then DALL-E 3 or FLUX if available.
              </p>
              <button onClick={loadTopics}
                className="inline-flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors text-sm">
                <Sparkles className="w-4 h-4" />
                Generate Topic Ideas
              </button>
            </div>
          )}

          {/* ── Phase: loading topics ── */}
          {phase === 'loading_topics' && (
            <div className="text-center py-12">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Researching SE PA pest control topics…</p>
              <p className="text-gray-400 text-sm mt-1">This takes about 10 seconds</p>
            </div>
          )}

          {/* ── Phase: select ── */}
          {phase === 'select' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-semibold text-gray-900">Choose which posts to create</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selected.size} of {topics.length} selected</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setSelected(new Set(topics.map((_, i) => i)))}
                    className="text-xs px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors font-medium">
                    All
                  </button>
                  <button onClick={() => setSelected(new Set())}
                    className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors font-medium">
                    None
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                {topics.map((topic, i) => {
                  const isSelected = selected.has(i);
                  return (
                    <button key={i} onClick={() => toggleSelect(i)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected ? 'border-purple-400 bg-purple-50' : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isSelected ? 'bg-purple-600 border-purple-600' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-gray-900 text-sm">{topic.title}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[topic.category] ?? 'bg-gray-100 text-gray-600'}`}>
                              {topic.category}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 leading-relaxed">{topic.angle}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button onClick={loadTopics} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  ↺ Regenerate topics
                </button>
                <div className="flex items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-600">
                    <input
                      type="checkbox"
                      checked={includeImages}
                      onChange={e => setIncludeImages(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    Create hero images
                  </label>
                  <button onClick={createSelected} disabled={selected.size === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm">
                    <PenLine className="w-4 h-4" />
                    Create {selected.size} Post{selected.size !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Phase: generating ── */}
          {phase === 'generating' && (
            <div>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                {statusMsg}
              </p>
              <div className="space-y-2">
                {slots.map(slot => (
                  <div key={slot.index} className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm transition-all ${
                    slot.status === 'saved' ? 'bg-green-50 border-green-200' :
                    slot.status === 'error' ? 'bg-red-50 border-red-200' :
                    slot.status === 'queued' ? 'bg-gray-50 border-gray-200' :
                    'bg-purple-50 border-purple-200'
                  }`}>
                    <SlotStatusIcon status={slot.status} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{slot.title}</div>
                      <div className={`text-xs mt-0.5 ${
                        slot.status === 'error' ? 'text-red-600' :
                        slot.status === 'saved' ? 'text-green-700' : 'text-gray-400'
                      }`}>{slotLabel(slot)}</div>
                    </div>
                    {slot.status === 'saved' && slot.slug && (
                      <a href={`/blog/${slot.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-green-700 hover:text-green-900 font-medium shrink-0 ml-2">
                        Preview ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-4">
                Image generation is timeout-bound. If an image provider is slow, the post still publishes without a hero image.
              </p>
            </div>
          )}

          {/* ── Phase: done ── */}
          {phase === 'done' && (
            <div>
              <div className="text-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-bold text-gray-900 text-lg">{savedCount} post{savedCount !== 1 ? 's' : ''} published live</p>
                <p className="text-gray-500 text-sm mt-1">They are now visible on the blog. Edit anytime from the post list.</p>
              </div>
              <div className="space-y-2 mb-6">
                {slots.map(slot => (
                  <div key={slot.index} className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                    slot.status === 'saved' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}>
                    <SlotStatusIcon status={slot.status} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{slot.title}</div>
                      <div className={`text-xs mt-0.5 ${slot.status === 'error' ? 'text-red-600' : 'text-green-700'}`}>{slotLabel(slot)}</div>
                    </div>
                    {slot.status === 'saved' && slot.slug && (
                      <a href={`/blog/${slot.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-green-700 hover:text-green-900 font-medium shrink-0">Preview ↗</a>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-center">
                <button onClick={() => { onComplete(); onClose(); }}
                  className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl text-sm transition-colors">
                  View All Posts
                </button>
              </div>
            </div>
          )}

          {/* ── Phase: fatal ── */}
          {phase === 'fatal' && (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 font-semibold mb-1">Something went wrong</p>
              <p className="text-gray-500 text-sm mb-5">{fatalMsg}</p>
              <button onClick={onClose} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors">Close</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bulk image regeneration modal ────────────────────────────────────────────

type BulkImageMode = 'missing' | 'selected';
type BulkImageStatus = 'queued' | 'generating' | 'saved' | 'error';

interface BulkImageItem {
  id: number;
  title: string;
  status: BulkImageStatus;
  source?: string;
  message?: string;
}

function BulkImageModal({
  mode,
  ids,
  onClose,
  onComplete,
}: {
  mode: BulkImageMode;
  ids: number[];
  onClose: () => void;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<'confirm' | 'running' | 'done' | 'error'>('confirm');
  const [items, setItems] = useState<BulkImageItem[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [fatalError, setFatalError] = useState('');

  function updateItem(id: number, patch: Partial<BulkImageItem>) {
    setItems(current => current.map(item => item.id === id ? { ...item, ...patch } : item));
  }

  function handleEvent(event: any) {
    if (event.type === 'start') {
      setItems((event.posts ?? []).map((post: { id: number; title: string }) => ({
        ...post,
        status: 'queued' as const,
      })));
    } else if (event.type === 'item_start') {
      updateItem(event.id, { status: 'generating' });
    } else if (event.type === 'item_success') {
      updateItem(event.id, { status: 'saved', source: event.source });
    } else if (event.type === 'item_error') {
      updateItem(event.id, { status: 'error', message: event.message });
    } else if (event.type === 'complete') {
      setSavedCount(event.savedCount ?? 0);
      setFailedCount(event.failedCount ?? 0);
      setPhase('done');
      onComplete();
    } else if (event.type === 'fatal') {
      setFatalError(event.message || 'Bulk image regeneration failed');
      setPhase('error');
    }
  }

  async function startRegeneration() {
    setPhase('running');
    setFatalError('');

    try {
      const response = await fetch('/api/admin/blog/bulk-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, ids }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Unable to start image regeneration');
      }
      if (!response.body) throw new Error('No progress stream was returned');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedTerminalEvent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          try {
            const event = JSON.parse(line.slice(6));
            if (event.type === 'complete' || event.type === 'fatal') {
              receivedTerminalEvent = true;
            }
            handleEvent(event);
          } catch {
            // Ignore malformed progress lines and continue processing the job.
          }
        }
      }

      if (!receivedTerminalEvent) {
        throw new Error('The regeneration connection ended before the batch completed. Completed images were still saved.');
      }
    } catch (error: any) {
      setFatalError(error.message || 'Bulk image regeneration failed');
      setPhase('error');
    }
  }

  const completedCount = items.filter(item => item.status === 'saved' || item.status === 'error').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              {mode === 'missing' ? 'Regenerate Missing Images' : 'Regenerate Selected Images'}
            </h2>
          </div>
          {phase !== 'running' && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6 overflow-y-auto">
          {phase === 'confirm' && (
            <div className="text-center py-6">
              <ImageIcon className="w-12 h-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {mode === 'missing'
                  ? 'Find and repair every missing image?'
                  : `Regenerate images for ${ids.length} selected post${ids.length !== 1 ? 's' : ''}?`}
              </h3>
              <p className="text-sm text-gray-500 max-w-lg mx-auto mb-6">
                {mode === 'missing'
                  ? 'This finds posts with no image or an old broken local image path. Valid external and App Storage images will not be changed.'
                  : 'Existing images on the selected posts will be replaced. Each successful image is saved immediately, while failures remain available to retry.'}
              </p>
              <div className="flex justify-center gap-3">
                <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={startRegeneration}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-semibold">
                  <RefreshCw className="w-4 h-4" />
                  Start Regeneration
                </button>
              </div>
            </div>
          )}

          {phase === 'running' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  Generating and saving images…
                </p>
                <span className="text-xs text-gray-500">{completedCount} of {items.length || '—'} complete</span>
              </div>
              {items.length === 0 ? (
                <div className="py-10 text-center text-sm text-gray-400">Finding posts that need images…</div>
              ) : (
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                      item.status === 'saved' ? 'bg-green-50 border-green-200' :
                      item.status === 'error' ? 'bg-red-50 border-red-200' :
                      item.status === 'generating' ? 'bg-orange-50 border-orange-200' :
                      'bg-gray-50 border-gray-200'
                    }`}>
                      {item.status === 'saved' ? <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" /> :
                        item.status === 'error' ? <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" /> :
                        item.status === 'generating' ? <Loader2 className="w-4 h-4 text-orange-500 animate-spin mt-0.5 shrink-0" /> :
                        <Clock className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className={`text-xs mt-0.5 ${item.status === 'error' ? 'text-red-600' : item.status === 'saved' ? 'text-green-700' : 'text-gray-500'}`}>
                          {item.status === 'queued' ? 'Waiting…' :
                            item.status === 'generating' ? 'Generating image…' :
                            item.status === 'saved' ? `Saved${item.source ? ` via ${item.source}` : ''}` :
                            item.message || 'Image generation failed'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-4">
                Keep this window open until the batch finishes. Successful posts save as they complete.
              </p>
            </div>
          )}

          {phase === 'done' && (
            <div className="text-center py-6">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Image regeneration finished</h3>
              <p className="text-sm text-gray-600 mb-6">
                {savedCount} image{savedCount !== 1 ? 's' : ''} saved
                {failedCount > 0 ? ` · ${failedCount} failed and can be retried` : ''}.
              </p>
              {items.length === 0 && (
                <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3 mb-5">
                  No posts with missing or legacy image paths were found.
                </p>
              )}
              {items.some(item => item.status === 'error') && (
                <div className="text-left space-y-2 mb-6">
                  {items.filter(item => item.status === 'error').map(item => (
                    <div key={item.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-800">{item.title}</p>
                      <p className="text-xs text-red-600 mt-0.5">{item.message}</p>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={onClose} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold">
                Done
              </button>
            </div>
          )}

          {phase === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to regenerate images</h3>
              <p className="text-sm text-red-600 mb-6">{fatalError}</p>
              <button onClick={onClose} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium">
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showRssModal, setShowRssModal] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<number>>(new Set());
  const [bulkImageRequest, setBulkImageRequest] = useState<{ mode: BulkImageMode; ids: number[] } | null>(null);
  const [showBulkDelete, setShowBulkDelete] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();

  // Deep-link support: /admin/blog?edit=<id> opens the edit modal for that post
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (!editId) return;
    const id = parseInt(editId, 10);
    if (!id || isNaN(id)) return;
    // If already loaded in list, use it; else fetch it.
    const existing = posts.find(p => p.id === id);
    if (existing) {
      setEditingPost(existing);
    } else {
      fetch(`/api/admin/blog/${id}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data?.post) setEditingPost(data.post); });
    }
  }, [searchParams, posts]);

  // When the edit modal closes, drop the ?edit= param so refresh doesn't reopen it
  function clearEditParam() {
    if (searchParams.get('edit')) router.replace('/admin/blog');
  }

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/blog?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const nextPosts = data.posts || [];
      setPosts(nextPosts);
      const visibleIds = new Set<number>(nextPosts.map((post: BlogPost) => post.id));
      setSelectedPostIds(current => new Set([...current].filter(id => visibleIds.has(id))));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(data: any, id?: number) {
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `/api/admin/blog/${id}` : '/api/admin/blog';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed'); }
    setShowAddModal(false);
    setEditingPost(null);
    clearEditParam();
    await fetchData();
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    setEditingPost(null);
    clearEditParam();
    await fetchData();
  }

  async function handleTogglePublish(post: BlogPost) {
    await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !post.is_published }),
    });
    await fetchData();
  }

  function togglePostSelection(id: number) {
    setSelectedPostIds(current => {
      const next = new Set(current);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelectedPostIds(current => {
      const allSelected = posts.length > 0 && posts.every(post => current.has(post.id));
      if (allSelected) return new Set();
      return new Set(posts.map(post => post.id));
    });
  }

  async function handleBulkDelete() {
    setBulkDeleting(true);
    setBulkDeleteError('');

    try {
      const response = await fetch('/api/admin/blog/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [...selectedPostIds] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Bulk delete failed');

      setSelectedPostIds(new Set());
      setShowBulkDelete(false);
      await fetchData();
    } catch (error: any) {
      setBulkDeleteError(error.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
    }
  }

  const allVisibleSelected = posts.length > 0 && posts.every(post => selectedPostIds.has(post.id));

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">{posts.length} posts</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setShowRssModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors">
            <Rss className="w-4 h-4" />Import RSS
          </button>
          <button onClick={() => setShowBatchModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Bot className="w-4 h-4" />AI Create 6 Posts
          </button>
          <button onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />New Post
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="search" placeholder="Search by title, author, or category..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 p-3 bg-white border border-gray-200 rounded-xl">
        <button
          onClick={() => setBulkImageRequest({ mode: 'missing', ids: [] })}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Regenerate All Missing Images
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 mr-1">
            {selectedPostIds.size} selected
          </span>
          <button
            onClick={() => setBulkImageRequest({ mode: 'selected', ids: [...selectedPostIds] })}
            disabled={selectedPostIds.size === 0}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-orange-700 border border-orange-200 bg-white hover:bg-orange-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ImageIcon className="w-4 h-4" />
            Regenerate Selected
          </button>
          <button
            onClick={() => { setBulkDeleteError(''); setShowBulkDelete(true); }}
            disabled={selectedPostIds.size === 0}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-700 border border-red-200 bg-white hover:bg-red-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Selected
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all visible blog posts"
                    className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">Author</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden md:table-cell">Category</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin inline" /></td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No blog posts found</td></tr>
              ) : (
                posts.map(p => (
                  <tr key={p.id} className={`${selectedPostIds.has(p.id) ? 'bg-green-50/60' : 'hover:bg-gray-50'} transition-colors`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedPostIds.has(p.id)}
                        onChange={() => togglePostSelection(p.id)}
                        aria-label={`Select ${p.title}`}
                        className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 max-w-xs truncate">{p.title}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{p.author}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell capitalize">{p.category}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleTogglePublish(p)}
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_published ? <Globe className="w-3 h-3 mr-1" /> : <FileText className="w-3 h-3 mr-1" />}
                        {p.is_published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                      {p.published_at ? new Date(p.published_at).toLocaleDateString() : new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditingPost(p)}
                        className="text-green-600 hover:text-green-800 text-xs font-medium mr-3">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <PostModal post={null} onSave={(data) => handleSave(data)} onClose={() => setShowAddModal(false)} onDelete={handleDelete} />
      )}
      {editingPost && (
        <PostModal post={editingPost} onSave={(data) => handleSave(data, editingPost.id)} onClose={() => { setEditingPost(null); clearEditParam(); }} onDelete={handleDelete} />
      )}
      {showRssModal && (
        <RssSyndicateModal onClose={() => setShowRssModal(false)} onComplete={fetchData} />
      )}
      {showBatchModal && (
        <BatchCreateModal onClose={() => setShowBatchModal(false)} onComplete={fetchData} />
      )}
      {bulkImageRequest && (
        <BulkImageModal
          mode={bulkImageRequest.mode}
          ids={bulkImageRequest.ids}
          onClose={() => setBulkImageRequest(null)}
          onComplete={fetchData}
        />
      )}
      {showBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Delete selected blog posts?</h2>
            <p className="text-sm text-gray-600 mb-5">
              You are about to permanently delete {selectedPostIds.size} blog post{selectedPostIds.size !== 1 ? 's' : ''}.
              This cannot be undone.
            </p>
            {bulkDeleteError && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {bulkDeleteError}
              </div>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDelete(false)}
                disabled={bulkDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-50"
              >
                {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {bulkDeleting ? 'Deleting…' : `Delete ${selectedPostIds.size} Posts`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
