'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, CheckCircle, XCircle, Loader2, Calendar, Clock } from 'lucide-react';

interface Inspection {
  id: number;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  service_type: string | null;
  preferred_date: string | null;
  preferred_time: string | null;
  urgency: string | null;
  status: string | null;
  message: string | null;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const urgencyColors: Record<string, string> = {
  low: 'bg-blue-100 text-blue-700',
  medium: 'bg-amber-100 text-amber-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

function AddModal({ onSave, onClose }: { onSave: (data: any) => Promise<void>; onClose: () => void }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', email: '',
    address: '', city: '', serviceType: '',
    preferredDate: '', preferredTime: '', urgency: 'medium', message: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.phone || !form.email || !form.address || !form.city || !form.serviceType) {
      setError('All required fields must be filled');
      return;
    }
    setSaving(true);
    setError('');
    try { await onSave(form); }
    catch (err: any) { setError(err.message || 'Failed to save'); setSaving(false); }
  }

  const fieldClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Schedule Inspection</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label><input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} className={fieldClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label><input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} className={fieldClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={fieldClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Email *</label><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={fieldClass} /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className={fieldClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">City *</label><input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className={fieldClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label><input value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})} className={fieldClass} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label><input type="date" value={form.preferredDate} onChange={e => setForm({...form, preferredDate: e.target.value})} className={fieldClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label><input value={form.preferredTime} onChange={e => setForm({...form, preferredTime: e.target.value})} className={fieldClass} placeholder="e.g. Morning" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
            <select value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})} className={fieldClass}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} value={form.message} onChange={e => setForm({...form, message: e.target.value})} className={fieldClass + ' resize-none'} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Scheduling...' : 'Schedule Inspection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditModal({ inspection, onSave, onClose, onDelete }: {
  inspection: Inspection;
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const [form, setForm] = useState({
    status: inspection.status || 'pending',
    preferredDate: inspection.preferred_date ? inspection.preferred_date.split('T')[0] : '',
    preferredTime: inspection.preferred_time || '',
    urgency: inspection.urgency || 'medium',
    message: inspection.message || '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try { await onSave(form); }
    catch (err: any) { setError(err.message || 'Failed to save'); setSaving(false); }
  }

  async function handleDelete() {
    setDeleting(true);
    await onDelete(inspection.id);
  }

  const fieldClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Inspection Details</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs font-semibold text-gray-500 uppercase">Customer</p><p className="text-sm font-medium text-gray-900 mt-0.5">{inspection.first_name} {inspection.last_name}</p></div>
            <div><p className="text-xs font-semibold text-gray-500 uppercase">Service</p><p className="text-sm text-gray-700 mt-0.5 capitalize">{inspection.service_type}</p></div>
            <div><p className="text-xs font-semibold text-gray-500 uppercase">Address</p><p className="text-sm text-gray-700 mt-0.5">{inspection.address}, {inspection.city}</p></div>
            <div><p className="text-xs font-semibold text-gray-500 uppercase">Contact</p><p className="text-sm text-gray-700 mt-0.5">{inspection.phone}<br/>{inspection.email}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className={fieldClass}>
                <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
              <select value={form.urgency} onChange={e => setForm({...form, urgency: e.target.value})} className={fieldClass}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <input type="date" value={form.preferredDate} onChange={e => setForm({...form, preferredDate: e.target.value})} className={fieldClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
            <input value={form.preferredTime} onChange={e => setForm({...form, preferredTime: e.target.value})} className={fieldClass} />
          </div>
          {inspection.message && <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">{inspection.message}</div>}
          <div className="flex justify-between pt-2">
            <button type="button" onClick={handleDelete} disabled={deleting}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50">
              <Trash2 className="w-4 h-4" />{deleting ? 'Deleting...' : 'Delete'}
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import { Trash2 } from 'lucide-react';

export default function InspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      const res = await fetch(`/api/admin/inspections?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setInspections(data.inspections || []);
      setPagination(data.pagination || null);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSave(data: any, id?: number) {
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `/api/admin/inspections/${id}` : '/api/admin/inspections';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed'); }
    setSelectedInspection(null);
    await fetchData();
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/inspections/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    setSelectedInspection(null);
    await fetchData();
  }

  async function quickAction(id: number, newStatus: 'approved' | 'rejected') {
    await handleSave({ status: newStatus }, id);
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspections</h1>
          {pagination && <p className="text-sm text-gray-500 mt-1">{pagination.total} total inspections</p>}
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />Schedule Inspection
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="search" placeholder="Search by name, address, city..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden md:table-cell">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Preferred</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Urgency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin inline" /></td></tr>
              ) : inspections.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No inspections found</td></tr>
              ) : (
                inspections.map(insp => (
                  <tr key={insp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{insp.first_name} {insp.last_name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell capitalize">{insp.service_type}</td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell text-xs">{insp.address}, {insp.city}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                      <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{insp.preferred_date ? new Date(insp.preferred_date).toLocaleDateString() : '—'}</div>
                      <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{insp.preferred_time || '—'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${urgencyColors[insp.urgency || 'medium']}`}>
                        {(insp.urgency || 'medium')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[insp.status || 'pending']}`}>
                        {insp.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                      {insp.status === 'pending' && (
                        <>
                          <button onClick={() => quickAction(insp.id, 'approved')}
                            className="text-green-600 hover:text-green-800 text-xs font-medium mr-2"><CheckCircle className="w-4 h-4 inline" /></button>
                          <button onClick={() => quickAction(insp.id, 'rejected')}
                            className="text-red-600 hover:text-red-800 text-xs font-medium mr-2"><XCircle className="w-4 h-4 inline" /></button>
                        </>
                      )}
                      <button onClick={() => setSelectedInspection(insp)}
                        className="text-gray-500 hover:text-gray-800 text-xs font-medium">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages}</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}
                className="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Previous</button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                className="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddModal onSave={(data) => handleSave(data)} onClose={() => setShowAddModal(false)} />}
      {selectedInspection && (
        <EditModal inspection={selectedInspection} onSave={(data) => handleSave(data, selectedInspection.id)} onClose={() => setSelectedInspection(null)} onDelete={handleDelete} />
      )}
    </div>
  );
}
