import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Admin Dashboard | APS Admin',
  robots: { index: false, follow: false },
}

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">Welcome to the Absolute Pest Services admin panel.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/admin/marketing"
              className="p-6 bg-green-50 border border-green-200 rounded-xl hover:bg-green-100 transition-colors"
            >
              <h2 className="font-bold text-gray-900 mb-2">📊 Marketing Dashboard</h2>
              <p className="text-sm text-gray-600">
                Google Ads campaigns, SEO overview, GA4 metrics, and recommendations.
              </p>
            </Link>

            <Link
              href="/admin/dashboard/ads"
              className="p-6 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
            >
              <h2 className="font-bold text-gray-900 mb-2">📢 Google Ads</h2>
              <p className="text-sm text-gray-600">
                Campaign performance, search terms, and budget management.
              </p>
            </Link>

            <Link
              href="/admin/dashboard/seo"
              className="p-6 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors"
            >
              <h2 className="font-bold text-gray-900 mb-2">🔍 SEO Overview</h2>
              <p className="text-sm text-gray-600">
                Rankings, impressions, click-through rates, and indexing status.
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
