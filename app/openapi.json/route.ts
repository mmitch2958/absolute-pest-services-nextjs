import { NextResponse } from 'next/server'

const SITE = 'https://absolutepestservices.com'

// OpenAPI 3.1 spec for Absolute Pest Services public APIs.
// Currently exposes the health check; the lead-capture form runs through Next.js
// server actions (with Cloudflare Turnstile), not a public REST endpoint.
export async function GET() {
  const spec = {
    openapi: '3.1.0',
    info: {
      title: 'Absolute Pest Services Public API',
      version: '1.0.0',
      description:
        'Public endpoints exposed by absolutepestservices.com. Lead capture is handled via the website form at /request-service (protected by Cloudflare Turnstile). For booking service, please call 484-643-2225 or use the contact form.',
      contact: {
        name: 'Absolute Pest Services',
        url: `${SITE}/contact`,
        email: 'info@absolutepestservices.com',
      },
    },
    servers: [{ url: SITE }],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check',
          description: 'Returns service health status.',
          operationId: 'getHealth',
          responses: {
            '200': {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { status: { type: 'string', example: 'ok' } },
                    required: ['status'],
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {},
  }

  return NextResponse.json(spec, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
