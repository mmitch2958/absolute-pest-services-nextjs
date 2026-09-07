import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Phone } from 'lucide-react'
import { sql } from '@/lib/db'
import { normalizeBlogHtml } from '@/lib/blog-content'

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

interface SupportingImage {
  id: number
  image_url: string
  alt_text: string
  section_heading: string | null
  sort_order: number
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

async function getSupportingImages(postId: number): Promise<SupportingImage[]> {
  try {
    return await sql`
      SELECT id, image_url, alt_text, section_heading, sort_order
      FROM blog_post_images
      WHERE post_id = ${postId}
      ORDER BY sort_order ASC, id ASC
      LIMIT 3
    ` as SupportingImage[]
  } catch {
    // Keep articles available while the new table is being rolled out.
    return []
  }
}

function splitArticleHtml(html: string): string[] {
  const headings = [...html.matchAll(/<h2\b/gi)]
    .map(match => match.index ?? 0)
    .filter((index, position, all) => position === 0 || index !== all[position - 1])

  if (headings.length === 0) return [html]

  const chunks: string[] = []
  if (headings[0] > 0) chunks.push(html.slice(0, headings[0]))
  headings.forEach((start, index) => {
    chunks.push(html.slice(start, headings[index + 1] ?? html.length))
  })
  return chunks.filter(chunk => chunk.trim())
}

function ArticleImage({ image }: { image: SupportingImage }) {
  return (
    <figure className="blog-supporting-image">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-[#e9eddf]">
        <Image
          src={image.image_url}
          alt={image.alt_text}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 92vw, 720px"
          quality={72}
        />
      </div>
      {image.section_heading && (
        <figcaption>{image.section_heading}</figcaption>
      )}
    </figure>
  )
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
  const supportingImages = await getSupportingImages(post.id)

  const publishDate = post.published_at ?? post.created_at
  const formattedDate = new Date(publishDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Render content: if it looks like HTML, use dangerouslySetInnerHTML;
  // otherwise render as plain paragraphs split by newline.
  const normalizedContent = normalizeBlogHtml(post.content)
  const isHtml = /<[a-z][\s\S]*>/i.test(normalizedContent)
  const articleChunks = isHtml ? splitArticleHtml(normalizedContent) : []
  const plainParagraphs = isHtml ? [] : post.content.split('\n').filter(Boolean)

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a332b] to-[#203d34] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-[#8b978f] mb-6" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-white">Blog</Link>
            <span className="mx-2">/</span>
            <span className="text-[#c7d0cb] truncate">{post.title}</span>
          </nav>

          <div className="mb-4 flex items-center gap-3">
            <span className="text-xs font-semibold text-[#9fb896] bg-[#9fb896]/10 px-3 py-1 rounded-full border border-[#9fb896]/20">
              {post.category}
            </span>
            <span className="text-sm text-[#8b978f]">{formattedDate}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">{post.title}</h1>
          <p className="text-[#c7d0cb] text-lg">{post.excerpt}</p>

          {post.author && (
            <p className="mt-4 text-sm text-[#8b978f]">By <span className="text-white font-medium">{post.author}</span></p>
          )}
        </div>
      </section>

      {/* Featured image */}
      {post.featured_image && (
        <section className="bg-[#f8f5ec] pt-8 sm:pt-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl sm:rounded-3xl bg-[#e9eddf] shadow-[0_18px_50px_rgba(32,61,52,0.12)]">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 94vw, 960px"
                quality={78}
              />
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12 sm:py-16 bg-[#f8f5ec]">
        <div className="max-w-[760px] mx-auto px-5 sm:px-8">
          {isHtml ? (
            articleChunks.map((chunk, index) => (
              <div key={index}>
                <div
                  className="blog-content prose prose-lg prose-green max-w-none"
                  dangerouslySetInnerHTML={{ __html: chunk }}
                />
                {supportingImages[index] && <ArticleImage image={supportingImages[index]} />}
              </div>
            ))
          ) : (
            <div className="blog-content prose prose-lg prose-green max-w-none">
              {plainParagraphs.map((para, index) => (
                <div key={index}>
                  <p>{para}</p>
                  {supportingImages[index] && <ArticleImage image={supportingImages[index]} />}
                </div>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-[#e9eddf] flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-[#e9eddf] text-[#58665e] px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Back link */}
          <div className="mt-10 pt-6 border-t border-[#e9eddf]">
            <Link href="/blog" className="text-[#173f35] font-medium hover:text-[#0f2b23] text-sm">
              ← Back to all posts
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-[#eef1e7] border-t border-[#e9eddf]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-[#203d34] mb-4">Have a Pest Problem?</h2>
          <p className="text-[#58665e] mb-6">Call us now — same-day service available in PA &amp; DE.</p>
          <a
            href="tel:484-643-2225"
            className="inline-flex items-center gap-3 bg-[#173f35] hover:bg-[#0f2b23] text-white font-bold px-8 py-4 rounded-xl"
          >
            <Phone size={20} />
            484-643-2225
          </a>
        </div>
      </section>
    </>
  )
}
