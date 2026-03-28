'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, X, Loader2, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Contract {
  id: number;
  customer_id: number;
  customer_name: string;
  frequency: string;
  next_scheduled_date: string | null;
  site_location: string;
  serviced_area: string;
  default_work_template: string | null;
  notes: string | null;
  assigned_employee_id: number | null;
  assigned_employee_name?: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface Client { id: number; name: string; }
interface Employee { id: number; name: string; }

const freqLabels: Record<string, string> = {
  weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly',
};

function ContractModal({ contract, clients, employees, onSave, onClose, onDelete }: {
  contract: Contract | null;
  clients: Client[];
  employees: Employee[];
  onSave: (data: any) => Promise<void>;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
}) {
  const [form, setForm] = useState({
    customerId: contract?.customer_id || '',
    frequency: contract?.frequency || 'monthly',
    nextScheduledDate: contract?.next_scheduled_date ? contract.next_scheduled_date.split('T')[0] : '',
    siteLocation: contract?.site_location || '',
    servicedArea: contract?.serviced_area || '',
    defaultWorkTemplate: contract?.default_work_template || '',
    notes: contract?.notes || '',
    assignedEmployeeId: contract?.assigned_employee_id || '',
    startDate: contract?.start_date ? contract.start_date.split('T')[0] : '',
    endDate: contract?.end_date ? contract.end_date.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId || !form.siteLocation || !form.servicedArea) {
      setError('Customer, site location, and serviced area are required');
      return;
    }
    setSaving(true);
    setError('');
    try { await onSave(form); }
    catch (err: any) { setError(err.message || 'Failed to save'); setSaving(false); }
  }

  async function handleDelete() {
    if (!contract) return;
    setDeleting(true);
    await onDelete(contract.id);
  }

  const fieldClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{contract ? 'Edit Contract' : 'Add Contract'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            <select value={form.customerId} onChange={e => setForm({...form, customerId: e.target.value})}
              className={fieldClass} required>
              <option value="">Select customer...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})} className={fieldClass}>
                <option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="quarterly">Quarterly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Next Scheduled Date</label>
              <input type="date" value={form.nextScheduledDate} onChange={e => setForm({...form, nextScheduledDate: e.target.value})} className={fieldClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Location *</label>
            <input value={form.siteLocation} onChange={e => setForm({...form, siteLocation: e.target.value})} className={fieldClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Serviced Area *</label>
            <input value={form.servicedArea} onChange={e => setForm({...form, servicedArea: e.target.value})} className={fieldClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Employee</label>
            <select value={form.assignedEmployeeId} onChange={e => setForm({...form, assignedEmployeeId: e.target.value})}
              className={fieldClass}>
              <option value="">Unassigned</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className={fieldClass} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className={fieldClass} /></div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Work Template</label>
            <textarea rows={2} value={form.defaultWorkTemplate} onChange={e => setForm({...form, defaultWorkTemplate: e.target.value})} className={fieldClass + ' resize-none'} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className={fieldClass + ' resize-none'} />
          </div>

          <div className="flex justify-between pt-2">
            {contract && (
              <button type="button" onClick={handleDelete} disabled={deleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50">
                <Trash2 className="w-4 h-4" />{deleting ? 'Deleting...' : 'Delete'}
              </button>
            )}
            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Saving...' : contract ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/contracts?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setContracts(data.contracts || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    fetchData();
    // Load clients for dropdown
    fetch('/api/admin/clients?limit=100')
      .then(r => r.json())
      .then(d => setClients(d.clients || []))
      .catch(console.error);
    // Load employees
    fetch('/api/admin/scheduled-jobs')
      .then(r => r.json())
      .then(d => setEmployees(d.employees || []))
      .catch(console.error);
  }, [fetchData]);

  async function handleSave(data: any, id?: number) {
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `/api/admin/contracts/${id}` : '/api/admin/contracts';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Save failed'); }
    setShowAddModal(false);
    setEditingContract(null);
    await fetchData();
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/contracts/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Delete failed');
    setEditingContract(null);
    await fetchData();
  }

  async function handleToggleActive(contract: Contract) {
    await fetch(`/api/admin/contracts/${contract.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !contract.is_active }),
    });
    await fetchData();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Contracts</h1>
          <p className="text-sm text-gray-500 mt-1">{contracts.length} contracts</p>
        </div>
        <button onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors">
          <Plus className="w-4 h-4" />Add Contract
        </button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="search" placeholder="Search by customer, site location..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden sm:table-cell">Frequency</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden md:table-cell">Next Service</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Location</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide hidden lg:table-cell">Employee</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide">Active</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin inline" /></td></tr>
              ) : contracts.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No contracts found</td></tr>
              ) : (
                contracts.map(contract => (
                  <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{contract.customer_name}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{freqLabels[contract.frequency] || contract.frequency}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {contract.next_scheduled_date ? new Date(contract.next_scheduled_date).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">{contract.site_location}</td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{contract.assigned_employee_name || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleToggleActive(contract)}
                        className={`inline-flex items-center gap-1 text-xs font-medium ${contract.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                        {contract.is_active
                          ? <ToggleRight className="w-5 h-5" />
                          : <ToggleLeft className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditingContract(contract)}
                        className="text-green-600 hover:text-green-800 text-xs font-medium mr-3">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <ContractModal
          contract={null}
          clients={clients}
          employees={employees}
          onSave={(data) => handleSave(data)}
          onClose={() => setShowAddModal(false)}
          onDelete={handleDelete}
        />
      )}
      {editingContract && (
        <ContractModal
          contract={editingContract}
          clients={clients}
          employees={employees}
          onSave={(data) => handleSave(data, editingContract.id)}
          onClose={() => setEditingContract(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
