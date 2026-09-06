import { NextRequest, NextResponse } from 'next/server'
import { getAdminSession } from '@/lib/admin-session'
import { createInvoiceForJobLog, InvoiceCreationError } from '@/lib/invoices'

/**
 * POST /api/admin/invoices/from-job/:jobLogId
 *
 * Creates a draft invoice from a job log and marks the job log 'invoiced'.
 * Body (all optional): { dueDate?, taxRate?, notes?, lineItemsOverride? }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ jobLogId: string }> }
) {
  const session = await getAdminSession()
  if (!session.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { jobLogId } = await params
    const id = parseInt(jobLogId, 10)
    if (isNaN(id)) {
      return NextResponse.json({ error: 'Invalid job log ID' }, { status: 400 })
    }

    let body: any = {}
    try { body = await request.json() } catch {}

    const dueDate = body?.dueDate ? new Date(body.dueDate) : null
    if (dueDate && isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: 'Invalid dueDate' }, { status: 400 })
    }

    const invoice = await createInvoiceForJobLog({
      jobLogId: id,
      userId: session.userId as number,
      taxRate: body?.taxRate ?? null,
      notes: body?.notes ?? null,
      lineItemsOverride: Array.isArray(body?.lineItemsOverride) ? body.lineItemsOverride : null,
      dueDate: dueDate && !isNaN(dueDate.getTime()) ? dueDate : null,
    })

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        status: invoice.status,
        total: invoice.total,
        dueDate: invoice.due_date,
      },
    }, { status: 201 })
  } catch (err: any) {
    if (err instanceof InvoiceCreationError) {
      return NextResponse.json({ error: err.message, message: err.message }, { status: err.status })
    }
    console.error('[admin/invoices/from-job] POST failed:', err)
    return NextResponse.json({ error: 'Failed to create invoice', message: 'Failed to create invoice.', detail: err?.message }, { status: 500 })
  }
}
