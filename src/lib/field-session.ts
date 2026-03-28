import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface FieldSessionData {
  employeeId?: number;
  employeeName?: string;
  canManageEmployees?: boolean;
}

export async function getFieldSession() {
  const session = await getIronSession<FieldSessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: 'aps_field_session',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  });
  return session;
}
