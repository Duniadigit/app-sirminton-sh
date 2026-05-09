'use client'

import { CheckCircle, X, Calendar, Clock, MapPin, CreditCard, Copy } from 'lucide-react'
import { formatRupiah } from '@/lib/hargaUtils'
import { useState } from 'react'

export default function BookingSuccessModal({ data, onClose, onBayar }) {
  const [copied, setCopied] = useState(false)

  const copyNomorBooking = () => {
    navigator.clipboard.writeText(data.nomorBooking)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!data) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white">
          <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-white/20 p-2.5 rounded-full">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-primary-100 text-sm">Booking Berhasil Diajukan!</p>
              <p className="font-bold text-lg">Menunggu Konfirmasi Admin</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-primary-200 text-xs">Nomor Booking</p>
              <p className="font-mono font-bold text-lg tracking-wider">{data.nomorBooking}</p>
            </div>
            <button onClick={copyNomorBooking}
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-colors">
              <Copy className="w-3.5 h-3.5" />
              {copied ? 'Tersalin!' : 'Salin'}
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Detail Pesanan</h3>
          <div className="space-y-3">
            {[
              { icon: MapPin, label: 'Lapangan', value: data.namaLapangan },
              { icon: Calendar, label: 'Tanggal', value: data.tanggal },
              { icon: Clock, label: 'Waktu', value: `${data.jamMulai} – ${data.jamSelesai} (${data.durasi} jam · ${data.namaWaktu})` },
              { icon: CreditCard, label: 'Total Pembayaran', value: formatRupiah(data.totalHarga), bold: true },
            ].map(({ icon: Icon, label, value, bold }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="bg-primary-50 p-2 rounded-lg">
                  <Icon className="w-4 h-4 text-primary-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className={`text-gray-900 ${bold ? 'font-bold text-primary-700 text-lg' : 'font-semibold'}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {data.jumlahDp > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-orange-700 mb-1">⚠️ Kebijakan Pembatalan</p>
              <p className="text-xs text-orange-600">
                DP sebesar <strong>{formatRupiah(data.jumlahDp)}</strong> tidak dapat dikembalikan jika pembatalan dilakukan kurang dari 3 jam sebelum jadwal bermain.
              </p>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
            <span className="badge-pending">⏳ Menunggu Konfirmasi</span>
            <p className="text-xs text-gray-500 mt-2">Admin akan mengkonfirmasi booking Anda segera.</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={onBayar} className="btn-primary flex-1 text-center">Bayar Sekarang</button>
            <button onClick={onClose} className="btn-secondary flex-1 text-center">Nanti Saja</button>
          </div>
        </div>
      </div>
    </div>
  )
}