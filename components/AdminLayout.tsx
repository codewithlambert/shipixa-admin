'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  DashboardSquare01Icon,
  PackageIcon,
  PackageAddIcon,
  GlobeIcon,
  Logout03Icon,
  Menu01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons'

const navItems = [
  { href: '/orders', label: 'Dashboard', icon: DashboardSquare01Icon, exact: true },
  { href: '/orders', label: 'All Orders', icon: PackageIcon, exact: false },
  { href: '/orders/create', label: 'Create Shipment', icon: PackageAddIcon, exact: true },
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
      <div className="px-6 py-6 border-b border-white/10">
        <span className="text-xl font-extrabold text-white">Ship<span className="text-orange-500">ixa</span></span>
        <p className="text-xs text-white/40 mt-0.5">Admin Portal</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                active
                  ? 'bg-[#f2662d] text-black'
                  : 'text-white/60 hover:bg-white/5 hover:text-orange-400'
              }`}
            >
              <HugeiconsIcon icon={item.icon} size={18} color={active ? 'black' : 'currentColor'} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-6 border-t border-white/10 space-y-1">
        <a href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || 'https://shipixa.vercel.app'} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:bg-[#1c1c1f] hover:text-white/70 transition">
          <HugeiconsIcon icon={GlobeIcon} size={18} color="currentColor" />
          View Site
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-semibold text-white/50 hover:bg-red-500/10 hover:text-red-400 transition"
        >
          <HugeiconsIcon icon={Logout03Icon} size={18} color="currentColor" />
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black flex">

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-black border-r border-white/10 min-h-screen fixed top-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-black border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <span className="text-lg font-extrabold text-white">Ship<span className="text-orange-500">ixa</span></span>
        <button onClick={() => setMobileOpen(true)} className="text-white/60 px-2">
          <HugeiconsIcon icon={Menu01Icon} size={20} color="currentColor" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-black h-full shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <span className="text-lg font-extrabold text-white">Ship<span className="text-orange-500">ixa</span></span>
              <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white/60">
                <HugeiconsIcon icon={Cancel01Icon} size={20} color="currentColor" />
              </button>
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
