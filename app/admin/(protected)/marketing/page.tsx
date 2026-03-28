import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Marketing Dashboard | APS Admin',
  robots: { index: false, follow: false },
}

// Admin marketing page — Server Component shell
// The actual dashboard is a Client Component with tabs
export default function AdminMarketingPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marketing Dashboard</h1>
          <p className="text-gray-500 mb-8">Google Ads · SEO · GA4 Analytics · Recommendations</p>
          {/* 
            TODO: Import and render AdminMarketing Client Component here
            The original Replit project has a 843-line AdminMarketing.tsx component
            with 4 tabs: Overview, Google Ads, SEO, Social Media
            
            When the source code is available, migrate it here:
            import AdminMarketing from '@/components/admin/AdminMarketing'
            <AdminMarketing />
          */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
            <p className="font-semibold text-amber-800 mb-2">⚠️ Admin Dashboard — Migration Pending</p>
            <p className="text-amber-700 text-sm">
              The marketing dashboard requires the original AdminMarketing.tsx component from the
              Replit source code. Once the source is available, add &apos;use client&apos; to the top
              of AdminMarketing.tsx and import it here. All API routes are ready at:
            </p>
            <ul className="mt-3 space-y-1 text-sm text-amber-700 font-mono">
              <li>GET /api/admin/marketing/ads-campaigns</li>
              <li>GET /api/admin/marketing/ads-search-terms</li>
              <li>GET /api/admin/marketing/ga4-overview</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
