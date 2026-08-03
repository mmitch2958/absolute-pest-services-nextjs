import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { sql } from '@/lib/db';

async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const rows = await sql`
      SELECT
        i.*,
        c.id   AS client_id,
        c.name AS client_name
      FROM invoices i
      JOIN clients c ON c.id = i.client_id
      WHERE i.id = ${invoiceId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const lineItems = await sql`
      SELECT * FROM invoice_line_items
      WHERE invoice_id = ${invoiceId}
      ORDER BY sort_order ASC
    `;

    return NextResponse.json({ invoice: rows[0], lineItems });
  } catch (err) {
    console.error('[admin/invoices/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to load invoice' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const invoiceId = parseInt(id, 10);
    if (isNaN(invoiceId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const allowedFields = ['status', 'notes', 'void_reason', 'payment_method', 'payment_amount', 'payment_note', 'sent_at', 'paid_at'];
    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const cols = Object.keys(updates);
    const vals = Object.values(updates);
    const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const query = `UPDATE invoices SET ${setClause} WHERE id = $${cols.length + 1} RETURNING *`;

    const result = await sql.query(query, [...vals, invoiceId]);
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice: result[0] });
  } catch (err) {
    console.error('[admin/invoices/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}
