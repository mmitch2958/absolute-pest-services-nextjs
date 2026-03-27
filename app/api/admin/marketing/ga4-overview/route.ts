import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'

async function requireAdmin() {
  const session = await getSession()
  if (!session.adminToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

export async function GET(request: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    return NextResponse.json({
      overview: null,
      message: 'Connect GA4 API credentials to populate this data. Property ID: G-0PXFRNKQW5',
    })
  } catch (err) {
    console.error('[ga4-overview]', err)
    return NextResponse.json({ error: 'Failed to load GA4 data' }, { status: 500 })
  }
}
