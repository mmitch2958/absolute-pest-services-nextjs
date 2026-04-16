'use client'

import { useActionState, useRef, useEffect, useCallback } from 'react'
import { submitServiceRequest, type FormState } from './actions'
import { Phone } from 'lucide-react'

const services = [
  { value: 'pest-control', label: 'General Pest Control' },
  { value: 'wildlife-control', label: 'Wildlife Control' },
  { value: 'bed-bug-treatment', label: 'Bed Bug Treatment' },
  { value: 'termite-treatment', label: 'Termite Treatment' },
  { value: 'bat-removal', label: 'Bat Removal' },
  { value: 'rodent-control', label: 'Rodent Control' },
  { value: 'ant-wasp', label: 'Ants & Wasps' },
  { value: 'other', label: 'Other / Not Sure' },
]

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

const initialState: FormState = null

export default function ServiceRequestForm() {
  const [state, formAction, isPending] = useActionState(submitServiceRequest, initialState)
  const turnstileRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const resetTurnstile = useCallback(() => {
    if (widgetIdRef.current !== null && typeof window !== 'undefined' && (window as any).turnstile) {
      ;(window as any).turnstile.reset(widgetIdRef.current)
    }
  }, [])

  useEffect(() => {
    // Load Turnstile script once
    if (document.getElementById('cf-turnstile-script')) {
      renderWidget()
      return
    }
    const script = document.createElement('script')
    script.id = 'cf-turnstile-script'
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = renderWidget
    document.head.appendChild(script)

    return () => {
      // cleanup widget on unmount
      if (widgetIdRef.current !== null && (window as any).turnstile) {
        ;(window as any).turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  function renderWidget() {
    if (!turnstileRef.current || !(window as any).turnstile) return
    if (widgetIdRef.current !== null) return // already rendered
    widgetIdRef.current = (window as any).turnstile.render(turnstileRef.current, {
      sitekey: SITE_KEY,
      theme: 'light',
      size: 'normal',
    })
  }

  // Reset Turnstile after a failed submission
  useEffect(() => {
    if (state && !state.success) {
      resetTurnstile()
    }
  }, [state, resetTurnstile])

  // Fire Google Ads + GA4 conversion on successful form submission
  useEffect(() => {
    if (state?.success && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_submit', {
        event_category: 'Lead',
        event_label: 'Service Request Form',
      })

      // Google Ads conversion: "Submit lead form"
      window.gtag('event', 'conversion', {
        send_to: 'AW-1038095551/E4u4CK_Xq50cEL-pgO8D',
        value: 1.0,
        currency: 'USD',
      })
    }
  }, [state?.success])

  if (state?.success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">✅</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Request Received! We&rsquo;ll Be in Touch Soon.
        </h3>
        <p className="text-gray-600 mb-6">
          Our team will contact you within 1–2 business hours. For faster service, call us directly.
        </p>
        <a
          href="tel:484-643-2225"
          className="inline-flex items-center gap-2 bg-green-700 text-white font-bold px-6 py-3 rounded-lg"
        >
          <Phone size={18} />
          484-643-2225
        </a>
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-5" noValidate>
      {state?.error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
              state?.fieldErrors?.name ? 'border-red-400' : 'border-gray-300'
            }`}
            placeholder="John Smith"
          />
          {state?.fieldErrors?.name && (
            <p className="text-red-600 text-xs mt-1">{state.fieldErrors.name}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            required
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
              state?.fieldErrors?.phone ? 'border-red-400' : 'border-gray-300'
            }`}
            placeholder="(484) 555-1234"
          />
          {state?.fieldErrors?.phone && (
            <p className="text-red-600 text-xs mt-1">{state.fieldErrors.phone}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address <span className="text-red-500">*</span>
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={`w-full border rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
            state?.fieldErrors?.email ? 'border-red-400' : 'border-gray-300'
          }`}
          placeholder="john@example.com"
        />
        {state?.fieldErrors?.email && (
          <p className="text-red-600 text-xs mt-1">{state.fieldErrors.email}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Service */}
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1">
            Service Needed <span className="text-red-500">*</span>
          </label>
          <select
            id="service"
            name="service"
            required
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white ${
              state?.fieldErrors?.service ? 'border-red-400' : 'border-gray-300'
            }`}
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          {state?.fieldErrors?.service && (
            <p className="text-red-600 text-xs mt-1">{state.fieldErrors.service}</p>
          )}
        </div>

        {/* ZIP */}
        <div>
          <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-1">
            ZIP Code <span className="text-red-500">*</span>
          </label>
          <input
            id="zip"
            name="zip"
            type="text"
            autoComplete="postal-code"
            required
            maxLength={10}
            className={`w-full border rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
              state?.fieldErrors?.zip ? 'border-red-400' : 'border-gray-300'
            }`}
            placeholder="19380"
          />
          {state?.fieldErrors?.zip && (
            <p className="text-red-600 text-xs mt-1">{state.fieldErrors.zip}</p>
          )}
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Describe the Problem <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none"
          placeholder="Tell us what you're dealing with — where you've seen activity, how long, any details that would help..."
        />
      </div>

      {/* Cloudflare Turnstile */}
      <div>
        <div ref={turnstileRef} />
        {state?.fieldErrors?.turnstileToken && (
          <p className="text-red-600 text-xs mt-1">{state.fieldErrors.turnstileToken}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-green-700 hover:bg-green-800 disabled:bg-green-400 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting...
          </>
        ) : (
          'Request Service'
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        We&rsquo;ll contact you within 1–2 business hours. For immediate service, call{' '}
        <a href="tel:484-643-2225" className="text-green-700 font-medium">
          484-643-2225
        </a>
        .
      </p>
    </form>
  )
}
