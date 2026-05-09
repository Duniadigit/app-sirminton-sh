import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import JadwalMingguan from "@/components/JadwalMingguan";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if ((session.user as any).role === "ADMIN") redirect("/admin/dashboard");

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-3">
            GOR Badminton <span className="text-primary-200">SH</span>
          </h1>
          <p className="text-primary-200 text-sm md:text-lg mb-6">
            4 Lapangan Premium • Buka 06.00 – 22.00
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/booking"
              className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition text-center">
              🏸 Booking Sekarang
            </Link>
            <Link href="/lapangan"
              className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition text-center">
              Cek Jadwal
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { icon: "🏸", title: "4 Lapangan", desc: "Lapangan A, B, C, dan D tersedia" },
            { icon: "⏰", title: "Buka 7 Hari", desc: "Senin–Minggu, 06.00–22.00 WIB" },
            { icon: "💳", title: "Booking Online", desc: "Pesan kapan saja, di mana saja" },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="card text-center">
              <div className="text-3xl mb-2">{icon}</div>
              <h3 className="font-bold mb-1">{title}</h3>
              <p className="text-gray-500 text-sm">{desc}</p>
            </div>
          ))}
        </div>

        {/* Tarif Waktu */}
        <div className="card mb-6">
          <h3 className="font-bold text-gray-900 mb-4">⏰ Tarif Berdasarkan Waktu</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🌅", label: "Pagi", jam: "06:00–12:00", harga: "Harga Normal", bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-800", sub: "text-yellow-600", htext: "text-yellow-700" },
              { icon: "☀️", label: "Siang", jam: "12:00–17:00", harga: "+20% normal", bg: "bg-orange-50 border-orange-200", text: "text-orange-800", sub: "text-orange-600", htext: "text-orange-700" },
              { icon: "🌙", label: "Malam", jam: "17:00–22:00", harga: "+50% normal", bg: "bg-indigo-50 border-indigo-200", text: "text-indigo-800", sub: "text-indigo-600", htext: "text-indigo-700" },
            ].map((t) => (
              <div key={t.label} className={`${t.bg} border rounded-xl p-3 text-center`}>
                <p className="text-xl mb-1">{t.icon}</p>
                <p className={`font-bold text-sm ${t.text}`}>{t.label}</p>
                <p className={`text-xs ${t.sub}`}>{t.jam}</p>
                <p className={`text-xs font-semibold ${t.htext} mt-1`}>{t.harga}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Jadwal Mingguan */}
        <JadwalMingguan />

        {/* ── Lokasi & Alamat ── */}
        <div className="card mt-6 p-0 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">📍 Lokasi Kami</h3>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Info Alamat */}
            <div className="md:w-2/5 px-5 py-5 flex flex-col gap-4">

              <div className="flex gap-3 items-start">
                <span className="text-lg mt-0.5">🏠</span>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Alamat</p>
                  {/* ✏️ GANTI dengan alamat GOR kamu */}
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    Jl. Mulyasari, Kel. Mulyasari,<br />
                    Kec. Tamansari, Kota Tasikmalaya,<br />
                    Jawa Barat 46196
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-lg mt-0.5">⏰</span>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Jam Operasional</p>
                  <p className="text-sm text-gray-700 font-medium">Senin – Minggu</p>
                  <p className="text-sm text-primary-600 font-bold">06.00 – 22.00 WIB</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <span className="text-lg mt-0.5">📞</span>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Kontak</p>
                  {/* ✏️ GANTI dengan nomor WA / telp GOR kamu */}
                  <p className="text-sm text-gray-700 font-medium">0896-1718-9911</p>
                </div>
              </div>

              {/* Tombol buka Google Maps */}
              <a
                href="https://maps.google.com/?q=GOR+Badminton+SH+Bandung"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors w-fit"
              >
                <span>🗺️</span> Buka di Google Maps
              </a>
            </div>

            {/* Google Maps Embed */}
            <div className="md:w-3/5 h-64 md:h-auto min-h-[260px]">
              {/*
                ✏️ CARA GANTI MAP:
                1. Buka maps.google.com
                2. Cari lokasi GOR kamu
                3. Klik "Share" → "Embed a map"
                4. Copy src="..." dari iframe yang muncul
                5. Paste di bawah menggantikan src yang sekarang
              */}
              <iframe
                src="https://share.google/OGLMZUOLYKzHaiIBs"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "260px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              />
            </div>
          </div>
        </div>

      </section>
    </div>
  );
}
