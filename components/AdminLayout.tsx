'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

const navItems = [
  { href: '/orders', label: 'Dashboard', icon: '▦', exact: true },
  { href: '/orders', label: 'All Orders', icon: '📦', exact: false },
  { href: '/orders/create', label: 'Create Shipment', icon: '➕', exact: true },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-100">
        <span className="text-xl font-extrabold text-gray-900">Ship<span className="text-orange-500">ixa</span></span>
        <p className="text-xs text-gray-400 mt-0.5">Admin Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(item => (
          <Link
            key={item.label}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              isActive(item.href, item.exact)
                ? 'bg-orange-500 !text-white shadow-md shadow-orange-100'
                : 'text-gray-600 hover:bg-orange-50 hover:text-orange-500'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-6 border-t border-gray-100 space-y-1">
        <a href="http://localhost:3000" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition">
          <span>🌐</span> View Site
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition"
        >
          <span>⎋</span> Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen fixed top-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 px-4 py-4 flex items-center justify-between">
        <span className="text-lg font-extrabold text-gray-900">Ship<span className="text-orange-500">ixa</span></span>
        <button onClick={() => setMobileOpen(true)} className="text-gray-600 text-xl px-2">☰</button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <span className="text-lg font-extrabold text-gray-900">Ship<span className="text-orange-500">ixa</span></span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
