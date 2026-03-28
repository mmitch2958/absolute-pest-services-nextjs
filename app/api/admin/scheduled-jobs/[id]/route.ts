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
    const jobId = parseInt(id, 10);
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const rows = await sql`
      SELECT jl.*, c.name AS client_name, fe.name AS employee_name
      FROM job_logs jl
      LEFT JOIN clients c ON c.id = jl.client_id
      LEFT JOIN field_employees fe ON fe.id = jl.employee_id
      WHERE jl.id = ${jobId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ job: rows[0] });
  } catch (err) {
    console.error('[admin/scheduled-jobs/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to load job' }, { status: 500 });
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
    const jobId = parseInt(id, 10);
    if (isNaN(jobId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const allowedKeys = ['employee_id', 'job_date', 'scheduled_end_time', 'priority', 'admin_notes', 'status', 'site_location', 'site_address', 'serviced_area', 'scheduled_by'];
    const camelToSnake: Record<string, string> = {
      employeeId: 'employee_id', jobDate: 'job_date', scheduledEndTime: 'scheduled_end_time',
      adminNotes: 'admin_notes', scheduledBy: 'scheduled_by',
    };

    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      const snakeKey = camelToSnake[key] || key;
      if (allowedKeys.includes(snakeKey)) {
        if (snakeKey.includes('time') || snakeKey.includes('date')) {
          updates[snakeKey] = value ? new Date(value as string) : null;
        } else {
          updates[snakeKey] = value;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const result = await sql`UPDATE job_logs SET ${sql(updates)} WHERE id = ${jobId} RETURNING *`;
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ job: result[0] });
  } catch (err) {
    console.error('[admin/scheduled-jobs/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
  }
}
