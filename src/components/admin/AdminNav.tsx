'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Bug, LayoutDashboard, Users, Wrench, ClipboardCheck,
  Receipt, FileText, Newspaper, Calendar, TrendingUp,
  LogOut, Menu, X, ClipboardList
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
  { label: 'Clients', icon: Users, href: '/admin/clients' },
  { label: 'Service Requests', icon: Wrench, href: '/admin/service-requests' },
  { label: 'Inspections', icon: ClipboardCheck, href: '/admin/inspections' },
  { label: 'Job Log', icon: ClipboardList, href: '/admin/job-logs' },
  { label: 'Invoices', icon: Receipt, href: '/admin/invoices' },
  { label: 'Contracts', icon: FileText, href: '/admin/contracts' },
  { label: 'Blog', icon: Newspaper, href: '/admin/blog' },
  { label: 'Scheduling', icon: Calendar, href: '/admin/scheduling' },
  { label: 'Marketing', icon: TrendingUp, href: '/admin/marketing' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
    } finally {
      router.push('/admin/login')
      router.refresh()
    }
  }

  const sidebarContent = (
    <>
      {/* Brand */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
          <Bug className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <p className="text-lg font-bold text-white leading-tight">APS Admin</p>
          <p className="text-xs text-slate-400">Management Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 h-10 px-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-green-500/10 text-green-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-800 p-3 shrink-0">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full h-10 px-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-60 lg:fixed lg:inset-y-0 bg-slate-900 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Hamburger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 bg-slate-900 text-white rounded-lg"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-50 w-60 bg-slate-900 lg:hidden flex flex-col transition-transform duration-300',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  )
}
