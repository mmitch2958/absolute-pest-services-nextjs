import type { Metadata } from 'next'
import Link from 'next/link'
import CostCalculator from '@/components/calculator/CostCalculator'

export const metadata: Metadata = {
  title: 'Pest Control Cost Calculator | Absolute Pest Services',
  description:
    'Estimate your pest control cost. Instant ranges for pest control, bed bug treatment, termite control, bat removal & wildlife removal in PA & DE.',
  alternates: { canonical: 'https://absolutepestservices.com/cost-calculator' },
}

export default function CostCalculatorPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span>Cost Calculator</span>
          </nav>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Pest Control Cost Calculator
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl">
            Get an instant cost estimate for pest control, bed bug treatment, termite control,
            or wildlife removal. Free exact quotes when you call.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <CostCalculator />
            </div>
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">Factors That Affect Price</h3>
                <div className="space-y-3 text-sm text-gray-700">
                  {[
                    { title: 'Infestation severity', desc: 'Light vs. heavy infestations require different amounts of treatment.' },
                    { title: 'Property size', desc: 'Larger homes require more materials and time.' },
                    { title: 'Treatment type', desc: 'Heat treatment costs more upfront but typically requires fewer visits.' },
                    { title: 'Accessibility', desc: 'Crawl spaces, attics, and tight areas may require more labor.' },
                    { title: 'Return visits', desc: 'Some infestations require follow-up treatments.' },
                  ].map(item => (
                    <div key={item.title}>
                      <span className="font-medium">{item.title}</span> — {item.desc}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
                <h3 className="font-bold text-gray-900 mb-3">Want an Exact Quote?</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Our technicians provide free, no-obligation estimates. We&rsquo;ll inspect your
                  property and give you an exact price before any work begins.
                </p>
                <a
                  href="tel:484-643-2225"
                  className="flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold px-4 py-3 rounded-xl w-full text-sm"
                >
                  Call 484-643-2225
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
