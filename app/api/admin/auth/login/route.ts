import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Look up user by email
    const users = await sql`
      SELECT id, email, password, first_name, last_name, phone, address, role, is_active
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0];

    // Check if user is active
    if (!user.is_active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin access required.' }, { status: 403 });
    }

    // Verify password — plain-text comparison (assumes passwords stored in plain text in DB)
    const valid = user.password === password;

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Set session
    const session = await getAdminSession();
    session.userId = user.id;
    session.email = user.email;
    session.firstName = user.first_name;
    session.lastName = user.last_name;
    session.role = user.role;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[admin/auth/login] POST error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
