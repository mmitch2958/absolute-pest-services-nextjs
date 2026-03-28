import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getAdminSession } from '@/lib/admin-session';
import { sql } from '@/lib/db';

interface AdminUser {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { email?: string; password?: string };
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const users = await sql`
      SELECT id, email, password, first_name, last_name, phone, address, role, is_active
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = users[0] as AdminUser;

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 401 });
    }

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied. Admin access required.' }, { status: 403 });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
