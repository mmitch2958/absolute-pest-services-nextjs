'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Loader2, Calendar, MapPin, User, Clock, ChevronLeft, ChevronRight,
  LayoutGrid, List, ClipboardList, History, LogOut,
} from 'lucide-react';

interface Job {
  id: number;
  customer_name: string;
  client_id: number | null;
  client_name: string | null;
  site_location: string;
  site_address: string | null;
  serviced_area: string;
  work_performed: string;
  job_date: string;
  status: string;
  priority: string | null;
  admin_notes: string | null;
  employee_id: number | null;
  employee_name: string | null;
  scheduled_end_time: string | null;
  created_at: string;
}

interface Employee { id: number; name: string; }
interface EmployeeInfo { id: number; name: string; canManageEmployees: boolean; }

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700',
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  invoiced: 'bg-orange-100 text-orange-700',
  paid: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-gray-100 text-gray-500',
};
const statusColorFallback = 'bg-gray-100 text-gray-500';

const statusBarColor: Record<string, string> = {
  scheduled: 'bg-blue-500',
  pending: 'bg-amber-500',
  assigned: 'bg-cyan-500',
  in_progress: 'bg-indigo-500',
  completed: 'bg-green-500',
  invoiced: 'bg-orange-500',
  paid: 'bg-purple-500',
  cancelled: 'bg-gray-400',
};
const statusBarColorFallback = 'bg-gray-400';

// All statuses a job can be in — matching the shared field job-log lifecycle.
const STATUS_OPTIONS = [
  'scheduled', 'pending', 'assigned', 'in_progress', 'completed', 'invoiced', 'paid', 'cancelled',
];

function formatLabel(s: string) {
  return s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function FieldNav({ active }: { active: string }) {
  const router = useRouter();
  async function logout() {
    await fetch('/api/field/logout', { method: 'POST' });
    localStorage.removeItem('fieldEmployee');
    router.push('/field');
  }
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        <button onClick={() => router.push('/field/log')}
          className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl ${active === '/field/log' ? 'text-green-600' : 'text-slate-400'}`}>
          <ClipboardList className="w-5 h-5" /><span className="text-xs font-medium">Log Job</span>
        </button>
        <button onClick={() => router.push('/field/schedule')}
          className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl ${active === '/field/schedule' ? 'text-green-600' : 'text-slate-400'}`}>
          <Calendar className="w-5 h-5" /><span className="text-xs font-medium">Schedule</span>
        </button>
        <button onClick={() => router.push('/field/history')}
          className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl ${active === '/field/history' ? 'text-green-600' : 'text-slate-400'}`}>
          <History className="w-5 h-5" /><span className="text-xs font-medium">History</span>
        </button>
        <button onClick={logout} className="flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl text-slate-400">
          <LogOut className="w-5 h-5" /><span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}

// ─── Calendar grid helpers ──────────────────────────────────────────────
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1); }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
function isoDay(d: Date) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function jobIsoDay(j: Job) { return isoDay(new Date(j.job_date)); }

function CalendarView({ jobs, monthAnchor, onPrev, onNext, onToday, onJobClick }: {
  jobs: Job[];
  monthAnchor: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onJobClick: (j: Job) => void;
}) {
  const monthLabel = monthAnchor.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const todayIso = isoDay(new Date());

  const cells = useMemo(() => {
    const first = startOfMonth(monthAnchor);
    const start = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [monthAnchor]);

  const jobsByDay = useMemo(() => {
    const map = new Map<string, Job[]>();
    for (const j of jobs) {
      const k = jobIsoDay(j);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(j);
    }
    return map;
  }, [jobs]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="p-1.5 rounded-lg hover:bg-gray-200" aria-label="Previous month"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={onToday} className="px-3 py-1 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-100">Today</button>
          <button onClick={onNext} className="p-1.5 rounded-lg hover:bg-gray-200" aria-label="Next month"><ChevronRight className="w-4 h-4" /></button>
        </div>
        <h3 className="font-semibold text-gray-900">{monthLabel}</h3>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} className="px-2 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wide text-center">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 grid-rows-6 auto-rows-fr">
        {cells.map((d, idx) => {
          const inMonth = d.getMonth() === monthAnchor.getMonth();
          const iso = isoDay(d);
          const dayJobs = jobsByDay.get(iso) || [];
          const isToday = iso === todayIso;
          return (
            <div key={idx}
              className={`border-r border-b border-gray-100 p-1.5 min-h-[96px] flex flex-col gap-1 ${
                inMonth ? 'bg-white' : 'bg-gray-50/50'
              }`}>
              <div className={`text-xs font-medium self-start px-1.5 py-0.5 rounded ${
                isToday ? 'bg-green-600 text-white' : inMonth ? 'text-gray-700' : 'text-gray-400'
              }`}>
                {d.getDate()}
              </div>
              <div className="flex flex-col gap-1 overflow-hidden">
                {dayJobs.slice(0, 3).map(j => (
                  <button key={j.id} onClick={() => onJobClick(j)}
                    className={`text-left text-[11px] leading-tight px-1.5 py-1 rounded text-white truncate hover:opacity-90 ${statusBarColor[j.status] || statusBarColorFallback}`}
                    title={`${j.customer_name} — ${j.serviced_area} (${j.status})${j.employee_name ? ' · ' + j.employee_name : ''}`}>
                    <span className="font-medium">{j.customer_name}</span>
                    {j.employee_name && <span className="opacity-80"> · {j.employee_name}</span>}
                  </button>
                ))}
                {dayJobs.length > 3 && (
                  <div className="text-[10px] text-gray-500 px-1">+{dayJobs.length - 3} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EditJobModal({ job, employees, onSave, onClose }: {
  job: Job;
  employees: Employee[];
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [employeeId, setEmployeeId] = useState(job.employee_id?.toString() || '');
  const [jobDate, setJobDate] = useState(job.job_date ? job.job_date.split('T')[0] : '');
  const [scheduledEndTime, setScheduledEndTime] = useState(job.scheduled_end_time ? job.scheduled_end_time.slice(0, 5) : '');
  const [status, setStatus] = useState(job.status || 'scheduled');
  const [priority, setPriority] = useState(job.priority || 'medium');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({
        employeeId: employeeId || null,
        jobDate,
        scheduledEndTime: scheduledEndTime || null,
        status,
        priority,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to save');
      setSaving(false);
    }
  }

  const fieldClass = "w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Edit Scheduled Job</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs font-semibold text-gray-500 uppercase">Job</p>
            <p className="text-sm font-medium text-gray-900 mt-0.5">{job.customer_name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{job.site_location}{job.site_address ? ` — ${job.site_address}` : ''}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Employee</label>
            <select value={employeeId} onChange={e => setEmployeeId(e.target.value)} className={fieldClass}>
              <option value="">Unassigned</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Date</label>
              <input type="date" value={jobDate} onChange={e => setJobDate(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input type="time" value={scheduledEndTime} onChange={e => setScheduledEndTime(e.target.value)} className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={fieldClass}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{formatLabel(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)} className={fieldClass}>
              {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{formatLabel(p)}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FieldSchedulePage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<EmployeeInfo | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [monthAnchor, setMonthAnchor] = useState(() => startOfMonth(new Date()));
  const [saveError, setSaveError] = useState('');

  // Auth gate: field session must be present, else redirect to PIN login.
  useEffect(() => {
    const stored = localStorage.getItem('fieldEmployee');
    if (!stored) { router.push('/field'); return; }
    try { setEmployee(JSON.parse(stored)); } catch { router.push('/field'); }
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    if (!employee) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (view === 'list' && dateFilter) params.set('date', dateFilter);
      const res = await fetch(`/api/field/scheduled-jobs?${params.toString()}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setJobs(data.jobs || []);
      setEmployees(data.employees || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [debouncedSearch, dateFilter, view, employee]);

  useEffect(() => { if (employee) fetchData(); }, [fetchData, employee]);

  async function handleSave(data: any) {
    setSaveError('');
    const res = await fetch(`/api/field/scheduled-jobs/${editingJob!.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body.message || 'Save failed');
    }
    setEditingJob(null);
    await fetchData();
  }

  const visibleJobs = useMemo(() => {
    if (view !== 'calendar') return jobs;
    const first = startOfMonth(monthAnchor);
    const last = addDays(startOfMonth(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1)), -1);
    return jobs.filter(j => {
      const d = new Date(j.job_date);
      return d >= addDays(first, -7) && d <= addDays(last, 7);
    });
  }, [jobs, monthAnchor, view]);

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">Field Schedule</h1>
          <p className="text-xs text-gray-500">{employee ? employee.name : ''}</p>
        </div>
        <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
          <button onClick={() => setView('calendar')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md inline-flex items-center gap-1.5 ${view === 'calendar' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <LayoutGrid className="w-4 h-4" /> Calendar
          </button>
          <button onClick={() => setView('list')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md inline-flex items-center gap-1.5 ${view === 'list' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            <List className="w-4 h-4" /> List
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4">
        <div className="flex flex-col gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="search" placeholder="Search by customer, site..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          {view === 'list' && (
            <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
              className="px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-green-500" />
          )}
        </div>

        {saveError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">{saveError}</div>}

        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 py-20 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin inline" />
          </div>
        ) : view === 'calendar' ? (
          <>
            <CalendarView
              jobs={visibleJobs}
              monthAnchor={monthAnchor}
              onPrev={() => setMonthAnchor(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
              onNext={() => setMonthAnchor(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
              onToday={() => setMonthAnchor(startOfMonth(new Date()))}
              onJobClick={setEditingJob}
            />
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
              {Object.entries(statusBarColor).map(([k, v]) => (
                <span key={k} className="inline-flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded ${v}`} /> {formatLabel(k)}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Edit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.length === 0 ? (
                    <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No scheduled jobs found</td></tr>
                  ) : (
                    jobs.map(job => (
                      <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <span>{new Date(job.job_date).toLocaleDateString()}</span>
                          </div>
                          {job.scheduled_end_time && (
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>{job.scheduled_end_time.slice(0, 5)}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{job.customer_name}</div>
                          <div className="text-xs text-gray-500"><MapPin className="w-3 h-3 shrink-0 inline" /> {job.site_location}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                          {job.employee_name
                            ? <span className="inline-flex items-center gap-1"><User className="w-3 h-3" />{job.employee_name}</span>
                            : <span className="text-gray-400 text-xs">Unassigned</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[job.status] || statusColorFallback}`}>
                            {formatLabel(job.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setEditingJob(job)}
                            className="text-green-600 hover:text-green-800 text-xs font-medium">Edit</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          employees={employees}
          onSave={handleSave}
          onClose={() => setEditingJob(null)}
        />
      )}

      <FieldNav active="/field/schedule" />
    </div>
  );
}
