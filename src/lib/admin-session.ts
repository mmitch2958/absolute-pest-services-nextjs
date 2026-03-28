import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface AdminSessionData {
  userId?: number;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export async function getAdminSession() {
  const session = await getIronSession<AdminSessionData>(await cookies(), {
    password: process.env.SESSION_SECRET!,
    cookieName: 'aps_admin_session',
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
  });
  return session;
}
