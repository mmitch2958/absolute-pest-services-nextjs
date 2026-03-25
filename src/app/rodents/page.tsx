import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Rodent Control | Absolute Pest Services',
  description:
    'Mice, rats & rodent removal in PA & DE. Fast, effective rodent control and exclusion for homes and businesses. Licensed & insured. Call 484-643-2225.',
  alternates: { canonical: 'https://absolutepestservices.com/rodents' },
}

export default function RodentsPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-400 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Rodent Control</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Rodent Control</h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Mice and rats pose serious health and property risks. Our rodent control program
            eliminates active infestations and seals entry points to keep rodents out permanently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:484-643-2225" className="inline-flex items-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold px-6 py-3 rounded-lg">
              <Phone size={18} />Call 484-643-2225
            </a>
            <Link href="/request-service" className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-6 py-3 rounded-lg">
              Request Service
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">Our Rodent Control Approach</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Inspection & Assessment', desc: 'We locate entry points, nesting sites, and runways. Understanding how rodents are entering is essential to eliminating them.' },
              { title: 'Treatment & Elimination', desc: 'We use a combination of trapping and rodenticide bait stations to quickly reduce the active population.' },
              { title: 'Exclusion & Prevention', desc: 'We seal all entry points with steel wool, hardware cloth, and caulk. A rat can enter through a gap the size of a quarter.' },
            ].map(item => (
              <div key={item.title} className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Signs of a Rodent Infestation</h2>
              <div className="space-y-3">
                {[
                  'Droppings near food, in drawers, or along walls',
                  'Gnaw marks on food packaging, wires, or wood',
                  'Nesting materials (shredded paper, fabric, plant matter)',
                  'Scratching sounds in walls or ceiling at night',
                  'Grease marks or rub marks along baseboards',
                  'Tracks or footprints in dusty areas',
                ].map(item => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 text-xl mb-4">Why Rodent Control Matters</h3>
              <p className="text-gray-600 mb-4 text-sm">Rodents are not just a nuisance — they&rsquo;re a health risk and a property risk:</p>
              <ul className="space-y-2 text-sm text-gray-700 mb-6">
                {[
                  'Carry diseases including hantavirus, salmonella, and leptospirosis',
                  'Chew electrical wiring, causing fire hazards',
                  'Contaminate food and food prep surfaces',
                  'Reproduce rapidly — one pair becomes 1,000+ in a year',
                ].map(item => (
                  <li key={item} className="flex gap-2">
                    <span className="text-red-500 font-bold">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <a href="tel:484-643-2225" className="flex items-center gap-3 bg-gray-800 hover:bg-gray-900 text-white font-bold px-6 py-4 rounded-xl w-full justify-center">
                <Phone size={20} />
                484-643-2225
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
