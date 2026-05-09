'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarCheck, Dumbbell, Users, BarChart3, LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/lapangan', label: 'Lapangan', icon: Dumbbell },
  { href: '/admin/reservasi', label: 'Reservasi', icon: CalendarCheck },
  { href: '/admin/member', label: 'Member', icon: Users },
  { href: '/admin/rekap', label: 'Rekap', icon: BarChart3 },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* SIDEBAR — Desktop */}
      <aside className="hidden md:flex w-64 min-h-screen flex-col" style={{ background: 'var(--sidebar-bg)' }}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-primary-500 p-2.5 rounded-xl">
              <span className="text-white font-black text-lg">🏸</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">SIRMINTON-SH</p>
              <p className="text-primary-400 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive ? 'bg-primary-600 text-white shadow-md' : 'text-gray-400 hover:bg-white/10 hover:text-white'
                }`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all w-full">
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </div>
      </aside>

      {/* BOTTOM NAV — Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 flex"
        style={{ background: 'var(--sidebar-bg)' }}>
        {menuItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-all ${
                isActive ? 'text-primary-400' : 'text-gray-500 hover:text-gray-300'
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          )
        })}
        <button onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-gray-500 hover:text-red-400 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="text-xs font-medium">Keluar</span>
        </button>
      </nav>
    </>
  )
}