import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { sql } from '@/lib/db';

/**
 * GET /api/admin/clients/:id/job-logs
 * Job logs linked to a client, with the linked invoice (if any).
 * Used by the client detail panel (Jobs tab).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session.userId || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const clientId = parseInt(id, 10);
    if (isNaN(clientId)) {
      return NextResponse.json({ error: 'Invalid client ID' }, { status: 400 });
    }

    const [client] = await sql`SELECT id FROM clients WHERE id = ${clientId} LIMIT 1`;
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    const rows = await sql`
      SELECT
        jl.id, jl.customer_name, jl.client_id, jl.site_location, jl.site_address,
        jl.serviced_area, jl.work_performed, jl.job_date, jl.status,
        jl.amount, jl.admin_notes,
        fe.name AS employee_name,
        i.id AS invoice_id, i.invoice_number AS invoice_number,
        i.status AS invoice_status, i.total AS invoice_total
      FROM job_logs jl
      LEFT JOIN field_employees fe ON fe.id = jl.employee_id
      LEFT JOIN invoices i ON i.job_log_id = jl.id
      WHERE jl.client_id = ${clientId}
      ORDER BY jl.job_date DESC
      LIMIT 200
    `;

    const jobLogs = (rows as any[]).map((r) => ({
      id: r.id,
      customerName: r.customer_name,
      clientId: r.client_id,
      siteLocation: r.site_location,
      siteAddress: r.site_address,
      servicedArea: r.serviced_area,
      workPerformed: r.work_performed,
      jobDate: r.job_date,
      status: r.status,
      amount: r.amount,
      adminNotes: r.admin_notes,
      employeeName: r.employee_name,
      invoice: r.invoice_id
        ? {
            id: r.invoice_id,
            invoiceNumber: r.invoice_number,
            status: r.invoice_status,
            total: r.invoice_total,
          }
        : null,
    }));

    return NextResponse.json({ success: true, jobLogs });
  } catch (err) {
    console.error('[admin/clients/[id]/job-logs] GET error:', err);
    return NextResponse.json({ error: 'Failed to load client job logs' }, { status: 500 });
  }
}
