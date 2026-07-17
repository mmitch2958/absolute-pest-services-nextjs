'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Link from 'next/link'

const DISMISS_KEY = 'summer-stinging-insect-banner-dismissed'
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
      className="relative w-full bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500"
      role="banner"
      aria-label="Summer stinging insect alert"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex items-center gap-4">
        <span className="text-3xl flex-shrink-0 hidden sm:block">🐝</span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              It&apos;s Summer — Stinging Insects Are Here
            </h2>
            <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Summer 2026
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Yellow jacket &amp; hornet treatments for PA &amp; DE homes and businesses. No annual contracts required.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link
            href="/request-service"
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm whitespace-nowrap"
          >
            Get a Free Quote
          </Link>
        </div>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
