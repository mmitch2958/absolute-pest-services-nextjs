import { NextRequest, NextResponse } from 'next/server';
import { getFieldSession } from '@/lib/field-session';
import { sql } from '@/lib/db';

// Tech-facing scheduling view. Mirrors the admin scheduled-jobs list but
// authenticated with the field session. Shows ALL job statuses (scheduled,
// pending, assigned, in_progress, completed, invoiced, paid, cancelled) so a
// tech can see every job that may be scheduled, not just future/pending ones.
export async function GET(request: NextRequest) {
  const session = await getFieldSession();
  if (!session.employeeId) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const date = searchParams.get('date') || '';

    let rows;
    if (search.trim()) {
      const pattern = `%${search.trim()}%`;
      rows = await sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        WHERE jl.customer_name ILIKE ${pattern}
           OR jl.site_location ILIKE ${pattern}
           OR jl.site_address ILIKE ${pattern}
        ORDER BY jl.job_date DESC
        LIMIT 100
      `;
    } else if (date) {
      rows = await sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        WHERE DATE(jl.job_date) = ${date}
        ORDER BY jl.job_date ASC
        LIMIT 100
      `;
    } else {
      rows = await sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        ORDER BY jl.job_date DESC
        LIMIT 100
      `;
    }

    const employees = await sql`SELECT id, name FROM field_employees WHERE is_active = true ORDER BY name`;

    return NextResponse.json({ success: true, jobs: rows, employees });
  } catch (err) {
    console.error('[field/scheduled-jobs] GET error:', err);
    return NextResponse.json({ success: false, message: 'Failed to load scheduled jobs' }, { status: 500 });
  }
}
