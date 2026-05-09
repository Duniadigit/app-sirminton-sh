"use client";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-primary-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🏸</span>
          <span className="text-primary-700 font-bold text-lg">SIRMINTON-SH</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-gray-600 hover:text-primary-700 text-sm font-medium">Beranda</Link>
          <Link href="/lapangan" className="text-gray-600 hover:text-primary-700 text-sm font-medium">Lapangan</Link>
          <Link href="/booking" className="text-gray-600 hover:text-primary-700 text-sm font-medium">Booking</Link>
          <Link href="/riwayat" className="text-gray-600 hover:text-primary-700 text-sm font-medium">Riwayat</Link>
          <span className="text-gray-400 text-sm">{session?.user?.name}</span>
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm hover:bg-red-100 transition">
            Logout
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6 text-primary-700" /> : <Menu className="w-6 h-6 text-primary-700" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-primary-100 px-4 py-3 space-y-3">
          <p className="text-xs text-gray-400">Halo, {session?.user?.name}</p>
          {[
            { href: "/dashboard", label: "🏠 Beranda" },
            { href: "/lapangan", label: "🏸 Lapangan" },
            { href: "/booking", label: "📅 Booking" },
            { href: "/riwayat", label: "📋 Riwayat" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className="block text-gray-700 font-medium py-2 border-b border-gray-100">
              {label}
            </Link>
          ))}
          <button onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}