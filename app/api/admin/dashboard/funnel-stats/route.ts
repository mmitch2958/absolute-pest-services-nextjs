import { NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const s = await getAdminSession();
  if (!s.userId || s.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

/**
 * GET /api/admin/dashboard/funnel-stats
 * Aggregates conversion / lead data from local tables.
 * Used by the Google Ads + SEO summary pages.
 *
 * Query: ?days=30 (default 30, max 365)
 */
export async function GET(request: Request) {
  const err = await requireAdmin();
  if (err) return err;

  const url = new URL(request.url);
  const days = Math.min(365, Math.max(1, parseInt(url.searchParams.get('days') || '30', 10)));

  try {
    // Run all aggregates in parallel.
    // NOTE: interval is built via make_interval(days => $1) for clean parameter binding.
    const [contacts, inspections, contactsBySvc, contactsByCity, contactsDaily, contractsTotal, jobsTotal, invoicesTotal] = await Promise.all([
      sql`SELECT COUNT(*)::int AS n FROM contact_submissions WHERE created_at > NOW() - INTERVAL '1 day' * ${days}`,
      sql`SELECT COUNT(*)::int AS n FROM inspection_schedules WHERE created_at > NOW() - INTERVAL '1 day' * ${days}`,
      sql`
        SELECT service_type AS label, COUNT(*)::int AS n
        FROM contact_submissions
        WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
        GROUP BY service_type ORDER BY n DESC LIMIT 8
      `,
      sql`
        SELECT city AS label, COUNT(*)::int AS n
        FROM contact_submissions
        WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
        GROUP BY city ORDER BY n DESC LIMIT 10
      `,
      sql`
        SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS day, COUNT(*)::int AS n
        FROM contact_submissions
        WHERE created_at > NOW() - INTERVAL '1 day' * ${days}
        GROUP BY day ORDER BY day
      `,
      sql`SELECT COUNT(*)::int AS n FROM service_contracts WHERE is_active = true`,
      sql`SELECT COUNT(*)::int AS n FROM job_logs WHERE job_date > NOW() - INTERVAL '1 day' * ${days}`,
      sql`SELECT COALESCE(SUM(total),0)::float AS revenue, COUNT(*)::int AS n FROM invoices WHERE status IN ('paid','sent','viewed') AND created_at > NOW() - INTERVAL '1 day' * ${days}`,
    ]);

    return NextResponse.json({
      windowDays: days,
      contactSubmissions: (contacts as any[])[0]?.n ?? 0,
      inspectionsScheduled: (inspections as any[])[0]?.n ?? 0,
      activeContracts: (contractsTotal as any[])[0]?.n ?? 0,
      jobsCompleted: (jobsTotal as any[])[0]?.n ?? 0,
      invoicesIssued: (invoicesTotal as any[])[0]?.n ?? 0,
      revenue: (invoicesTotal as any[])[0]?.revenue ?? 0,
      bySvc: contactsBySvc,
      byCity: contactsByCity,
      daily: contactsDaily,
    });
  } catch (e: any) {
    console.error('[funnel-stats]', e);
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 });
  }
}
