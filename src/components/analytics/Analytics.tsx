'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
    // CallRail session
    CallRail?: {
      load: (accountId: string, options: { domain: string }) => void
    }
  }
}

// Phone number patterns used across the site
const PHONE_NUMBERS = ['484-643-2225', '4846432225', '+1-484-643-2225', '+14846432225']
const DE_PHONE = '302-235-1975'

/**
 * Fire a GA4 event. Safe to call even if gtag hasn't loaded yet.
 */
function gaEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', name, params)
}

/**
 * Determine which phone number was clicked (PA or DE) so we can
 * attach the correct Google Ads conversion label.
 */
function getPhoneLabel(href: string): string {
  const bare = href.replace(/[^0-9]/g, '')
  if (bare.includes('302')) return DE_PHONE
  return '484-643-2225'
}

/**
 * Checks whether an element or any of its ancestors is a phone trigger.
 * Handles: <a href="tel:...">, <button data-phone>, elements with
 * aria-label containing a phone number, and onclick handlers with tel:.
 */
function findPhoneAncestor(el: Element | null): Element | null {
  while (el) {
    const tag = el.tagName?.toLowerCase()
    const href = (el as HTMLAnchorElement).href ?? ''
    const dataPhone = el.getAttribute('data-phone')
    const ariaLabel = el.getAttribute('aria-label') ?? ''
    const onClick = el.getAttribute('onclick') ?? ''

    if (
      href.startsWith('tel:') ||
      dataPhone ||
      PHONE_NUMBERS.some((p) => ariaLabel.includes(p) || onClick.includes(p))
    ) {
      return el
    }

    // Also accept buttons / elements with role="button" that have a phone class
    const classes = (el.getAttribute('class') ?? '').split(' ')
    if (
      (tag === 'button' || el.getAttribute('role') === 'button') &&
      classes.some((c) => c.includes('phone') || c.includes('tel'))
    ) {
      return el
    }

    el = el.parentElement
  }
  return null
}

export default function Analytics() {
  const pathname = usePathname()
  const firedPaths = useRef<Set<string>>(new Set())

  // ─────────────────────────────────────────────────────────────────────────
  // 1. SPA pageview tracking — fires on every route change
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pathname) return

    // Guard against double-firing on StrictMode double-mount
    const key = pathname
    if (firedPaths.current.has(key)) return
    firedPaths.current.add(key)

    gaEvent('page_view', { page_path: pathname })
  }, [pathname])

  // ─────────────────────────────────────────────────────────────────────────
  // 2. Phone / tel: click tracking
  //
  // Why a hybrid approach (click listener + mousedown):
  //   - 'click' catches taps on iOS Safari (tap triggers click)
  //   - 'mousedown' catches quick taps that don't propagate as 'click'
  //     on some Android browsers.
  // We de-duplicate using a ref so we fire at most once per interaction.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let lastFired = 0

    const handlePhoneInteraction = (e: MouseEvent | TouchEvent) => {
      const now = Date.now()
      if (now - lastFired < 1500) return // debounce 1.5s
      lastFired = now

      // Resolve the target from either a mouse or touch event
      let target: Element | null = null
      if ('touches' in e && e.touches.length > 0) {
        target = document.elementFromPoint(
          e.touches[0].clientX,
          e.touches[0].clientY,
        )
      } else if ('target' in e) {
        target = e.target as Element
      }
      if (!target) return

      const phoneEl = findPhoneAncestor(target)
      if (!phoneEl) return

      const href = (phoneEl as HTMLAnchorElement).href ?? ''
      const phoneLabel = getPhoneLabel(href)

      // ── Google Ads conversion (AW-1038095551/6JpzCLqOragbEL-pgO8D) ───
      // send_to must use the full conversion action label, not just the account ID.
      // tel: links don't navigate away from the page, so no event_callback needed.
      gaEvent('conversion', {
        send_to: 'AW-1038095551/6JpzCLqOragbEL-pgO8D',
        value: 1.0,
        currency: 'USD',
      })

      // ── GA4 custom event: phone_click ──────────────────────────────────
      // NOTE: For this to appear as a CONVERSION in GA4, Mike must:
      //   1. Go to GA4 Admin → Events → Mark event as conversion
      //   2. Find "phone_click" and toggle it ON.
      // Without that step, the event is still collected as a custom event.
      gaEvent('phone_click', {
        event_category: 'Contact',
        event_label: pathname,
        phone_number: phoneLabel,
        // Click ID for Google Ads enhanced conversions
        click_id: (phoneEl as HTMLAnchorElement).id || undefined,
      })
    }

    document.addEventListener('click', handlePhoneInteraction, true)
    document.addEventListener('touchstart', handlePhoneInteraction, { passive: true })

    return () => {
      document.removeEventListener('click', handlePhoneInteraction, true)
      document.removeEventListener('touchstart', handlePhoneInteraction)
    }
  }, [pathname])

  // ─────────────────────────────────────────────────────────────────────────
  // 3. CallRail integration (optional — activate if CallRail is added)
  //
  // To enable CallRail:
  //   1. Add NEXT_PUBLIC_CALLRAIL_ID=<your-account-id> to .env
  //   2. The script below will auto-initialise CallRail.
  //   3. CallRail will fire GA4 events automatically when it tracks a call.
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const callRailId = process.env.NEXT_PUBLIC_CALLRAIL_ID
    if (!callRailId) return

    // Load CallRail's tracking script asynchronously
    const script = document.createElement('script')
    script.src = `//cdn.callrail.com/companies/${callRailId}/12.5.1/tags.js`
    script.async = true
    document.head.appendChild(script)

    // Expose the load function for single-page apps
    window.CallRail = window.CallRail ?? {
      load: (accountId: string, opts: { domain: string }) => {
        // Loaded via the script tag above — no-op here
        console.debug('[CallRail] loaded for account', accountId, opts)
      },
    }

    return () => {
      document.head.removeChild(script)
    }
  }, [])

  return null
}
