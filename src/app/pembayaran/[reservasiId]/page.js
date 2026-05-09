'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatRupiah } from '@/lib/hargaUtils'
import Navbar from '@/components/Navbar'

const REKENING_GOR = [
  { bank: 'BCA', noRek: '1234567890', atasNama: 'SIRMINTON SH' },
  { bank: 'BRI', noRek: '0987654321', atasNama: 'SIRMINTON SH' },
  { bank: 'Mandiri', noRek: '1122334455', atasNama: 'SIRMINTON SH' },
]

const EWALLET_GOR = [
  { nama: 'GoPay', nomor: '0811-2233-4455', atasNama: 'SIRMINTON SH' },
  { nama: 'OVO', nomor: '0811-2233-4455', atasNama: 'SIRMINTON SH' },
  { nama: 'Dana', nomor: '0811-2233-4455', atasNama: 'SIRMINTON SH' },
  { nama: 'ShopeePay', nomor: '0811-2233-4455', atasNama: 'SIRMINTON SH' },
]

export default function PembayaranPage({ params }) {
  // ✅ FIX 1: Next.js 15 - params harus di-unwrap pakai use()
  const { reservasiId } = use(params)

  const router = useRouter()
  const [reservasi, setReservasi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [metode, setMetode] = useState('TRANSFER_BANK')
  const [formData, setFormData] = useState({
    namaBank: '',
    nomorRekening: '',
    namaPengirim: '',
    namaEwallet: '',
    nomorEwallet: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // ✅ FIX 2: Tambah error handling agar loading tidak stuck selamanya
    fetch(`/api/reservasi/${reservasiId}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`)
        return r.json()
      })
      .then(json => {
        setReservasi(json)
        setLoading(false)
      })
      .catch(err => {
        console.error('Gagal fetch reservasi:', err)
        setError('Gagal memuat data reservasi. Silakan coba lagi.')
        setLoading(false) // ✅ Pastikan loading berhenti walau error
      })
  }, [reservasiId])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        reservasiId,
        metodePembayaran: metode,
        jumlahBayar: reservasi.dp || reservasi.total_harga,
        ...(metode === 'TRANSFER_BANK'
          ? {
              namaBank: formData.namaBank,
              nomorRekening: formData.nomorRekening,
              namaPengirim: formData.namaPengirim,
            }
          : {
              namaEwallet: formData.namaEwallet,
              nomorEwallet: formData.nomorEwallet,
            }),
      }

      const res = await fetch('/api/pembayaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Pembayaran berhasil disubmit! Menunggu verifikasi admin.')
        router.push('/riwayat')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Gagal submit pembayaran')
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan')
    } finally {
      setSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  // ✅ FIX 3: Tampilkan error state jika fetch gagal
  if (error || !reservasi) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-4">{error || 'Data tidak ditemukan'}</p>
          <button
            onClick={() => router.back()}
            className="btn-primary px-6 py-2"
          >
            Kembali
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran</h1>
        <p className="text-gray-500 mb-6">Booking #{reservasi?.id}</p>

        {/* Ringkasan */}
        <div className="card mb-6">
          <h3 className="font-bold mb-4">Ringkasan Booking</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Lapangan</span>
              <span className="font-medium">{reservasi?.lapangan?.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Jam</span>
              <span className="font-medium">{reservasi?.jam_mulai} – {reservasi?.jam_selesai}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary-700">{formatRupiah(reservasi?.total_harga)}</span>
            </div>
            {reservasi?.dp > 0 && (
              <div className="flex justify-between text-orange-700 font-semibold">
                <span>DP yang harus dibayar</span>
                <span>{formatRupiah(reservasi?.dp)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Pilih Metode */}
        <div className="card mb-6">
          <h3 className="font-bold mb-4">Metode Pembayaran</h3>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { value: 'TRANSFER_BANK', label: 'Transfer Bank', icon: '🏦' },
              { value: 'EWALLET', label: 'E-Wallet', icon: '📱' },
              { value: 'TUNAI', label: 'Tunai (di lokasi)', icon: '💵' },
            ].map((m) => (
              <button
                key={m.value}
                onClick={() => setMetode(m.value)}
                className={`p-3 border-2 rounded-xl text-center transition-all ${
                  metode === m.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <p className="text-2xl mb-1">{m.icon}</p>
                <p className="text-xs font-semibold">{m.label}</p>
              </button>
            ))}
          </div>

          {/* Form Transfer Bank */}
          {metode === 'TRANSFER_BANK' && (
            <div className="space-y-4">
              <div className="bg-primary-50 rounded-xl p-4 mb-2">
                <p className="text-sm font-bold text-primary-800 mb-3">Rekening Tujuan Transfer:</p>
                {REKENING_GOR.map((rek) => (
                  <div key={rek.bank} className="flex justify-between items-center py-2 border-b border-primary-100 last:border-0">
                    <span className="text-sm font-semibold">{rek.bank}</span>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">{rek.noRek}</p>
                      <p className="text-xs text-gray-500">{rek.atasNama}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="label">Bank yang Digunakan</label>
                <select className="input-field" value={formData.namaBank}
                  onChange={(e) => setFormData({ ...formData, namaBank: e.target.value })}>
                  <option value="">Pilih Bank...</option>
                  {REKENING_GOR.map((r) => <option key={r.bank} value={r.bank}>{r.bank}</option>)}
                  <option value="Lainnya">Bank Lainnya</option>
                </select>
              </div>
              <div>
                <label className="label">Nomor Rekening Pengirim</label>
                <input type="text" className="input-field" placeholder="1234567890"
                  value={formData.nomorRekening}
                  onChange={(e) => setFormData({ ...formData, nomorRekening: e.target.value })} />
              </div>
              <div>
                <label className="label">Nama Pemilik Rekening</label>
                <input type="text" className="input-field" placeholder="Nama sesuai rekening bank"
                  value={formData.namaPengirim}
                  onChange={(e) => setFormData({ ...formData, namaPengirim: e.target.value })} />
              </div>
            </div>
          )}

          {/* Form E-Wallet */}
          {metode === 'EWALLET' && (
            <div className="space-y-4">
              <div className="bg-primary-50 rounded-xl p-4 mb-2">
                <p className="text-sm font-bold text-primary-800 mb-3">Nomor E-Wallet Tujuan:</p>
                {EWALLET_GOR.map((ew) => (
                  <div key={ew.nama} className="flex justify-between items-center py-2 border-b border-primary-100 last:border-0">
                    <span className="text-sm font-semibold">{ew.nama}</span>
                    <div className="text-right">
                      <p className="text-sm font-mono font-bold">{ew.nomor}</p>
                      <p className="text-xs text-gray-500">{ew.atasNama}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="label">E-Wallet yang Digunakan</label>
                <select className="input-field" value={formData.namaEwallet}
                  onChange={(e) => setFormData({ ...formData, namaEwallet: e.target.value })}>
                  <option value="">Pilih E-Wallet...</option>
                  {EWALLET_GOR.map((ew) => <option key={ew.nama} value={ew.nama}>{ew.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Nomor E-Wallet Pengirim</label>
                <input type="text" className="input-field" placeholder="0811-2233-4455"
                  value={formData.nomorEwallet}
                  onChange={(e) => setFormData({ ...formData, nomorEwallet: e.target.value })} />
              </div>
            </div>
          )}

          {/* Tunai */}
          {metode === 'TUNAI' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-yellow-800">💵 Pembayaran dilakukan langsung di kasir GOR saat tiba.</p>
              <p className="text-xs text-yellow-600 mt-1">Tunjukkan nomor booking kepada petugas.</p>
            </div>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="btn-primary w-full text-center py-3 text-base disabled:opacity-50"
        >
          {submitting ? 'Menyimpan...' : 'Konfirmasi Pembayaran'}
        </button>
      </div>
    </div>
  )
}
