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
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = 20;
    const offset = (page - 1) * limit;

    if (search.trim()) {
      const pattern = `%${search.trim()}%`;
      const rows = await sql`
        SELECT id, first_name, last_name, phone, email, city, service_type, message, created_at
        FROM contact_submissions
        WHERE first_name ILIKE ${pattern}
           OR last_name ILIKE ${pattern}
           OR city ILIKE ${pattern}
           OR service_type ILIKE ${pattern}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
      const count = await sql`
        SELECT COUNT(*) as total FROM contact_submissions
        WHERE first_name ILIKE ${pattern}
           OR last_name ILIKE ${pattern}
           OR city ILIKE ${pattern}
           OR service_type ILIKE ${pattern}
      `;
      const total = parseInt(count[0]?.total || '0', 10);
      return NextResponse.json({
        submissions: rows,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    const rows = await sql`
      SELECT id, first_name, last_name, phone, email, city, service_type, message, created_at
      FROM contact_submissions
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    const count = await sql`SELECT COUNT(*) as total FROM contact_submissions`;
    const total = parseInt(count[0]?.total || '0', 10);
    return NextResponse.json({
      submissions: rows,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[admin/service-requests] GET error:', err);
    return NextResponse.json({ error: 'Failed to load service requests' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const { firstName, lastName, phone, email, city, serviceType, message } = body;

    if (!firstName?.trim() || !lastName?.trim() || !phone?.trim() || !email?.trim() || !city?.trim() || !serviceType?.trim()) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO contact_submissions (first_name, last_name, phone, email, city, service_type, message)
      VALUES (${firstName.trim()}, ${lastName.trim()}, ${phone.trim()}, ${email.trim()}, ${city.trim()}, ${serviceType.trim()}, ${message?.trim() || null})
      RETURNING id, first_name, last_name, phone, email, city, service_type, message, created_at
    `;

    return NextResponse.json({ submission: result[0] }, { status: 201 });
  } catch (err) {
    console.error('[admin/service-requests] POST error:', err);
    return NextResponse.json({ error: 'Failed to create service request' }, { status: 500 });
  }
}
