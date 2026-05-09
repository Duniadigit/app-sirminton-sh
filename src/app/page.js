import JadwalMingguan from '@/components/JadwalMingguan'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">🏸 SIRMINTON-SH</h1>
          <p className="text-primary-200 text-lg mb-8">
            Sistem Informasi Reservasi Lapangan Badminton SH
          </p>
          <div className="flex justify-center gap-4">
            <a href="/booking" className="bg-white text-primary-700 font-bold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors">
              Booking Sekarang
            </a>
            <a href="/lapangan" className="border-2 border-white text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Lihat Lapangan
            </a>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary-700">4</p>
            <p className="text-sm text-gray-500 mt-1">Lapangan Tersedia</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary-700">06:00</p>
            <p className="text-sm text-gray-500 mt-1">Buka Setiap Hari</p>
          </div>
          <div className="card text-center">
            <p className="text-3xl font-bold text-primary-700">22:00</p>
            <p className="text-sm text-gray-500 mt-1">Tutup Setiap Hari</p>
          </div>
        </div>

        {/* Tarif Waktu */}
        <div className="card mb-8">
          <h3 className="font-bold text-gray-900 mb-4">⏰ Tarif Berdasarkan Waktu</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">🌅</p>
              <p className="font-bold text-yellow-800">Pagi</p>
              <p className="text-xs text-yellow-600">06:00 – 12:00</p>
              <p className="text-sm font-semibold text-yellow-700 mt-2">Harga Normal</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">☀️</p>
              <p className="font-bold text-orange-800">Siang</p>
              <p className="text-xs text-orange-600">12:00 – 17:00</p>
              <p className="text-sm font-semibold text-orange-700 mt-2">+20% dari normal</p>
            </div>
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
              <p className="text-2xl mb-1">🌙</p>
              <p className="font-bold text-indigo-800">Malam</p>
              <p className="text-xs text-indigo-600">17:00 – 22:00</p>
              <p className="text-sm font-semibold text-indigo-700 mt-2">+50% dari normal</p>
            </div>
          </div>
        </div>

        {/* Jadwal Mingguan */}
        <JadwalMingguan />
      </section>
    </div>
  )
}