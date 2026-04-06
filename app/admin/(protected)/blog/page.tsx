'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Loader2, Globe, FileText, Sparkles, ImageIcon, Bot, CheckCircle2, AlertCircle, Clock, PenLine, Image, Trash2 } from 'lucide-react';

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
    author: post?.author || '',
    category: post?.category || '',
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
        body: JSON.stringify({ title: form.title, category: form.category || undefined }),
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

  const fieldClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

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
            <input value={form.featuredImage} onChange={e => setForm(f => ({ ...f, featuredImage: e.target.value }))}
              className={fieldClass} placeholder="https://..." />
            {form.featuredImage && (
              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 h-32 bg-gray-50">
                <img src={form.featuredImage} alt="Featured image preview" className="w-full h-full object-cover" />
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

type PostStatus = 'queued' | 'writing' | 'imaging' | 'saving' | 'saved' | 'error';

interface PostSlot {
  index: number;
  title: string;
  category: string;
  status: PostStatus;
  imagesDone: number;
  id?: number;
  slug?: string;
  errorMsg?: string;
}

function StatusIcon({ status }: { status: PostStatus }) {
  if (status === 'saved') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  if (status === 'error') return <AlertCircle className="w-4 h-4 text-red-500" />;
  if (status === 'queued') return <Clock className="w-4 h-4 text-gray-400" />;
  return <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />;
}

function statusLabel(slot: PostSlot): string {
  if (slot.status === 'queued') return 'Queued';
  if (slot.status === 'writing') return 'Writing content…';
  if (slot.status === 'imaging') return `Generating image ${slot.imagesDone + 1}/3…`;
  if (slot.status === 'saving') return 'Saving to database…';
  if (slot.status === 'saved') return 'Saved as draft ✓';
  return slot.errorMsg ?? 'Error';
}

function BatchCreateModal({ onClose, onComplete }: { onClose: () => void; onComplete: () => void }) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'done' | 'fatal'>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [slots, setSlots] = useState<PostSlot[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [fatalMsg, setFatalMsg] = useState('');

  function updateSlot(index: number, patch: Partial<PostSlot>) {
    setSlots(prev => prev.map(s => s.index === index ? { ...s, ...patch } : s));
  }

  async function startGeneration() {
    setPhase('running');
    setStatusMsg('Researching SE PA pest topics…');
    setSlots([]);

    try {
      const res = await fetch('/api/admin/blog/ai-batch', { method: 'POST' });
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
          try {
            const event = JSON.parse(line.slice(6));
            handleEvent(event);
          } catch { /* ignore parse errors */ }
        }
      }
    } catch (err: any) {
      setFatalMsg(err.message ?? 'Generation failed');
      setPhase('fatal');
    }
  }

  function handleEvent(event: any) {
    switch (event.type) {
      case 'start':
        setStatusMsg(event.message);
        break;
      case 'topics_ready':
        setStatusMsg(`Planning ${event.count} articles…`);
        setSlots(event.titles.map((title: string, i: number) => ({
          index: i, title, category: '', status: 'queued' as PostStatus, imagesDone: 0,
        })));
        break;
      case 'post_start':
        setStatusMsg(`Writing article ${event.index + 1} of ${slots.length || 6}…`);
        updateSlot(event.index, { title: event.title, category: event.category, status: 'writing' });
        break;
      case 'post_writing':
        updateSlot(event.index, { status: 'writing' });
        break;
      case 'post_images':
        updateSlot(event.index, { status: 'imaging', imagesDone: event.imageIndex });
        break;
      case 'post_saving':
        updateSlot(event.index, { status: 'saving' });
        break;
      case 'post_saved':
        updateSlot(event.index, { status: 'saved', id: event.id, slug: event.slug });
        break;
      case 'post_error':
        updateSlot(event.index, { status: 'error', errorMsg: event.message });
        break;
      case 'complete':
        setSavedCount(event.savedCount);
        setPhase('done');
        setStatusMsg(`Done! ${event.savedCount} posts saved as drafts.`);
        break;
      case 'fatal':
        setFatalMsg(event.message);
        setPhase('fatal');
        break;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">AI Create 6 Blog Posts</h2>
          </div>
          {phase !== 'running' && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="p-6">
          {/* Idle state */}
          {phase === 'idle' && (
            <div className="text-center py-4">
              <Bot className="w-12 h-12 text-purple-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 text-lg mb-2">Generate 6 SEO-Optimized Blog Posts</h3>
              <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                AI will research seasonal pest control topics for southeastern PA, write complete articles with local context,
                generate images, and create full SEO metadata for each post. All posts are saved as <strong>drafts</strong> for your review.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-6 text-xs text-gray-500">
                <div className="bg-purple-50 rounded-lg p-3">
                  <PenLine className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                  <div className="font-medium text-gray-700">6 Articles</div>
                  <div>700–950 words each</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3">
                  <Image className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <div className="font-medium text-gray-700">3 Images / Post</div>
                  <div>Hero + 2 inline</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <Globe className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <div className="font-medium text-gray-700">Full SEO Data</div>
                  <div>Meta title, description, tags</div>
                </div>
              </div>
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6">
                This process takes 3–5 minutes. Keep this window open.
              </p>
              <button onClick={startGeneration}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors">
                <Bot className="w-5 h-5" />
                Start Generating
              </button>
            </div>
          )}

          {/* Running / done state */}
          {(phase === 'running' || phase === 'done') && (
            <div>
              <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
                {phase === 'running' && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
                {phase === 'done' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                {statusMsg}
              </p>

              <div className="space-y-2">
                {slots.length === 0 && phase === 'running' && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-purple-400" />
                    Researching topics…
                  </div>
                )}
                {slots.map(slot => (
                  <div key={slot.index}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-sm transition-colors ${
                      slot.status === 'saved' ? 'bg-green-50 border-green-200' :
                      slot.status === 'error' ? 'bg-red-50 border-red-200' :
                      slot.status === 'queued' ? 'bg-gray-50 border-gray-200' :
                      'bg-purple-50 border-purple-200'
                    }`}>
                    <StatusIcon status={slot.status} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{slot.title || `Post ${slot.index + 1}`}</div>
                      <div className={`text-xs mt-0.5 ${
                        slot.status === 'error' ? 'text-red-600' :
                        slot.status === 'saved' ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {slot.category && <span className="font-medium">{slot.category} · </span>}
                        {statusLabel(slot)}
                      </div>
                    </div>
                    {slot.status === 'saved' && slot.slug && (
                      <a href={`/blog/${slot.slug}`} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-green-700 hover:text-green-900 font-medium shrink-0">
                        Preview ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {phase === 'done' && (
                <div className="mt-6 text-center">
                  <p className="text-green-700 font-semibold mb-4">{savedCount} posts saved as drafts — review and publish from the list.</p>
                  <button onClick={() => { onComplete(); onClose(); }}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl text-sm">
                    View Posts
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Fatal error */}
          {phase === 'fatal' && (
            <div className="text-center py-6">
              <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
              <p className="text-red-700 font-medium mb-2">Generation failed</p>
              <p className="text-gray-500 text-sm mb-4">{fatalMsg}</p>
              <button onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm">Close</button>
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
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/blog?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setPosts(data.posts || []);
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
    await fetchData();
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    setEditingPost(null);
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

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-1">{posts.length} posts</p>
        </div>
        <div className="flex items-center gap-2">
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

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
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
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin inline" /></td></tr>
              ) : posts.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No blog posts found</td></tr>
              ) : (
                posts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
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
        <PostModal post={editingPost} onSave={(data) => handleSave(data, editingPost.id)} onClose={() => setEditingPost(null)} onDelete={handleDelete} />
      )}
      {showBatchModal && (
        <BatchCreateModal onClose={() => setShowBatchModal(false)} onComplete={fetchData} />
      )}
    </div>
  );
}
