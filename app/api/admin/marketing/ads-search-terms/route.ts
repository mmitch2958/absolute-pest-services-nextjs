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
      searchTerms: [],
      message: 'Connect Google Ads API credentials to populate this data.',
    })
  } catch (err) {
    console.error('[ads-search-terms]', err)
    return NextResponse.json({ error: 'Failed to load search terms' }, { status: 500 })
  }
}
