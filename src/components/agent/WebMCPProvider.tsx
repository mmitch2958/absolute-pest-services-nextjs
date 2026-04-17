'use client'

import { useEffect } from 'react'

// WebMCP — exposes site capabilities to AI agents via the in-page browser API.
// Spec: https://webmachinelearning.github.io/webmcp/
//
// This is a progressive enhancement: if the browser doesn't implement
// navigator.modelContext yet, this component is a no-op.
declare global {
  interface Navigator {
    modelContext?: {
      provideContext: (ctx: {
        tools?: Array<{
          name: string
          description: string
          inputSchema: Record<string, unknown>
          execute: (input: unknown) => Promise<unknown>
        }>
      }) => void
    }
  }
}

export default function WebMCPProvider() {
  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.modelContext) return

    navigator.modelContext.provideContext({
      tools: [
        {
          name: 'request_pest_service',
          description:
            'Open the Absolute Pest Services request form, optionally pre-filling pest type and contact details. Use this when a user wants to book pest control service in PA or DE.',
          inputSchema: {
            type: 'object',
            properties: {
              pest: {
                type: 'string',
                description:
                  'Pest type, e.g. "termites", "bed bugs", "carpenter bees", "rodents", "wasps", "bats", "wildlife".',
              },
              name: { type: 'string', description: 'Customer full name' },
              phone: { type: 'string', description: 'Customer phone number' },
              email: { type: 'string', description: 'Customer email' },
              address: { type: 'string', description: 'Service address' },
            },
          },
          execute: async (input: unknown) => {
            const params = new URLSearchParams()
            if (input && typeof input === 'object') {
              for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
                if (typeof v === 'string' && v.trim()) params.set(k, v)
              }
            }
            const url = `/request-service${params.toString() ? `?${params}` : ''}`
            window.location.href = url
            return { ok: true, opened: url }
          },
        },
        {
          name: 'call_pest_control',
          description:
            'Initiate a phone call to Absolute Pest Services (484-643-2225, PA & DE).',
          inputSchema: { type: 'object', properties: {} },
          execute: async () => {
            window.location.href = 'tel:+14846432225'
            return { ok: true, dialed: '+14846432225' }
          },
        },
        {
          name: 'check_service_area',
          description:
            'Look up Absolute Pest Services coverage for a given city or town in PA or DE.',
          inputSchema: {
            type: 'object',
            properties: {
              city: { type: 'string', description: 'City or town name' },
            },
            required: ['city'],
          },
          execute: async (input: unknown) => {
            const city =
              input && typeof input === 'object' && 'city' in input
                ? String((input as { city: unknown }).city)
                : ''
            const slug = city.toLowerCase().trim().replace(/\s+/g, '-')
            const url = slug ? `/service-areas/${slug}` : '/service-areas'
            window.location.href = url
            return { ok: true, opened: url }
          },
        },
      ],
    })
  }, [])

  return null
}
