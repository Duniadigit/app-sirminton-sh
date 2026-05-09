'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { formatRupiah } from '@/lib/hargaUtils'
import AdminSidebar from '@/components/AdminSidebar'

export default function RekapPenghasilanPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [weekOffset, setWeekOffset] = useState(0)

  const fetchRekap = async (offset) => {
    setLoading(true)
    const res = await fetch(`/api/admin/rekap?week=${offset}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { fetchRekap(weekOffset) }, [weekOffset])

  const maxPenghasilan = data
    ? Math.max(...data.rekapHarian.map((h) => h.totalPenghasilan), 1) : 1

  return (
    <div className="flex min-h-screen bg-primary-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Rekap Penghasilan</h1>
            <p className="text-gray-500 text-sm mt-1">{data?.periode.awal} — {data?.periode.akhir}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setWeekOffset(w => w - 1)} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}
              className="text-sm font-medium px-3 py-1.5 rounded-lg border border-primary-300 text-primary-700 hover:bg-primary-50 disabled:opacity-40">
              Minggu Ini
            </button>
            <button onClick={() => setWeekOffset(w => w + 1)} disabled={weekOffset >= 0}
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: DollarSign, label: 'Total Penghasilan', value: formatRupiah(data.ringkasan.totalMinggu), color: 'bg-primary-100 text-primary-700' },
                { icon: TrendingUp, label: 'DP Diterima', value: formatRupiah(data.ringkasan.totalDp), color: 'bg-orange-100 text-orange-700' },
                { icon: Calendar, label: 'Total Booking', value: `${data.ringkasan.totalBooking} booking`, color: 'bg-blue-100 text-blue-700' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="card">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${color}`}><Icon className="w-5 h-5" /></div>
                    <div>
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className="text-xl font-bold">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            <div className="card mb-6">
              <h3 className="font-bold text-gray-900 mb-6">Penghasilan per Hari</h3>
              <div className="flex items-end gap-3 h-48">
                {data.rekapHarian.map((hari) => {
                  const persen = (hari.totalPenghasilan / maxPenghasilan) * 100
                  return (
                    <div key={hari.tanggal} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold text-primary-700">
                        {hari.totalPenghasilan > 0 ? formatRupiah(hari.totalPenghasilan) : ''}
                      </span>
                      <div className="w-full flex items-end" style={{ height: '140px' }}>
                        <div className="w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-500 relative group"
                          style={{ height: `${Math.max(persen, 3)}%` }}>
                          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                            {hari.jumlahBooking} booking
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">{hari.namaHariPendek}</span>
                      <span className="text-xs text-gray-400">{hari.tanggalDisplay}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tabel per Lapangan */}
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Rekap per Lapangan</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 font-semibold text-gray-600">Lapangan</th>
                    <th className="text-center py-3 font-semibold text-gray-600">Booking</th>
                    <th className="text-right py-3 font-semibold text-gray-600">Total Penghasilan</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rekapLapangan.length === 0 ? (
                    <tr><td colSpan={3} className="text-center py-8 text-gray-400">Belum ada booking minggu ini</td></tr>
                  ) : (
                    data.rekapLapangan.map((lp) => (
                      <tr key={lp.namaLapangan} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium">{lp.namaLapangan}</td>
                        <td className="py-3 text-center">
                          <span className="bg-primary-100 text-primary-800 px-2.5 py-1 rounded-full text-xs font-semibold">{lp.jumlahBooking}x</span>
                        </td>
                        <td className="py-3 text-right font-semibold text-primary-700">{formatRupiah(lp.totalPenghasilan)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td className="py-3 font-bold">Total</td>
                    <td className="py-3 text-center font-bold">{data.ringkasan.totalBooking}x</td>
                    <td className="py-3 text-right font-bold text-primary-700">{formatRupiah(data.ringkasan.totalMinggu)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}