import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { sql } from '@/lib/db'

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
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    let query = sql`
      SELECT
        i.id,
        i.invoice_number,
        i.status,
        i.issue_date,
        i.due_date,
        i.total,
        i.sent_at,
        i.viewed_at,
        i.paid_at,
        c.id   AS client_id,
        c.name AS client_name
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE 1=1
    `

    // Apply filters at the SQL level (neon uses tagged template literals)
    if (status) {
      const rows = await sql`
        SELECT
          i.id,
          i.invoice_number,
          i.status,
          i.issue_date,
          i.due_date,
          i.total,
          i.sent_at,
          i.viewed_at,
          i.paid_at,
          c.id   AS client_id,
          c.name AS client_name
        FROM invoices i
        JOIN clients c ON c.id = i.client_id
        WHERE i.status = ${status}
        ORDER BY i.created_at DESC
        LIMIT 100
      `
      return NextResponse.json({ invoices: rows })
    }

    if (clientId) {
      const rows = await sql`
        SELECT
          i.id,
          i.invoice_number,
          i.status,
          i.issue_date,
          i.due_date,
          i.total,
          i.sent_at,
          i.viewed_at,
          i.paid_at,
          c.id   AS client_id,
          c.name AS client_name
        FROM invoices i
        JOIN clients c ON c.id = i.client_id
        WHERE i.client_id = ${Number(clientId)}
        ORDER BY i.created_at DESC
        LIMIT 100
      `
      return NextResponse.json({ invoices: rows })
    }

    const rows = await sql`
      SELECT
        i.id,
        i.invoice_number,
        i.status,
        i.issue_date,
        i.due_date,
        i.total,
        i.sent_at,
        i.viewed_at,
        i.paid_at,
        c.id   AS client_id,
        c.name AS client_name
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      ORDER BY i.created_at DESC
      LIMIT 100
    `
    return NextResponse.json({ invoices: rows })
  } catch (err) {
    console.error('[admin/invoices] GET failed:', err)
    return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 })
  }
}
