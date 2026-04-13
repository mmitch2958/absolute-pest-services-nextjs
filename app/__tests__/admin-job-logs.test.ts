import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@/lib/admin-session', () => ({
  getAdminSession: vi.fn(() =>
    Promise.resolve({ userId: 1, role: 'admin', name: 'Admin User' })
  ),
}));

vi.mock('@/lib/db', () => ({
  sql: vi.fn(),
}));

const { sql } = await import('@/lib/db');
const { GET } = await import('@/api/admin/job-logs/route');

describe('GET /api/admin/job-logs — filter combinations', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should apply search filter only', async () => {
    vi.mocked(sql).mockResolvedValue([] as any);
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest('http://localhost/api/admin/job-logs?search=brown');
    await GET(req);

    expect(sql).toHaveBeenCalled();
    const callArgs = vi.mocked(sql).mock.calls[0]?.[0];
    expect(String(callArgs).toLowerCase()).toContain('customer_name ilike');
  });

  it('should apply search + status filters together', async () => {
    vi.mocked(sql).mockResolvedValue([] as any);
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest('http://localhost/api/admin/job-logs?search=brown&status=completed');
    await GET(req);

    expect(sql).toHaveBeenCalled();
    const queryParts = vi.mocked(sql).mock.calls.map(c => String(c[0]).toLowerCase());
    const fullQuery = queryParts.join(' ');
    // Both search (ILIKE) and status should appear in the query
    expect(fullQuery).toContain('ilike');
    expect(fullQuery).toContain('status');
  });

  it('should apply search + status + dateFrom + dateTo together', async () => {
    vi.mocked(sql).mockResolvedValue([] as any);
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest(
      'http://localhost/api/admin/job-logs?search=jones&status=invoiced&dateFrom=2026-02-01&dateTo=2026-02-28'
    );
    await GET(req);

    expect(sql).toHaveBeenCalled();
    const queryParts = vi.mocked(sql).mock.calls.map(c => String(c[0]).toLowerCase());
    const fullQuery = queryParts.join(' ');
    // All four filters should appear
    expect(fullQuery).toContain('ilike');
    expect(fullQuery).toContain('status');
    expect(fullQuery).toContain('job_date');
  });

  it('should return all logs when no filters provided', async () => {
    vi.mocked(sql).mockResolvedValue([{ id: 1 }, { id: 2 }] as any);
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest('http://localhost/api/admin/job-logs');
    const res = await GET(req);
    expect(res.status).toBe(200);
  });

  it('should return 401 when not admin', async () => {
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 99, role: 'field_employee', name: 'Not Admin' });

    const req = new NextRequest('http://localhost/api/admin/job-logs');
    const res = await GET(req);
    expect(res.status).toBe(401);
  });
});
