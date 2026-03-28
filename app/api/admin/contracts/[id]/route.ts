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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const contractId = parseInt(id, 10);
    if (isNaN(contractId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const rows = await sql`
      SELECT sc.*, c.name AS customer_name
      FROM service_contracts sc
      JOIN clients c ON c.id = sc.customer_id
      WHERE sc.id = ${contractId}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ contract: rows[0] });
  } catch (err) {
    console.error('[admin/contracts/[id]] GET error:', err);
    return NextResponse.json({ error: 'Failed to load contract' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const contractId = parseInt(id, 10);
    if (isNaN(contractId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const allowedKeys = [
      'frequency', 'next_scheduled_date', 'site_location', 'serviced_area',
      'default_work_template', 'notes', 'assigned_employee_id', 'is_active',
      'start_date', 'end_date',
    ];
    const camelToSnake: Record<string, string> = {
      frequency: 'frequency', nextScheduledDate: 'next_scheduled_date',
      siteLocation: 'site_location', servicedArea: 'serviced_area',
      defaultWorkTemplate: 'default_work_template', assignedEmployeeId: 'assigned_employee_id',
      startDate: 'start_date', endDate: 'end_date',
    };

    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(body)) {
      const snakeKey = camelToSnake[key] || key;
      if (allowedKeys.includes(snakeKey)) {
        if (snakeKey.includes('date') && value) {
          updates[snakeKey] = new Date(value as string);
        } else {
          updates[snakeKey] = value;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const result = await sql`UPDATE service_contracts SET ${sql(updates as any)} WHERE id = ${contractId} RETURNING *`;
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ contract: result[0] });
  } catch (err) {
    console.error('[admin/contracts/[id]] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const { id } = await params;
    const contractId = parseInt(id, 10);
    if (isNaN(contractId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const result = await sql`DELETE FROM service_contracts WHERE id = ${contractId} RETURNING id`;
    if (!result || result.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/contracts/[id]] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 });
  }
}
