'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { href: '/', label: 'Home' },
  {
    label: 'Services',
    children: [
      { href: '/wildlife-control', label: 'Wildlife Control' },
      { href: '/bat-removal', label: 'Bat Removal' },
      { href: '/wasp-removal', label: 'Wasp & Hornet Removal' },
      { href: '/bed-bug-treatment', label: 'Bed Bug Treatment' },
      { href: '/termite-treatment', label: 'Termite Treatment' },
      { href: '/rodents', label: 'Rodent Control' },
      { href: '/bed-bugs', label: 'Bed Bugs' },
      { href: '/termites', label: 'Termites' },
      { href: '/wildlife', label: 'Wildlife' },
    ],
  },
  { href: '/service-areas', label: 'Service Areas' },
  { href: '/blog', label: 'Blog' },
  { href: '/request-service', label: 'Request Service' },
]

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [servicesOpen, setServicesOpen] = useState(false)

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="md:hidden p-2 text-gray-700 hover:text-green-700"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
      >
        {open ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile menu overlay */}
      {open && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg border-t border-gray-100 z-50">
          <nav className="flex flex-col p-4">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button
                    className="w-full text-left py-3 px-2 font-medium text-gray-700 hover:text-green-700 flex justify-between items-center"
                    onClick={() => setServicesOpen(!servicesOpen)}
                  >
                    {link.label}
                    <span className="text-xs">{servicesOpen ? '▲' : '▼'}</span>
                  </button>
                  {servicesOpen && (
                    <div className="pl-4 border-l-2 border-green-100 ml-2">
                      {link.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block py-2 px-2 text-gray-600 hover:text-green-700"
                          onClick={() => setOpen(false)}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.href}
                  href={link.href!}
                  className="py-3 px-2 font-medium text-gray-700 hover:text-green-700 border-b border-gray-50"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
            <a
              href="tel:484-643-2225"
              className="mt-4 bg-green-700 text-white text-center py-3 px-6 rounded-lg font-semibold"
              onClick={() => setOpen(false)}
            >
              Call 484-643-2225
            </a>
          </nav>
        </div>
      )}
    </>
  )
}
