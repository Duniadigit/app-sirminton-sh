import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, addDays, format } from 'date-fns'
import { id } from 'date-fns/locale'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const tanggalParam = searchParams.get('tanggal')
    const tanggalAcuan = tanggalParam ? new Date(tanggalParam) : new Date()

    const awalMinggu = startOfWeek(tanggalAcuan, { weekStartsOn: 1 })
    const akhirMinggu = endOfWeek(tanggalAcuan, { weekStartsOn: 1 })

    const reservasi = await prisma.reservasi.findMany({
      where: {
        tanggal: { gte: awalMinggu, lte: akhirMinggu },
        status: { in: ['PENDING', 'KONFIRMASI'] },
      },
      include: { lapangan: { select: { id: true, nama: true } } },
      orderBy: [{ tanggal: 'asc' }, { jam_mulai: 'asc' }],
    })

    const semuaLapangan = await prisma.lapangan.findMany({
      where: { status: 'TERSEDIA' },
      orderBy: { nama: 'asc' },
    })

    const hariDalamMinggu = Array.from({ length: 7 }, (_, i) => {
      const tanggal = addDays(awalMinggu, i)
      return {
        tanggal: format(tanggal, 'yyyy-MM-dd'),
        namaHariPendek: format(tanggal, 'EEE', { locale: id }),
        tanggalDisplay: format(tanggal, 'd MMM', { locale: id }),
        isHariIni: format(tanggal, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd'),
      }
    })

    const jadwalPerHari = hariDalamMinggu.map((hari) => {
      const reservasiHariIni = reservasi.filter(
        (r) => format(new Date(r.tanggal), 'yyyy-MM-dd') === hari.tanggal
      )

      const perLapangan = semuaLapangan.map((lapangan) => {
        const slots = reservasiHariIni
          .filter((r) => r.lapanganId === lapangan.id)
          .map((r) => ({
            id: r.id,
            namaPemesan: r.nama_pemesan,
            jamMulai: r.jam_mulai,
            jamSelesai: r.jam_selesai,
            durasi: r.durasi,
            status: r.status,
          }))

        return { lapanganId: lapangan.id, namaLapangan: lapangan.nama, slots }
      })

      return {
        ...hari,
        perLapangan,
        totalBooking: reservasiHariIni.length,
      }
    })

    return NextResponse.json({
      minggu: {
        awal: format(awalMinggu, 'd MMM yyyy', { locale: id }),
        akhir: format(akhirMinggu, 'd MMM yyyy', { locale: id }),
      },
      jadwal: jadwalPerHari,
      lapangan: semuaLapangan,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal ambil jadwal' }, { status: 500 })
  }
}