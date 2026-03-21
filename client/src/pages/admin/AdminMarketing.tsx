import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  BarChart3,
  Search,
  Globe,
  Share2,
  DollarSign,
  MousePointerClick,
  Target,
  Users,
  Eye,
  ExternalLink,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface Campaign {
  campaign_name: string;
  campaign_status: string;
  cost_micros: number;
  spend_usd: number;
  clicks: number;
  impressions: number;
  conversions: number;
}

interface AdsCampaignsData {
  fetched_at: string;
  customer_id: string;
  campaign_count: number;
  campaigns: Campaign[];
}

interface SearchTerm {
  search_term: string;
  clicks: number;
  impressions: number;
  cost_micros: number;
  spend_usd: number;
  conversions: number;
}

interface SearchTermsData {
  fetched_at: string;
  customer_id: string;
  campaign_id: string;
  term_count: number;
  search_terms: SearchTerm[];
}

interface GA4Totals {
  sessions: number;
  users: number;
  pageviews: number;
}

interface GA4Page {
  page_path: string;
  pageviews: number;
}

interface GA4SourceBucket {
  sessions: number;
  users: number;
  pageviews: number;
}

interface GA4Data {
  fetched_at: string;
  property_id: string;
  date_range: string;
  totals: GA4Totals;
  top_pages: GA4Page[];
  traffic_sources: Record<string, GA4SourceBucket>;
  row_count: number;
}

interface MarketingResponse<T> {
  success: boolean;
  data: T | null;
  lastFetched: string | null;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const COMPETITOR_KEYWORDS = [
  "echo shield",
  "green pest",
  "presto pest",
  "terminix",
  "orkin",
  "dominion",
];

const APS_NAVY = "#1E3A5F";
const APS_BLUE = "#1D4ED8";

const TAB_LIST = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "ads", label: "Google Ads", icon: Target },
  { id: "seo", label: "SEO", icon: Search },
  { id: "social", label: "Social Media", icon: Share2 },
] as const;

type TabId = (typeof TAB_LIST)[number]["id"];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isCompetitorTerm(term: string): boolean {
  const lower = term.toLowerCase();
  return COMPETITOR_KEYWORDS.some((kw) => lower.includes(kw));
}

function ctr(clicks: number, impressions: number): string {
  if (!impressions) return "0.00%";
  return ((clicks / impressions) * 100).toFixed(2) + "%";
}

function fmt$(n: number): string {
  return "$" + n.toFixed(2);
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    ENABLED: "bg-green-100 text-green-800",
    PAUSED: "bg-yellow-100 text-yellow-800",
    REMOVED: "bg-gray-100 text-gray-500",
  };
  const cls = colors[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div
      className="bg-white rounded-lg shadow-sm overflow-hidden"
      style={{ borderTop: `4px solid ${color}` }}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 font-medium">{label}</span>
          <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function NoData({ lastFetched }: { lastFetched: string | null }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
      <p className="text-lg font-medium">No data yet</p>
      {lastFetched && (
        <p className="text-sm mt-1">Last fetched: {lastFetched}</p>
      )}
      <p className="text-sm mt-2 text-gray-300">
        Run the fetch scripts to populate data
      </p>
    </div>
  );
}

function SocialCard({
  platform,
  icon,
  color,
  description,
}: {
  platform: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center gap-4">
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl"
        style={{ backgroundColor: color }}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-lg">{platform}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        Not connected
      </span>
      <button
        className="mt-1 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
        style={{ backgroundColor: APS_BLUE }}
        disabled
        title="Coming soon"
      >
        Connect
      </button>
    </div>
  );
}

// ── Tab: Overview ──────────────────────────────────────────────────────────────

function OverviewTab({
  adsData,
  ga4Data,
}: {
  adsData: MarketingResponse<AdsCampaignsData>;
  ga4Data: MarketingResponse<GA4Data>;
}) {
  const ads = adsData.data;
  const ga4 = ga4Data.data;

  if (!ads && !ga4) {
    return <NoData lastFetched={adsData.lastFetched} />;
  }

  const totalSpend = ads
    ? ads.campaigns.reduce((s, c) => s + c.spend_usd, 0)
    : 0;
  const totalClicks = ads
    ? ads.campaigns.reduce((s, c) => s + c.clicks, 0)
    : 0;
  const totalConversions = ads
    ? ads.campaigns.reduce((s, c) => s + c.conversions, 0)
    : 0;
  const cpl =
    totalConversions > 0 ? totalSpend / totalConversions : 0;

  const kpis = [
    {
      label: "Total Spend (7d)",
      value: fmt$(totalSpend),
      icon: DollarSign,
      color: APS_NAVY,
      sub: ads ? `Last updated: ${ads.fetched_at}` : undefined,
    },
    {
      label: "Clicks (7d)",
      value: fmtNum(totalClicks),
      icon: MousePointerClick,
      color: APS_BLUE,
      sub: ads ? `${ads.campaign_count} campaigns` : undefined,
    },
    {
      label: "Conversions (7d)",
      value: totalConversions.toFixed(1),
      icon: Target,
      color: "#059669",
      sub: undefined,
    },
    {
      label: "Cost Per Lead",
      value: totalConversions > 0 ? fmt$(cpl) : "—",
      icon: TrendingUp,
      color: "#7C3AED",
      sub: totalConversions === 0 ? "No conversions tracked" : undefined,
    },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* GA4 Quick Summary */}
      {ga4 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Globe className="w-4 h-4" style={{ color: APS_BLUE }} />
            Website Traffic (7d)
          </h3>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {fmtNum(ga4.totals.sessions)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {fmtNum(ga4.totals.users)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Users</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {fmtNum(ga4.totals.pageviews)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Pageviews</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-4 text-right">
            Last updated: {ga4.fetched_at}
          </p>
        </div>
      )}

      {/* Data freshness note */}
      {!ads && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
          ⚠ No Google Ads data available. Run{" "}
          <code className="font-mono">fetch_ads_data.py</code> to populate.
        </div>
      )}
    </div>
  );
}

// ── Tab: Google Ads ────────────────────────────────────────────────────────────

function AdsTab({
  adsData,
  termsData,
}: {
  adsData: MarketingResponse<AdsCampaignsData>;
  termsData: MarketingResponse<SearchTermsData>;
}) {
  const ads = adsData.data;
  const terms = termsData.data;

  if (!ads && !terms) {
    return <NoData lastFetched={adsData.lastFetched} />;
  }

  const competitorTerms =
    terms?.search_terms.filter((t) => isCompetitorTerm(t.search_term)) ?? [];

  return (
    <div className="space-y-6">
      {/* Competitor Alert Banner */}
      {competitorTerms.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-300 rounded-lg p-4">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800">
              Competitor Terms Detected
            </p>
            <p className="text-sm text-red-700 mt-1">
              Ads are triggering on competitor brand terms:{" "}
              <strong>
                {competitorTerms.map((t) => t.search_term).join(", ")}
              </strong>
              . Consider adding these as negative keywords.
            </p>
          </div>
        </div>
      )}

      {/* Campaign Performance Table */}
      {ads && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Target className="w-4 h-4" style={{ color: APS_BLUE }} />
              Campaign Performance (7d)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Campaign</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Impressions</th>
                  <th className="px-4 py-3 text-right">Clicks</th>
                  <th className="px-4 py-3 text-right">CTR</th>
                  <th className="px-4 py-3 text-right">Spend</th>
                  <th className="px-4 py-3 text-right">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {ads.campaigns.map((c, i) => (
                  <tr
                    key={c.campaign_name}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 max-w-xs truncate">
                      {c.campaign_name}
                    </td>
                    <td className="px-4 py-3">{statusBadge(c.campaign_status)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {fmtNum(c.impressions)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {fmtNum(c.clicks)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {ctr(c.clicks, c.impressions)}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-800">
                      {fmt$(c.spend_usd)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600">
                      {c.conversions.toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-semibold text-gray-700 text-sm">
                  <td className="px-4 py-3" colSpan={2}>
                    Totals
                  </td>
                  <td className="px-4 py-3 text-right">
                    {fmtNum(
                      ads.campaigns.reduce((s, c) => s + c.impressions, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {fmtNum(ads.campaigns.reduce((s, c) => s + c.clicks, 0))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ctr(
                      ads.campaigns.reduce((s, c) => s + c.clicks, 0),
                      ads.campaigns.reduce((s, c) => s + c.impressions, 0)
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {fmt$(ads.campaigns.reduce((s, c) => s + c.spend_usd, 0))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {ads.campaigns
                      .reduce((s, c) => s + c.conversions, 0)
                      .toFixed(1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Search Terms Table */}
      {terms && terms.search_terms.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Search className="w-4 h-4" style={{ color: APS_BLUE }} />
              Top Search Terms (7d)
              <span className="ml-auto text-xs text-red-600 font-normal flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300 inline-block" />
                Competitor term
              </span>
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Search Term</th>
                  <th className="px-4 py-3 text-right">Clicks</th>
                  <th className="px-4 py-3 text-right">Impr.</th>
                  <th className="px-4 py-3 text-right">CTR</th>
                  <th className="px-4 py-3 text-right">Spend</th>
                  <th className="px-4 py-3 text-right">Conv.</th>
                </tr>
              </thead>
              <tbody>
                {terms.search_terms.map((t, i) => {
                  const isComp = isCompetitorTerm(t.search_term);
                  return (
                    <tr
                      key={t.search_term}
                      className={
                        isComp
                          ? "bg-red-50"
                          : i % 2 === 0
                          ? "bg-white"
                          : "bg-gray-50"
                      }
                    >
                      <td
                        className={`px-4 py-3 font-medium ${
                          isComp ? "text-red-700" : "text-gray-800"
                        }`}
                      >
                        {isComp && (
                          <AlertTriangle className="w-3.5 h-3.5 inline mr-1.5 text-red-500" />
                        )}
                        {t.search_term}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {fmtNum(t.clicks)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {fmtNum(t.impressions)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {ctr(t.clicks, t.impressions)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          isComp ? "text-red-700" : "text-gray-800"
                        }`}
                      >
                        {fmt$(t.spend_usd)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {t.conversions.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!ads && !terms && <NoData lastFetched={null} />}
    </div>
  );
}

// ── Tab: SEO ───────────────────────────────────────────────────────────────────

function SeoTab({ ga4Data }: { ga4Data: MarketingResponse<GA4Data> }) {
  const ga4 = ga4Data.data;

  if (!ga4) {
    return <NoData lastFetched={ga4Data.lastFetched} />;
  }

  const sourceColors: Record<string, string> = {
    organic: "#059669",
    direct: "#3B82F6",
    paid: "#7C3AED",
    social: "#EC4899",
    other: "#9CA3AF",
  };

  const totalSessions = ga4.totals.sessions || 1;

  return (
    <div className="space-y-6">
      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <KpiCard
          label="Sessions (7d)"
          value={fmtNum(ga4.totals.sessions)}
          icon={Users}
          color="#059669"
          sub={`Last updated: ${ga4.fetched_at}`}
        />
        <KpiCard
          label="Users (7d)"
          value={fmtNum(ga4.totals.users)}
          icon={Users}
          color={APS_BLUE}
        />
        <KpiCard
          label="Pageviews (7d)"
          value={fmtNum(ga4.totals.pageviews)}
          icon={Eye}
          color={APS_NAVY}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: APS_BLUE }} />
              Top Pages by Views
            </h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                <th className="px-4 py-3 text-left">Page</th>
                <th className="px-4 py-3 text-right">Pageviews</th>
              </tr>
            </thead>
            <tbody>
              {ga4.top_pages.map((p, i) => (
                <tr
                  key={p.page_path}
                  className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-3 text-gray-700 font-mono text-xs max-w-xs truncate">
                    {p.page_path}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-800">
                    {fmtNum(p.pageviews)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" style={{ color: APS_BLUE }} />
              Traffic Sources
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {Object.entries(ga4.traffic_sources)
              .sort((a, b) => b[1].sessions - a[1].sessions)
              .map(([bucket, stats]) => {
                const pct = Math.round((stats.sessions / totalSessions) * 100);
                const color = sourceColors[bucket] ?? "#9CA3AF";
                return (
                  <div key={bucket}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-medium text-gray-700">
                        {bucket}
                      </span>
                      <span className="text-gray-500">
                        {fmtNum(stats.sessions)} sessions ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Social Media ─────────────────────────────────────────────────────────

function SocialTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-800 text-sm">
        Connect your social accounts to track posts, engagement, and audience
        growth alongside your ads and SEO data.
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <SocialCard
          platform="X / Twitter"
          icon="𝕏"
          color="#000000"
          description="Connect X account to track posts, likes, and retweets"
        />
        <SocialCard
          platform="Bluesky"
          icon="🦋"
          color="#0085FF"
          description="Connect Bluesky account to track posts, likes, and reposts"
        />
        <SocialCard
          platform="Facebook"
          icon="f"
          color="#1877F2"
          description="Connect Facebook page to track likes, comments, and shares"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-400 text-sm">
        <ExternalLink className="w-6 h-6 mx-auto mb-2 opacity-30" />
        Social media integration via bird / bsky / Facebook API coming soon.
        <br />
        Ask Steel City AI to enable it.
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function AdminMarketing() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const { data: adsResponse, isLoading: adsLoading } = useQuery<
    MarketingResponse<AdsCampaignsData>
  >({
    queryKey: ["/api/admin/marketing/ads-campaigns"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/marketing/ads-campaigns");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 min
  });

  const { data: termsResponse, isLoading: termsLoading } = useQuery<
    MarketingResponse<SearchTermsData>
  >({
    queryKey: ["/api/admin/marketing/ads-search-terms"],
    queryFn: async () => {
      const res = await apiRequest(
        "GET",
        "/api/admin/marketing/ads-search-terms"
      );
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: ga4Response, isLoading: ga4Loading } = useQuery<
    MarketingResponse<GA4Data>
  >({
    queryKey: ["/api/admin/marketing/ga4-overview"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/marketing/ga4-overview");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = adsLoading || termsLoading || ga4Loading;

  const emptyAds: MarketingResponse<AdsCampaignsData> = {
    success: true,
    data: null,
    lastFetched: null,
  };
  const emptyTerms: MarketingResponse<SearchTermsData> = {
    success: true,
    data: null,
    lastFetched: null,
  };
  const emptyGa4: MarketingResponse<GA4Data> = {
    success: true,
    data: null,
    lastFetched: null,
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div
        className="rounded-xl p-6 text-white shadow-md"
        style={{
          background: `linear-gradient(135deg, ${APS_NAVY} 0%, ${APS_BLUE} 100%)`,
        }}
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-7 h-7 opacity-80" />
          <div>
            <h1 className="text-2xl font-bold">Marketing Dashboard</h1>
            <p className="text-blue-200 text-sm mt-0.5">
              Google Ads • SEO • Social — last 7 days
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          {TAB_LIST.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === id
                  ? "border-blue-600 text-blue-700 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
              style={
                activeTab === id
                  ? { borderColor: APS_BLUE, color: APS_BLUE }
                  : {}
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
              Loading marketing data…
            </div>
          ) : (
            <>
              {activeTab === "overview" && (
                <OverviewTab
                  adsData={adsResponse ?? emptyAds}
                  ga4Data={ga4Response ?? emptyGa4}
                />
              )}
              {activeTab === "ads" && (
                <AdsTab
                  adsData={adsResponse ?? emptyAds}
                  termsData={termsResponse ?? emptyTerms}
                />
              )}
              {activeTab === "seo" && (
                <SeoTab ga4Data={ga4Response ?? emptyGa4} />
              )}
              {activeTab === "social" && <SocialTab />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
