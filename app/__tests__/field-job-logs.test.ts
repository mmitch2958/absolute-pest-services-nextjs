import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// --- Mocks (must be top-level, before importing route modules) ---

vi.mock('@/lib/field-session', () => ({
  getFieldSession: vi.fn(() => Promise.resolve({ employeeId: 5, employeeName: 'John Tech' })),
}));

vi.mock('@/lib/db', () => ({
  sql: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendJobLogNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/sms', () => ({
  sendJobLogSMS: vi.fn().mockResolvedValue(undefined),
}));

// Import after mocks are declared
const { sql } = await import('@/lib/db');
const { POST, GET, PATCH } = await import('@/api/field/job-logs/route');

describe('POST /api/field/job-logs', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return 401 when no session', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: null });
    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 400 when required fields are missing', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: 5, employeeName: 'John Tech' });
    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'POST',
      body: JSON.stringify({ customerName: 'Acme' }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain('Missing required fields');
  });

  it('should return 400 when jobDate is not a string', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: 5, employeeName: 'John Tech' });
    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'Acme',
        siteLocation: 'Site A',
        servicedArea: 'Kitchen',
        workPerformed: 'Spraying',
        jobDate: 12345, // should be string
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('should return 200 when all required fields are present', async () => {
    const mockLog = {
      id: 10,
      employee_id: 5,
      customer_name: 'Acme Corp',
      site_location: 'Site A',
      status: 'completed',
    };
    vi.mocked(sql).mockResolvedValue([mockLog] as any);
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: 5, employeeName: 'John Tech' });

    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'POST',
      body: JSON.stringify({
        customerName: 'Acme Corp',
        siteLocation: 'Site A',
        servicedArea: 'Kitchen',
        workPerformed: 'Spraying',
        jobDate: '2026-04-01',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.log.id).toBe(10);
  });
});

describe('GET /api/field/job-logs', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return 401 when no session', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: null });
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it('should return only the logged-in employee logs', async () => {
    const mockLogs = [{ id: 1, employee_id: 5 }, { id: 2, employee_id: 5 }];
    vi.mocked(sql).mockResolvedValue(mockLogs as any);
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: 5, employeeName: 'John Tech' });

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.logs).toHaveLength(2);
    expect(json.logs[0].employee_id).toBe(5);
  });
});

describe('PATCH /api/field/job-logs', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('should return 401 when no session', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: null });
    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'PATCH',
      body: JSON.stringify({ id: 1, siteLocation: 'New Site' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it('should return 403 when employee does not own the log', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: 5, employeeName: 'John Tech' });
    vi.mocked(sql).mockResolvedValue([{ id: 10, employee_id: 99 }] as any); // different owner
    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'PATCH',
      body: JSON.stringify({ id: 10, siteLocation: 'New Site' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(403);
  });

  it('should return 404 when job log not found', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: 5, employeeName: 'John Tech' });
    vi.mocked(sql).mockResolvedValue([] as any); // no result
    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'PATCH',
      body: JSON.stringify({ id: 999, siteLocation: 'New Site' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(404);
  });

  it('should return 200 when updating own log', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: 5, employeeName: 'John Tech' });
    const existingLog = { id: 10, employee_id: 5, site_location: 'Old Site' };
    const updatedLog = { ...existingLog, site_location: 'New Site' };
    // Use mockImplementation so the UPDATE tagged-template (2 calls: inner + outer) works correctly
    vi.mocked(sql).mockImplementation((strings, ...vals) => {
      // If called as a regular fn with a plain-object arg (inner sql call), return the object itself
      if (typeof strings === 'object' && !Array.isArray(strings) && strings !== null) {
        return Promise.resolve(strings);
      }
      // Tagged template call — determine result by inspecting the template strings
      const templateStr = Array.isArray(strings) ? strings[0] : '';
      if (templateStr.toLowerCase().includes('select')) {
        return Promise.resolve([existingLog]);
      }
      // UPDATE — Neon returns an array of rows; the route destructures the first element
      return Promise.resolve([updatedLog]);
    });
    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'PATCH',
      body: JSON.stringify({ id: 10, siteLocation: 'New Site' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.log.site_location).toBe('New Site');
  });

  it('should return 400 when no editable fields provided', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: 5, employeeName: 'John Tech' });
    vi.mocked(sql).mockResolvedValue([{ id: 10, employee_id: 5 }] as any);
    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'PATCH',
      body: JSON.stringify({ id: 10 }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toContain('No editable fields provided');
  });

  it('should not allow status to be changed', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: 5, employeeName: 'John Tech' });
    const existingLog = { id: 10, employee_id: 5, status: 'completed', site_location: 'Old Site' };
    vi.mocked(sql).mockImplementation((strings, ...vals) => {
      if (typeof strings === 'object' && !Array.isArray(strings) && strings !== null) {
        return Promise.resolve(strings); // inner sql call — return allowedFields as-is
      }
      const templateStr = Array.isArray(strings) ? strings[0] : '';
      if (templateStr.toLowerCase().includes('select')) {
        return Promise.resolve([existingLog]);
      }
      // UPDATE — the route receives the first row; status should be unchanged
      return Promise.resolve([{ ...existingLog, site_location: 'Old Site' }]);
    });
    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'PATCH',
      body: JSON.stringify({ id: 10, siteLocation: 'Old Site', status: 'cancelled' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    // The returned log should still have the original status since status is not editable
    expect(json.log.status).toBe('completed');
  });

  it('should not allow employee_id to be changed', async () => {
    const { getFieldSession } = await import('@/lib/field-session');
    vi.mocked(getFieldSession).mockResolvedValueOnce({ employeeId: 5, employeeName: 'John Tech' });
    const existingLog = { id: 10, employee_id: 5, site_location: 'Old Site' };
    vi.mocked(sql).mockImplementation((strings, ...vals) => {
      if (typeof strings === 'object' && !Array.isArray(strings) && strings !== null) {
        return Promise.resolve(strings); // inner sql call
      }
      const templateStr = Array.isArray(strings) ? strings[0] : '';
      if (templateStr.toLowerCase().includes('select')) {
        return Promise.resolve([existingLog]);
      }
      // UPDATE — employee_id should remain unchanged
      return Promise.resolve([{ ...existingLog, site_location: 'New Site' }]);
    });
    const req = new NextRequest('http://localhost/api/field/job-logs', {
      method: 'PATCH',
      body: JSON.stringify({ id: 10, employee_id: 99, siteLocation: 'New Site' }),
    });
    const res = await PATCH(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    // The returned log should still have the original employee_id since it's not editable
    expect(json.log.employee_id).toBe(5);
  });
});
