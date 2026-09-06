import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { sql } from '@/lib/db'
import {
  computeTotals,
  dueDateFor,
  generateInvoiceNumber,
  newViewToken,
  createInvoiceForJobLog,
  InvoiceCreationError,
  type LineItemInput,
} from '@/lib/invoices'

async function requireAdmin(): Promise<{ error: NextResponse } | { session: Awaited<ReturnType<typeof getAdminSession>> }> {
  const session = await getAdminSession()
  if (!session.userId || session.role !== 'admin') {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }
  return { session }
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')
    const jobLogId = searchParams.get('jobLogId')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)))
    const offset = (page - 1) * limit

    // Single query with window-function COUNT + filters
    const rows = (await sql`
      SELECT
        i.id, i.invoice_number, i.status,
        i.issue_date, i.due_date, i.total,
        i.sent_at, i.viewed_at, i.paid_at,
        c.id   AS client_id,
        c.name AS client_name,
        COUNT(*) OVER() AS _total
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE (${status}::text IS NULL OR i.status = ${status})
        AND (${clientId ? Number(clientId) : null}::int IS NULL OR i.client_id = ${clientId ? Number(clientId) : null})
        AND (${jobLogId ? Number(jobLogId) : null}::int IS NULL OR i.job_log_id = ${jobLogId ? Number(jobLogId) : null})
      ORDER BY i.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `) as any[]

    const total = rows.length > 0 ? parseInt(rows[0]._total, 10) : 0
    const invoices = rows.map(({ _total, ...r }) => r)

    return NextResponse.json({
      invoices,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('[admin/invoices] GET failed:', err)
    return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 })
  }
}

/**
 * POST /api/admin/invoices
 *
 * Three creation modes (mutually exclusive):
 *  1. From job log:    { jobLogId, taxRate?, notes?, lineItemsOverride? }
 *  2. Existing client: { clientId, lineItems: [...], taxRate?, notes? }
 *  3. New client:      { newClient: {name,email?,phone?,address?,propertyType?}, lineItems: [...], taxRate?, notes? }
 *
 * `taxRate` is a percentage (0-100) applied to every line that doesn't carry its own taxRate.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if ('error' in auth) return auth.error
  const userId = auth.session.userId as number

  try {
    const body = await request.json()
    const { jobLogId, clientId, newClient, lineItems, lineItemsOverride, taxRate, notes } = body ?? {}

    let resolvedClientId: number | null = null
    let resolvedJobLogId: number | null = null
    let propertyType: string = 'residential'
    let items: LineItemInput[] = []

    // ---- Mode 1: From job log ----
    if (jobLogId) {
      try {
        const invoice = await createInvoiceForJobLog({
          jobLogId: Number(jobLogId),
          userId,
          taxRate: taxRate ?? null,
          notes: notes ?? null,
          lineItemsOverride: Array.isArray(lineItemsOverride) ? lineItemsOverride : null,
        })
        return NextResponse.json({ invoice }, { status: 201 })
      } catch (err: any) {
        if (err instanceof InvoiceCreationError) {
          return NextResponse.json({ error: err.message }, { status: err.status })
        }
        throw err
      }
    }
    // ---- Mode 3: New client ----
    else if (newClient && typeof newClient === 'object') {
      if (!newClient.name || typeof newClient.name !== 'string') {
        return NextResponse.json({ error: 'New client requires a name' }, { status: 400 })
      }
      const propType = (newClient.propertyType === 'commercial') ? 'commercial' : 'residential'
      const created = (await sql`
        INSERT INTO clients (name, email, phone, address, property_type, client_type, status)
        VALUES (
          ${newClient.name},
          ${newClient.email || null},
          ${newClient.phone || null},
          ${newClient.address || null},
          ${propType},
          'client',
          'active'
        )
        RETURNING id, property_type
      `) as Array<{ id: number; property_type: string }>
      resolvedClientId = created[0].id
      propertyType = created[0].property_type || 'residential'
      items = Array.isArray(lineItems) ? lineItems : []
    }
    // ---- Mode 2: Existing client ----
    else if (clientId) {
      const c = (await sql`
        SELECT id, property_type FROM clients WHERE id = ${Number(clientId)} LIMIT 1
      `) as Array<{ id: number; property_type: string }>
      if (c.length === 0) {
        return NextResponse.json({ error: 'Client not found' }, { status: 404 })
      }
      resolvedClientId = c[0].id
      propertyType = c[0].property_type || 'residential'
      items = Array.isArray(lineItems) ? lineItems : []
    } else {
      return NextResponse.json({
        error: 'Provide jobLogId, clientId, or newClient to create an invoice.',
      }, { status: 400 })
    }

    // Apply default tax rate to lines that don't specify their own
    if (taxRate !== undefined && taxRate !== null) {
      items = items.map(it => ({ ...it, taxRate: it.taxRate ?? taxRate }))
    }

    if (!items.length) {
      return NextResponse.json({ error: 'At least one line item is required' }, { status: 400 })
    }

    const totals = computeTotals(items)
    const issueDate = new Date()
    const dueDate = dueDateFor(propertyType, issueDate)
    const invoiceNumber = await generateInvoiceNumber(issueDate.getFullYear())
    const viewToken = newViewToken()

    // Insert invoice
    const invRows = (await sql`
      INSERT INTO invoices (
        invoice_number, client_id, job_log_id, status,
        issue_date, due_date,
        subtotal, tax_total, total,
        notes, view_token, created_by
      ) VALUES (
        ${invoiceNumber}, ${resolvedClientId}, ${resolvedJobLogId}, 'draft',
        ${issueDate.toISOString()}, ${dueDate.toISOString()},
        ${totals.subtotal}, ${totals.taxTotal}, ${totals.total},
        ${notes || null}, ${viewToken}, ${userId}
      )
      RETURNING *
    `) as any[]
    const invoice = invRows[0]

    // Bulk insert line items in parallel (single round-trip per item, but no awaits between)
    if (totals.items.length > 0) {
      await Promise.all(
        totals.items.map((li, i) => sql`
          INSERT INTO invoice_line_items (
            invoice_id, description, quantity, unit_rate, tax_rate,
            line_total, line_tax, materials, sort_order,
            service_date, technician_name, service_type,
            service_address, serviced_area, job_log_id
          ) VALUES (
            ${invoice.id}, ${li.description}, ${String(li.quantity ?? 1)},
            ${String(li.unitRate)}, ${String(li.taxRate ?? 0)},
            ${li.lineTotal}, ${li.lineTax},
            ${li.materials ? JSON.stringify(li.materials) : null}, ${i},
            ${li.serviceDate || null}, ${li.technicianName || null},
            ${li.serviceType || null}, ${li.serviceAddress || null},
            ${li.servicedArea || null}, ${li.jobLogId || null}
          )
        `)
      )
    }

    // Status log
    await sql`
      INSERT INTO invoice_status_logs (invoice_id, from_status, to_status, actor, note)
      VALUES (${invoice.id}, NULL, 'draft', ${'admin:' + userId}, 'Invoice created')
    `

    return NextResponse.json({ invoice }, { status: 201 })
  } catch (err: any) {
    console.error('[admin/invoices] POST failed:', err)
    return NextResponse.json({ error: 'Failed to create invoice', detail: err?.message }, { status: 500 })
  }
}
