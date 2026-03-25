'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Phone } from 'lucide-react'

interface PricingRange {
  min: number
  max: number
}

// Pricing data by service and home size
const PRICING: Record<string, Record<string, PricingRange>> = {
  'pest-control': {
    small: { min: 150, max: 250 },
    medium: { min: 200, max: 350 },
    large: { min: 300, max: 450 },
    'extra-large': { min: 400, max: 600 },
  },
  'bed-bug-heat': {
    small: { min: 1200, max: 1800 },
    medium: { min: 1600, max: 2400 },
    large: { min: 2200, max: 3200 },
    'extra-large': { min: 2800, max: 4500 },
  },
  'bed-bug-chemical': {
    small: { min: 400, max: 700 },
    medium: { min: 600, max: 900 },
    large: { min: 800, max: 1200 },
    'extra-large': { min: 1000, max: 1600 },
  },
  'termite-liquid': {
    small: { min: 800, max: 1200 },
    medium: { min: 1000, max: 1600 },
    large: { min: 1400, max: 2200 },
    'extra-large': { min: 1800, max: 3000 },
  },
  'termite-bait': {
    small: { min: 400, max: 800 },
    medium: { min: 500, max: 900 },
    large: { min: 700, max: 1200 },
    'extra-large': { min: 900, max: 1500 },
  },
  'wildlife-control': {
    small: { min: 300, max: 600 },
    medium: { min: 400, max: 800 },
    large: { min: 500, max: 1000 },
    'extra-large': { min: 700, max: 1400 },
  },
  'bat-exclusion': {
    small: { min: 600, max: 1200 },
    medium: { min: 800, max: 1600 },
    large: { min: 1200, max: 2200 },
    'extra-large': { min: 1600, max: 3000 },
  },
  'rodent-control': {
    small: { min: 250, max: 450 },
    medium: { min: 350, max: 600 },
    large: { min: 450, max: 800 },
    'extra-large': { min: 600, max: 1100 },
  },
}

const serviceOptions = [
  { value: 'pest-control', label: 'General Pest Control (ants, roaches, spiders, etc.)' },
  { value: 'bed-bug-heat', label: 'Bed Bug Treatment — Heat (most effective)' },
  { value: 'bed-bug-chemical', label: 'Bed Bug Treatment — Chemical (2-3 visits)' },
  { value: 'termite-liquid', label: 'Termite Liquid Barrier (Termidor®)' },
  { value: 'termite-bait', label: 'Termite Bait Station System' },
  { value: 'wildlife-control', label: 'Wildlife Removal & Exclusion' },
  { value: 'bat-exclusion', label: 'Bat Exclusion' },
  { value: 'rodent-control', label: 'Rodent Control (mice/rats)' },
]

const homeSizeOptions = [
  { value: 'small', label: 'Small (under 1,500 sq ft)' },
  { value: 'medium', label: 'Medium (1,500 – 2,500 sq ft)' },
  { value: 'large', label: 'Large (2,500 – 4,000 sq ft)' },
  { value: 'extra-large', label: 'Extra Large (over 4,000 sq ft)' },
]

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount)
}

export default function CostCalculator() {
  const [service, setService] = useState('')
  const [homeSize, setHomeSize] = useState('')
  const [estimate, setEstimate] = useState<PricingRange | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)

  const handleCalculate = () => {
    if (!service || !homeSize) return
    const pricing = PRICING[service]?.[homeSize]
    if (pricing) {
      setEstimate(pricing)
      setHasCalculated(true)
    }
  }

  const handleReset = () => {
    setService('')
    setHomeSize('')
    setEstimate(null)
    setHasCalculated(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Calculator Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 p-6 text-white">
          <h2 className="text-2xl font-bold mb-1">Cost Estimator</h2>
          <p className="text-green-100 text-sm">
            Get a rough estimate in seconds. Free exact quotes when you call.
          </p>
        </div>

        <div className="p-6">
          {!hasCalculated ? (
            <div className="space-y-5">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What service do you need?
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none bg-white"
                >
                  <option value="">Select a service...</option>
                  {serviceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Home Size */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  What is the size of your home?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {homeSizeOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setHomeSize(opt.value)}
                      className={`p-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                        homeSize === opt.value
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-700 hover:border-green-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCalculate}
                disabled={!service || !homeSize}
                className="w-full bg-green-700 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-colors"
              >
                Get Estimate
              </button>

              <p className="text-xs text-gray-500 text-center">
                This is a rough estimate only. Actual pricing depends on infestation severity,
                property access, and other factors. Free exact quotes provided when you call.
              </p>
            </div>
          ) : (
            /* Results */
            <div className="text-center">
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                <p className="text-sm text-green-700 font-medium mb-2">Estimated Cost Range</p>
                <div className="text-4xl font-bold text-gray-900 mb-1">
                  {estimate && formatCurrency(estimate.min)} – {estimate && formatCurrency(estimate.max)}
                </div>
                <p className="text-sm text-gray-500">
                  For {serviceOptions.find(s => s.value === service)?.label}
                  <br />
                  {homeSizeOptions.find(s => s.value === homeSize)?.label} home
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-gray-700 text-left">
                <strong>⚠️ Important:</strong> This estimate is for budgeting purposes only. Actual cost
                depends on infestation severity, number of treatments needed, property access, and other
                factors. Call for a free on-site assessment and exact quote.
              </div>

              <div className="space-y-3 mb-6">
                <a
                  href="tel:484-643-2225"
                  className="flex items-center gap-3 bg-green-700 hover:bg-green-800 text-white font-bold px-6 py-4 rounded-xl w-full justify-center"
                >
                  <Phone size={20} />
                  Call for Free Exact Quote: 484-643-2225
                </a>
                <Link
                  href="/request-service"
                  className="flex items-center gap-2 justify-center border border-green-300 text-green-700 hover:bg-green-50 font-medium px-6 py-3 rounded-xl w-full"
                >
                  Request Service Online
                </Link>
              </div>

              <button
                onClick={handleReset}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Calculate another estimate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
