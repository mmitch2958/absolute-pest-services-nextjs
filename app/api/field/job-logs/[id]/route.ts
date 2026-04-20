import { NextRequest, NextResponse } from 'next/server';
import { getFieldSession } from '@/lib/field-session';
import { sql } from '@/lib/db';

// Allowed status values for job logs
const ALLOWED_STATUSES = new Set([
  'completed', 'scheduled', 'in_progress', 'invoiced', 'paid', 'cancelled',
]);

async function authorize(idStr: string) {
  const session = await getFieldSession();
  if (!session.employeeId) {
    return { error: NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 }) };
  }
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id)) {
    return { error: NextResponse.json({ success: false, message: 'Invalid id' }, { status: 400 }) };
  }
  // Verify the log belongs to this technician
  const [row] = await sql`SELECT id FROM job_logs WHERE id = ${id} AND employee_id = ${session.employeeId} LIMIT 1`;
  if (!row) {
    return { error: NextResponse.json({ success: false, message: 'Not found' }, { status: 404 }) };
  }
  return { id, employeeId: session.employeeId };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await authorize(id);
    if ('error' in auth) return auth.error;

    const body = await request.json();
    const {
      customerName, siteLocation, siteAddress, servicedArea,
      workPerformed, jobDate, status, serviceRateId, amount, materials,
    } = body;

    if (!customerName || !siteLocation || !servicedArea || !workPerformed || !jobDate) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }
    if (status && !ALLOWED_STATUSES.has(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status' }, { status: 400 });
    }

    const [updated] = await sql`
      UPDATE job_logs SET
        customer_name   = ${customerName},
        site_location   = ${siteLocation},
        site_address    = ${siteAddress ?? null},
        serviced_area   = ${servicedArea},
        work_performed  = ${workPerformed},
        job_date        = ${new Date(jobDate).toISOString()},
        status          = ${status ?? 'completed'},
        service_rate_id = ${serviceRateId ?? null},
        amount          = ${amount ?? '200.00'},
        materials       = ${materials ? JSON.stringify(materials) : null}
      WHERE id = ${auth.id} AND employee_id = ${auth.employeeId}
      RETURNING *
    `;

    return NextResponse.json({ success: true, log: updated });
  } catch (err) {
    console.error('[field/job-logs/:id] PATCH error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await authorize(id);
    if ('error' in auth) return auth.error;

    await sql`DELETE FROM job_logs WHERE id = ${auth.id} AND employee_id = ${auth.employeeId}`;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[field/job-logs/:id] DELETE error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
