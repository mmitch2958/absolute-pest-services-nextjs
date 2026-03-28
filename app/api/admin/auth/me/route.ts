import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';

export async function GET() {
  try {
    const session = await getAdminSession();

    if (!session.userId || session.role !== 'admin') {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
        role: session.role,
      },
    });
  } catch (err) {
    console.error('[admin/auth/me] GET error:', err);
    return NextResponse.json({ user: null });
  }
}
