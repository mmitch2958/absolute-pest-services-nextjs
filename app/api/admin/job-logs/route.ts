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

export async function GET(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';

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
        WHERE (
          jl.customer_name ILIKE ${pattern}
          OR jl.site_location ILIKE ${pattern}
          OR jl.serviced_area ILIKE ${pattern}
          OR jl.work_performed ILIKE ${pattern}
        )
        ORDER BY jl.job_date DESC
        LIMIT 200
      `;
    } else if (status && dateFrom && dateTo) {
      rows = await sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        WHERE jl.status = ${status}
          AND DATE(jl.job_date) >= ${dateFrom}
          AND DATE(jl.job_date) <= ${dateTo}
        ORDER BY jl.job_date DESC
        LIMIT 200
      `;
    } else if (status) {
      rows = await sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        WHERE jl.status = ${status}
        ORDER BY jl.job_date DESC
        LIMIT 200
      `;
    } else if (dateFrom && dateTo) {
      rows = await sql`
        SELECT
          jl.*,
          c.name AS client_name,
          fe.name AS employee_name
        FROM job_logs jl
        LEFT JOIN clients c ON c.id = jl.client_id
        LEFT JOIN field_employees fe ON fe.id = jl.employee_id
        WHERE DATE(jl.job_date) >= ${dateFrom}
          AND DATE(jl.job_date) <= ${dateTo}
        ORDER BY jl.job_date DESC
        LIMIT 200
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
        LIMIT 200
      `;
    }

    const employees = await sql`SELECT id, name FROM field_employees WHERE is_active = true ORDER BY name`;

    return NextResponse.json({ logs: rows, employees });
  } catch (err) {
    console.error('[admin/job-logs] GET error:', err);
    return NextResponse.json({ error: 'Failed to load job logs' }, { status: 500 });
  }
}
