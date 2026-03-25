'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export default function Analytics() {
  const pathname = usePathname()

  // Track phone link clicks as Google Ads + GA4 conversions
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest('a[href^="tel:"]')
      if (target) {
        window.gtag?.('event', 'conversion', {
          send_to: 'AW-1038095551',
          event_category: 'Contact',
          event_label: 'Phone Call',
        })
        window.gtag?.('event', 'phone_click', {
          event_category: 'Contact',
          event_label: window.location.pathname,
        })
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // Track client-side navigation page views
  useEffect(() => {
    window.gtag?.('config', 'G-0PXFRNKQW5', {
      page_path: pathname,
    })
  }, [pathname])

  return null
}
