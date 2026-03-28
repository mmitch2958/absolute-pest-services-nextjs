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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = 20;
    const offset = (page - 1) * limit;

    if (search.trim() || status) {
      const pattern = `%${search.trim()}%`;
      const rows = await sql`
        SELECT id, first_name, last_name, phone, email, address, city, service_type,
               preferred_date, preferred_time, urgency, status, message, created_at
        FROM inspection_schedules
        WHERE (${search.trim()} = '' OR first_name ILIKE ${pattern} OR last_name ILIKE ${pattern} OR address ILIKE ${pattern} OR city ILIKE ${pattern})
          AND (${status} = '' OR status = ${status})
        ORDER BY preferred_date DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
      const count = await sql`
        SELECT COUNT(*) as total FROM inspection_schedules
        WHERE (${search.trim()} = '' OR first_name ILIKE ${pattern} OR last_name ILIKE ${pattern} OR address ILIKE ${pattern} OR city ILIKE ${pattern})
          AND (${status} = '' OR status = ${status})
      `;
      const total = parseInt(count[0]?.total || '0', 10);
      return NextResponse.json({
        inspections: rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    const rows = await sql`
      SELECT id, first_name, last_name, phone, email, address, city, service_type,
             preferred_date, preferred_time, urgency, status, message, created_at
      FROM inspection_schedules
      ORDER BY preferred_date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const count = await sql`SELECT COUNT(*) as total FROM inspection_schedules`;
    const total = parseInt(count[0]?.total || '0', 10);
    return NextResponse.json({
      inspections: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[admin/inspections] GET error:', err);
    return NextResponse.json({ error: 'Failed to load inspections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { firstName, lastName, phone, email, address, city, serviceType, preferredDate, preferredTime, urgency, message } = body;

    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim() || !email?.trim() || !address?.trim() || !city?.trim() || !serviceType?.trim()) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO inspection_schedules (first_name, last_name, phone, email, address, city, service_type, preferred_date, preferred_time, urgency, message, status)
      VALUES (
        ${firstName.trim()}, ${lastName.trim()}, ${phone.trim()}, ${email.trim()},
        ${address.trim()}, ${city.trim()}, ${serviceType.trim()},
        ${preferredDate ? new Date(preferredDate) : null},
        ${preferredTime || 'anytime'},
        ${urgency || 'medium'},
        ${message?.trim() || null},
        'pending'
      )
      RETURNING id, first_name, last_name, phone, email, address, city, service_type, preferred_date, preferred_time, urgency, status, message, created_at
    `;

    return NextResponse.json({ inspection: result[0] }, { status: 201 });
  } catch (err) {
    console.error('[admin/inspections] POST error:', err);
    return NextResponse.json({ error: 'Failed to create inspection' }, { status: 500 });
  }
}
