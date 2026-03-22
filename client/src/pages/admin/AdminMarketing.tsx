import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
  Facebook,
  Instagram,
  Heart,
  MessageCircle,
  Repeat2,
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

interface FacebookPost {
  message: string;
  created_at: string;
  likes: number;
  comments: number;
  shares: number;
}

interface FacebookAccountMetrics {
  page_name: string;
  category: string;
  fan_count: number;
  followers_count: number;
}

interface FacebookEngagement {
  post_count_7d: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  page_impressions_unique: number;
  page_post_engagements: number;
  page_fan_adds_unique: number;
}

interface FacebookData {
  fetched_at: string;
  platform: string;
  page_id: string;
  status: string;
  account_metrics: FacebookAccountMetrics;
  engagement_7d: FacebookEngagement;
  recent_posts: FacebookPost[];
}

interface InstagramAccountMetrics {
  username: string;
  name: string;
  followers_count: number;
  media_count: number;
}

interface InstagramEngagement {
  impressions: number;
  reach: number;
  profile_views: number;
}

interface InstagramPost {
  caption: string;
  timestamp: string;
  like_count: number;
  comment_count: number;
  media_type: string;
  permalink: string;
}

interface InstagramData {
  fetched_at: string;
  platform: string;
  status: string;
  account_metrics: InstagramAccountMetrics;
  engagement_7d: InstagramEngagement;
  recent_posts: InstagramPost[];
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

function FacebookCard({
  fbData,
  isLoading,
  onConnect,
  isConnecting,
}: {
  fbData: MarketingResponse<FacebookData>;
  isLoading: boolean;
  onConnect: () => void;
  isConnecting: boolean;
}) {
  const fb = fbData.data;
  const isConnected = fb?.status === 'live';

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-100">
          <Facebook className="w-7 h-7 text-blue-600" />
        </div>
        <div className="animate-pulse w-32 h-5 bg-gray-200 rounded" />
        <div className="animate-pulse w-24 h-4 bg-gray-100 rounded" />
      </div>
    );
  }

  const totalEngagement =
    (fb?.engagement_7d.total_likes ?? 0) +
    (fb?.engagement_7d.total_comments ?? 0) +
    (fb?.engagement_7d.total_shares ?? 0);
  const fanCount = fb?.account_metrics.fan_count ?? 0;
  const engagementRate = fanCount > 0
    ? ((totalEngagement / fanCount) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600">
          <Facebook className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {isConnected ? fb.account_metrics.page_name : 'Facebook'}
          </p>
          <p className="text-sm text-gray-500">
            {isConnected ? `${fb.account_metrics.fan_count.toLocaleString()} followers` : 'Not connected'}
          </p>
        </div>
      </div>

      {isConnected ? (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Engagement Rate</p>
              <p className="font-semibold text-gray-900">{engagementRate}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Posts (7d)</p>
              <p className="font-semibold text-gray-900">{fb.engagement_7d.post_count_7d}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs flex items-center gap-1">
                <Heart className="w-3 h-3" /> Likes
              </p>
              <p className="font-semibold text-gray-900">{fb.engagement_7d.total_likes.toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs flex items-center gap-1">
                <MessageCircle className="w-3 h-3" /> Comments
              </p>
              <p className="font-semibold text-gray-900">{fb.engagement_7d.total_comments.toLocaleString()}</p>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-right">
            Last updated: {fb.fetched_at}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Connect Facebook page to track likes, comments, and shares
          </p>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            Not connected
          </span>
          <button
            className="mt-1 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: APS_BLUE }}
            onClick={onConnect}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        </>
      )}
    </div>
  );
}

function InstagramCard({
  igData,
  isLoading,
}: {
  igData: MarketingResponse<InstagramData>;
  isLoading: boolean;
}) {
  const ig = igData.data;
  const isConnected = ig?.status === 'live';

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center gap-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-pink-100">
          <Instagram className="w-7 h-7 text-pink-600" />
        </div>
        <div className="animate-pulse w-32 h-5 bg-gray-200 rounded" />
        <div className="animate-pulse w-24 h-4 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
          <Instagram className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">
            {isConnected ? `@${ig.account_metrics.username}` : 'Instagram'}
          </p>
          <p className="text-sm text-gray-500">
            {isConnected
              ? `${ig.account_metrics.followers_count.toLocaleString()} followers`
              : ig?.status === 'not_linked'
                ? 'Not linked to Facebook page'
                : 'Not connected'}
          </p>
        </div>
      </div>

      {isConnected ? (
        <>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Reach (7d)</p>
              <p className="font-semibold text-gray-900">{(ig.engagement_7d.reach ?? 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Impressions (7d)</p>
              <p className="font-semibold text-gray-900">{(ig.engagement_7d.impressions ?? 0).toLocaleString()}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Posts (7d)</p>
              <p className="font-semibold text-gray-900">{ig.recent_posts.length}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-500 text-xs">Total Media</p>
              <p className="font-semibold text-gray-900">{ig.account_metrics.media_count.toLocaleString()}</p>
            </div>
          </div>

          <div className="text-xs text-gray-400 text-right">
            Last updated: {ig.fetched_at}
          </div>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {ig?.status === 'not_linked'
              ? 'Link Instagram to Facebook Page via Meta Business Suite to enable tracking.'
              : 'Instagram metrics appear automatically when linked to your Facebook Page.'}
          </p>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            {ig?.status === 'not_linked' ? 'Not linked' : 'Not connected'}
          </span>
        </>
      )}
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

      {!ads && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-amber-800 text-sm">
          Google Ads data is loading. Try refreshing the page, or check the Google Ads tab for details.
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

function SocialTab({
  fbData,
  igData,
  fbLoading,
  igLoading,
  onConnectFacebook,
  isConnectingFb,
  connectError,
}: {
  fbData: MarketingResponse<FacebookData>;
  igData: MarketingResponse<InstagramData>;
  fbLoading: boolean;
  igLoading: boolean;
  onConnectFacebook: () => void;
  isConnectingFb: boolean;
  connectError: string | null;
}) {
  const fb = fbData.data;
  const ig = igData.data;
  const fbConnected = fb?.status === 'live';
  const igConnected = ig?.status === 'live';

  // Get latest post date from Facebook
  const lastPostDate = fb?.recent_posts?.[0]?.created_at;
  const formattedLastPost = lastPostDate
    ? new Date(lastPostDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="space-y-6">
      {/* Connection status banner */}
      {!fbConnected && !igLoading && (
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-800 text-sm">
          <strong>Connect Facebook</strong> to start tracking page metrics, post engagement, and audience growth.
          {ig?.status === 'not_linked' && (
            <span className="block mt-1">
              Instagram will connect automatically once linked via Meta Business Suite.
            </span>
          )}
        </div>
      )}

      {fbConnected && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-green-800 text-sm flex items-center gap-2">
          <Facebook className="w-4 h-4 text-green-600" />
          <span>
            <strong>{fb.account_metrics.page_name}</strong> connected
            {formattedLastPost && ` • Last post: ${formattedLastPost}`}
            {igConnected && ` • Instagram @${ig.account_metrics.username} linked`}
          </span>
        </div>
      )}

      {connectError && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-800 text-sm">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {connectError}
        </div>
      )}

      {/* Social Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <FacebookCard fbData={fbData} isLoading={fbLoading} onConnect={onConnectFacebook} isConnecting={isConnectingFb} />
        <InstagramCard igData={igData} isLoading={igLoading} />
      </div>

      {/* Recent Facebook Posts */}
      {fbConnected && fb.recent_posts && fb.recent_posts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Facebook className="w-4 h-4 text-blue-600" />
              Recent Facebook Posts (7d)
            </h3>
          </div>
          <div className="divide-y">
            {fb.recent_posts.map((post, i) => {
              const postDate = post.created_at
                ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '';
              return (
                <div key={i} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-800 line-clamp-2 flex-1">
                      {post.message || <span className="text-gray-400 italic">No text</span>}
                    </p>
                    <span className="text-xs text-gray-400 ml-3 whitespace-nowrap">{postDate}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-red-400" />
                      {post.likes.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                      {post.comments.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Repeat2 className="w-3.5 h-3.5 text-green-400" />
                      {post.shares.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Instagram Posts */}
      {igConnected && ig.recent_posts && ig.recent_posts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Instagram className="w-4 h-4 text-pink-500" />
              Recent Instagram Posts (7d)
            </h3>
          </div>
          <div className="divide-y">
            {ig.recent_posts.map((post, i) => {
              const postDate = post.timestamp
                ? new Date(post.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '';
              return (
                <div key={i} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-gray-800 line-clamp-2 flex-1">
                      {post.caption || <span className="text-gray-400 italic">No caption</span>}
                    </p>
                    <span className="text-xs text-gray-400 ml-3 whitespace-nowrap">{postDate}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-red-400" />
                      {post.like_count.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-400" />
                      {post.comment_count.toLocaleString()}
                    </span>
                    <span className="text-gray-400">{post.media_type}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!fbConnected && (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center text-gray-400 text-sm">
          <ExternalLink className="w-6 h-6 mx-auto mb-2 opacity-30" />
          <p className="font-medium text-gray-500">Facebook not connected</p>
          <p className="mt-1">
            Click the Connect button above to pull in your Facebook page data.
          </p>
        </div>
      )}
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

  const { data: fbResponse, isLoading: fbLoading } = useQuery<
    MarketingResponse<FacebookData>
  >({
    queryKey: ["/api/admin/marketing/facebook"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/marketing/facebook");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: igResponse, isLoading: igLoading } = useQuery<
    MarketingResponse<InstagramData>
  >({
    queryKey: ["/api/admin/marketing/instagram"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/marketing/instagram");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const [connectError, setConnectError] = useState<string | null>(null);
  const connectFbMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/marketing/connect-social");
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data.facebook === 'connected') {
        setConnectError(null);
        queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/facebook"] });
        queryClient.invalidateQueries({ queryKey: ["/api/admin/marketing/instagram"] });
      } else {
        setConnectError(data.message || 'Connection failed');
      }
    },
    onError: () => {
      setConnectError('Failed to connect. Please try again.');
    },
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
  const emptyFb: MarketingResponse<FacebookData> = {
    success: true,
    data: null,
    lastFetched: null,
  };
  const emptyIg: MarketingResponse<InstagramData> = {
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
              {activeTab === "social" && (
                <SocialTab
                  fbData={fbResponse ?? emptyFb}
                  igData={igResponse ?? emptyIg}
                  fbLoading={fbLoading}
                  igLoading={igLoading}
                  onConnectFacebook={() => connectFbMutation.mutate()}
                  isConnectingFb={connectFbMutation.isPending}
                  connectError={connectError}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
