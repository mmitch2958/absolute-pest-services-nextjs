import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { homeMarkdown } from '@/lib/home-markdown'

export function proxy(request: NextRequest) {
  const accept = request.headers.get('accept') ?? ''

  if (accept.toLowerCase().includes('text/markdown')) {
    const tokenEstimate = Math.ceil(homeMarkdown.length / 4)

    return new Response(homeMarkdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        Vary: 'Accept',
        'X-Markdown-Tokens': String(tokenEstimate),
        'Content-Signal': 'search=yes, ai-input=yes, ai-train=no',
      },
    })
  }

  const response = NextResponse.next()
  response.headers.set('Vary', 'Accept')
  response.headers.set(
    'Content-Signal',
    'search=yes, ai-input=yes, ai-train=no'
  )
  return response
}

export const config = {
  matcher: '/',
}
