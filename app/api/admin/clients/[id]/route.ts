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
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, name, email, phone, address, contact_person, property_type,
             client_type, status, notes, review_opt_out, created_at, updated_at
      FROM clients
      WHERE id = ${clientId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client: rows[0] });
  } catch (err) {
    console.error('[admin/clients/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to load client' }, { status: 500 });
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
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const body = await request.json();

    // Map camelCase client payload fields to snake_case DB columns
    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.email !== undefined) updates.email = body.email;
    if (body.phone !== undefined) updates.phone = body.phone;
    if (body.address !== undefined) updates.address = body.address;
    if (body.contactPerson !== undefined) updates.contact_person = body.contactPerson;
    if (body.propertyType !== undefined) updates.property_type = body.propertyType;
    if (body.clientType !== undefined) updates.client_type = body.clientType;
    if (body.status !== undefined) updates.status = body.status;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.reviewOptOut !== undefined) updates.review_opt_out = body.reviewOptOut;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const cols = Object.keys(updates);
    const vals = Object.values(updates);
    const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const query = `UPDATE clients SET ${setClause} WHERE id = $${cols.length + 1} RETURNING *`;

    const result = await sql.query(query, [...vals, clientId]);

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ client: result[0] });
  } catch (err) {
    console.error('[admin/clients/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const result = await sql`
      DELETE FROM clients WHERE id = ${clientId} RETURNING id
    `;

    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/clients/[id]] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
