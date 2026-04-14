import { NextRequest, NextResponse } from 'next/server';
import { getFieldSession } from '@/lib/field-session';
import { sql } from '@/lib/db';
import { sendJobLogNotification } from '@/lib/email';
import { sendJobLogSMS } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const session = await getFieldSession();
    if (!session.employeeId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      customerName, siteLocation, siteAddress,
      servicedArea, workPerformed, jobDate, serviceRateId,
      amount, materials, propertyType, isNewCustomer, newCustomerAddress,
    } = body;

    if (!customerName || !siteLocation || !servicedArea || !workPerformed || !jobDate) {
      return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
    }

    // Resolve or auto-create the client
    let resolvedClientId: number | null = body.clientId ?? null;
    if (!resolvedClientId && customerName) {
      const [existing] = await sql`
        SELECT id FROM clients
        WHERE LOWER(TRIM(name)) = LOWER(TRIM(${customerName}))
        LIMIT 1
      `;
      if (existing) {
        resolvedClientId = existing.id;
      } else {
        const address = newCustomerAddress || siteAddress || null;
        try {
          const [newClient] = await sql`
            INSERT INTO clients (name, address, property_type, client_type, status, created_at)
            VALUES (${customerName}, ${address}, ${propertyType || 'residential'}, 'prospect', 'pending', NOW())
            RETURNING id
          `;
          resolvedClientId = newClient.id;
        } catch (e) {
          console.error('[field/job-logs] Auto-create client error:', e);
        }
      }
    }

    const [log] = await sql`
      INSERT INTO job_logs (
        employee_id, customer_name, client_id, site_location, site_address,
        serviced_area, work_performed, job_date, status, service_rate_id,
        amount, materials, created_at
      ) VALUES (
        ${session.employeeId},
        ${customerName},
        ${resolvedClientId},
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

    // Fire-and-forget email — don't block the response
    sendJobLogNotification({
      employeeName: session.employeeName ?? 'Technician',
      customerName,
      siteLocation,
      siteAddress: siteAddress ?? null,
      servicedArea,
      workPerformed,
      jobDate,
      amount: amount ?? null,
    }).catch((e) => console.error('[field/job-logs] Email notification failed:', e));

    sendJobLogSMS({
      employeeName: session.employeeName ?? 'Technician',
      customerName,
      siteLocation,
      jobDate,
    }).catch((e) => console.error('[field/job-logs] SMS notification failed:', e));

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
      SELECT
        jl.*,
        c.phone   AS client_phone,
        c.email   AS client_email,
        c.address AS client_address
      FROM job_logs jl
      LEFT JOIN clients c ON jl.client_id = c.id
      WHERE jl.employee_id = ${session.employeeId}
      ORDER BY jl.job_date DESC
      LIMIT 50
    `;

    return NextResponse.json({ success: true, logs });
  } catch (err) {
    console.error('[field/job-logs] GET error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
