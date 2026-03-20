import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Eye, EyeOff, Rss, Mail, Sparkles, CheckCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { BlogPost, InsertBlogPost } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface ResearchedTopic {
  id: number;
  title: string;
  category: string;
  type: string;
  searchVolume: number;
  description: string;
  keywords: string[];
  selected?: boolean;
}

interface GeneratedArticle {
  id?: number;
  title: string;
  slug?: string;
  featuredImage?: string;
  status: 'created' | 'error';
  error?: string;
}

export function AdminBlog() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSyndicateOpen, setIsSyndicateOpen] = useState(false);
  const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false);
  const [feedUrl, setFeedUrl] = useState("https://pestmgt.com/feed/");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubject, setNewsletterSubject] = useState("Latest Pest Control Tips & Updates");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [selectedPosts, setSelectedPosts] = useState<number[]>([]);
  
  // AI Generate state
  const [researchedTopics, setResearchedTopics] = useState<ResearchedTopic[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<number[]>([]);
  const [isResearching, setIsResearching] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedArticles, setGeneratedArticles] = useState<GeneratedArticle[]>([]);
  const [aiStep, setAiStep] = useState<'idle' | 'researching' | 'selecting' | 'generating' | 'complete'>('idle');
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

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const response = await apiRequest('POST', '/api/admin/blog/posts/bulk-delete', { ids });
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
      toast({ title: "Success", description: `${selectedPosts.length} blog posts deleted successfully` });
      setSelectedPosts([]);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete blog posts", variant: "destructive" });
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
      
      // Log detailed errors to console
      if (results.errors > 0) {
        console.log("RSS Import Errors:", results.details.filter((d: any) => d.status === 'error'));
      }
      
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

  const newsletterMutation = useMutation({
    mutationFn: async (data: { postIds: number[]; recipientEmail: string; subject: string }) => {
      const response = await apiRequest('POST', '/api/admin/newsletter/send', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Newsletter Sent", 
        description: "Newsletter email sent successfully"
      });
      setIsNewsletterOpen(false);
      setNewsletterEmail("");
      setNewsletterSubject("Latest Pest Control Tips & Updates");
      setSelectedPosts([]);
    },
    onError: (error: any) => {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to send newsletter", 
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

  const togglePostSelection = (postId: number) => {
    setSelectedPosts(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const toggleAllPosts = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(p => p.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedPosts.length === 0) return;
    if (confirm(`Are you sure you want to delete ${selectedPosts.length} blog post(s)?`)) {
      bulkDeleteMutation.mutate(selectedPosts);
    }
  };

  const handleSendNewsletter = () => {
    if (!newsletterEmail.trim()) {
      toast({ 
        title: "Error", 
        description: "Please enter a recipient email address", 
        variant: "destructive" 
      });
      return;
    }
    if (selectedPosts.length === 0) {
      toast({ 
        title: "Error", 
        description: "Please select at least one blog post", 
        variant: "destructive" 
      });
      return;
    }
    newsletterMutation.mutate({
      postIds: selectedPosts,
      recipientEmail: newsletterEmail,
      subject: newsletterSubject
    });
  };

  // AI Research Topics
  const handleResearchTopics = async () => {
    setIsResearching(true);
    setAiStep('researching');
    setResearchedTopics([]);
    setSelectedTopics([]);
    setGeneratedArticles([]);
    
    try {
      const response = await fetch('/api/admin/blog/research-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success && data.topics) {
        setResearchedTopics(data.topics.map((t: ResearchedTopic) => ({ ...t, selected: false })));
        setAiStep('selecting');
        toast({ 
          title: "Topics Researched", 
          description: `Found ${data.topics.length} trending topics. Select up to 6 to generate articles.` 
        });
      } else {
        throw new Error(data.message || 'Failed to research topics');
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to research topics. Please try again.", 
        variant: "destructive" 
      });
      setAiStep('idle');
    } finally {
      setIsResearching(false);
    }
  };

  // Toggle topic selection
  const toggleTopicSelection = (topicId: number) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      }
      if (prev.length >= 6) {
        toast({ 
          title: "Limit Reached", 
          description: "You can generate up to 6 articles at a time.", 
          variant: "destructive" 
        });
        return prev;
      }
      return [...prev, topicId];
    });
  };

  // Generate selected articles
  const handleGenerateArticles = async () => {
    if (selectedTopics.length === 0) {
      toast({ 
        title: "Error", 
        description: "Please select at least one topic", 
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);
    setAiStep('generating');
    setGenerationProgress(0);
    setGeneratedArticles([]);

    try {
      const topicsToGenerate = researchedTopics.filter(t => selectedTopics.includes(t.id));
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setGenerationProgress(prev => Math.min(prev + 5, 90));
      }, 500);

      const response = await fetch('/api/admin/blog/generate-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          topicIds: selectedTopics,
          topics: topicsToGenerate 
        })
      });
      
      clearInterval(progressInterval);
      
      const data = await response.json();
      
      if (data.success && data.articles) {
        setGeneratedArticles(data.articles);
        setGenerationProgress(100);
        setAiStep('complete');
        
        const successCount = data.articles.filter((a: GeneratedArticle) => a.status === 'created').length;
        
        // Refresh posts list
        queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
        
        toast({ 
          title: "Articles Generated!", 
          description: `Successfully created ${successCount} blog articles with images.` 
        });
      } else {
        throw new Error(data.message || 'Failed to generate articles');
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to generate articles. Please try again.", 
        variant: "destructive" 
      });
      setAiStep('selecting');
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset AI panel
  const handleResetAIPanel = () => {
    setResearchedTopics([]);
    setSelectedTopics([]);
    setGeneratedArticles([]);
    setGenerationProgress(0);
    setAiStep('idle');
    setIsAIGenerateOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Blog Management</h1>
          <p className="text-gray-600" data-testid="text-page-subtitle">Create and manage blog posts for SEO</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAIGenerateOpen} onOpenChange={setIsAIGenerateOpen}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                onClick={() => { setAiStep('idle'); setResearchedTopics([]); setSelectedTopics([]); setGeneratedArticles([]); }}
                data-testid="button-ai-generate"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Research & Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Blog Article Generator
                </DialogTitle>
                <DialogDescription>
                  Research trending pest control topics and generate SEO-optimized blog articles with images
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Step 1: Research Topics */}
                {aiStep === 'idle' && (
                  <div className="text-center py-8">
                    <div className="mb-4">
                      <Sparkles className="w-16 h-16 mx-auto text-purple-600 mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Ready to Research Topics</h3>
                      <p className="text-gray-600 mb-6">
                        AI will search for trending pest control topics based on seasonal trends, 
                        search volume, and homeowner interests in Southeastern PA.
                      </p>
                    </div>
                    <Button 
                      onClick={handleResearchTopics}
                      disabled={isResearching}
                      className="bg-gradient-to-r from-purple-600 to-blue-600"
                      data-testid="button-start-research"
                    >
                      {isResearching ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Researching...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Start Topic Research
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Step 2: Researching */}
                {aiStep === 'researching' && (
                  <div className="text-center py-8">
                    <Loader2 className="w-16 h-16 mx-auto text-purple-600 animate-spin mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Researching Trending Topics...</h3>
                    <p className="text-gray-600">
                      Searching Search Console data and analyzing current pest control trends
                    </p>
                  </div>
                )}

                {/* Step 3: Select Topics */}
                {aiStep === 'selecting' && researchedTopics.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Select Topics to Generate</h3>
                        <p className="text-sm text-gray-600">
                          Choose up to 6 topics ({selectedTopics.length}/6 selected)
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleResearchTopics}
                        disabled={isResearching}
                      >
                        Refresh Topics
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {researchedTopics.map((topic) => (
                        <Card 
                          key={topic.id} 
                          className={`cursor-pointer transition-all ${
                            selectedTopics.includes(topic.id) 
                              ? 'border-purple-500 border-2 bg-purple-50' 
                              : 'hover:border-gray-300'
                          }`}
                          onClick={() => toggleTopicSelection(topic.id)}
                          data-testid={`topic-card-${topic.id}`}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-sm font-medium line-clamp-2">
                                  {topic.title}
                                </CardTitle>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs">
                                    {topic.category}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {topic.type}
                                  </Badge>
                                </div>
                              </div>
                              {selectedTopics.includes(topic.id) && (
                                <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                              )}
                            </div>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {topic.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {topic.searchVolume?.toLocaleString()} monthly searches
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={handleResetAIPanel}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleGenerateArticles}
                        disabled={selectedTopics.length === 0 || isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-blue-600"
                        data-testid="button-generate-articles"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate {selectedTopics.length} Article{selectedTopics.length !== 1 ? 's' : ''}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Generating */}
                {aiStep === 'generating' && (
                  <div className="space-y-6 py-4">
                    <div className="text-center">
                      <Loader2 className="w-12 h-12 mx-auto text-purple-600 animate-spin mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Generating Articles...</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        Creating SEO-optimized content and generating images
                      </p>
                    </div>
                    <Progress value={generationProgress} className="w-full" />
                    <p className="text-center text-sm text-gray-500">
                      {generationProgress < 30 ? 'Researching keywords and structure...' :
                       generationProgress < 60 ? 'Writing article content...' :
                       generationProgress < 90 ? 'Generating featured images...' :
                       'Finalizing articles...'}
                    </p>
                  </div>
                )}

                {/* Step 5: Complete */}
                {aiStep === 'complete' && generatedArticles.length > 0 && (
                  <div className="space-y-4">
                    <div className="text-center mb-6">
                      <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-2" />
                      <h3 className="text-lg font-semibold">Articles Generated!</h3>
                      <p className="text-sm text-gray-600">
                        {generatedArticles.filter(a => a.status === 'created').length} articles created as drafts
                      </p>
                    </div>

                    <div className="space-y-3">
                      {generatedArticles.map((article, index) => (
                        <Card key={index} className={article.status === 'error' ? 'border-red-300 bg-red-50' : ''}>
                          <CardContent className="py-3">
                            <div className="flex items-center gap-4">
                              {article.featuredImage ? (
                                <img 
                                  src={article.featuredImage} 
                                  alt="" 
                                  className="w-16 h-12 object-cover rounded"
                                />
                              ) : (
                                <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                                  <ImageIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{article.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  {article.status === 'created' ? (
                                    <Badge variant="default" className="text-xs bg-green-600">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Created
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="text-xs">
                                      Error: {article.error}
                                    </Badge>
                                  )}
                                  {article.slug && (
                                    <span className="text-xs text-gray-400">/blog/{article.slug}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={handleResetAIPanel}>
                        Close
                      </Button>
                      <Button 
                        onClick={() => {
                          handleResetAIPanel();
                          queryClient.invalidateQueries({ queryKey: ['/api/admin/blog/posts'] });
                        }}
                      >
                        View Posts
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
          {selectedPosts.length > 0 && (
            <>
              <Button 
                variant="default" 
                onClick={() => setIsNewsletterOpen(true)}
                disabled={newsletterMutation.isPending}
                data-testid="button-create-newsletter"
              >
                <Mail className="w-4 h-4 mr-2" />
                Create Newsletter ({selectedPosts.length})
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                data-testid="button-bulk-delete"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Selected ({selectedPosts.length})
              </Button>
            </>
          )}
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
          <Dialog open={isNewsletterOpen} onOpenChange={setIsNewsletterOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Newsletter Email</DialogTitle>
                <DialogDescription>
                  Send selected blog posts as an email newsletter
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="newsletterSubject">Email Subject *</Label>
                  <Input
                    id="newsletterSubject"
                    value={newsletterSubject}
                    onChange={(e) => setNewsletterSubject(e.target.value)}
                    placeholder="Latest Pest Control Tips & Updates"
                    data-testid="input-newsletter-subject"
                  />
                </div>
                <div>
                  <Label htmlFor="newsletterEmail">Recipient Email *</Label>
                  <Input
                    id="newsletterEmail"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="customer@example.com"
                    data-testid="input-newsletter-email"
                  />
                </div>
                <div>
                  <Label>Selected Posts ({selectedPosts.length})</Label>
                  <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
                    {posts.filter(p => selectedPosts.includes(p.id)).map(post => (
                      <div key={post.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{post.title}</p>
                          <p className="text-xs text-gray-600 line-clamp-1">{post.excerpt}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={handleSendNewsletter}
                  disabled={newsletterMutation.isPending}
                  className="w-full"
                  data-testid="button-send-newsletter"
                >
                  {newsletterMutation.isPending ? "Sending..." : "Send Newsletter"}
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
        <>
          <div className="mb-4 flex items-center gap-2">
            <Checkbox
              checked={selectedPosts.length === posts.length}
              onCheckedChange={toggleAllPosts}
              data-testid="checkbox-select-all"
            />
            <Label className="cursor-pointer" onClick={toggleAllPosts}>
              Select All ({posts.length} posts)
            </Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} data-testid={`card-post-${post.id}`} className={selectedPosts.includes(post.id) ? "border-blue-500 border-2" : ""}>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox
                      checked={selectedPosts.includes(post.id)}
                      onCheckedChange={() => togglePostSelection(post.id)}
                      data-testid={`checkbox-post-${post.id}`}
                    />
                    <div className="flex items-center justify-between flex-1">
                      <Badge variant={post.isPublished ? "default" : "secondary"} data-testid={`badge-status-${post.id}`}>
                        {post.isPublished ? (
                          <><Eye className="w-3 h-3 mr-1" /> Published</>
                        ) : (
                          <><EyeOff className="w-3 h-3 mr-1" /> Draft</>
                        )}
                      </Badge>
                      <Badge variant="outline" data-testid={`badge-category-${post.id}`}>{post.category}</Badge>
                    </div>
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
        </>
      )}
    </div>
  );
}
