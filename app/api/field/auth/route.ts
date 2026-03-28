import { NextRequest, NextResponse } from 'next/server';
import { getFieldSession } from '@/lib/field-session';
import { sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { pin } = await request.json();
    if (!pin) {
      return NextResponse.json({ success: false, message: 'PIN is required' }, { status: 400 });
    }

    const [employee] = await sql`
      SELECT id, name, pin, is_active, can_manage_employees
      FROM field_employees
      WHERE pin = ${pin} AND is_active = true
      LIMIT 1
    `;

    if (!employee) {
      return NextResponse.json({ success: false, message: 'Invalid PIN' }, { status: 401 });
    }

    const session = await getFieldSession();
    session.employeeId = employee.id;
    session.employeeName = employee.name;
    session.canManageEmployees = employee.can_manage_employees;
    await session.save();

    return NextResponse.json({
      success: true,
      employee: {
        id: employee.id,
        name: employee.name,
        canManageEmployees: employee.can_manage_employees,
      },
    });
  } catch (err) {
    console.error('[field/auth] POST error:', err);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
