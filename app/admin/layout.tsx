import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/admin-session';
import AdminNav from '@/components/admin/AdminNav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session.userId || session.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminNav />

      {/* Main content area — offset by sidebar width on desktop */}
      <div className="md:ml-60">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Admin Portal
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {session.firstName} {session.lastName}
                <span className="text-gray-400 ml-1">({session.email})</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Admin
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
