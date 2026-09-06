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

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const jobId = parseInt(id);
    if (isNaN(jobId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    const body = await request.json();
    const { status, adminNotes, clientId } = body;

    const validStatuses = ['scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'cancelled'];

    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Build dynamic update set
    const updates: Record<string, any> = {};
    if (status !== undefined) updates.status = status;
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;
    if (clientId !== undefined) {
      // Accept a client id (number or numeric string) or null/'' to unlink
      if (clientId === null || clientId === '') {
        updates.client_id = null;
      } else {
        const cid = typeof clientId === 'number' ? clientId : parseInt(String(clientId), 10);
        if (isNaN(cid)) {
          return NextResponse.json({ error: 'Invalid clientId' }, { status: 400 });
        }
        const [client] = await sql`SELECT id FROM clients WHERE id = ${cid} LIMIT 1`;
        if (!client) {
          return NextResponse.json({ error: 'Client not found' }, { status: 404 });
        }
        updates.client_id = cid;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const cols = Object.keys(updates);
    const vals = Object.values(updates);
    const setClause = cols.map((c, i) => `${c} = $${i + 1}`).join(', ');
    const query = `UPDATE job_logs SET ${setClause} WHERE id = $${cols.length + 1} RETURNING *`;
    const result = await sql.query(query, [...vals, jobId]);

    const updated = result && result.length > 0 ? result[0] : null;
    return NextResponse.json({ success: true, log: updated });
  } catch (err) {
    console.error('[admin/job-logs/:id] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update job log' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const jobId = parseInt(id);
    if (isNaN(jobId)) return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });

    await sql`DELETE FROM job_logs WHERE id = ${jobId}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/job-logs/:id] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete job log' }, { status: 500 });
  }
}
