'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, Briefcase, Users, UserPlus, Search, Loader2, Plus, Trash2,
  FileText, AlertCircle,
} from 'lucide-react';

type Mode = 'from-job' | 'existing-client' | 'new-client';

interface JobOption {
  id: number;
  customer_name: string;
  client_id: number;
  client_name: string | null;
  site_location: string;
  serviced_area: string;
  job_date: string;
  amount: string | null;
  property_type: string | null;
}

interface ClientOption {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  property_type: string | null;
}

interface Line {
  description: string;
  quantity: string;
  unitRate: string;
}

const emptyLine = (): Line => ({ description: '', quantity: '1', unitRate: '0' });

export default function NewInvoicePage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('from-job');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mode 1: from-job
  const [jobSearch, setJobSearch] = useState('');
  const [jobs, setJobs] = useState<JobOption[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobOption | null>(null);

  // Mode 2: existing-client
  const [clientSearch, setClientSearch] = useState('');
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);

  // Mode 3: new-client form
  const [newClient, setNewClient] = useState({
    name: '', email: '', phone: '', address: '',
    propertyType: 'residential' as 'residential' | 'commercial',
  });

  // Shared line items + tax + notes for modes 2 & 3 (mode 1 auto-builds from job)
  const [lines, setLines] = useState<Line[]>([emptyLine()]);
  const [taxRate, setTaxRate] = useState('0');
  const [notes, setNotes] = useState('');

  // ---- Fetchers ----
  const fetchJobs = useCallback(async (q: string) => {
    setJobsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/admin/invoices/uninvoiced-jobs?${params}`);
      const data = await res.json();
      setJobs(data.jobLogs || []);
    } catch (e) { console.error(e); }
    finally { setJobsLoading(false); }
  }, []);

  const fetchClients = useCallback(async (q: string) => {
    setClientsLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/admin/clients?${params}`);
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) { console.error(e); }
    finally { setClientsLoading(false); }
  }, []);

  useEffect(() => { if (mode === 'from-job') fetchJobs(jobSearch); }, [mode, jobSearch, fetchJobs]);
  useEffect(() => { if (mode === 'existing-client') fetchClients(clientSearch); }, [mode, clientSearch, fetchClients]);

  // ---- Live totals ----
  const totals = useMemo(() => {
    const tax = parseFloat(taxRate) || 0;
    let subtotal = 0;
    if (mode === 'from-job' && selectedJob) {
      subtotal = parseFloat(selectedJob.amount || '0') || 0;
    } else {
      subtotal = lines.reduce((s, l) => s + (parseFloat(l.quantity) || 0) * (parseFloat(l.unitRate) || 0), 0);
    }
    const taxTotal = subtotal * (tax / 100);
    return {
      subtotal: subtotal.toFixed(2),
      taxTotal: taxTotal.toFixed(2),
      total: (subtotal + taxTotal).toFixed(2),
    };
  }, [mode, selectedJob, lines, taxRate]);

  // ---- Submit ----
  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      let body: any = {
        taxRate: parseFloat(taxRate) || 0,
        notes: notes.trim() || undefined,
      };

      if (mode === 'from-job') {
        if (!selectedJob) throw new Error('Pick a job to invoice.');
        body.jobLogId = selectedJob.id;
      } else if (mode === 'existing-client') {
        if (!selectedClient) throw new Error('Pick a client.');
        body.clientId = selectedClient.id;
        body.lineItems = lines
          .filter(l => l.description.trim() && parseFloat(l.unitRate) >= 0)
          .map(l => ({
            description: l.description.trim(),
            quantity: l.quantity || '1',
            unitRate: l.unitRate || '0',
          }));
        if (body.lineItems.length === 0) throw new Error('Add at least one line item.');
      } else {
        if (!newClient.name.trim()) throw new Error('Client name is required.');
        body.newClient = {
          name: newClient.name.trim(),
          email: newClient.email.trim() || undefined,
          phone: newClient.phone.trim() || undefined,
          address: newClient.address.trim() || undefined,
          propertyType: newClient.propertyType,
        };
        body.lineItems = lines
          .filter(l => l.description.trim() && parseFloat(l.unitRate) >= 0)
          .map(l => ({
            description: l.description.trim(),
            quantity: l.quantity || '1',
            unitRate: l.unitRate || '0',
          }));
        if (body.lineItems.length === 0) throw new Error('Add at least one line item.');
      }

      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create invoice');
      router.push(`/admin/invoices/${data.invoice.id}/preview`);
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  function updateLine(idx: number, patch: Partial<Line>) {
    setLines(curr => curr.map((l, i) => i === idx ? { ...l, ...patch } : l));
  }

  // Pretty
  const tabBtn = (val: Mode, icon: any, label: string) => {
    const Icon = icon;
    const active = mode === val;
    return (
      <button
        key={val}
        onClick={() => { setMode(val); setError(null); }}
        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
          active ? 'border-green-600 text-green-700 bg-green-50' : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </button>
    );
  };

  return (
    <div className="max-w-4xl">
      <button onClick={() => router.push('/admin/invoices')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Invoices
      </button>

      <h1 className="text-2xl font-bold text-gray-900 mb-1">New Invoice</h1>
      <p className="text-sm text-gray-500 mb-6">Create from a completed job, an existing client, or a brand new client.</p>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabBtn('from-job', Briefcase, 'From Job')}
          {tabBtn('existing-client', Users, 'Existing Client')}
          {tabBtn('new-client', UserPlus, 'New Client')}
        </div>

        <div className="p-6 space-y-6">
          {/* ---- Mode 1: from-job ---- */}
          {mode === 'from-job' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Search completed jobs</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" value={jobSearch} onChange={e => setJobSearch(e.target.value)}
                  placeholder="Search by customer, site, or service..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>

              <div className="border border-gray-200 rounded-lg max-h-72 overflow-y-auto">
                {jobsLoading ? (
                  <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-gray-400" /></div>
                ) : jobs.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">No uninvoiced completed jobs found.</div>
                ) : jobs.map(j => (
                  <button key={j.id} onClick={() => setSelectedJob(j)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors ${
                      selectedJob?.id === j.id ? 'bg-green-50 hover:bg-green-50' : ''
                    }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{j.client_name || j.customer_name}</p>
                        <p className="text-xs text-gray-500 truncate">{j.serviced_area} — {j.site_location}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(j.job_date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-sm text-gray-900">${parseFloat(j.amount || '0').toFixed(2)}</p>
                        <p className="text-xs text-gray-400 capitalize">{j.property_type || 'residential'}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {selectedJob && (
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-sm">
                  <p className="font-semibold text-green-900 mb-1">Selected job — invoice will be auto-populated</p>
                  <p className="text-green-800 text-xs">
                    Client: <strong>{selectedJob.client_name || selectedJob.customer_name}</strong> ·
                    Amount: <strong>${parseFloat(selectedJob.amount || '0').toFixed(2)}</strong> ·
                    Due: <strong>{selectedJob.property_type === 'commercial' ? 'Net 15' : 'Upon Receipt'}</strong>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ---- Mode 2: existing-client ---- */}
          {mode === 'existing-client' && (
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Search clients</label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text" value={clientSearch} onChange={e => setClientSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>

              <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto mb-4">
                {clientsLoading ? (
                  <div className="p-6 text-center"><Loader2 className="w-5 h-5 animate-spin inline text-gray-400" /></div>
                ) : clients.length === 0 ? (
                  <div className="p-6 text-center text-sm text-gray-400">No clients found.</div>
                ) : clients.map(c => (
                  <button key={c.id} onClick={() => setSelectedClient(c)}
                    className={`w-full text-left px-4 py-2.5 border-b border-gray-100 last:border-0 hover:bg-gray-50 ${
                      selectedClient?.id === c.id ? 'bg-green-50 hover:bg-green-50' : ''
                    }`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{c.name}</p>
                        <p className="text-xs text-gray-500 truncate">{c.email || c.phone || '—'}</p>
                      </div>
                      <span className="text-xs text-gray-400 capitalize">{c.property_type || 'residential'}</span>
                    </div>
                  </button>
                ))}
              </div>

              {selectedClient && <LineItemsEditor lines={lines} setLines={setLines} updateLine={updateLine} />}
            </div>
          )}

          {/* ---- Mode 3: new-client ---- */}
          {mode === 'new-client' && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Client information</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Name *</label>
                  <input type="text" value={newClient.name} onChange={e => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Property Type</label>
                  <select value={newClient.propertyType}
                    onChange={e => setNewClient({ ...newClient, propertyType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                    <option value="residential">Residential (due on receipt)</option>
                    <option value="commercial">Commercial (Net 15)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Email</label>
                  <input type="email" value={newClient.email} onChange={e => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Phone</label>
                  <input type="tel" value={newClient.phone} onChange={e => setNewClient({ ...newClient, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-gray-600 mb-1">Address</label>
                  <input type="text" value={newClient.address} onChange={e => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>

              <LineItemsEditor lines={lines} setLines={setLines} updateLine={updateLine} />
            </div>
          )}

          {/* ---- Tax + Notes (all modes) ---- */}
          <div className="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tax Rate (%)</label>
              <input type="number" step="0.01" min="0" value={taxRate} onChange={e => setTaxRate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
              <p className="text-xs text-gray-400 mt-1">Default 0%. PA sales tax — set as needed.</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>${totals.subtotal}</span></div>
              <div className="flex justify-between text-gray-600 mt-1"><span>Tax</span><span>${totals.taxTotal}</span></div>
              <div className="flex justify-between font-bold text-gray-900 mt-2 pt-2 border-t border-gray-200"><span>Total</span><span>${totals.total}</span></div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              placeholder="Payment terms, special instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
          <button onClick={() => router.push('/admin/invoices')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={submitting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {submitting ? 'Creating...' : 'Create Invoice (Draft)'}
          </button>
        </div>
      </div>
    </div>
  );
}

// -------- Line Items Editor (used by modes 2 & 3) --------
function LineItemsEditor({ lines, setLines, updateLine }: {
  lines: Line[];
  setLines: (l: Line[]) => void;
  updateLine: (idx: number, patch: Partial<Line>) => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Line Items</p>
      <div className="space-y-2 mb-2">
        {lines.map((line, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-start">
            <input type="text" placeholder="Description (e.g. General Pest Control)"
              value={line.description} onChange={e => updateLine(i, { description: e.target.value })}
              className="col-span-6 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="number" placeholder="Qty" step="0.01" min="0"
              value={line.quantity} onChange={e => updateLine(i, { quantity: e.target.value })}
              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <input type="number" placeholder="Rate" step="0.01" min="0"
              value={line.unitRate} onChange={e => updateLine(i, { unitRate: e.target.value })}
              className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            <button onClick={() => setLines(lines.filter((_, idx) => idx !== i))} disabled={lines.length === 1}
              className="col-span-1 p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => setLines([...lines, emptyLine()])}
        className="inline-flex items-center gap-1 text-sm text-green-700 font-medium hover:text-green-800">
        <Plus className="w-4 h-4" /> Add line
      </button>
    </div>
  );
}
