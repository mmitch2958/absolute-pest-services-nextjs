'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarCheck, Phone } from 'lucide-react'

const hiddenPrefixes = ['/admin', '/field', '/invoice']

export default function StickyServiceCTA() {
  const pathname = usePathname()
  const shouldHide = hiddenPrefixes.some((prefix) => pathname?.startsWith(prefix))

  if (shouldHide) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-green-900/10 bg-white/95 px-3 py-2 shadow-[0_-12px_30px_rgba(15,23,42,0.16)] backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-2 gap-2">
        <a
          href="tel:484-643-2225"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-green-800 px-3 text-sm font-bold text-white shadow-sm"
        >
          <Phone className="h-4 w-4" />
          Call Now
        </a>
        <Link
          href="/request-service"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-yellow-400 px-3 text-sm font-bold text-gray-950 shadow-sm"
        >
          <CalendarCheck className="h-4 w-4" />
          Request Service
        </Link>
      </div>
      <p className="mt-1 text-center text-[11px] font-medium text-gray-500">
        Fast response in southeastern PA and Delaware
      </p>
    </div>
  )
}
