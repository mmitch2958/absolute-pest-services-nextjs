'use client'

import { useState, useEffect } from 'react'
import { X, Bug } from 'lucide-react'
import Link from 'next/link'

const DISMISS_KEY = 'carpenter-bee-banner-dismissed'
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000

export default function SpringCarpenterBeeBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (!dismissed || Date.now() - Number(dismissed) > DISMISS_TTL) {
      setVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="relative w-full bg-gradient-to-r from-green-50 to-amber-50 border-l-4 border-green-700"
      role="banner"
      aria-label="Carpenter bee seasonal alert"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center gap-4">
        <Bug className="w-8 h-8 text-green-700 flex-shrink-0 hidden sm:block" />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Carpenter Bee Season Is Here
            </h2>
            <span className="bg-amber-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              20% OFF — Code CBT26
            </span>
          </div>
          <p className="text-sm text-gray-600">
            These wood-destroying bees are already drilling into PA &amp; DE homes.
            Schedule spring treatment before the damage compounds.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/carpenter-bee-treatment"
            className="bg-green-700 hover:bg-green-800 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm whitespace-nowrap"
          >
            Get 20% Off
          </Link>
          <a
            href="tel:484-643-2225"
            className="hidden sm:inline-flex border border-green-700 text-green-700 hover:bg-green-50 font-bold px-4 py-2 rounded-lg text-sm whitespace-nowrap"
          >
            484-643-2225
          </a>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Dismiss carpenter bee banner"
      >
        <X className="w-4 h-4" />
      </button>
      <span className="absolute top-2 right-12 bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full hidden sm:inline">
        Spring 2026
      </span>
    </div>
  )
}
