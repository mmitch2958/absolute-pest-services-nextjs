import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Wildlife Services | Absolute Pest Services',
  description:
    'Full-service wildlife management in PA & DE. Removal, exclusion & prevention for raccoons, squirrels, bats, groundhogs & more. Call 484-643-2225.',
  alternates: { canonical: 'https://absolutepestservices.com/wildlife' },
}

export default function WildlifePage() {
  return (
    <>
      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Wildlife Services</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Wildlife Services</h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Southeastern Pennsylvania and Delaware sit at the intersection of suburban development
            and rich natural habitat. When wildlife and homeowners collide, we provide effective,
            humane solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:484-643-2225" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-3 rounded-lg">
              <Phone size={18} />Call 484-643-2225
            </a>
            <Link href="/wildlife-control" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg">
              Wildlife Control Details
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Our Wildlife Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Raccoon Removal', desc: 'Raccoons are the #1 wildlife call we receive. Attic invasions, chimney dens, garbage raiding. We provide live trapping and exclusion.' },
              { title: 'Squirrel Exclusion', desc: 'Squirrels are persistent and can cause serious damage chewing through soffits and wiring. Exclusion with entry-point sealing is the permanent solution.' },
              { title: 'Groundhog Trapping', desc: 'Foundation burrowing, garden destruction, and structural damage. We live-trap and relocate groundhogs away from your property.' },
              { title: 'Bat Exclusion', desc: 'Licensed bat exclusion following strict PA & DE seasonal regulations. We never kill bats — only humane exclusion.' },
              { title: 'Skunk Removal', desc: 'Skunks den under porches, decks, and sheds. We carefully trap and relocate them without triggering a spray.' },
              { title: 'Opossum Control', desc: 'Opossums in crawl spaces, under decks, and in garages. Live trapping and exclusion.' },
            ].map(item => (
              <div key={item.title} className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/wildlife-control" className="inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-3 rounded-lg">
              Full Wildlife Control Service Details →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
