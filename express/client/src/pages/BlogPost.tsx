import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Calendar, ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import type { BlogPost } from "@shared/schema";

export default function BlogPost() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data, isLoading } = useQuery<{ success: boolean; post: BlogPost }>({
    queryKey: [`/api/blog/posts/${slug}`],
    enabled: !!slug,
  });

  const post = data?.post;

  const { data: relatedData } = useQuery<{ success: boolean; posts: BlogPost[] }>({
    queryKey: [`/api/blog/posts?category=${post?.category}`],
    enabled: !!post?.category,
  });

  const relatedPosts = (relatedData?.posts || [])
    .filter((p) => p.slug !== post?.slug)
    .slice(0, 2);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-12">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h1 className="text-3xl font-bold mb-4" data-testid="text-not-found">Blog post not found</h1>
            <Link href="/blog">
              <Button data-testid="button-back-to-blog">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{post.metaTitle || post.title} - Absolute Pest Services</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:type" content="article" />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        <meta property="article:published_time" content={new Date(post.publishedAt || post.createdAt).toISOString()} />
        <meta property="article:author" content={post.author} />
        <link rel="canonical" href={"https://absolutepestservices.com/blog/" + post.slug} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "author": { "@type": "Person", "name": post.author },
            "datePublished": post.publishedAt
              ? new Date(post.publishedAt).toISOString()
              : new Date(post.createdAt).toISOString(),
            "image": post.featuredImage || undefined,
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-8">
          <div className="container mx-auto px-4 max-w-4xl">
            <Link href="/blog">
              <Button variant="ghost" className="text-white hover:bg-green-600 mb-4" data-testid="button-back">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>

        <article className="container mx-auto px-4 py-12 max-w-4xl">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" data-testid="badge-category">
                {post.category}
              </Badge>
              <span className="text-gray-600 flex items-center gap-1" data-testid="text-publish-date">
                <Calendar className="w-4 h-4" />
                {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900" data-testid="text-post-title">
              {post.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-4" data-testid="text-post-excerpt">
              {post.excerpt}
            </p>
            
            <p className="text-gray-500" data-testid="text-post-author">
              By <span className="font-medium">{post.author}</span>
            </p>
          </header>

          {post.featuredImage && (
            <img 
              src={post.featuredImage} 
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg mb-8"
              data-testid="img-featured"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}

          <div 
            className="prose prose-lg max-w-none mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
            data-testid="content-post-body"
          />

          {post.tags && post.tags.length > 0 && (
            <div className="border-t pt-6" data-testid="section-tags">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Tag className="w-5 h-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" data-testid={`tag-${index}`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="border-t mt-12 pt-8 bg-green-50 p-6 rounded-lg">
            <h3 className="text-2xl font-bold mb-3" data-testid="text-cta-title">Need Professional Pest Control?</h3>
            <p className="text-gray-700 mb-4" data-testid="text-cta-description">
              Our expert team is ready to help protect your home from pests. Get a free consultation today!
            </p>
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700" 
              data-testid="button-contact-us"
              onClick={() => window.location.href = '/#contact'}
            >
              Contact Us Today
            </Button>
          </div>

          {relatedPosts.length > 0 && (
            <div className="mt-12 border-t pt-10" data-testid="section-related-posts">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {relatedPosts.map((related) => (
                  <Card key={related.slug} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <Badge variant="secondary" className="mb-3">{related.category}</Badge>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {related.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{related.excerpt}</p>
                      <Link href={`/blog/${related.slug}`}>
                        <Button variant="outline" size="sm">Read Article</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </>
  );
}
