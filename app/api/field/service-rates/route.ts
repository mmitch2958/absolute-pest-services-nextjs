import { NextResponse } from 'next/server';
import { getFieldSession } from '@/lib/field-session';
import { sql } from '@/lib/db';

export async function GET() {
  try {
    const session = await getFieldSession();
    if (!session.employeeId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const rates = await sql`
      SELECT id, name, description, default_rate AS "defaultRate"
      FROM service_rates
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `;

    return NextResponse.json({ success: true, rates });
  } catch (err) {
    console.error('[field/service-rates] GET error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
