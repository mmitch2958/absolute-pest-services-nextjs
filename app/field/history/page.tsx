'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, History, LogOut, Loader2, MapPin, Calendar, DollarSign, ChevronDown, ChevronUp, Package, Phone, Mail, User } from 'lucide-react';

interface Employee { id: number; name: string; canManageEmployees: boolean; }
interface JobLog {
  id: number;
  customer_name: string;
  site_location: string;
  serviced_area: string;
  work_performed: string;
  job_date: string;
  status: string;
  amount: string | null;
  materials: any;
  client_phone: string | null;
  client_email: string | null;
  client_address: string | null;
}

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

export default function FieldHistoryPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [logs, setLogs] = useState<JobLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('fieldEmployee');
    if (!stored) { router.push('/field'); return; }
    setEmployee(JSON.parse(stored));
    fetch('/api/field/job-logs')
      .then(r => r.json())
      .then(d => { if (d.success) setLogs(d.logs); })
      .finally(() => setLoading(false));
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
                    {/* Work Performed */}
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Work Performed</p>
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{log.work_performed}</p>
                    </div>

                    {/* Materials */}
                    {formatMaterials(log.materials) && (
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1"><Package className="w-3 h-3" /> Materials</p>
                        <p className="text-sm text-slate-700">{formatMaterials(log.materials)}</p>
                      </div>
                    )}

                    {/* Customer Contact */}
                    {(log.client_phone || log.client_email || log.client_address) && (
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                          <User className="w-3 h-3" /> Customer Contact
                        </p>
                        <div className="space-y-2">
                          {log.client_phone && (
                            <a
                              href={`tel:${log.client_phone}`}
                              className="flex items-center gap-2.5 text-sm text-green-700 font-medium active:opacity-70"
                            >
                              <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
                                <Phone className="w-3.5 h-3.5 text-green-600" />
                              </div>
                              {log.client_phone}
                            </a>
                          )}
                          {log.client_address && (
                            <a
                              href={`https://maps.google.com/?q=${encodeURIComponent(log.client_address)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-2.5 text-sm text-blue-700 active:opacity-70"
                            >
                              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                              </div>
                              {log.client_address}
                            </a>
                          )}
                          {log.client_email && (
                            <a
                              href={`mailto:${log.client_email}`}
                              className="flex items-center gap-2.5 text-sm text-slate-600 active:opacity-70"
                            >
                              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                                <Mail className="w-3.5 h-3.5 text-slate-500" />
                              </div>
                              {log.client_email}
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <FieldNav active="/field/history" />
    </div>
  );
}
