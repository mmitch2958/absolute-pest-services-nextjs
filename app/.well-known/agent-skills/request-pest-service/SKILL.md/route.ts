import { requestPestServiceSkill } from '@/lib/agent-skills'

export function GET() {
  return new Response(requestPestServiceSkill, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

