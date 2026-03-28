import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-session'
import AdminNav from '@/components/admin/AdminNav'
import { Menu } from 'lucide-react'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()

  if (!session.userId || session.role !== 'admin') {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <AdminNav />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="lg:ml-60">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">
                {session.firstName} {session.lastName}
              </span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
