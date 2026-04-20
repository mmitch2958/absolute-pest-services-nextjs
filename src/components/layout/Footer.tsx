import Link from 'next/link'
import Image from 'next/image'

// Server Component — fully static, no interactivity needed
export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Image
                src="/images/Logosq.jpg"
                alt="Absolute Pest Services"
                width={48}
                height={48}
                className="w-12 h-12 object-contain rounded"
              />
              <span className="font-bold text-white text-lg">Absolute Pest Services</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Licensed, insured pest control serving southeastern Pennsylvania and Delaware.
              Humane wildlife removal, bed bug treatment, termite protection & more.
            </p>
            <a
              href="tel:484-643-2225"
              className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 font-semibold text-lg"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              484-643-2225
            </a>
            <p className="text-xs text-gray-500 mt-2">Available 24/7 for emergencies</p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold text-white mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/wildlife-control', label: 'Wildlife Control' },
                { href: '/bat-removal', label: 'Bat Removal' },
                { href: '/wasp-removal', label: 'Wasp & Hornet Removal' },
                { href: '/bed-bug-treatment', label: 'Bed Bug Treatment' },
                { href: '/termite-treatment', label: 'Termite Treatment' },
                { href: '/rodents', label: 'Rodent Control' },
                { href: '/bed-bugs', label: 'Bed Bugs' },
                { href: '/termites', label: 'Termites' },
                { href: '/wildlife', label: 'Wildlife Services' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-green-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h3 className="font-semibold text-white mb-4">Service Areas</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/service-areas/west-chester-pa', label: 'West Chester, PA' },
                { href: '/service-areas/exton-pa', label: 'Exton, PA' },
                { href: '/service-areas/kennett-square-pa', label: 'Kennett Square, PA' },
                { href: '/service-areas/west-grove-pa', label: 'West Grove, PA' },
                { href: '/service-areas/avondale-pa', label: 'Avondale, PA' },
                { href: '/service-areas/oxford-pa', label: 'Oxford, PA' },
                { href: '/service-areas/wilmington-de', label: 'Wilmington, DE' },
                { href: '/service-areas/newark-de', label: 'Newark, DE' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-green-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/service-areas" className="text-green-400 hover:text-green-300">
                  View All Areas →
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: '/request-service', label: 'Request Service' },
                { href: '/blog', label: 'Pest Control Blog' },
                { href: '/service-areas', label: 'All Service Areas' },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-green-400 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <h3 className="font-semibold text-white mb-3">Service Hours</h3>
              <div className="text-sm space-y-1">
                <p>Mon–Fri: 7:00 AM – 7:00 PM</p>
                <p>Sat: 8:00 AM – 5:00 PM</p>
                <p>Sun: Emergency only</p>
                <p className="text-green-400">24/7 Emergency Line Available</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} Absolute Pest Services. All rights reserved. Licensed & Insured.</p>
          <div className="flex gap-4">
            <span>PA License # BU0300</span>
            <span>·</span>
            <span>DE License # 200269</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
