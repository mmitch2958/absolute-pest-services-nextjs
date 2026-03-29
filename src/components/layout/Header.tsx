import Link from 'next/link'
import Image from 'next/image'
import MobileMenu from './MobileMenu'

// Server Component — static nav renders on server for SEO + performance
export default function Header() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 relative">
          {/* Logo — fills header height with no padding */}
          <Link href="/" className="flex-shrink-0 self-stretch flex items-center">
            <Image
              src="/images/logolong.jpg"
              alt="Absolute Pest Services"
              width={300}
              height={80}
              className="h-full w-auto object-contain py-1"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main navigation">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-700 rounded-md hover:bg-green-50 transition-colors"
            >
              Home
            </Link>

            {/* Services dropdown */}
            <div className="relative group">
              <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-700 rounded-md hover:bg-green-50 transition-colors flex items-center gap-1">
                Services
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-2">
                  {[
                    { href: '/wildlife-control', label: 'Wildlife Control' },
                    { href: '/bat-removal', label: 'Bat Removal' },
                    { href: '/bed-bug-treatment', label: 'Bed Bug Treatment' },
                    { href: '/termite-treatment', label: 'Termite Treatment' },
                    { href: '/rodents', label: 'Rodent Control' },
                    { href: '/bed-bugs', label: 'Bed Bugs' },
                    { href: '/termites', label: 'Termites' },
                    { href: '/wildlife', label: 'Wildlife' },
                  ].map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-3 py-2 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 rounded-md"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/service-areas"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-700 rounded-md hover:bg-green-50 transition-colors"
            >
              Service Areas
            </Link>
            <Link
              href="/blog"
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-green-700 rounded-md hover:bg-green-50 transition-colors"
            >
              Blog
            </Link>
          </nav>

          {/* CTA + Mobile Menu */}
          <div className="flex items-center gap-3">
            <a
              href="tel:484-643-2225"
              className="hidden sm:inline-flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              484-643-2225
            </a>
            <Link
              href="/request-service"
              className="hidden md:inline-flex bg-yellow-500 hover:bg-yellow-400 text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              Request Service
            </Link>
            {/* Mobile hamburger — Client Component */}
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
