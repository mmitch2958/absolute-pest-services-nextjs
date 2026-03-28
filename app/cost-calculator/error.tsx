'use client'

import { useEffect } from 'react'

export default function CostCalculatorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          We couldn&apos;t load the cost calculator. Please try again or call us directly for a quote.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg"
          >
            Try Again
          </button>
          <a
            href="tel:484-643-2225"
            className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-lg"
          >
            Call 484-643-2225
          </a>
        </div>
      </div>
    </div>
  )
}
