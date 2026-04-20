'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, ClipboardList, ChevronDown, ChevronUp, Trash2, MapPin, User, Calendar, DollarSign, FileText, Package, ExternalLink } from 'lucide-react';
import InvoicePrompt from '@/components/admin/InvoicePrompt';
import Link from 'next/link';

interface JobLog {
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
  amount: string | null;
  materials: any;
  created_at: string;
}

interface Employee { id: number; name: string; }

interface JobLogInvoice {
  id: number;
  invoiceNumber: string;
  status: string;
  total: string;
}

const statusColors: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  invoiced: 'bg-orange-100 text-orange-700 border-orange-200',
  paid: 'bg-purple-100 text-purple-700 border-purple-200',
  cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
};

const invoiceStatusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  viewed: 'bg-indigo-100 text-indigo-700',
  paid: 'bg-green-100 text-green-700',
  overdue: 'bg-red-100 text-red-700',
  void: 'bg-gray-100 text-gray-400',
};

const validStatuses = ['scheduled', 'in_progress', 'completed', 'invoiced', 'paid', 'cancelled'];

function formatStatus(s: string) {
  return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function formatDate(d: string) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMaterials(materials: any): string | null {
  if (!materials) return null;
  if (materials.type === 'product') {
    const vol = materials.volume ? ` — ${materials.volume} ${materials.unit}` : '';
    return `${materials.productName}${vol}`;
  }
  if (materials.type === 'supplies' && Array.isArray(materials.items) && materials.items.length > 0) {
    return materials.items.map((i: any) => `${i.name}${i.quantity ? ` ×${i.quantity}` : ''}`).join(', ');
  }
  return null;
}

function RowDetail({ log, employees, onStatusChange, onDelete, onInvoiceGenerated }: {
  log: JobLog;
  employees: Employee[];
  onStatusChange: (id: number, status: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onInvoiceGenerated: (invoiceId: number) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adminNotes, setAdminNotes] = useState(log.admin_notes || '');
  const [notesSaving, setNotesSaving] = useState(false);
  const [showInvoicePrompt, setShowInvoicePrompt] = useState(false);
  const [existingInvoice, setExistingInvoice] = useState<JobLogInvoice | null>(null);
  const [checkingInvoice, setCheckingInvoice] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState('');

  async function checkExistingInvoice() {
    setCheckingInvoice(true);
    try {
      const res = await fetch(`/api/admin/invoices?jobLogId=${log.id}`);
      const data = await res.json();
      const invoices: JobLogInvoice[] = data.invoices || [];
      if (invoices.length > 0) {
        setExistingInvoice(invoices[0]);
      } else {
        setExistingInvoice(null);
      }
    } catch {}
    finally { setCheckingInvoice(false); }
  }

  useEffect(() => {
    if (log.status === 'completed' || log.status === 'invoiced') {
      checkExistingInvoice();
    }
  }, [log.id, log.status]);

  async function handleStatus(newStatus: string) {
    const wasCompleted = log.status === 'completed';
    setSaving(true);
    try {
      await onStatusChange(log.id, newStatus);
      if (newStatus === 'completed' && wasCompleted === false) {
        setShowInvoicePrompt(true);
      }
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete job log for "${log.customer_name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try { await onDelete(log.id); } finally { setDeleting(false); }
  }

  async function handleSaveNotes() {
    setNotesSaving(true);
    try {
      await fetch(`/api/admin/job-logs/${log.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminNotes }),
      });
    } finally { setNotesSaving(false); }
  }

  async function handleGenerateInvoice() {
    setGenerating(true);
    setGenerateError('');
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);
      const res = await fetch(`/api/admin/invoices/from-job/${log.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: dueDate.toISOString() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.message || 'Failed to generate invoice.');
        return;
      }
      setShowInvoicePrompt(false);
      setExistingInvoice({ id: data.invoice.id, invoiceNumber: data.invoice.invoiceNumber, status: data.invoice.status, total: data.invoice.total });
      onInvoiceGenerated(data.invoice.id);
    } catch {
      setGenerateError('Failed to generate invoice. Please try again.');
    } finally { setGenerating(false); }
  }

  const materialsStr = formatMaterials(log.materials);

  return (
    <div className="bg-slate-50 border-t border-slate-200 px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1"><FileText className="w-3 h-3" />Work Performed</p>
          <p className="text-sm text-slate-800 whitespace-pre-wrap">{log.work_performed}</p>
        </div>
        {materialsStr && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1"><Package className="w-3 h-3" />Materials Used</p>
            <p className="text-sm text-slate-800">{materialsStr}</p>
          </div>
        )}
        {log.site_address && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Site Address</p>
            <p className="text-sm text-slate-800">{log.site_address}</p>
          </div>
        )}

        {/* Invoice History Section */}
        {(log.status === 'completed' || log.status === 'invoiced') && (
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-1"><FileText className="w-3 h-3" />Invoice</p>
            {checkingInvoice ? (
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" />Checking...
              </div>
            ) : existingInvoice ? (
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${invoiceStatusColors[existingInvoice.status] || 'bg-gray-100 text-gray-700'}`}>
                  {existingInvoice.invoiceNumber}
                </span>
                <a
                  href={`/admin/invoices/${existingInvoice.id}/preview`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-green-700 font-medium hover:text-green-900"
                >
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No invoice linked</p>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        {/* Invoice Prompt */}
        {showInvoicePrompt && (
          <InvoicePrompt
            jobLogId={log.id}
            existingInvoiceId={existingInvoice?.id}
            existingInvoiceNumber={existingInvoice?.invoiceNumber}
            onGenerated={(invoiceId) => {
              setShowInvoicePrompt(false);
              onInvoiceGenerated(invoiceId);
            }}
            onDismiss={() => setShowInvoicePrompt(false)}
          />
        )}

        {/* Generate Invoice Button */}
        {(log.status === 'completed' || log.status === 'invoiced') && !showInvoicePrompt && (
          <div className="flex gap-2">
            {existingInvoice ? (
              <a
                href={`/admin/invoices/${existingInvoice.id}/preview`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileText className="w-3 h-3" />
                View Invoice #{existingInvoice.invoiceNumber}
              </a>
            ) : (
              <button
                onClick={handleGenerateInvoice}
                disabled={generating}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {generating ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileText className="w-3 h-3" />}
                {generating ? 'Creating...' : 'Generate Invoice'}
              </button>
            )}
            {generateError && (
              <p className="text-xs text-red-600">{generateError}</p>
            )}
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Update Status</p>
          <div className="flex flex-wrap gap-1.5">
            {validStatuses.map(s => (
              <button
                key={s}
                disabled={saving || log.status === s}
                onClick={() => handleStatus(s)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-colors disabled:opacity-50 ${
                  log.status === s
                    ? (statusColors[s] || 'bg-gray-100 text-gray-500 border-gray-200') + ' ring-2 ring-offset-1 ring-current'
                    : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {saving && log.status !== s ? '' : formatStatus(s)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Admin Notes</p>
          <textarea
            value={adminNotes}
            onChange={e => setAdminNotes(e.target.value)}
            rows={3}
            className="w-full text-sm border border-slate-300 rounded-md p-2 resize-none focus:outline-none focus:ring-2 focus:ring-green-500/50"
            placeholder="Internal notes..."
          />
          <button
            onClick={handleSaveNotes}
            disabled={notesSaving}
            className="mt-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {notesSaving ? 'Saving…' : 'Save Notes'}
          </button>
        </div>

        <div className="flex justify-end pt-1">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JobLogsPage() {
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [jobInvoiceMap, setJobInvoiceMap] = useState<Record<number, JobLogInvoice>>({});

  const fetchLogs = useCallback(async (params?: { search?: string; status?: string; dateFrom?: string; dateTo?: string }) => {
    setLoading(true);
    setError('');
    try {
      const p = params ?? { search, status: statusFilter, dateFrom, dateTo };
      const qs = new URLSearchParams();
      if (p.search) qs.set('search', p.search);
      if (p.status) qs.set('status', p.status);
      if (p.dateFrom) qs.set('dateFrom', p.dateFrom);
      if (p.dateTo) qs.set('dateTo', p.dateTo);
      const res = await fetch(`/api/admin/job-logs?${qs}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLogs(data.logs || []);
      setEmployees(data.employees || []);
    } catch {
      setError('Failed to load job logs.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFrom, dateTo]);

  useEffect(() => { fetchLogs(); }, []);

  // Fetch invoices for all expanded or invoiced logs to show invoice column
  useEffect(() => {
    async function fetchInvoicesForLogs() {
      const relevantIds = logs.filter(l => l.status === 'invoiced' || l.status === 'completed').map(l => l.id);
      if (relevantIds.length === 0) return;
      const newMap: Record<number, JobLogInvoice> = {};
      for (const id of relevantIds) {
        try {
          const res = await fetch(`/api/admin/invoices?jobLogId=${id}`);
          const data = await res.json();
          const invs: JobLogInvoice[] = data.invoices || [];
          if (invs.length > 0) {
            newMap[id] = invs[0];
          }
        } catch {}
      }
      setJobInvoiceMap(prev => ({ ...prev, ...newMap }));
    }
    fetchInvoicesForLogs();
  }, [logs]);

  async function handleStatusChange(id: number, status: string) {
    const res = await fetch(`/api/admin/job-logs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Update failed');
    setLogs(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/job-logs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    setLogs(prev => prev.filter(l => l.id !== id));
    if (expandedId === id) setExpandedId(null);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchLogs({ search, status: statusFilter, dateFrom, dateTo });
  }

  function handleInvoiceGenerated(invoiceId: number) {
    // Refresh expanded log
    if (expandedId) {
      setExpandedId(null);
      setTimeout(() => setExpandedId(expandedId), 50);
    }
  }

  const totalAmount = logs.reduce((sum, l) => sum + parseFloat(l.amount || '0'), 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Job Log</h1>
            <p className="text-sm text-slate-500">{logs.length} entries{logs.length > 0 && ` · $${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total`}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search customer, location…"
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          >
            <option value="">All statuses</option>
            {validStatuses.map(s => <option key={s} value={s}>{formatStatus(s)}</option>)}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/50"
          />
        </div>
        <div className="flex gap-2 mt-3">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : 'Search'}
          </button>
          <button
            type="button"
            onClick={() => {
              setSearch(''); setStatusFilter(''); setDateFrom(''); setDateTo('');
              fetchLogs({ search: '', status: '', dateFrom: '', dateTo: '' });
            }}
            className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 font-medium text-slate-600"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {error && (
          <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-sm text-red-600">{error}</div>
        )}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-slate-400" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <ClipboardList className="w-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">No job logs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Header */}
            <div className="hidden md:grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_80px_40px] gap-3 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Location / Area</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Amount</span>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Invoice</span>
              <span />
            </div>

            {logs.map(log => (
              <div key={log.id}>
                <button
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className="w-full text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr_1fr_80px_40px] gap-x-3 gap-y-1 px-4 py-3 items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{log.customer_name}</p>
                      {log.client_name && log.client_name !== log.customer_name && (
                        <p className="text-xs text-slate-400">{log.client_name}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {log.site_location}
                      </p>
                      <p className="text-xs text-slate-400 ml-4">{log.serviced_area}</p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <Calendar className="w-3 h-3 text-slate-400 md:hidden lg:block" />
                      {formatDate(log.job_date)}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-slate-600">
                      <User className="w-3 h-3 text-slate-400 md:hidden lg:block" />
                      {log.employee_name || <span className="text-slate-400 italic">Unassigned</span>}
                    </div>
                    <div>
                      <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium ${statusColors[log.status] || 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                        {formatStatus(log.status || 'completed')}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                      <DollarSign className="w-3 h-3 text-slate-400" />
                      {log.amount ? parseFloat(log.amount).toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
                    </div>
                    <div>
                      {jobInvoiceMap[log.id] ? (
                        <a
                          href={`/admin/invoices/${jobInvoiceMap[log.id].id}/preview`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-700 font-medium hover:text-blue-900"
                        >
                          <FileText className="w-3 h-3" />
                          {jobInvoiceMap[log.id].invoiceNumber}
                        </a>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </div>
                    <div className="flex justify-end">
                      {expandedId === log.id
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />
                      }
                    </div>
                  </div>
                </button>

                {expandedId === log.id && (
                  <RowDetail
                    log={log}
                    employees={employees}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    onInvoiceGenerated={handleInvoiceGenerated}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
