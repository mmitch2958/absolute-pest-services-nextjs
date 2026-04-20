'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, History, LogOut, Loader2, MapPin, Calendar, DollarSign,
  ChevronDown, ChevronUp, Package, Phone, Mail, User, Pencil, Trash2,
  X, Plus, Save, AlertTriangle,
} from 'lucide-react';

interface Employee { id: number; name: string; canManageEmployees: boolean; }
interface JobLog {
  id: number;
  customer_name: string;
  site_location: string;
  site_address: string | null;
  serviced_area: string;
  work_performed: string;
  job_date: string;
  status: string;
  amount: string | null;
  materials: any;
  service_rate_id: number | null;
  client_phone: string | null;
  client_email: string | null;
  client_address: string | null;
}

interface MaterialEntry {
  id: string;
  mode: 'product' | 'supplies';
  productName: string;
  productVolume: string;
  productUnit: 'oz' | 'gallons';
  supplyItems: { name: string; quantity: string }[];
}

const STATUS_OPTIONS = [
  'completed', 'scheduled', 'in_progress', 'invoiced', 'paid', 'cancelled',
] as const;

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700',
  scheduled: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  invoiced: 'bg-orange-100 text-orange-700',
  paid: 'bg-purple-100 text-purple-700',
  cancelled: 'bg-slate-100 text-slate-500',
};

function formatStatus(s: string) {
  return s.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function toDateInput(d: string) {
  return new Date(d).toISOString().split('T')[0];
}
function formatMaterialEntry(m: any): string | null {
  if (!m) return null;
  if (m.type === 'product') return `${m.productName}${m.volume ? ` — ${m.volume} ${m.unit}` : ''}`;
  if (m.type === 'supplies' && m.items?.length) return m.items.map((i: any) => `${i.name}${i.quantity ? ` ×${i.quantity}` : ''}`).join(', ');
  return null;
}
function formatMaterials(m: any): string | null {
  if (!m) return null;
  if (Array.isArray(m)) {
    const parts = m.map(formatMaterialEntry).filter(Boolean);
    return parts.length > 0 ? parts.join(' · ') : null;
  }
  return formatMaterialEntry(m);
}

// Convert stored materials (legacy single object OR new array) into editable entries
function materialsToEntries(m: any): MaterialEntry[] {
  if (!m) return [];
  const arr = Array.isArray(m) ? m : [m];
  return arr.map((entry: any, i: number) => ({
    id: `${Date.now()}-${i}`,
    mode: entry.type === 'supplies' ? 'supplies' : 'product',
    productName: entry.productName ?? '',
    productVolume: entry.volume != null ? String(entry.volume) : '',
    productUnit: entry.unit === 'gallons' ? 'gallons' : 'oz',
    supplyItems: Array.isArray(entry.items)
      ? entry.items.map((i: any) => ({ name: i.name ?? '', quantity: i.quantity != null ? String(i.quantity) : '1' }))
      : [],
  }));
}

function entriesToMaterials(entries: MaterialEntry[]): any[] | null {
  const active = entries
    .filter(e => e.mode === 'product' ? !!e.productName.trim() : e.supplyItems.some(i => i.name.trim()))
    .map(e => e.mode === 'product'
      ? { type: 'product', productName: e.productName.trim(), volume: e.productVolume ? parseFloat(e.productVolume) : null, unit: e.productUnit }
      : { type: 'supplies', items: e.supplyItems.filter(i => i.name.trim()).map(i => ({ name: i.name.trim(), quantity: i.quantity })) }
    );
  return active.length > 0 ? active : null;
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

const inputBase = 'w-full h-11 px-3 text-base text-black border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50';

function MaterialEditor({
  entry, total, index, onChange, onRemove,
}: {
  entry: MaterialEntry; total: number; index: number;
  onChange: (e: MaterialEntry) => void; onRemove: () => void;
}) {
  function update(patch: Partial<MaterialEntry>) { onChange({ ...entry, ...patch }); }
  return (
    <div className="border border-slate-200 rounded-xl bg-white p-3 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase">
          {total > 1 ? `Material ${index + 1}` : 'Material'}
        </span>
        <button type="button" onClick={onRemove} className="text-slate-300 hover:text-red-500">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {(['product', 'supplies'] as const).map(m => (
          <button key={m} type="button" onClick={() => update({ mode: m })}
            className={`py-2 rounded-lg text-sm font-medium border ${
              entry.mode === m ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500 border-slate-300'
            }`}>
            {m === 'product' ? 'Product' : 'Supplies'}
          </button>
        ))}
      </div>
      {entry.mode === 'product' ? (
        <div className="space-y-2">
          <input type="text" value={entry.productName}
            onChange={e => update({ productName: e.target.value })}
            placeholder="Product / solution name" className={inputBase} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" min="0" step="0.1" value={entry.productVolume}
              onChange={e => update({ productVolume: e.target.value })}
              placeholder="Volume" className={`${inputBase} text-right`} />
            <div className="grid grid-cols-2 gap-1.5">
              {(['oz', 'gallons'] as const).map(u => (
                <button key={u} type="button" onClick={() => update({ productUnit: u })}
                  className={`h-11 rounded-xl text-sm font-medium border ${
                    entry.productUnit === u ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500 border-slate-300'
                  }`}>{u}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {entry.supplyItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input type="text" value={item.name}
                onChange={e => update({ supplyItems: entry.supplyItems.map((it, i) => i === idx ? { ...it, name: e.target.value } : it) })}
                placeholder="Supply name" className={inputBase} />
              <input type="number" min="1" value={item.quantity}
                onChange={e => update({ supplyItems: entry.supplyItems.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it) })}
                className="w-16 h-11 px-2 text-base text-black text-right border border-slate-300 rounded-xl" />
              <button type="button"
                onClick={() => update({ supplyItems: entry.supplyItems.filter((_, i) => i !== idx) })}
                className="p-2 text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <button type="button"
            onClick={() => update({ supplyItems: [...entry.supplyItems, { name: '', quantity: '1' }] })}
            className="w-full h-9 border-2 border-dashed border-slate-300 rounded-lg text-xs font-medium text-slate-500 hover:border-green-400 hover:text-green-600">
            + Add supply
          </button>
        </div>
      )}
    </div>
  );
}

function EditModal({
  log, onClose, onSaved,
}: {
  log: JobLog; onClose: () => void; onSaved: (updated: JobLog) => void;
}) {
  const [customerName, setCustomerName] = useState(log.customer_name);
  const [siteLocation, setSiteLocation] = useState(log.site_location);
  const [siteAddress, setSiteAddress] = useState(log.site_address ?? '');
  const [servicedArea, setServicedArea] = useState(log.serviced_area);
  const [workPerformed, setWorkPerformed] = useState(log.work_performed);
  const [jobDate, setJobDate] = useState(toDateInput(log.job_date));
  const [amount, setAmount] = useState(log.amount ?? '0.00');
  const [status, setStatus] = useState(log.status || 'completed');
  const [entries, setEntries] = useState<MaterialEntry[]>(materialsToEntries(log.materials));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function addEntry() {
    setEntries(prev => [...prev, {
      id: `${Date.now()}`, mode: 'product', productName: '',
      productVolume: '', productUnit: 'oz', supplyItems: [],
    }]);
  }

  async function handleSave() {
    if (!customerName.trim() || !siteLocation.trim() || !servicedArea.trim() || !workPerformed.trim()) {
      setError('Customer, site location, area, and work performed are required.');
      return;
    }
    setSaving(true); setError('');
    try {
      const res = await fetch(`/api/field/job-logs/${log.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          siteLocation: siteLocation.trim(),
          siteAddress: siteAddress.trim() || null,
          servicedArea: servicedArea.trim(),
          workPerformed: workPerformed.trim(),
          jobDate, status, amount,
          serviceRateId: log.service_rate_id,
          materials: entriesToMaterials(entries),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Update failed');
      onSaved({ ...log, ...data.log });
    } catch (e: any) {
      setError(e.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 shrink-0">
          <h3 className="font-bold text-slate-900">Edit Job</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Customer *</label>
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputBase} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Site Location *</label>
            <input value={siteLocation} onChange={e => setSiteLocation(e.target.value)} className={inputBase} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Site Address</label>
            <input value={siteAddress} onChange={e => setSiteAddress(e.target.value)} className={inputBase} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Serviced Area *</label>
            <input value={servicedArea} onChange={e => setServicedArea(e.target.value)} className={inputBase} />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Work Performed *</label>
            <textarea value={workPerformed} onChange={e => setWorkPerformed(e.target.value)} rows={4}
              className="w-full px-3 py-3 text-base text-black border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Job Date</label>
              <input type="date" value={jobDate} onChange={e => setJobDate(e.target.value)} className={inputBase} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Amount ($)</label>
              <input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)}
                className={`${inputBase} text-right font-semibold`} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={inputBase}>
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{formatStatus(s)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-400" /> Materials Used
            </label>
            {entries.map((entry, index) => (
              <MaterialEditor
                key={entry.id} entry={entry} index={index} total={entries.length}
                onChange={updated => setEntries(prev => prev.map(e => e.id === entry.id ? updated : e))}
                onRemove={() => setEntries(prev => prev.filter(e => e.id !== entry.id))}
              />
            ))}
            <button type="button" onClick={addEntry}
              className="w-full flex items-center justify-center gap-2 h-10 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:border-green-400 hover:text-green-600">
              <Plus className="w-4 h-4" /> Add Material
            </button>
          </div>
        </div>

        <div className="border-t border-slate-200 p-3 flex gap-2 shrink-0 bg-white">
          <button onClick={onClose}
            className="flex-1 h-12 border border-slate-300 text-slate-700 font-semibold rounded-xl">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 h-12 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirm({
  log, onClose, onDeleted,
}: {
  log: JobLog; onClose: () => void; onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setDeleting(true); setError('');
    try {
      const res = await fetch(`/api/field/job-logs/${log.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Delete failed');
      onDeleted(log.id);
    } catch (e: any) {
      setError(e.message || 'Failed to delete');
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Delete this job log?</h3>
            <p className="text-sm text-slate-500 mt-1">
              <span className="font-medium text-slate-700">{log.customer_name}</span> on {formatDate(log.job_date)}.
              This cannot be undone.
            </p>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-600">{error}</div>
        )}
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} disabled={deleting}
            className="flex-1 h-11 border border-slate-300 text-slate-700 font-semibold rounded-xl disabled:opacity-60">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={deleting}
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 disabled:opacity-60">
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function FieldHistoryPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editing, setEditing] = useState<JobLog | null>(null);
  const [deleting, setDeleting] = useState<JobLog | null>(null);

  function loadLogs() {
    setLoading(true);
    fetch('/api/field/job-logs')
      .then(r => r.json())
      .then(d => { if (d.success) setLogs(d.logs); })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    const stored = localStorage.getItem('fieldEmployee');
    if (!stored) { router.push('/field'); return; }
    setEmployee(JSON.parse(stored));
    loadLogs();
  }, []);

  if (!employee) {
    return <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-base font-bold text-slate-900">My Job History</h1>
            <p className="text-xs text-slate-500">{logs.length} recent jobs</p>
          </div>
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <History className="w-4 h-4 text-green-600" />
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-lg mx-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No jobs logged yet</p>
              <p className="text-sm mt-1">Start by logging your first job</p>
            </div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className="w-full text-left p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{log.customer_name}</p>
                      <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate">{log.site_location} · {log.serviced_area}</span>
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[log.status] || 'bg-slate-100 text-slate-500'}`}>
                        {formatStatus(log.status || 'completed')}
                      </span>
                      {expandedId === log.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(log.job_date)}</span>
                    {log.amount && <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{parseFloat(log.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>}
                  </div>
                </button>

                {expandedId === log.id && (
                  <div className="border-t border-slate-100 px-4 py-3 bg-slate-50 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Work Performed</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{log.work_performed}</p>
                    </div>

                    {formatMaterials(log.materials) && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> Materials</p>
                        <p className="text-sm text-slate-700">{formatMaterials(log.materials)}</p>
                      </div>
                    )}

                    {(log.client_phone || log.client_email || log.client_address) && (
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <User className="w-3 h-3" /> Customer Contact
                        </p>
                        <div className="space-y-2">
                          {log.client_phone && (
                            <a href={`tel:${log.client_phone}`}
                              className="flex items-center gap-2.5 text-sm text-green-700 font-medium active:opacity-70">
                              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <Phone className="w-3.5 h-3.5 text-green-600" />
                              </div>
                              {log.client_phone}
                            </a>
                          )}
                          {log.client_address && (
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(log.client_address)}`}
                              target="_blank" rel="noreferrer"
                              className="flex items-center gap-2.5 text-sm text-blue-700 active:opacity-70">
                              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              {log.client_address}
                            </a>
                          )}
                          {log.client_email && (
                            <a href={`mailto:${log.client_email}`}
                              className="flex items-center gap-2.5 text-sm text-slate-600 active:opacity-70">
                              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                              </div>
                              {log.client_email}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Edit / Delete actions */}
                    <div className="border-t border-slate-200 pt-3 flex gap-2">
                      <button
                        onClick={() => setEditing(log)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-blue-50 text-blue-700 font-medium rounded-xl hover:bg-blue-100 active:opacity-80"
                      >
                        <Pencil className="w-4 h-4" /> Edit
                      </button>
                      <button
                        onClick={() => setDeleting(log)}
                        className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-red-50 text-red-700 font-medium rounded-xl hover:bg-red-100 active:opacity-80"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {editing && (
        <EditModal
          log={editing}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setLogs(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
            setEditing(null);
          }}
        />
      )}

      {deleting && (
        <DeleteConfirm
          log={deleting}
          onClose={() => setDeleting(null)}
          onDeleted={(id) => {
            setLogs(prev => prev.filter(l => l.id !== id));
            setDeleting(null);
            setExpandedId(null);
          }}
        />
      )}

      <FieldNav active="/field/history" />
    </div>
  );
}
