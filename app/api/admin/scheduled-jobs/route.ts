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
        WHERE jl.job_date >= CURRENT_DATE
           OR jl.status IN ('pending', 'assigned')
        ORDER BY jl.job_date ASC
        LIMIT 100
      `;
    }

    const employees = await sql`SELECT id, name FROM field_employees WHERE is_active = true ORDER BY name`;

    return NextResponse.json({ jobs: rows, employees });
  } catch (err) {
    console.error('[admin/scheduled-jobs] GET error:', err);
    return NextResponse.json({ error: 'Failed to load scheduled jobs' }, { status: 500 });
  }
}
