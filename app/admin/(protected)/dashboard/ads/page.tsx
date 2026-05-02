'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, TrendingUp, Phone, Mail, MapPin, Wrench, ExternalLink, AlertCircle } from 'lucide-react';

interface FunnelStats {
  windowDays: number;
  contactSubmissions: number;
  inspectionsScheduled: number;
  activeContracts: number;
  jobsCompleted: number;
  invoicesIssued: number;
  revenue: number;
  bySvc: { label: string; n: number }[];
  byCity: { label: string; n: number }[];
  daily: { day: string; n: number }[];
}

const WINDOWS = [7, 30, 90];

export default function AdsDashboardPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<FunnelStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/dashboard/funnel-stats?days=${days}`)
      .then(r => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [days]);

  const peakDaily = stats?.daily.reduce((m, d) => Math.max(m, d.n), 0) || 1;
  const totalContacts = stats?.contactSubmissions ?? 0;
  const conversion = totalContacts > 0 ? Math.round(((stats?.inspectionsScheduled || 0) / totalContacts) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📢 Google Ads & Lead Performance</h1>
            <p className="text-gray-600 mt-1">Track inbound leads, conversions, and campaign reach.</p>
          </div>
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
            {WINDOWS.map(w => (
              <button key={w} onClick={() => setDays(w)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${days === w ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Last {w}d
              </button>
            ))}
          </div>
        </div>

        {/* Connect Google Ads notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-900">Connect Google Ads for full campaign data</p>
            <p className="text-sm text-amber-800 mt-0.5">
              Spend, impressions, CTR, and search terms will populate once Google Ads API credentials are added.
              Lead data below is pulled live from your website forms.
            </p>
          </div>
          <a href="https://ads.google.com" target="_blank" rel="noreferrer"
            className="text-sm font-semibold text-amber-900 hover:text-amber-700 inline-flex items-center gap-1 shrink-0">
            Open Google Ads <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {loading || !stats ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
              <KPI icon={Mail} label="Contact Forms" value={stats.contactSubmissions} accent="bg-blue-50 text-blue-700" />
              <KPI icon={Phone} label="Inspections Booked" value={stats.inspectionsScheduled} accent="bg-green-50 text-green-700" />
              <KPI icon={Wrench} label="Jobs Completed" value={stats.jobsCompleted} accent="bg-purple-50 text-purple-700" />
              <KPI icon={TrendingUp} label="Lead → Booking" value={`${conversion}%`} accent="bg-amber-50 text-amber-700" />
              <KPI icon={TrendingUp} label="Revenue (est.)" value={`$${stats.revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} accent="bg-emerald-50 text-emerald-700" />
            </div>

            {/* Daily lead chart */}
            <div className="bg-white rounded-xl p-5 mb-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Lead volume — last {days} days</h3>
              {stats.daily.length === 0 ? (
                <p className="text-sm text-gray-500">No leads in this window.</p>
              ) : (
                <div className="flex items-end gap-1 h-32">
                  {stats.daily.map(d => (
                    <div key={d.day} className="flex-1 flex flex-col items-center justify-end group relative">
                      <div className="w-full bg-blue-500 hover:bg-blue-600 rounded-t" style={{ height: `${(d.n / peakDaily) * 100}%`, minHeight: d.n > 0 ? 2 : 0 }} />
                      <div className="absolute -top-7 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {d.day}: {d.n}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-5 mb-5">
              <BreakdownCard title="Top Service Requests" items={stats.bySvc} icon={Wrench} />
              <BreakdownCard title="Top Cities" items={stats.byCity} icon={MapPin} />
            </div>

            {/* Campaigns placeholder */}
            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">Campaign performance</h3>
              <p className="text-sm text-gray-500 mb-3">Live campaign metrics will appear here once Google Ads API is connected.</p>
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">
                No campaigns connected yet
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string | number; accent: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${accent}`}>
        <Icon className="w-4 h-4" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function BreakdownCard({ title, items, icon: Icon }: { title: string; items: { label: string; n: number }[]; icon: any }) {
  const max = items.reduce((m, i) => Math.max(m, i.n), 0) || 1;
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-200">
      <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Icon className="w-4 h-4 text-gray-400" />{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No data yet.</p>
      ) : (
        <ul className="space-y-2">
          {items.map(it => (
            <li key={it.label}>
              <div className="flex justify-between text-sm mb-0.5"><span className="text-gray-700 truncate pr-2">{it.label}</span><span className="font-semibold text-gray-900">{it.n}</span></div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(it.n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
