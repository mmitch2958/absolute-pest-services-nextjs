import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { sql } from '@/lib/db';

/**
 * GET /api/admin/invoices/uninvoiced-jobs
 * Returns completed job logs that have a linked client and no invoice yet.
 * Used by the "Create Invoice From Job" picker.
 */
export async function GET(request: NextRequest) {
  const session = await getAdminSession();
  if (!session.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = (searchParams.get('search') || '').trim();

    const rows = search
      ? await sql`
          SELECT jl.id, jl.customer_name, jl.client_id, jl.site_location,
                 jl.serviced_area, jl.job_date, jl.amount, jl.status,
                 c.name AS client_name, c.property_type
          FROM job_logs jl
          LEFT JOIN clients c ON c.id = jl.client_id
          WHERE jl.status IN ('completed', 'invoiced')
            AND jl.client_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.job_log_id = jl.id)
            AND (
              jl.customer_name ILIKE ${'%' + search + '%'}
              OR jl.site_location ILIKE ${'%' + search + '%'}
              OR jl.serviced_area ILIKE ${'%' + search + '%'}
              OR c.name ILIKE ${'%' + search + '%'}
            )
          ORDER BY jl.job_date DESC
          LIMIT 50
        `
      : await sql`
          SELECT jl.id, jl.customer_name, jl.client_id, jl.site_location,
                 jl.serviced_area, jl.job_date, jl.amount, jl.status,
                 c.name AS client_name, c.property_type
          FROM job_logs jl
          LEFT JOIN clients c ON c.id = jl.client_id
          WHERE jl.status IN ('completed', 'invoiced')
            AND jl.client_id IS NOT NULL
            AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.job_log_id = jl.id)
          ORDER BY jl.job_date DESC
          LIMIT 50
        `;

    return NextResponse.json({ jobLogs: rows });
  } catch (err) {
    console.error('[admin/invoices/uninvoiced-jobs] GET failed:', err);
    return NextResponse.json({ error: 'Failed to load job logs' }, { status: 500 });
  }
}
