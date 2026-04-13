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
const { PATCH, DELETE } = await import('@/api/admin/job-logs/[id]/route');

describe('PATCH /api/admin/job-logs/:id — status transitions', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const validStatuses = ['scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'cancelled'];

  it.each(validStatuses)('should accept valid status: %s', async (status) => {
    vi.mocked(sql).mockResolvedValue([{ id: 1, status }] as any);
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest('http://localhost/api/admin/job-logs/1', {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(200);
  });

  it('should reject invalid status with 400', async () => {
    vi.mocked(sql).mockResolvedValue([] as any);
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest('http://localhost/api/admin/job-logs/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalid_status' }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(400);
  });

  it('should allow status-only update', async () => {
    vi.mocked(sql).mockResolvedValue([{ id: 1, status: 'completed' }] as any);
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest('http://localhost/api/admin/job-logs/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(200);
  });

  it('should allow adminNotes-only update', async () => {
    vi.mocked(sql).mockResolvedValue([{ id: 1, admin_notes: 'Note here' }] as any);
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest('http://localhost/api/admin/job-logs/1', {
      method: 'PATCH',
      body: JSON.stringify({ adminNotes: 'Note here' }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(200);
  });

  it('should return 400 for invalid job log ID', async () => {
    vi.mocked(sql).mockResolvedValue([] as any);
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest('http://localhost/api/admin/job-logs/abc', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: 'abc' }) });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/admin/job-logs/:id — authorization', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should allow admin to delete any job log', async () => {
    vi.mocked(sql).mockResolvedValue([] as any);
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest('http://localhost/api/admin/job-logs/1', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });

  it('should return 401 when non-admin tries to delete', async () => {
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 99, role: 'field_employee', name: 'Not Admin' });

    const req = new NextRequest('http://localhost/api/admin/job-logs/1', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: '1' }) });
    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid job log ID on delete', async () => {
    const { getAdminSession } = await import('@/lib/admin-session');
    vi.mocked(getAdminSession).mockResolvedValueOnce({ userId: 1, role: 'admin', name: 'Admin User' });

    const req = new NextRequest('http://localhost/api/admin/job-logs/xyz', { method: 'DELETE' });
    const res = await DELETE(req, { params: Promise.resolve({ id: 'xyz' }) });
    expect(res.status).toBe(400);
  });
});
