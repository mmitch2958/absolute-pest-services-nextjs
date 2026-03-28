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
    const { status, adminNotes } = body;

    const validStatuses = ['scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'cancelled'];

    if (status !== undefined && !validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (status !== undefined && adminNotes !== undefined) {
      await sql`UPDATE job_logs SET status = ${status}, admin_notes = ${adminNotes} WHERE id = ${jobId}`;
    } else if (status !== undefined) {
      await sql`UPDATE job_logs SET status = ${status} WHERE id = ${jobId}`;
    } else if (adminNotes !== undefined) {
      await sql`UPDATE job_logs SET admin_notes = ${adminNotes} WHERE id = ${jobId}`;
    }

    const [updated] = await sql`SELECT * FROM job_logs WHERE id = ${jobId}`;
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
