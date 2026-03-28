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

    let countQuery: any;
    let dataQuery: any;

    if (search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      countQuery = await sql`
        SELECT COUNT(*) as total FROM clients
        WHERE name ILIKE ${searchPattern}
           OR email ILIKE ${searchPattern}
      `;
      dataQuery = await sql`
        SELECT id, name, email, phone, address, contact_person, property_type,
               client_type, status, notes, review_opt_out, created_at, updated_at
        FROM clients
        WHERE name ILIKE ${searchPattern}
           OR email ILIKE ${searchPattern}
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      countQuery = await sql`SELECT COUNT(*) as total FROM clients`;
      dataQuery = await sql`
        SELECT id, name, email, phone, address, contact_person, property_type,
               client_type, status, notes, review_opt_out, created_at, updated_at
        FROM clients
        ORDER BY created_at DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    const total = parseInt(countQuery[0]?.total || '0', 10);

    return NextResponse.json({
      clients: dataQuery,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[admin/clients] GET error:', err);
    return NextResponse.json({ error: 'Failed to load clients' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAdmin();
  if (authError) return authError;

  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      address,
      contactPerson,
      propertyType,
      clientType,
      status,
      notes,
      reviewOptOut,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO clients (name, email, phone, address, contact_person, property_type, client_type, status, notes, review_opt_out)
      VALUES (
        ${name.trim()},
        ${email || null},
        ${phone || null},
        ${address || null},
        ${contactPerson || null},
        ${propertyType || 'residential'},
        ${clientType || 'prospect'},
        ${status || 'active'},
        ${notes || null},
        ${reviewOptOut || false}
      )
      RETURNING id, name, email, phone, address, contact_person, property_type, client_type, status, notes, review_opt_out, created_at, updated_at
    `;

    return NextResponse.json({ client: result[0] }, { status: 201 });
  } catch (err) {
    console.error('[admin/clients] POST error:', err);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
