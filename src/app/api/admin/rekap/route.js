import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, subWeeks, format, eachDayOfInterval } from 'date-fns'
import { id } from 'date-fns/locale'

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const weekOffset = parseInt(searchParams.get('week') || '0')

    const tanggalAcuan = subWeeks(new Date(), Math.abs(weekOffset))
    const awalMinggu = startOfWeek(tanggalAcuan, { weekStartsOn: 1 })
    const akhirMinggu = endOfWeek(tanggalAcuan, { weekStartsOn: 1 })

    const reservasi = await prisma.reservasi.findMany({
      where: {
        tanggal: { gte: awalMinggu, lte: akhirMinggu },
        status: { in: ['KONFIRMASI', 'SELESAI'] },
      },
      include: {
        lapangan: { select: { nama: true } },
        pembayaran: { select: { jumlahBayar: true, statusPembayaran: true, metodePembayaran: true } },
      },
    })

    const semuaHari = eachDayOfInterval({ start: awalMinggu, end: akhirMinggu })
    const rekapHarian = semuaHari.map((hari) => {
      const tanggalStr = format(hari, 'yyyy-MM-dd')
      const reservasiHari = reservasi.filter(
        (r) => format(new Date(r.tanggal), 'yyyy-MM-dd') === tanggalStr
      )
      const totalPenghasilan = reservasiHari.reduce((sum, r) => sum + parseFloat(r.total_harga), 0)
      const dpDiterima = reservasiHari.reduce(
        (sum, r) => sum + parseFloat(r.pembayaran?.jumlahBayar || 0), 0
      )
      return {
        tanggal: tanggalStr,
        namaHariPendek: format(hari, 'EEE', { locale: id }),
        tanggalDisplay: format(hari, 'd MMM', { locale: id }),
        jumlahBooking: reservasiHari.length,
        totalPenghasilan,
        dpDiterima,
      }
    })

    const totalMinggu = rekapHarian.reduce((sum, h) => sum + h.totalPenghasilan, 0)
    const totalDp = rekapHarian.reduce((sum, h) => sum + h.dpDiterima, 0)
    const totalBooking = rekapHarian.reduce((sum, h) => sum + h.jumlahBooking, 0)

    const rekapLapangan = {}
    reservasi.forEach((r) => {
      const nama = r.lapangan.nama
      if (!rekapLapangan[nama]) {
        rekapLapangan[nama] = { namaLapangan: nama, jumlahBooking: 0, totalPenghasilan: 0 }
      }
      rekapLapangan[nama].jumlahBooking++
      rekapLapangan[nama].totalPenghasilan += parseFloat(r.total_harga)
    })

    return NextResponse.json({
      periode: {
        awal: format(awalMinggu, 'd MMMM yyyy', { locale: id }),
        akhir: format(akhirMinggu, 'd MMMM yyyy', { locale: id }),
        weekOffset,
      },
      ringkasan: { totalMinggu, totalDp, totalBooking },
      rekapHarian,
      rekapLapangan: Object.values(rekapLapangan),
    })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil rekap' }, { status: 500 })
  }
}