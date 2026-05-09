'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { formatRupiah } from '@/lib/hargaUtils'

export default function TombolBatal({ reservasi, onBerhasil }) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const sekarang = new Date()
  const tanggalStr = new Date(reservasi.tanggal).toISOString().split('T')[0]
  const [jamStr, menitStr] = reservasi.jam_mulai.split(':')
  const jadwalMain = new Date(`${tanggalStr}T${jamStr.padStart(2,'0')}:${menitStr}:00`)
  const selisihJam = (jadwalMain.getTime() - sekarang.getTime()) / (1000 * 60 * 60)
  const dpHangus = selisihJam < 3 && reservasi.pembayaran

  const handleBatal = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/reservasi/${reservasi.id}/batal`, { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.pesan)
        setShowModal(false)
        onBerhasil?.()
      } else { toast.error(data.error) }
    } catch { toast.error('Terjadi kesalahan') }
    finally { setLoading(false) }
  }

  if (reservasi.status !== 'PENDING' && reservasi.status !== 'KONFIRMASI') return null

  return (
    <>
      <button onClick={() => setShowModal(true)} className="btn-danger text-sm px-4 py-2">Batalkan</button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Batalkan Reservasi?</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Kamu yakin ingin membatalkan reservasi{' '}
              <strong>{reservasi.lapangan?.nama}</strong> pada{' '}
              <strong>{new Date(reservasi.tanggal).toLocaleDateString('id-ID')}</strong>?
            </p>

            {dpHangus && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-bold text-red-700 mb-1">⚠️ DP Tidak Dapat Dikembalikan!</p>
                <p className="text-xs text-red-600">
                  Pembatalan dilakukan kurang dari <strong>3 jam</strong> sebelum jadwal bermain ({Math.round(selisihJam * 10) / 10} jam lagi).
                  DP sebesar <strong>{formatRupiah(reservasi.pembayaran?.jumlahBayar || 0)}</strong> tidak dapat dikembalikan.
                </p>
              </div>
            )}

            {!dpHangus && reservasi.pembayaran && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <p className="text-xs text-yellow-700">
                  Karena pembatalan lebih dari 3 jam sebelum jadwal, admin akan memproses pengembalian DP Anda.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={handleBatal} disabled={loading}
                className="btn-danger flex-1 disabled:opacity-50">
                {loading ? 'Memproses...' : 'Ya, Batalkan'}
              </button>
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Tidak</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}