import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Phone } from 'lucide-react'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

interface DbPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  category: string
  featured_image: string | null
  tags: string[] | null
  meta_title: string | null
  meta_description: string | null
  published_at: string | null
  created_at: string
}

async function getPost(slug: string): Promise<DbPost | null> {
  try {
    const rows = await sql`
      SELECT id, title, slug, excerpt, content, author, category, featured_image,
             tags, meta_title, meta_description, published_at, created_at
      FROM blog_posts
      WHERE slug = ${slug} AND is_published = true
      LIMIT 1
    `
    return (rows[0] as DbPost) ?? null
  } catch {
    return null
  }
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return { title: 'Post Not Found | Absolute Pest Services' }

  return {
    title: post.meta_title || `${post.title} | Absolute Pest Services`,
    description: post.meta_description || post.excerpt,
    alternates: { canonical: `https://absolutepestservices.com/blog/${post.slug}` },
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt,
      ...(post.featured_image ? { images: [{ url: post.featured_image }] } : {}),
    },
  }
}

export default async function BlogPostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  const publishDate = post.published_at ?? post.created_at
  const formattedDate = new Date(publishDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Render content: if it looks like HTML, use dangerouslySetInnerHTML;
  // otherwise render as plain paragraphs split by newline.
  const isHtml = /<[a-z][\s\S]*>/i.test(post.content)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-300 truncate">{post.title}</span>
          </nav>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
              {post.category}
            </span>
            <span className="text-sm text-gray-400">{formattedDate}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
          <p className="text-gray-300 text-lg">{post.excerpt}</p>

          {post.author && (
            <p className="mt-4 text-sm text-gray-400">By <span className="text-white font-medium">{post.author}</span></p>
          )}
        </div>
      </section>

      {/* Featured image */}
      {post.featured_image && (
        <div className="relative w-full h-64 sm:h-96 bg-gray-100">
          <Image
            src={post.featured_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* Content */}
      <section className="py-12 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {isHtml ? (
            <div
              className="prose prose-lg prose-green max-w-none"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <div className="prose prose-lg prose-green max-w-none">
              {post.content.split('\n').filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <Link href="/blog" className="text-green-700 font-medium hover:text-green-800 text-sm">
              ← Back to all posts
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-green-50 border-t border-green-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Have a Pest Problem?</h2>
          <p className="text-gray-600 mb-6">Call us now — same-day service available in PA &amp; DE.</p>
          <a
            href="tel:484-643-2225"
            className="inline-flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white font-bold px-8 py-4 rounded-xl"
          >
            <Phone size={20} />
            484-643-2225
          </a>
        </div>
      </section>
    </>
  )
}
