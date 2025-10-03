import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost, InsertBlogPost } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

export function AdminBlog() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSyndicateOpen, setIsSyndicateOpen] = useState(false);
  const [feedUrl, setFeedUrl] = useState("https://pestmgt.com/feed/");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<InsertBlogPost>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    author: "",
    featuredImage: "",
    category: "",
    tags: [],
    isPublished: false,
    metaTitle: "",
    metaDescription: "",
  });
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ success: boolean; posts: BlogPost[] }>({
    queryKey: ['/api/admin/blog/posts'],
  });

  const posts = data?.posts || [];

  const createMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      const response = await apiRequest('POST', '/api/admin/blog/posts', data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      toast({ title: "Success", description: "Blog post created successfully" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create blog post", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBlogPost> }) => {
      const response = await apiRequest('PUT', `/api/admin/blog/posts/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      toast({ title: "Success", description: "Blog post updated successfully" });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update blog post", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/admin/blog/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      toast({ title: "Success", description: "Blog post deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete blog post", variant: "destructive" });
    },
  });

  const syndicateMutation = useMutation({
    mutationFn: async (feedUrl: string) => {
      const response = await apiRequest('POST', '/api/admin/blog/syndicate', { feedUrl });
      return await response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      const { results } = data;
      toast({ 
        title: "Syndication Complete", 
        description: `${results.imported} posts imported, ${results.skipped} skipped, ${results.errors} errors`
      });
      setIsSyndicateOpen(false);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to syndicate RSS feed", 
        variant: "destructive" 
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      author: "",
      featuredImage: "",
      category: "",
      tags: [],
      isPublished: false,
      metaTitle: "",
      metaDescription: "",
    });
    setEditingPost(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      featuredImage: post.featuredImage || "",
      category: post.category,
      tags: post.tags || [],
      isPublished: post.isPublished,
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
    });
    setIsCreateOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDialogClose = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      title: value,
      slug: prev.slug || generateSlug(value)
    }));
  };

  const handleTagsChange = (value: string) => {
    const tagsArray = value.split(',').map(t => t.trim()).filter(t => t);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Blog Management</h1>
          <p className="text-gray-600" data-testid="text-page-subtitle">Create and manage blog posts for SEO</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSyndicateOpen} onOpenChange={setIsSyndicateOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-syndicate">
                <Rss className="w-4 h-4 mr-2" />
                Syndicate RSS
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Syndicate RSS Feed</DialogTitle>
                <DialogDescription>
                  Import blog posts from an external RSS feed
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="feedUrl">RSS Feed URL</Label>
                  <Input
                    id="feedUrl"
                    value={feedUrl}
                    onChange={(e) => setFeedUrl(e.target.value)}
                    placeholder="https://example.com/feed/"
                    data-testid="input-feed-url"
                  />
                </div>
                <Button 
                  onClick={() => syndicateMutation.mutate(feedUrl)} 
                  disabled={syndicateMutation.isPending}
                  className="w-full"
                  data-testid="button-import"
                >
                  {syndicateMutation.isPending ? "Importing..." : "Import Posts"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} data-testid="button-create-post">
                <Plus className="w-4 h-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle data-testid="text-dialog-title">
                {editingPost ? 'Edit Blog Post' : 'Create New Blog Post'}
              </DialogTitle>
              <DialogDescription>
                {editingPost ? 'Update your blog post details' : 'Fill in the details to create a new blog post'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  data-testid="input-title"
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="auto-generated-from-title"
                  required
                  data-testid="input-slug"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={3}
                  required
                  data-testid="input-excerpt"
                />
              </div>

              <div>
                <Label htmlFor="content">Content (HTML) *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={10}
                  required
                  data-testid="input-content"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="author">Author *</Label>
                  <Input
                    id="author"
                    value={formData.author}
                    onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                    required
                    data-testid="input-author"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Pest Prevention"
                    required
                    data-testid="input-category"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="featuredImage">Featured Image URL</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  placeholder="https://..."
                  data-testid="input-featured-image"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags?.join(', ') || ""}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="pest control, prevention, tips"
                  data-testid="input-tags"
                />
              </div>

              <div>
                <Label htmlFor="metaTitle">SEO Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  placeholder="Optional, defaults to title"
                  data-testid="input-meta-title"
                />
              </div>

              <div>
                <Label htmlFor="metaDescription">SEO Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={2}
                  placeholder="Optional, defaults to excerpt"
                  data-testid="input-meta-description"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Publish Post</Label>
                  <div className="text-sm text-gray-500">Make this post visible to the public</div>
                </div>
                <Switch
                  checked={formData.isPublished}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublished: checked }))}
                  data-testid="switch-published"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  data-testid="button-save-post"
                >
                  {editingPost ? 'Update Post' : 'Create Post'}
                </Button>
                <Button type="button" variant="outline" onClick={handleDialogClose} data-testid="button-cancel">
                  Cancel
                </Button>
              </div>
            </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500" data-testid="text-no-posts">No blog posts yet. Create your first post!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Card key={post.id} data-testid={`card-post-${post.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={post.isPublished ? "default" : "secondary"} data-testid={`badge-status-${post.id}`}>
                    {post.isPublished ? (
                      <><Eye className="w-3 h-3 mr-1" /> Published</>
                    ) : (
                      <><EyeOff className="w-3 h-3 mr-1" /> Draft</>
                    )}
                  </Badge>
                  <Badge variant="outline" data-testid={`badge-category-${post.id}`}>{post.category}</Badge>
                </div>
                <CardTitle className="line-clamp-2" data-testid={`text-title-${post.id}`}>{post.title}</CardTitle>
                <CardDescription className="line-clamp-2" data-testid={`text-excerpt-${post.id}`}>
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span data-testid={`text-author-${post.id}`}>By {post.author}</span>
                  <span data-testid={`text-date-${post.id}`}>
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(post)}
                    data-testid={`button-edit-${post.id}`}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(post.id)}
                    data-testid={`button-delete-${post.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
