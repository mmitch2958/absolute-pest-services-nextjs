import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Phone } from 'lucide-react'
import { sql } from '@/lib/db'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pest Control Blog | Absolute Pest Services',
  description:
    'Expert pest control tips, guides, and advice for PA & DE homeowners. Learn about wildlife removal, bed bugs, termites, and seasonal pest prevention.',
  alternates: { canonical: 'https://absolutepestservices.com/blog' },
}

interface DbPost {
  id: number
  title: string
  slug: string
  excerpt: string
  category: string
  featured_image: string | null
  published_at: string | null
  created_at: string
}

// Static fallback posts (shown when no DB posts exist)
const staticPosts = [
  {
    slug: 'bat-exclusion-season-pa',
    title: 'PA Bat Exclusion Season: What Homeowners Need to Know',
    excerpt:
      'Pennsylvania has strict regulations on when bat exclusion can be performed. Here\'s everything you need to know about legal exclusion windows and why they matter.',
    date: '2026-03-01',
    category: 'Wildlife Control',
    imageUrl: '/blog/images/bat-exclusion.jpg',
    imageAlt: 'Bats flying at dusk near a Pennsylvania home',
  },
  {
    slug: 'termite-swarming-season-chester-county',
    title: 'Termite Swarm Season in Chester County — Is Your Home Protected?',
    excerpt:
      'Spring brings termite swarming season to southeastern PA. Swarmers (winged termites) are the most visible sign of a colony — here\'s what to do if you see them.',
    date: '2026-02-15',
    category: 'Termites',
    imageUrl: '/blog/images/termite-swarm.jpg',
    imageAlt: 'Termite swarmers on a wooden surface',
  },
  {
    slug: 'bed-bugs-hotel-prevention',
    title: 'How to Avoid Bringing Bed Bugs Home From a Hotel',
    excerpt:
      'Bed bugs are expert hitchhikers. Follow these steps every time you travel to avoid bringing an infestation home.',
    date: '2026-02-01',
    category: 'Bed Bugs',
    imageUrl: '/blog/images/bed-bugs-hotel.jpg',
    imageAlt: 'Hotel bed showing signs of bed bug infestation',
  },
  {
    slug: 'raccoon-proofing-your-home',
    title: '10 Ways to Raccoon-Proof Your Home This Spring',
    excerpt:
      "Raccoons are active in spring searching for den sites. Here's how to make your attic, chimney, and property less attractive.",
    date: '2026-01-20',
    category: 'Wildlife Control',
    imageUrl: '/blog/images/raccoon-proofing.jpg',
    imageAlt: 'Raccoon on a residential rooftop at night',
  },
  {
    slug: 'mice-in-winter-chester-county',
    title: 'Why Mice Invade PA Homes in Winter — and How to Stop Them',
    excerpt:
      'As temperatures drop, mice look for warm shelter — and your home looks very inviting. Learn how mice enter and how to keep them out.',
    date: '2025-12-10',
    category: 'Rodents',
    imageUrl: '/blog/images/mice-winter.jpg',
    imageAlt: 'Mouse on a kitchen counter near food crumbs',
  },
  {
    slug: 'groundhog-foundation-damage',
    title: 'Groundhog Burrows and Foundation Damage: What PA Homeowners Need to Know',
    excerpt:
      "Groundhogs (woodchucks) are more than a nuisance — their burrows can undermine your home's foundation. Here's when to be concerned and what to do.",
    date: '2025-11-15',
    category: 'Wildlife Control',
    imageUrl: '/blog/images/groundhog-damage.jpg',
    imageAlt: 'Groundhog in a suburban yard near a foundation',
  },
]

async function getPublishedPosts(): Promise<DbPost[]> {
  try {
    const rows = await sql`
      SELECT id, title, slug, excerpt, category, featured_image, published_at, created_at
      FROM blog_posts
      WHERE is_published = true
      ORDER BY published_at DESC, created_at DESC
      LIMIT 50
    `
    return rows as DbPost[]
  } catch {
    return []
  }
}

function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
      {category}
    </span>
  )
}

function DateLabel({ dateStr }: { dateStr: string }) {
  return (
    <span className="text-xs text-gray-400">
      {new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
    </span>
  )
}

export default async function BlogPage() {
  const dbPosts = await getPublishedPosts()

  // Build a set of slugs from DB so we don't duplicate with static fallbacks
  const dbSlugs = new Set(dbPosts.map((p) => p.slug))
  const filteredStatic = staticPosts.filter((p) => !dbSlugs.has(p.slug))

  return (
    <>
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Blog</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Pest Control Blog</h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Expert advice, seasonal guides, and tips for PA &amp; DE homeowners dealing with pest and
            wildlife issues.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Database posts (admin-created) */}
            {dbPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/blog/${post.slug}`} className="block">
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-green-800 to-gray-700">
                    {post.featured_image ? (
                      <Image
                        src={post.featured_image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white/30 text-4xl font-bold">APS</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CategoryBadge category={post.category} />
                      <DateLabel dateStr={post.published_at ?? post.created_at} />
                    </div>
                    <h2 className="font-bold text-gray-900 text-lg mb-3 leading-tight">{post.title}</h2>
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                    <span className="text-green-700 text-sm font-medium">Read more →</span>
                  </div>
                </Link>
              </article>
            ))}

            {/* Static fallback posts */}
            {filteredStatic.map((post) => (
              <article
                key={post.slug}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-green-800 to-gray-700">
                  <Image
                    src={post.imageUrl}
                    alt={post.imageAlt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <CategoryBadge category={post.category} />
                    <DateLabel dateStr={post.date} />
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg mb-3 leading-tight">{post.title}</h2>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                  <span className="text-green-700 text-sm font-medium">Read more →</span>
                </div>
              </article>
            ))}

          </div>
        </div>
      </section>

      <section className="py-12 bg-green-50 border-t border-green-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Have a Pest Emergency?</h2>
          <p className="text-gray-600 mb-6">Don&rsquo;t wait — call us now for same-day service.</p>
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
