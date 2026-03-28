import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const { data, isLoading } = useQuery<{ success: boolean; posts: BlogPost[] }>({
    queryKey: ['/api/blog/posts'],
  });

  const posts = data?.posts || [];

  return (
    <>
      <Helmet>
        <title>Pest Control Tips & Guides - Absolute Pest Services Blog</title>
        <meta name="description" content="Expert pest control tips, seasonal advice, and comprehensive guides for homeowners in Pennsylvania and Delaware. Learn how to prevent and treat common pest problems." />
        <meta property="og:title" content="Pest Control Tips & Guides - Absolute Pest Services Blog" />
        <meta property="og:description" content="Expert pest control tips, seasonal advice, and comprehensive guides for homeowners in Pennsylvania and Delaware." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://absolutepestservices.com/blog" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <div className="bg-gradient-to-r from-green-700 to-green-600 text-white py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-blog-title">
              Pest Control Tips & Guides
            </h1>
            <p className="text-xl text-green-100 max-w-2xl" data-testid="text-blog-subtitle">
              Expert advice and seasonal tips to keep your home pest-free
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg" data-testid="text-no-posts">
                No blog posts available yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-xl transition-shadow duration-300" data-testid={`card-blog-${post.id}`}>
                  {post.featuredImage && (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                      data-testid={`img-blog-featured-${post.id}`}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary" data-testid={`badge-category-${post.id}`}>
                        {post.category}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1" data-testid={`text-date-${post.id}`}>
                        <Calendar className="w-4 h-4" />
                        {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <CardTitle className="text-xl mb-2" data-testid={`text-title-${post.id}`}>
                      {post.title}
                    </CardTitle>
                    <CardDescription data-testid={`text-excerpt-${post.id}`}>
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center gap-1" data-testid={`text-author-${post.id}`}>
                        By {post.author}
                      </span>
                      <Link href={`/blog/${post.slug}`}>
                        <a className="text-green-600 hover:text-green-700 font-medium flex items-center gap-2" data-testid={`link-read-more-${post.id}`}>
                          Read More <ArrowRight className="w-4 h-4" />
                        </a>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
