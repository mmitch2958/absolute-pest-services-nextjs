import { NextRequest, NextResponse } from 'next/server';
import { getFieldSession } from '@/lib/field-session';
import { sql } from '@/lib/db';

// Tech-facing edit for a scheduled job. Mirrors the admin scheduling PATCH but
// authenticated with the field session. A tech may update schedule/venue/status
// and assign the job to themselves or another active technician (same
// capabilities as the admin scheduling view, under the tech's own access).
// Admin-only fields (admin_notes, scheduled_by) are intentionally not editable
// from the field portal.
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getFieldSession();
  if (!session.employeeId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const jobId = parseInt(id, 10);
    if (isNaN(jobId)) {
      return NextResponse.json({ success: false, message: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const allowedKeys = ['employee_id', 'job_date', 'scheduled_end_time', 'priority', 'status', 'site_location', 'site_address', 'serviced_area'];
    const camelToSnake: Record<string, string> = {
      employeeId: 'employee_id', jobDate: 'job_date', scheduledEndTime: 'scheduled_end_time',
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
      return NextResponse.json({ success: false, message: 'No valid fields to update' }, { status: 400 });
    }

    const result = await sql`UPDATE job_logs SET ${sql(updates as any)} WHERE id = ${jobId} RETURNING *`;
    if (!result || result.length === 0) {
      return NextResponse.json({ success: false, message: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, job: result[0] });
  } catch (err) {
    console.error('[field/scheduled-jobs/:id] PATCH error:', err);
    return NextResponse.json({ success: false, message: 'Failed to update job' }, { status: 500 });
  }
}
