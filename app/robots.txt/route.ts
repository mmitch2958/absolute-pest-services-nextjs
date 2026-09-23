const SITE = 'https://absolutepestservices.com'

const PRIVATE_PATHS = [
  '/admin/',
  '/field/',
  '/invoice/',
  '/api/admin/',
  '/api/field/',
]

export function GET() {
  const disallow = PRIVATE_PATHS.map((path) => `Disallow: ${path}`).join('\n')

  const body = `User-Agent: *
Allow: /
${disallow}

User-Agent: GPTBot
User-Agent: OAI-SearchBot
User-Agent: ChatGPT-User
User-Agent: ClaudeBot
User-Agent: Claude-SearchBot
User-Agent: Claude-User
User-Agent: PerplexityBot
User-Agent: Google-Extended
User-Agent: Applebot-Extended
Allow: /
${disallow}

# Permit search and real-time AI answers while declining model training.
Content-Signal: search=yes, ai-input=yes, ai-train=no

Sitemap: ${SITE}/sitemap.xml
Agentmap: ${SITE}/.well-known/ard.json
`

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}

