'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardList, History, LogOut, Loader2, CheckCircle2, Search, Plus, ChevronDown, Package, Boxes, Trash2 } from 'lucide-react';

interface Employee { id: number; name: string; canManageEmployees: boolean; }
interface ServiceRate { id: number; name: string; description: string | null; defaultRate: string; }
interface SuggestionsData {
  customers: string[];
  customerLocations: Record<string, string[]>;
  locationAreas: Record<string, string[]>;
  clients: { id: number; name: string; address: string | null; propertyType: string }[];
}

const PEST_PRODUCTS = [
  'Termidor SC','Phantom II','Alpine WSG','Temprid FX','Demand CS','Suspend Polyzone',
  'Talstar P','Bifen I/T','Advion Cockroach Gel','Advion Ant Gel','Maxforce FC Magnum',
  'Gentrol IGR','Precor IGR','Crossfire Concentrate','Bedlam Plus','Cimexa Dust',
  'Delta Dust','Drione Dust','Taurus SC','Contrac Blox','Final Blox',
];
const PEST_SUPPLIES = [
  'Glue Board (Small)','Glue Board (Large)','Snap Trap','Rodent Bait Station',
  'Tamper-Resistant Bait Station','Termite Bait Station','Pheromone Trap',
  'Fly Light Trap','Bed Bug Monitor','Duster','Tick Tube',
];

function FieldNav({ employee, active }: { employee: Employee | null; active: string }) {
  const router = useRouter();
  async function logout() {
    await fetch('/api/field/logout', { method: 'POST' });
    localStorage.removeItem('fieldEmployee');
    router.push('/field');
  }
  const items = [
    { href: '/field/log', label: 'Log Job', icon: ClipboardList },
    { href: '/field/history', label: 'History', icon: History },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-4">
        {items.map(({ href, label, icon: Icon }) => (
          <button key={href} onClick={() => router.push(href)}
            className={`flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl transition-colors ${active === href ? 'text-green-600' : 'text-slate-400'}`}>
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
        <button onClick={logout} className="flex flex-col items-center gap-0.5 px-5 py-1 rounded-xl text-slate-400">
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}

function SearchableInput({ label, options, value, onChange, placeholder }: {
  label: string; options: string[]; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const filtered = options.filter(o => o.toLowerCase().includes(value.toLowerCase()));

  return (
    <div className="space-y-1.5 relative">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          className="w-full h-12 pl-9 pr-3 text-base border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
        />
      </div>
      {open && options.length > 0 && (
        <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
          {filtered.slice(0, 10).map(opt => (
            <button key={opt} type="button" onMouseDown={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
              {opt}
            </button>
          ))}
          {value.trim() && !options.some(o => o.toLowerCase() === value.trim().toLowerCase()) && (
            <button type="button" onMouseDown={() => { onChange(value.trim()); setOpen(false); }}
              className="w-full text-left px-4 py-3 text-sm text-green-600 font-medium hover:bg-green-50 flex items-center gap-2 border-t">
              <Plus className="w-4 h-4" /> Add "{value.trim()}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FieldLogPage() {
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionsData>({ customers: [], customerLocations: {}, locationAreas: {}, clients: [] });
  const [serviceRates, setServiceRates] = useState<ServiceRate[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [customerName, setCustomerName] = useState('');
  const [siteLocation, setSiteLocation] = useState('');
  const [servicedArea, setServicedArea] = useState('');
  const [workPerformed, setWorkPerformed] = useState('');
  const [jobDate, setJobDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRateId, setSelectedRateId] = useState<number | null>(null);
  const [amount, setAmount] = useState('200.00');
  const [rateSearch, setRateSearch] = useState('');
  const [showRateDropdown, setShowRateDropdown] = useState(false);
  const [materialsMode, setMaterialsMode] = useState<'none'|'product'|'supplies'>('none');
  const [productName, setProductName] = useState('');
  const [productVolume, setProductVolume] = useState('');
  const [productUnit, setProductUnit] = useState<'oz'|'gallons'>('oz');
  const [supplyItems, setSupplyItems] = useState<{name: string; quantity: string}[]>([]);
  const [supplySearch, setSupplySearch] = useState('');
  const [showSupplyDropdown, setShowSupplyDropdown] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('fieldEmployee');
    if (!stored) { router.push('/field'); return; }
    const emp = JSON.parse(stored);
    setEmployee(emp);

    fetch('/api/field/suggestions').then(r => r.json()).then(d => { if (d.success) setSuggestions(d); });
    fetch('/api/field/service-rates').then(r => r.json()).then(d => { if (d.success) setServiceRates(d.rates); });
  }, []);

  const locationsForCustomer = customerName
    ? (suggestions.customerLocations[customerName.toLowerCase()] || [])
    : [];
  const areasForLocation = siteLocation
    ? (suggestions.locationAreas[siteLocation.toLowerCase()] || [])
    : [];

  function buildMaterials() {
    if (materialsMode === 'product' && productName) {
      return { type: 'product', productName, volume: productVolume ? parseFloat(productVolume) : null, unit: productUnit };
    }
    if (materialsMode === 'supplies' && supplyItems.length > 0) {
      return { type: 'supplies', items: supplyItems };
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim()) { setError('Customer name is required'); return; }
    if (!siteLocation.trim()) { setError('Site location is required'); return; }
    if (!servicedArea.trim()) { setError('Serviced area is required'); return; }
    if (!workPerformed.trim()) { setError('Work performed is required'); return; }

    setSubmitting(true);
    setError('');
    try {
      const matchedClient = suggestions.clients.find(c => c.name.toLowerCase() === customerName.toLowerCase());
      const res = await fetch('/api/field/job-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          clientId: matchedClient?.id ?? null,
          siteLocation: siteLocation.trim(),
          servicedArea: servicedArea.trim(),
          workPerformed: workPerformed.trim(),
          jobDate,
          serviceRateId: selectedRateId,
          amount,
          materials: buildMaterials(),
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setCustomerName(''); setSiteLocation(''); setServicedArea('');
        setWorkPerformed(''); setSelectedRateId(null); setAmount('200.00');
        setRateSearch(''); setMaterialsMode('none'); setProductName('');
        setProductVolume(''); setSupplyItems([]);
        setJobDate(new Date().toISOString().split('T')[0]);
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!employee) {
    return <div className="fixed inset-0 z-50 bg-slate-50 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>;
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center gap-4 p-6">
        <CheckCircle2 className="w-20 h-20 text-green-500" />
        <h2 className="text-2xl font-bold text-slate-900">Job Logged!</h2>
        <p className="text-slate-500 text-center">Your job has been saved successfully.</p>
      </div>
    );
  }

  const filteredRates = serviceRates.filter(r => r.name.toLowerCase().includes(rateSearch.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <h1 className="text-base font-bold text-slate-900">Log a Job</h1>
            <p className="text-xs text-slate-500">Hi, {employee.name}</p>
          </div>
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <ClipboardList className="w-4 h-4 text-green-600" />
          </div>
        </div>
      </header>

      {/* Scrollable form */}
      <div className="flex-1 overflow-y-auto pb-24">
        <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-4 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {/* Date */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Job Date</label>
            <input
              type="date"
              value={jobDate}
              onChange={e => setJobDate(e.target.value)}
              className="w-full h-12 px-3 text-base border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
            />
          </div>

          {/* Customer */}
          <SearchableInput label="Customer Name *" options={suggestions.customers} value={customerName}
            onChange={v => { setCustomerName(v); setSiteLocation(''); setServicedArea(''); }}
            placeholder="Search or enter customer name" />

          {/* Site Location */}
          <SearchableInput label="Site Location *" options={locationsForCustomer} value={siteLocation}
            onChange={v => { setSiteLocation(v); setServicedArea(''); }}
            placeholder="Search or enter location" />

          {/* Serviced Area */}
          <SearchableInput label="Serviced Area *" options={areasForLocation} value={servicedArea}
            onChange={setServicedArea} placeholder="e.g. Kitchen, Basement, Exterior" />

          {/* Work Performed */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Work Performed *</label>
            <textarea
              value={workPerformed}
              onChange={e => setWorkPerformed(e.target.value)}
              rows={4}
              placeholder="Describe the work done in detail..."
              className="w-full px-3 py-3 text-base border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
            />
          </div>

          {/* Service Type & Amount */}
          <div className="grid grid-cols-5 gap-3">
            <div className="col-span-3 space-y-1.5 relative">
              <label className="text-sm font-medium text-slate-700">Service Type</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={rateSearch}
                  onChange={e => { setRateSearch(e.target.value); setShowRateDropdown(true); }}
                  onFocus={() => setShowRateDropdown(true)}
                  onBlur={() => setTimeout(() => setShowRateDropdown(false), 150)}
                  placeholder="Search service..."
                  className="w-full h-12 pl-9 pr-3 text-base border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                />
              </div>
              {showRateDropdown && (
                <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                  <button type="button" onMouseDown={() => { setSelectedRateId(null); setRateSearch(''); setShowRateDropdown(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-400 hover:bg-slate-50">No service type</button>
                  {filteredRates.map(r => (
                    <button key={r.id} type="button" onMouseDown={() => {
                      setSelectedRateId(r.id); setRateSearch(r.name);
                      setAmount(r.defaultRate); setShowRateDropdown(false);
                    }}
                      className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 border-t border-slate-50">
                      <div className="flex justify-between">
                        <span className="font-medium">{r.name}</span>
                        <span className="text-slate-400">${r.defaultRate}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Amount ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full h-12 px-3 text-base text-right font-semibold border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
              />
            </div>
          </div>

          {/* Materials */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-400" /> Materials Used
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['none','product','supplies'] as const).map(m => (
                <button key={m} type="button" onClick={() => setMaterialsMode(m)}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    materialsMode === m
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-white text-slate-500 border-slate-300 hover:border-green-400'
                  }`}>
                  {m === 'none' ? 'None' : m === 'product' ? 'Product' : 'Supplies'}
                </button>
              ))}
            </div>

            {materialsMode === 'product' && (
              <div className="space-y-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                <SearchableInput label="Product Name" options={PEST_PRODUCTS} value={productName}
                  onChange={setProductName} placeholder="Search or enter product..." />
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Volume</label>
                    <input type="number" min="0" step="0.1" value={productVolume}
                      onChange={e => setProductVolume(e.target.value)} placeholder="0.0"
                      className="w-full h-11 px-3 text-base text-right border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Unit</label>
                    <div className="grid grid-cols-2 gap-1.5 h-11">
                      {(['oz','gallons'] as const).map(u => (
                        <button key={u} type="button" onClick={() => setProductUnit(u)}
                          className={`rounded-xl text-sm font-medium border transition-colors ${
                            productUnit === u ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500 border-slate-300'
                          }`}>{u}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {materialsMode === 'supplies' && (
              <div className="space-y-3 bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-medium text-slate-700">Add Supply</label>
                  <div className="relative">
                    <Boxes className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input type="text" value={supplySearch}
                      onChange={e => { setSupplySearch(e.target.value); setShowSupplyDropdown(true); }}
                      onFocus={() => setShowSupplyDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSupplyDropdown(false), 150)}
                      placeholder="Search or type a supply..."
                      className="w-full h-11 pl-9 pr-3 text-base border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500/50" />
                  </div>
                  {showSupplyDropdown && (
                    <div className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-44 overflow-y-auto">
                      {PEST_SUPPLIES.filter(s => s.toLowerCase().includes(supplySearch.toLowerCase()) && !supplyItems.find(i => i.name === s))
                        .map(s => (
                          <button key={s} type="button" onMouseDown={() => { setSupplyItems(prev => [...prev, { name: s, quantity: '1' }]); setSupplySearch(''); setShowSupplyDropdown(false); }}
                            className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50">{s}</button>
                        ))}
                      {supplySearch.trim() && !PEST_SUPPLIES.some(s => s.toLowerCase() === supplySearch.trim().toLowerCase()) && (
                        <button type="button" onMouseDown={() => { setSupplyItems(prev => [...prev, { name: supplySearch.trim(), quantity: '1' }]); setSupplySearch(''); setShowSupplyDropdown(false); }}
                          className="w-full text-left px-4 py-3 text-sm text-green-600 font-medium hover:bg-green-50 flex items-center gap-2 border-t">
                          <Plus className="w-4 h-4" /> Add "{supplySearch.trim()}"
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {supplyItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white rounded-xl border border-slate-200 p-2">
                    <span className="flex-1 text-sm font-medium">{item.name}</span>
                    <label className="text-xs text-slate-400">Qty:</label>
                    <input type="number" min="1" value={item.quantity}
                      onChange={e => setSupplyItems(prev => prev.map((it, i) => i === idx ? { ...it, quantity: e.target.value } : it))}
                      className="w-14 h-8 px-2 text-sm text-right border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" />
                    <button type="button" onClick={() => setSupplyItems(prev => prev.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full h-14 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60 text-base"
          >
            {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</> : 'Submit Job Log'}
          </button>
        </form>
      </div>

      <FieldNav employee={employee} active="/field/log" />
    </div>
  );
}
