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
    // TODO: Connect to Google Ads API or read from cached JSON files
    // This mirrors the old Express route logic
    return NextResponse.json({
      campaigns: [],
      message: 'Connect Google Ads API credentials to populate this data.',
    })
  } catch (err) {
    console.error('[ads-campaigns]', err)
    return NextResponse.json({ error: 'Failed to load campaigns' }, { status: 500 })
  }
}
