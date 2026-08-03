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
    const inspectionId = parseInt(id, 10);
    if (isNaN(inspectionId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, first_name, last_name, phone, email, address, city, service_type,
             preferred_date, preferred_time, urgency, status, message, created_at
      FROM inspection_schedules
      WHERE id = ${inspectionId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ inspection: rows[0] });
  } catch (err) {
    console.error('[admin/inspections/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to load inspection' }, { status: 500 });
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
    const inspectionId = parseInt(id, 10);
    if (isNaN(inspectionId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const allowedFields = ['status', 'preferred_date', 'preferred_time', 'urgency', 'message', 'first_name', 'last_name', 'phone', 'email', 'address', 'city', 'service_type'];
    const updates: Record<string, any> = {};
    for (const key of allowedFields) {
      const camelKey = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
      if (body[camelKey] !== undefined || body[key] !== undefined) {
        const val = body[camelKey] ?? body[key];
        updates[key] = key.includes('date') && val ? new Date(val) : val;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const cols = Object.keys(updates);
    const vals = Object.values(updates);
    const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const query = `UPDATE inspection_schedules SET ${setClause} WHERE id = $${cols.length + 1} RETURNING *`;

    const result = await sql.query(query, [...vals, inspectionId]);
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ inspection: result[0] });
  } catch (err) {
    console.error('[admin/inspections/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update inspection' }, { status: 500 });
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
    const inspectionId = parseInt(id, 10);
    if (isNaN(inspectionId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await sql`DELETE FROM inspection_schedules WHERE id = ${inspectionId} RETURNING id`;
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/inspections/[id]] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete inspection' }, { status: 500 });
  }
}
