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
    const submissionId = parseInt(id, 10);
    if (isNaN(submissionId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const rows = await sql`
      SELECT id, first_name, last_name, phone, email, city, service_type, message, created_at
      FROM contact_submissions
      WHERE id = ${submissionId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ submission: rows[0] });
  } catch (err) {
    console.error('[admin/service-requests/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to load service request' }, { status: 500 });
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
    const submissionId = parseInt(id, 10);
    if (isNaN(submissionId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    // contact_submissions is read-only submission table, so only allow annotating via message/notes
    if (body.message !== undefined || body.serviceType !== undefined) {
      const updates: Record<string, any> = {};
      if (body.message !== undefined) updates.message = body.message;
      if (body.serviceType !== undefined) updates.service_type = body.serviceType;

      const cols = Object.keys(updates);
      const vals = Object.values(updates);
      const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');

      const result = await sql`UPDATE contact_submissions SET ${sql(updates as any)} WHERE id = ${submissionId} RETURNING *`;
      if (!result || result.length === 0) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ submission: result[0] });
    }

    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  } catch (err) {
    console.error('[admin/service-requests/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
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
    const submissionId = parseInt(id, 10);
    if (isNaN(submissionId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await sql`DELETE FROM contact_submissions WHERE id = ${submissionId} RETURNING id`;
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/service-requests/[id]] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
