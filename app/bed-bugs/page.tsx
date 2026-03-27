import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Bed Bug Control | Absolute Pest Services',
  description:
    'Identify & eliminate bed bugs in PA & DE. Expert heat and chemical treatment. Free inspections. Licensed & insured. Call 484-643-2225.',
  alternates: { canonical: 'https://absolutepestservices.com/bed-bugs' },
}

export default function BedBugsPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-red-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-red-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Bed Bugs</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Bed Bug Control</h1>
          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            Bed bug infestations are stressful and fast-growing. Our licensed technicians eliminate
            bed bugs completely using proven heat and chemical treatment methods.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a href="tel:484-643-2225" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-lg">
              <Phone size={18} />Call 484-643-2225
            </a>
            <Link href="/bed-bug-treatment" className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-lg">
              View Treatment Options
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">About Bed Bugs</h2>
              <p className="text-gray-700 mb-4">
                Bed bugs (<em>Cimex lectularius</em>) are small, oval, reddish-brown insects that
                feed exclusively on blood. They don&rsquo;t fly, but move quickly across floors,
                walls, and ceilings. Females deposit up to 5 eggs per day in tight cracks and
                crevices — making early treatment critical.
              </p>
              <p className="text-gray-700 mb-4">
                Despite their name, bed bugs are found in more than just beds. They hide in sofas,
                luggage, clothing, electrical outlets, and behind baseboards. They spread easily
                between hotel rooms, apartments, and homes.
              </p>
              <p className="text-gray-700">
                The population in the US has resurged dramatically since the 1990s. Pennsylvania
                cities including Philadelphia, Pittsburgh, and surrounding suburbs consistently
                rank among the most affected in national surveys.
              </p>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Bed Bug Services</h2>
              <div className="space-y-4">
                {[
                  { title: 'Free Inspection', desc: 'We thoroughly inspect mattresses, furniture, walls, and all harboring areas.' },
                  { title: 'Heat Treatment', desc: 'Most effective option. Kills all life stages in a single treatment. No chemical residue.' },
                  { title: 'Chemical Treatment', desc: '2-3 visit program using EPA-registered insecticides with residual protection.' },
                  { title: 'Follow-Up Monitoring', desc: 'We schedule follow-up visits to ensure complete elimination.' },
                ].map(item => (
                  <div key={item.title} className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900">{item.title}</span>
                      <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/bed-bug-treatment" className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold px-6 py-3 rounded-lg">
                  View Full Treatment Details →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
