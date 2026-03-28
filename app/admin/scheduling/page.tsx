'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Calendar, MapPin, User, Clock } from 'lucide-react';

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

const priorityColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  assigned: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

function AssignModal({ job, employees, onSave, onClose }: {
  job: Job;
  employees: Employee[];
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
}) {
  const [employeeId, setEmployeeId] = useState(job.employee_id || '');
  const [jobDate, setJobDate] = useState(job.job_date ? job.job_date.split('T')[0] : '');
  const [scheduledEndTime, setScheduledEndTime] = useState(job.scheduled_end_time ? job.scheduled_end_time.slice(0, 5) : '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await onSave({ employeeId: employeeId || null, jobDate, scheduledEndTime: scheduledEndTime || null });
    } catch (err: any) {
      setError(err.message || 'Failed to save');
      setSaving(false);
    }
  }

  const fieldClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Assign & Schedule Job</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

export default function SchedulingPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [assigningJob, setAssigningJob] = useState<Job | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (dateFilter) params.set('date', dateFilter);
      const res = await fetch(`/api/admin/scheduled-jobs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setJobs(data.jobs || []);
      setEmployees(data.employees || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [debouncedSearch, dateFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleAssignSave(data: any) {
    const res = await fetch(`/api/admin/scheduled-jobs/${assigningJob!.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Save failed');
    }
    setAssigningJob(null);
    await fetchData();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Field Scheduling</h1>
          <p className="text-sm text-gray-500 mt-1">{jobs.length} scheduled jobs</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="search" placeholder="Search by customer, site..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">Address</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden md:table-cell">Service Area</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Employee</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin inline" /></td></tr>
              ) : jobs.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400">No scheduled jobs found</td></tr>
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
                    <td className="px-4 py-3 font-medium text-gray-900">{job.customer_name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">
                      <div className="flex items-start gap-1"><MapPin className="w-3 h-3 shrink-0 mt-0.5" />{job.site_location}</div>
                      {job.site_address && <span className="text-gray-400 ml-4">{job.site_address}</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs hidden md:table-cell">{job.serviced_area}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${priorityColors[job.priority || 'medium']}`}>
                        {job.priority || 'medium'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {job.employee_name
                        ? <span className="inline-flex items-center gap-1"><User className="w-3 h-3" />{job.employee_name}</span>
                        : <span className="text-gray-400 text-xs">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[job.status]}`}>
                        {job.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setAssigningJob(job)}
                        className="text-green-600 hover:text-green-800 text-xs font-medium">Assign</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {assigningJob && (
        <AssignModal
          job={assigningJob}
          employees={employees}
          onSave={handleAssignSave}
          onClose={() => setAssigningJob(null)}
        />
      )}
    </div>
  );
}
