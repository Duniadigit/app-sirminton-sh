'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from 'lucide-react'

export default function JadwalMingguan() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tanggalAcuan, setTanggalAcuan] = useState(new Date().toISOString().split('T')[0])

  const fetchJadwal = async (tanggal) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/jadwal?tanggal=${tanggal}`)
      setData(await res.json())
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchJadwal(tanggalAcuan)
    const interval = setInterval(() => fetchJadwal(tanggalAcuan), 60000)
    return () => clearInterval(interval)
  }, [tanggalAcuan])

  const navigasiMinggu = (arah) => {
    const current = new Date(tanggalAcuan)
    current.setDate(current.getDate() + arah * 7)
    setTanggalAcuan(current.toISOString().split('T')[0])
  }

  const getStatusStyle = (status) =>
    status === 'KONFIRMASI'
      ? 'bg-primary-100 border-primary-400 text-primary-800'
      : 'bg-yellow-50 border-yellow-300 text-yellow-800'

  if (loading) return (
    <div className="card">
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        <span className="ml-3 text-gray-500 text-sm">Memuat jadwal...</span>
      </div>
    </div>
  )

  if (!data) return null

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary-100 p-2 rounded-xl">
            <Calendar className="w-4 h-4 text-primary-700" />
          </div>
          <div>
            <h2 className="text-sm md:text-lg font-bold text-gray-900">Jadwal Minggu Ini</h2>
            <p className="text-xs text-gray-500">{data.minggu.awal} — {data.minggu.akhir}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => navigasiMinggu(-1)}
            className="p-2 rounded-xl border border-gray-200 hover:bg-primary-50 transition">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button onClick={() => setTanggalAcuan(new Date().toISOString().split('T')[0])}
            className="text-xs font-medium text-primary-700 border border-primary-300 px-2 py-1.5 rounded-lg hover:bg-primary-50 hidden sm:block">
            Minggu Ini
          </button>
          <button onClick={() => navigasiMinggu(1)}
            className="p-2 rounded-xl border border-gray-200 hover:bg-primary-50 transition">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Grid — scroll horizontal di HP */}
      <div className="overflow-x-auto -mx-2 px-2">
        <div className="grid grid-cols-7 gap-1.5 min-w-[560px]">
          {data.jadwal.map((hari) => (
            <div key={hari.tanggal} className={`rounded-xl border-2 overflow-hidden ${
              hari.isHariIni ? 'border-primary-500 shadow-md' : 'border-gray-100'
            }`}>
              {/* Header Hari */}
              <div className={`px-1 py-2 text-center ${
                hari.isHariIni ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-700'
              }`}>
                <p className="text-xs font-semibold uppercase tracking-wide">{hari.namaHariPendek}</p>
                <p className={`text-lg font-bold ${hari.isHariIni ? 'text-white' : 'text-gray-900'}`}>
                  {hari.tanggalDisplay.split(' ')[0]}
                </p>
                <p className={`text-xs ${hari.isHariIni ? 'text-primary-100' : 'text-gray-400'}`}>
                  {hari.tanggalDisplay.split(' ')[1]}
                </p>
              </div>

              {/* Slot */}
              <div className="p-1 space-y-1 min-h-[60px] bg-white">
                {hari.perLapangan.map((lp) =>
                  lp.slots.map((slot) => (
                    <div key={slot.id} className={`border rounded px-1 py-0.5 text-xs ${getStatusStyle(slot.status)}`}>
                      <p className="font-bold truncate text-xs">{lp.namaLapangan}</p>
                      <div className="flex items-center gap-0.5 text-gray-600">
                        <Clock className="w-2 h-2" /><span>{slot.jamMulai}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-gray-600">
                        <User className="w-2 h-2" /><span className="truncate">{slot.namaPemesan}</span>
                      </div>
                    </div>
                  ))
                )}
                {hari.totalBooking === 0 && (
                  <div className="flex items-center justify-center h-10">
                    <p className="text-xs text-gray-300">Kosong</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-1 py-1 bg-gray-50 border-t border-gray-100">
                <p className="text-xs text-center font-medium text-gray-500">
                  {hari.totalBooking > 0 ? `${hari.totalBooking}x` : '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 flex-wrap">
        <p className="text-xs font-medium text-gray-500">Keterangan:</p>
        <span className="flex items-center gap-1 text-xs">
          <span className="w-3 h-3 rounded bg-primary-200 border border-primary-400" />Konfirmasi
        </span>
        <span className="flex items-center gap-1 text-xs">
          <span className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" />Menunggu
        </span>
      </div>
    </div>
  )
}