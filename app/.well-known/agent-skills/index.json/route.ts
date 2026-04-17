import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'

const SITE = 'https://absolutepestservices.com'

// Agent Skills Discovery RFC v0.2.0 — index of skills agents can use to
// interact with the site. Each skill has a stable URL and a sha256 digest of
// its content. We compute the digest of the raw description payload at request
// time so it always matches what we serve.
function digest(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

const skills = [
  {
    name: 'request-pest-service',
    type: 'web-form',
    description:
      'Submit a pest control service request for residential or commercial properties in Pennsylvania or Delaware. Captures pest type, address, and contact info, then routes to the Absolute Pest Services dispatcher.',
    url: `${SITE}/request-service`,
  },
  {
    name: 'find-service-area',
    type: 'web-page',
    description:
      'Look up whether Absolute Pest Services covers a specific city or town in PA or DE, including local pest issues and service options.',
    url: `${SITE}/service-areas`,
  },
  {
    name: 'browse-pest-info',
    type: 'web-page',
    description:
      'Get expert information on common pests handled by Absolute Pest Services: termites, bed bugs, carpenter bees, wildlife, rodents, wasps, and bats.',
    url: `${SITE}/blog`,
  },
  {
    name: 'contact-by-phone',
    type: 'tel',
    description:
      'Call Absolute Pest Services directly for immediate service or emergency response. Available during business hours.',
    url: 'tel:+14846432225',
  },
]

export async function GET() {
  const enriched = skills.map((s) => ({
    ...s,
    sha256: digest(JSON.stringify(s)),
  }))

  const body = {
    $schema:
      'https://raw.githubusercontent.com/cloudflare/agent-skills-discovery-rfc/main/schema/v0.2.0/index.schema.json',
    version: '0.2.0',
    skills: enriched,
  }

  return NextResponse.json(body, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  })
}
