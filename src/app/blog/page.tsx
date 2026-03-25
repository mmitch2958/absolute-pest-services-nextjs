import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pest Control Blog | Absolute Pest Services',
  description:
    'Expert pest control tips, guides, and advice for PA & DE homeowners. Learn about wildlife removal, bed bugs, termites, and seasonal pest prevention.',
  alternates: { canonical: 'https://absolutepestservices.com/blog' },
}

// Blog posts data — in production, fetch from CMS
const blogPosts = [
  {
    slug: 'bat-exclusion-season-pa',
    title: "PA Bat Exclusion Season: What Homeowners Need to Know",
    excerpt: "Pennsylvania has strict regulations on when bat exclusion can be performed. Here's everything you need to know about legal exclusion windows and why they matter.",
    date: '2026-03-01',
    category: 'Wildlife Control',
  },
  {
    slug: 'termite-swarming-season-chester-county',
    title: 'Termite Swarm Season in Chester County — Is Your Home Protected?',
    excerpt: "Spring brings termite swarming season to southeastern PA. Swarmers (winged termites) are the most visible sign of a colony — here's what to do if you see them.",
    date: '2026-02-15',
    category: 'Termites',
  },
  {
    slug: 'bed-bugs-hotel-prevention',
    title: 'How to Avoid Bringing Bed Bugs Home From a Hotel',
    excerpt: 'Bed bugs are expert hitchhikers. Follow these steps every time you travel to avoid bringing an infestation home.',
    date: '2026-02-01',
    category: 'Bed Bugs',
  },
  {
    slug: 'raccoon-proofing-your-home',
    title: '10 Ways to Raccoon-Proof Your Home This Spring',
    excerpt: "Raccoons are active in spring searching for den sites. Here's how to make your attic, chimney, and property less attractive.",
    date: '2026-01-20',
    category: 'Wildlife Control',
  },
  {
    slug: 'mice-in-winter-chester-county',
    title: 'Why Mice Invade PA Homes in Winter — and How to Stop Them',
    excerpt: 'As temperatures drop, mice look for warm shelter — and your home looks very inviting. Learn how mice enter and how to keep them out.',
    date: '2025-12-10',
    category: 'Rodents',
  },
  {
    slug: 'groundhog-foundation-damage',
    title: 'Groundhog Burrows and Foundation Damage: What PA Homeowners Need to Know',
    excerpt: "Groundhogs (woodchucks) are more than a nuisance — their burrows can undermine your home's foundation. Here's when to be concerned and what to do.",
    date: '2025-11-15',
    category: 'Wildlife Control',
  },
]

const categories = ['All', 'Wildlife Control', 'Bed Bugs', 'Termites', 'Rodents', 'Seasonal Tips']

export default function BlogPage() {
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
            Expert advice, seasonal guides, and tips for PA & DE homeowners dealing with pest and
            wildlife issues.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category filter (static for SSR — could be client-side filtered) */}
          <div className="flex flex-wrap gap-2 mb-10">
            {categories.map((cat) => (
              <span
                key={cat}
                className={`px-4 py-2 rounded-full text-sm font-medium border ${
                  cat === 'All'
                    ? 'bg-green-700 text-white border-green-700'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:text-green-700 cursor-pointer'
                }`}
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Blog grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.slug}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-48 bg-gradient-to-br from-green-800 to-gray-700 flex items-center justify-center">
                  <div className="text-white text-4xl">🦡</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <h2 className="font-bold text-gray-900 text-lg mb-3 leading-tight">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                  <span className="text-green-700 text-sm font-medium">Read more →</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
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
