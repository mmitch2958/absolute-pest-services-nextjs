import { ardManifest } from '@/lib/ard-manifest'

export function GET() {
  return Response.json(ardManifest, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  })
}

