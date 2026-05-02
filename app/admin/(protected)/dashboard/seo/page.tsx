'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, FileText, ExternalLink, AlertCircle, Folder, Search, Globe } from 'lucide-react';

interface SeoStats {
  posts: { published: number; drafts: number; total: number };
  recent: { id: number; title: string; slug: string; category: string; published_at: string | null; is_published: boolean }[];
  categories: { label: string; n: number }[];
}

// Static service+city coverage estimate — derived from app/[service]/[city] pages.
const SERVICE_CITY_PAGES = 60;

export default function SeoDashboardPage() {
  const [stats, setStats] = useState<SeoStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard/seo-stats').then(r => r.json()).then(setStats).finally(() => setLoading(false));
  }, []);

  const max = stats?.categories.reduce((m, c) => Math.max(m, c.n), 0) || 1;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <Link href="/admin/dashboard" className="inline-flex items-center gap-1 text-sm text-blue-700 hover:underline mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">🔍 SEO Overview</h1>
        <p className="text-gray-600 mt-1 mb-5">Content inventory, top categories, and indexing status.</p>

        {/* Connect Search Console notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-amber-900">Connect Google Search Console for live ranking data</p>
            <p className="text-sm text-amber-800 mt-0.5">
              Impressions, clicks, average position, and indexing status will populate once Search Console API is connected.
              Content metrics below come from your live blog and site pages.
            </p>
          </div>
          <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer"
            className="text-sm font-semibold text-amber-900 hover:text-amber-700 inline-flex items-center gap-1 shrink-0">
            Open Search Console <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {loading || !stats ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              <KPI icon={FileText} label="Published Posts" value={stats.posts.published} accent="bg-emerald-50 text-emerald-700" />
              <KPI icon={FileText} label="Drafts" value={stats.posts.drafts} accent="bg-gray-50 text-gray-700" />
              <KPI icon={Folder} label="Categories" value={stats.categories.length} accent="bg-blue-50 text-blue-700" />
              <KPI icon={Globe} label="City × Service Pages" value={SERVICE_CITY_PAGES} accent="bg-purple-50 text-purple-700" />
            </div>

            <div className="grid md:grid-cols-2 gap-5 mb-5">
              {/* Recent posts */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Recently published / updated</h3>
                {stats.recent.length === 0 ? (
                  <p className="text-sm text-gray-500">No posts yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.recent.map(p => (
                      <li key={p.id} className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-b-0">
                        <div className="min-w-0 flex-1">
                          <Link href={`/admin/blog?edit=${p.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-700 line-clamp-1">{p.title}</Link>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {p.category} · {p.is_published ? 'Published' : 'Draft'}
                            {p.published_at && ` · ${new Date(p.published_at).toLocaleDateString()}`}
                          </p>
                        </div>
                        {p.is_published && (
                          <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline shrink-0 inline-flex items-center gap-0.5">
                            View <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Categories */}
              <div className="bg-white rounded-xl p-5 border border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><Folder className="w-4 h-4 text-gray-400" />Content by category</h3>
                {stats.categories.length === 0 ? (
                  <p className="text-sm text-gray-400">No categories yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {stats.categories.map(c => (
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

            <div className="bg-white rounded-xl p-5 border border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2"><Search className="w-4 h-4 text-gray-400" />Search rankings</h3>
              <p className="text-sm text-gray-500 mb-3">Top queries, impressions, and average position will appear once Google Search Console is connected.</p>
              <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-400 text-sm border border-dashed border-gray-200">
                No ranking data yet — connect Search Console to view
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
