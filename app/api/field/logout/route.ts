import { NextResponse } from 'next/server';
import { getFieldSession } from '@/lib/field-session';

export async function POST() {
  try {
    const session = await getFieldSession();
    session.destroy();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[field/logout] POST error:', err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
