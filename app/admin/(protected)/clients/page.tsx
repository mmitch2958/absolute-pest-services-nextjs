'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileText, ExternalLink, Loader2 } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  contact_person: string | null;
  property_type: string | null;
  client_type: string | null;
  status: string | null;
  notes: string | null;
  review_opt_out: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ClientInvoice {
  id: number;
  invoiceNumber: string;
  status: string;
  issueDate: string;
  dueDate: string;
  total: string;
  notes: string | null;
}

// ─── Client Form Modal ─────────────────────────────────────────────────────────

interface ClientFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
  propertyType: 'residential' | 'commercial';
  clientType: 'prospect' | 'client';
  status: 'active' | 'inactive';
  notes: string;
  reviewOptOut: boolean;
}

const emptyForm: ClientFormData = {
  name: '',
  email: '',
  phone: '',
  address: '',
  contactPerson: '',
  propertyType: 'residential',
  clientType: 'prospect',
  status: 'active',
  notes: '',
  reviewOptOut: false,
};

function ClientModal({
  client,
  onSave,
  onClose,
}: {
  client: Client | null;
  onSave: (data: ClientFormData, id?: number) => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ClientFormData>(() =>
    client
      ? {
          name: client.name,
          email: client.email || '',
          phone: client.phone || '',
          address: client.address || '',
          contactPerson: client.contact_person || '',
          propertyType: (client.property_type as ClientFormData['propertyType']) || 'residential',
          clientType: (client.client_type as ClientFormData['clientType']) || 'prospect',
          status: (client.status as ClientFormData['status']) || 'active',
          notes: client.notes || '',
          reviewOptOut: client.review_opt_out || false,
        }
      : { ...emptyForm }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form, client?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {client ? 'Edit Client' : 'Add Client'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
            <input
              type="text"
              value={form.contactPerson}
              onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                value={form.propertyType}
                onChange={(e) => setForm({ ...form, propertyType: e.target.value as ClientFormData['propertyType'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Type</label>
              <select
                value={form.clientType}
                onChange={(e) => setForm({ ...form, clientType: e.target.value as ClientFormData['clientType'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ClientFormData['status'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-center pt-5">
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.reviewOptOut}
                  onChange={(e) => setForm({ ...form, reviewOptOut: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                Opted out of reviews
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Delete Confirmation Modal ───────────────────────────────────────────────

function DeleteModal({
  client,
  onConfirm,
  onClose,
}: {
  client: Client;
  onConfirm: (id: number) => Promise<void>;
  onClose: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm(client.id);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete Client</h2>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Clients Page ────────────────────────────────────────────────────────

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [clientInvoices, setClientInvoices] = useState<Record<number, ClientInvoice[]>>({});
  const [loadingInvoices, setLoadingInvoices] = useState<Record<number, boolean>>({});
  const [showInvoicePanel, setShowInvoicePanel] = useState(false);
  const [selectedClientForInvoices, setSelectedClientForInvoices] = useState<Client | null>(null);

  async function fetchInvoicesForClient(clientId: number) {
    if (clientInvoices[clientId]) return; // already loaded
    setLoadingInvoices(prev => ({ ...prev, [clientId]: true }));
    try {
      const res = await fetch(`/api/admin/invoices?clientId=${clientId}`);
      const data = await res.json();
      setClientInvoices(prev => ({ ...prev, [clientId]: data.invoices || [] }));
    } catch {} finally {
      setLoadingInvoices(prev => ({ ...prev, [clientId]: false }));
    }
  }

  function openClientInvoices(client: Client) {
    setSelectedClientForInvoices(client);
    setShowInvoicePanel(true);
    fetchInvoicesForClient(client.id);
  }

  function getClientOutstanding(clientId: number): string {
    const invs = clientInvoices[clientId] || [];
    const total = invs
      .filter(i => ['sent', 'viewed', 'overdue'].includes(i.status))
      .reduce((s, i) => s + parseFloat(i.total || '0'), 0);
    return total.toFixed(2);
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      params.set('page', String(page));

      const res = await fetch(`/api/admin/clients?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setClients(data.clients || []);
      setPagination(data.pagination || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  async function handleSave(data: ClientFormData, id?: number) {
    const method = id ? 'PATCH' : 'POST';
    const url = id ? `/api/admin/clients/${id}` : '/api/admin/clients';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Save failed');
    }

    setShowAddModal(false);
    setEditingClient(null);
    await fetchClients();
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/admin/clients/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Delete failed');
    }
    setDeletingClient(null);
    await fetchClients();
  }

  function statusBadge(status: string | null) {
    const s = status || 'active';
    const classes =
      s === 'active'
        ? 'bg-green-100 text-green-800'
        : s === 'inactive'
        ? 'bg-gray-100 text-gray-700'
        : 'bg-gray-100 text-gray-700';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
        {s}
      </span>
    );
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          {pagination && (
            <p className="text-sm text-gray-500 mt-1">
              {pagination.total} total client{pagination.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Property</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : clients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No clients found
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr
                    key={client.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setEditingClient(client)}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{client.name}</td>
                    <td className="px-4 py-3 text-gray-600">{client.email || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{client.phone || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{client.property_type || '—'}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{client.client_type || '—'}</td>
                    <td className="px-4 py-3">{statusBadge(client.status)}</td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openClientInvoices(client)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-3 inline-flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />Invoices
                      </button>
                      <button
                        onClick={() => setEditingClient(client)}
                        className="text-green-600 hover:text-green-800 text-xs font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingClient(client)}
                        className="text-red-600 hover:text-red-800 text-xs font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-1 text-xs border rounded ${
                      page === pageNum
                        ? 'bg-green-600 text-white border-green-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
                className="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-40 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoice History Panel */}
      {showInvoicePanel && selectedClientForInvoices && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Invoices — {selectedClientForInvoices.name}</h2>
                <p className="text-xs text-gray-500">
                  Outstanding: ${getClientOutstanding(selectedClientForInvoices.id)}
                </p>
              </div>
              <button
                onClick={() => { setShowInvoicePanel(false); setSelectedClientForInvoices(null); }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              {loadingInvoices[selectedClientForInvoices.id] ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : (clientInvoices[selectedClientForInvoices.id] || []).length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No invoices found for this client</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(clientInvoices[selectedClientForInvoices.id] || []).map((inv: ClientInvoice) => {
                    const statusColors: Record<string, string> = {
                      draft: 'bg-gray-100 text-gray-700',
                      sent: 'bg-blue-100 text-blue-700',
                      viewed: 'bg-indigo-100 text-indigo-700',
                      paid: 'bg-green-100 text-green-700',
                      overdue: 'bg-red-100 text-red-700',
                      void: 'bg-gray-100 text-gray-400',
                    };
                    return (
                      <a
                        key={inv.id}
                        href={`/admin/invoices/${inv.id}/preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{inv.invoiceNumber}</p>
                            <p className="text-xs text-gray-500">
                              Issued {new Date(inv.issueDate).toLocaleDateString()} · Due {new Date(inv.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[inv.status] || 'bg-gray-100 text-gray-700'}`}>
                            {inv.status}
                          </span>
                          <span className="text-sm font-bold text-gray-900">${parseFloat(inv.total || '0').toFixed(2)}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <ClientModal
          client={null}
          onSave={handleSave}
          onClose={() => setShowAddModal(false)}
        />
      )}
      {editingClient && (
        <ClientModal
          client={editingClient}
          onSave={handleSave}
          onClose={() => setEditingClient(null)}
        />
      )}
      {deletingClient && (
        <DeleteModal
          client={deletingClient}
          onConfirm={handleDelete}
          onClose={() => setDeletingClient(null)}
        />
      )}
    </div>
  );
}
