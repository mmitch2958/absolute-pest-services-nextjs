import { NextRequest, NextResponse } from 'next/server';
import { getAdminSession } from '@/lib/admin-session';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const s = await getAdminSession();
  if (!s.userId || s.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

function getAuth() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    const oauth2 = new google.auth.OAuth2(clientId, clientSecret);
    oauth2.setCredentials({ refresh_token: refreshToken });
    return oauth2;
  }

  const json = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const credentials = JSON.parse(json);
    return new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
    });
  }

  return null;
}

export async function GET(request: NextRequest) {
  const err = await requireAdmin();
  if (err) return err;

  const site = process.env.SEARCH_CONSOLE_SITE_URL;
  const auth = getAuth();

  if (!auth || !site) {
    return NextResponse.json({
      configured: false,
      message: 'Connect Google Search Console: add OAuth credentials (GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_REFRESH_TOKEN) and SEARCH_CONSOLE_SITE_URL secrets.',
    });
  }

  const url = new URL(request.url);
  const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get('days') || '30', 10)));

  try {
    const sc = google.searchconsole({ version: 'v1', auth });

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const [totals, byQuery, byPage, byDay] = await Promise.all([
      sc.searchanalytics.query({
        siteUrl: site,
        requestBody: { startDate: fmt(start), endDate: fmt(end), dimensions: [], rowLimit: 1 },
      }),
      sc.searchanalytics.query({
        siteUrl: site,
        requestBody: { startDate: fmt(start), endDate: fmt(end), dimensions: ['query'], rowLimit: 25 },
      }),
      sc.searchanalytics.query({
        siteUrl: site,
        requestBody: { startDate: fmt(start), endDate: fmt(end), dimensions: ['page'], rowLimit: 15 },
      }),
      sc.searchanalytics.query({
        siteUrl: site,
        requestBody: { startDate: fmt(start), endDate: fmt(end), dimensions: ['date'], rowLimit: 200 },
      }),
    ]);

    const t = totals.data.rows?.[0];
    return NextResponse.json({
      configured: true,
      windowDays: days,
      site,
      totals: {
        clicks: t?.clicks ?? 0,
        impressions: t?.impressions ?? 0,
        ctr: t?.ctr ?? 0,
        position: t?.position ?? 0,
      },
      topQueries: (byQuery.data.rows || []).map(r => ({
        query: r.keys?.[0] ?? '',
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        ctr: r.ctr ?? 0,
        position: r.position ?? 0,
      })),
      topPages: (byPage.data.rows || []).map(r => ({
        page: r.keys?.[0] ?? '',
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
        position: r.position ?? 0,
      })),
      daily: (byDay.data.rows || []).map(r => ({
        date: r.keys?.[0] ?? '',
        clicks: r.clicks ?? 0,
        impressions: r.impressions ?? 0,
      })),
    });
  } catch (e: any) {
    console.error('[search-console]', e?.message || e);
    return NextResponse.json({
      configured: false,
      error: e?.message || 'Failed to query Search Console',
      hint: 'Verify OAuth credentials are correct, and that SEARCH_CONSOLE_SITE_URL matches the verified property exactly (e.g. "sc-domain:example.com" for domain-verified, or full URL with trailing slash for URL-prefix verified).',
    }, { status: 500 });
  }
}
