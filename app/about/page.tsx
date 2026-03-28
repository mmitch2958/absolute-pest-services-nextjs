import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Us | Absolute Pest Services',
  description: 'Absolute Pest Services is a licensed and insured pest control company serving Chester County PA, Delaware County PA, and New Castle County DE since 2004. Learn about our team and commitment to safe, effective pest management.',
  alternates: { canonical: 'https://absolutepestservices.com/about' },
  openGraph: {
    title: 'About Absolute Pest Services',
    description: 'Licensed pest control professionals serving PA & DE since 2004.',
    url: 'https://absolutepestservices.com/about',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <main>
      <section className="bg-gradient-to-br from-green-900 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-green-300 mb-4" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-white">About Us</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Absolute Pest Services</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Licensed, insured, and locally owned pest control serving Chester County PA, Delaware County PA, and New Castle County DE since 2004.
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              At Absolute Pest Services, our mission is simple: protect your home, family, and business from pests using safe, proven, and environmentally responsible methods. We combine local expertise with professional-grade treatments to deliver lasting results.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Licensed and insured in Pennsylvania and Delaware</li>
              <li>Same-day and emergency service available</li>
              <li>Eco-friendly treatment options</li>
              <li>Satisfaction guarantee on all services</li>
              <li>Family-owned and locally operated since 2004</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Area</h2>
            <p className="text-gray-700 mb-6">
              We proudly serve Chester County PA, Delaware County PA, Montgomery County PA, New Castle County DE, and surrounding communities. Our trucks are local and our technicians know the pest pressures specific to our region.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-2">
              <strong>Main:</strong> <a href="tel:6108693000" className="text-green-700 hover:underline">610-869-3000</a>
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Cell:</strong> <a href="tel:4846432225" className="text-green-700 hover:underline">484-643-2225</a>
            </p>
            <p className="text-gray-700 mb-6">
              <strong>Delaware:</strong> <a href="tel:6103254000" className="text-green-700 hover:underline">610-325-4000</a>
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/request-service"
                className="inline-block bg-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-800 transition-colors"
              >
                Request Service
              </Link>
              <Link
                href="/contact"
                className="inline-block border-2 border-green-700 text-green-700 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
