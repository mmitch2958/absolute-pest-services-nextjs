import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';

export async function POST() {
  try {
    const session = await getAdminSession();
    session.destroy();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/auth/logout] POST error:', err);
    return NextResponse.json({ error: 'Failed to logout' }, { status: 500 });
  }
}
