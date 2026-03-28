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
    const active = searchParams.get('active');

    if (search.trim()) {
      const pattern = `%${search.trim()}%`;
      const rows = await sql`
        SELECT
          sc.*,
          c.name AS customer_name
        FROM service_contracts sc
        JOIN clients c ON c.id = sc.customer_id
        WHERE c.name ILIKE ${pattern}
           OR sc.site_location ILIKE ${pattern}
           OR sc.serviced_area ILIKE ${pattern}
        ORDER BY sc.next_scheduled_date ASC
        LIMIT 100
      `;
      return NextResponse.json({ contracts: rows });
    }

    const rows = await sql`
      SELECT
        sc.*,
        c.name AS customer_name
      FROM service_contracts sc
      JOIN clients c ON c.id = sc.customer_id
      WHERE (${active} IS NULL OR sc.is_active = ${active === 'true'})
      ORDER BY sc.next_scheduled_date ASC
      LIMIT 100
    `;
    return NextResponse.json({ contracts: rows });
  } catch (err) {
    console.error('[admin/contracts] GET error:', err);
    return NextResponse.json({ error: 'Failed to load contracts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { customerId, frequency, nextScheduledDate, siteLocation, servicedArea, defaultWorkTemplate, notes, assignedEmployeeId, startDate, endDate } = body;

    if (!customerId || !siteLocation?.trim() || !servicedArea?.trim()) {
      return NextResponse.json({ error: 'customerId, siteLocation, and servicedArea are required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO service_contracts (
        customer_id, frequency, next_scheduled_date, site_location, serviced_area,
        default_work_template, notes, assigned_employee_id, start_date, end_date, is_active
      )
      VALUES (
        ${customerId}, ${frequency || 'monthly'},
        ${nextScheduledDate ? new Date(nextScheduledDate) : new Date()},
        ${siteLocation.trim()}, ${servicedArea.trim()},
        ${defaultWorkTemplate?.trim() || null}, ${notes?.trim() || null},
        ${assignedEmployeeId || null},
        ${startDate ? new Date(startDate) : null},
        ${endDate ? new Date(endDate) : null},
        true
      )
      RETURNING *
    `;

    return NextResponse.json({ contract: result[0] }, { status: 201 });
  } catch (err) {
    console.error('[admin/contracts] POST error:', err);
    return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 });
  }
}
