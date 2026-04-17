import { NextResponse } from 'next/server'

const SITE = 'https://absolutepestservices.com'

// RFC 9727 API Catalog (linkset+json)
// Lists each public API anchor and the relations agents can follow.
export async function GET() {
  const body = {
    linkset: [
      {
        anchor: `${SITE}/api`,
        'service-desc': [
          { href: `${SITE}/openapi.json`, type: 'application/json' },
        ],
        'service-doc': [
          { href: `${SITE}/contact`, type: 'text/html' },
        ],
        status: [
          { href: `${SITE}/api/health`, type: 'application/json' },
        ],
        'service-meta': [
          {
            href: `${SITE}/.well-known/agent-skills/index.json`,
            type: 'application/json',
            title: 'Agent skills index',
          },
        ],
      },
    ],
  }

  return NextResponse.json(body, {
    headers: {
      'Content-Type': 'application/linkset+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
