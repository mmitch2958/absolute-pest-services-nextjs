import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('admin-token')
  if (!token?.value) {
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
