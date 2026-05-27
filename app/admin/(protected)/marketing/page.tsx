'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3, Megaphone, Search, Lightbulb,
  Mail, Phone, Wrench, TrendingUp, MapPin, ExternalLink,
  AlertCircle, Loader2, FileText, Folder, CheckCircle2,
} from 'lucide-react';

type Tab = 'overview' | 'ads' | 'seo' | 'recs';

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

interface SeoStats {
  posts: { published: number; drafts: number; total: number };
  recent: { id: number; title: string; slug: string; category: string; published_at: string | null; is_published: boolean }[];
  categories: { label: string; n: number }[];
}

interface SearchConsoleData {
  configured: boolean;
  message?: string;
  error?: string;
  hint?: string;
  windowDays?: number;
  site?: string;
  totals?: { clicks: number; impressions: number; ctr: number; position: number };
  topQueries?: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  topPages?: { page: string; clicks: number; impressions: number; position: number }[];
  daily?: { date: string; clicks: number; impressions: number }[];
}

const WINDOWS = [7, 30, 90];

export default function AdminMarketingPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [days, setDays] = useState(30);
  const [funnel, setFunnel] = useState<FunnelStats | null>(null);
  const [seo, setSeo] = useState<SeoStats | null>(null);
  const [sc, setSc] = useState<SearchConsoleData | null>(null);
  const [adsMsg, setAdsMsg] = useState<string>('');
  const [ga4Msg, setGa4Msg] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/admin/dashboard/funnel-stats?days=${days}`).then(r => r.json()),
      fetch('/api/admin/dashboard/seo-stats').then(r => r.json()),
      fetch(`/api/admin/marketing/search-console?days=${days}`).then(r => r.json()).catch(() => ({ configured: false })),
      fetch('/api/admin/marketing/ads-campaigns').then(r => r.json()).catch(() => ({})),
      fetch('/api/admin/marketing/ga4-overview').then(r => r.json()).catch(() => ({})),
    ]).then(([f, s, scRes, a, g]) => {
      setFunnel(f);
      setSeo(s);
      setSc(scRes);
      setAdsMsg(a?.message || '');
      setGa4Msg(g?.message || '');
    }).finally(() => setLoading(false));
  }, [days]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Dashboard</h1>
            <p className="text-gray-600 mt-1">Google Ads · SEO · GA4 Analytics · Recommendations</p>
          </div>
          <div className="flex gap-1 bg-white rounded-lg p-1 border border-gray-200">
            {WINDOWS.map(w => (
              <button key={w} onClick={() => setDays(w)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${days === w ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                Last {w}d
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 mb-5">
          <div className="flex overflow-x-auto border-b border-gray-200">
            <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} icon={BarChart3}>Overview</TabButton>
            <TabButton active={tab === 'ads'} onClick={() => setTab('ads')} icon={Megaphone}>Google Ads</TabButton>
            <TabButton active={tab === 'seo'} onClick={() => setTab('seo')} icon={Search}>SEO</TabButton>
            <TabButton active={tab === 'recs'} onClick={() => setTab('recs')} icon={Lightbulb}>Recommendations</TabButton>
          </div>

          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
            ) : (
              <>
                {tab === 'overview' && <OverviewTab funnel={funnel} seo={seo} days={days} />}
                {tab === 'ads' && <AdsTab funnel={funnel} adsMsg={adsMsg} ga4Msg={ga4Msg} days={days} />}
                {tab === 'seo' && <SeoTab seo={seo} sc={sc} days={days} />}
                {tab === 'recs' && <RecsTab funnel={funnel} seo={seo} />}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }: { active: boolean; onClick: () => void; icon: any; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-5 py-3 text-sm font-medium inline-flex items-center gap-2 border-b-2 whitespace-nowrap ${
        active ? 'text-green-700 border-green-600' : 'text-gray-600 border-transparent hover:text-gray-900'
      }`}>
      <Icon className="w-4 h-4" />{children}
    </button>
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

function ConnectCTA({ title, body, href, label }: { title: string; body: string; href: string; label: string }) {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-amber-900">{title}</p>
        <p className="text-sm text-amber-800 mt-0.5">{body}</p>
      </div>
      <a href={href} target="_blank" rel="noreferrer"
        className="text-sm font-semibold text-amber-900 hover:text-amber-700 inline-flex items-center gap-1 shrink-0">
        {label} <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

function OverviewTab({ funnel, seo, days }: { funnel: FunnelStats | null; seo: SeoStats | null; days: number }) {
  if (!funnel || typeof funnel.contactSubmissions !== 'number') {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
        Marketing data is not available yet. The funnel stats endpoint returned an error — check the server logs.
      </div>
    );
  }
  const conv = funnel.contactSubmissions ? Math.round((funnel.inspectionsScheduled / funnel.contactSubmissions) * 100) : 0;
  const revenue = typeof funnel.revenue === 'number' ? funnel.revenue : 0;
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <KPI icon={Mail} label="Leads" value={funnel.contactSubmissions} accent="bg-blue-50 text-blue-700" />
        <KPI icon={Phone} label="Inspections" value={funnel.inspectionsScheduled} accent="bg-green-50 text-green-700" />
        <KPI icon={Wrench} label="Jobs" value={funnel.jobsCompleted} accent="bg-purple-50 text-purple-700" />
        <KPI icon={TrendingUp} label="Conversion" value={`${conv}%`} accent="bg-amber-50 text-amber-700" />
        <KPI icon={TrendingUp} label="Revenue" value={`$${revenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} accent="bg-emerald-50 text-emerald-700" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />Top cities ({days}d)</h3>
          <BreakdownList items={funnel.byCity} color="bg-blue-500" />
        </div>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2"><Wrench className="w-4 h-4 text-gray-400" />Top requested services</h3>
          <BreakdownList items={funnel.bySvc} color="bg-green-500" />
        </div>
      </div>

      {seo && (
        <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={FileText} label="Published Posts" value={seo.posts.published} accent="bg-emerald-50 text-emerald-700" />
          <KPI icon={FileText} label="Drafts" value={seo.posts.drafts} accent="bg-gray-50 text-gray-700" />
          <KPI icon={Folder} label="Categories" value={seo.categories.length} accent="bg-blue-50 text-blue-700" />
          <KPI icon={CheckCircle2} label="Active Contracts" value={funnel.activeContracts} accent="bg-purple-50 text-purple-700" />
        </div>
      )}
    </div>
  );
}

function AdsTab({ funnel, adsMsg, ga4Msg, days }: { funnel: FunnelStats | null; adsMsg: string; ga4Msg: string; days: number }) {
  const peak = funnel?.daily.reduce((m, d) => Math.max(m, d.n), 0) || 1;
  return (
    <div className="space-y-5">
      <ConnectCTA
        title="Connect Google Ads for live campaign data"
        body={adsMsg || 'Spend, impressions, CTR, and search terms will appear here once Google Ads API credentials are added.'}
        href="https://ads.google.com" label="Open Google Ads"
      />
      <ConnectCTA
        title="Connect GA4 Reporting for site traffic"
        body={ga4Msg || 'Sessions, users, and traffic sources will appear here once GA4 API credentials are added.'}
        href="https://analytics.google.com" label="Open GA4"
      />

      {funnel && (
        <>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Inbound lead volume — last {days}d</h3>
            {funnel.daily.length === 0 ? (
              <p className="text-sm text-gray-500">No leads in this window.</p>
            ) : (
              <div className="flex items-end gap-1 h-32">
                {funnel.daily.map(d => (
                  <div key={d.day} className="flex-1 flex flex-col items-center justify-end group relative">
                    <div className="w-full bg-blue-500 hover:bg-blue-600 rounded-t" style={{ height: `${(d.n / peak) * 100}%`, minHeight: d.n > 0 ? 2 : 0 }} />
                    <div className="absolute -top-7 hidden group-hover:block bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                      {d.day}: {d.n}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-sm text-gray-500 text-center">
            Live campaign performance and search term reports will appear here after Google Ads is connected.
          </div>
        </>
      )}
    </div>
  );
}

function SeoTab({ seo, sc, days }: { seo: SeoStats | null; sc: SearchConsoleData | null; days: number }) {
  if (!seo) return null;
  const max = seo.categories.reduce((m, c) => Math.max(m, c.n), 0) || 1;
  const liveSC = sc?.configured && sc.totals;
  return (
    <div className="space-y-5">
      {!liveSC && (
        <ConnectCTA
          title="Connect Google Search Console for ranking data"
          body={sc?.error || sc?.message || 'Top queries, impressions, clicks, and average position will populate once Search Console is connected.'}
          href="https://search.google.com/search-console" label="Open Search Console"
        />
      )}
      {liveSC && sc?.totals && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KPI icon={Search} label={`Clicks (${days}d)`} value={sc.totals.clicks.toLocaleString()} accent="bg-blue-50 text-blue-700" />
          <KPI icon={TrendingUp} label="Impressions" value={sc.totals.impressions.toLocaleString()} accent="bg-indigo-50 text-indigo-700" />
          <KPI icon={TrendingUp} label="Avg CTR" value={`${(sc.totals.ctr * 100).toFixed(1)}%`} accent="bg-amber-50 text-amber-700" />
          <KPI icon={TrendingUp} label="Avg Position" value={sc.totals.position.toFixed(1)} accent="bg-emerald-50 text-emerald-700" />
        </div>
      )}
      {liveSC && sc?.topQueries && sc.topQueries.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Top search queries</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
                  <th className="py-2 pr-4">Query</th>
                  <th className="py-2 pr-4 text-right">Clicks</th>
                  <th className="py-2 pr-4 text-right">Impr.</th>
                  <th className="py-2 pr-4 text-right">CTR</th>
                  <th className="py-2 text-right">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sc.topQueries.slice(0, 15).map(q => (
                  <tr key={q.query} className="hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-900 font-medium truncate max-w-xs" title={q.query}>{q.query}</td>
                    <td className="py-2 pr-4 text-right text-gray-700">{q.clicks}</td>
                    <td className="py-2 pr-4 text-right text-gray-500">{q.impressions.toLocaleString()}</td>
                    <td className="py-2 pr-4 text-right text-gray-500">{(q.ctr * 100).toFixed(1)}%</td>
                    <td className="py-2 text-right text-gray-700">{q.position.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KPI icon={FileText} label="Published" value={seo.posts.published} accent="bg-emerald-50 text-emerald-700" />
        <KPI icon={FileText} label="Drafts" value={seo.posts.drafts} accent="bg-gray-50 text-gray-700" />
        <KPI icon={Folder} label="Categories" value={seo.categories.length} accent="bg-blue-50 text-blue-700" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Recently published</h3>
          {seo.recent.length === 0 ? (
            <p className="text-sm text-gray-500">No posts yet.</p>
          ) : (
            <ul className="space-y-2">
              {seo.recent.slice(0, 8).map(p => (
                <li key={p.id} className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-100 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/blog?edit=${p.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-700 line-clamp-1">{p.title}</Link>
                    <p className="text-xs text-gray-500 mt-0.5">{p.category} · {p.is_published ? 'Published' : 'Draft'}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-3">Content by category</h3>
          {seo.categories.length === 0 ? (
            <p className="text-sm text-gray-400">No categories yet.</p>
          ) : (
            <ul className="space-y-2">
              {seo.categories.map(c => (
                <li key={c.label}>
                  <div className="flex justify-between text-sm mb-0.5"><span className="text-gray-700 truncate pr-2">{c.label}</span><span className="font-semibold text-gray-900">{c.n}</span></div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(c.n / max) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function RecsTab({ funnel, seo }: { funnel: FunnelStats | null; seo: SeoStats | null }) {
  if (!funnel || !seo) return null;
  const recs: { title: string; body: string; severity: 'good' | 'warn' | 'opp' }[] = [];

  const conv = funnel.contactSubmissions ? (funnel.inspectionsScheduled / funnel.contactSubmissions) : 0;
  if (funnel.contactSubmissions === 0) {
    recs.push({ severity: 'warn', title: 'No leads in the selected window', body: 'Check that your contact forms are reachable and that Google Ads campaigns are active.' });
  } else if (conv < 0.2) {
    recs.push({ severity: 'opp', title: 'Lead-to-booking rate is below 20%', body: `${Math.round(conv * 100)}% of contact submissions become inspections. Consider follow-up automation or faster response time.` });
  } else {
    recs.push({ severity: 'good', title: 'Healthy lead conversion', body: `${Math.round(conv * 100)}% of contact submissions become inspections — keep it up.` });
  }

  if (seo.posts.published < 10) {
    recs.push({ severity: 'opp', title: 'Add more SEO content', body: `Only ${seo.posts.published} published posts. Aim for 20+ to expand long-tail keyword coverage.` });
  }

  if (seo.posts.drafts > 5) {
    recs.push({ severity: 'opp', title: 'Publish your draft posts', body: `${seo.posts.drafts} drafts are ready. Publishing them will increase your indexed pages.` });
  }

  if (funnel.byCity.length > 0 && funnel.byCity[0].n >= 5) {
    recs.push({ severity: 'good', title: `Strongest city: ${funnel.byCity[0].label}`, body: `${funnel.byCity[0].n} leads from ${funnel.byCity[0].label}. Consider scaling Google Ads geo-targeting here.` });
  }

  if (funnel.activeContracts === 0) {
    recs.push({ severity: 'warn', title: 'No active service contracts', body: 'Recurring contracts stabilize revenue. Promote contract upsells on your invoices and follow-up emails.' });
  }

  return (
    <ul className="space-y-3">
      {recs.map((r, i) => (
        <li key={i} className={`p-4 rounded-xl border ${
          r.severity === 'good' ? 'bg-emerald-50 border-emerald-200' :
          r.severity === 'warn' ? 'bg-red-50 border-red-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <p className={`font-semibold ${
            r.severity === 'good' ? 'text-emerald-900' :
            r.severity === 'warn' ? 'text-red-900' :
            'text-blue-900'
          }`}>{r.title}</p>
          <p className={`text-sm mt-0.5 ${
            r.severity === 'good' ? 'text-emerald-800' :
            r.severity === 'warn' ? 'text-red-800' :
            'text-blue-800'
          }`}>{r.body}</p>
        </li>
      ))}
    </ul>
  );
}

function BreakdownList({ items, color }: { items: { label: string; n: number }[]; color: string }) {
  const max = items.reduce((m, i) => Math.max(m, i.n), 0) || 1;
  if (items.length === 0) return <p className="text-sm text-gray-400">No data yet.</p>;
  return (
    <ul className="space-y-2">
      {items.slice(0, 8).map(it => (
        <li key={it.label}>
          <div className="flex justify-between text-sm mb-0.5"><span className="text-gray-700 truncate pr-2">{it.label}</span><span className="font-semibold text-gray-900">{it.n}</span></div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${color} rounded-full`} style={{ width: `${(it.n / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
