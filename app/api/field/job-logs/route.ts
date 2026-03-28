import { NextRequest, NextResponse } from 'next/server';
import { getFieldSession } from '@/lib/field-session';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getFieldSession();
    if (!session.employeeId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerName, clientId, siteLocation, siteAddress,
      servicedArea, workPerformed, jobDate, serviceRateId,
      amount, materials,
    } = body;

    if (!customerName || !siteLocation || !servicedArea || !workPerformed || !jobDate) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    const [log] = await sql`
      INSERT INTO job_logs (
        employee_id, customer_name, client_id, site_location, site_address,
        serviced_area, work_performed, job_date, status, service_rate_id,
        amount, materials, created_at
      ) VALUES (
        ${session.employeeId},
        ${customerName},
        ${clientId ?? null},
        ${siteLocation},
        ${siteAddress ?? null},
        ${servicedArea},
        ${workPerformed},
        ${new Date(jobDate).toISOString()},
        'completed',
        ${serviceRateId ?? null},
        ${amount ?? '200.00'},
        ${materials ? JSON.stringify(materials) : null},
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true, log });
  } catch (err) {
    console.error('[field/job-logs] POST error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getFieldSession();
    if (!session.employeeId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const logs = await sql`
      SELECT * FROM job_logs
      WHERE employee_id = ${session.employeeId}
      ORDER BY job_date DESC
      LIMIT 50
    `;

    return NextResponse.json({ success: true, logs });
  } catch (err) {
    console.error('[field/job-logs] GET error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
