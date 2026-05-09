import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const reservasiId = parseInt(params.id)

    const reservasi = await prisma.reservasi.findFirst({
      where: {
        id: reservasiId,
        userId: parseInt(session.user.id),
      },
      include: { pembayaran: true },
    })

    if (!reservasi) {
      return NextResponse.json({ error: 'Reservasi tidak ditemukan' }, { status: 404 })
    }

    if (reservasi.status === 'BATAL') {
      return NextResponse.json({ error: 'Reservasi sudah dibatalkan' }, { status: 400 })
    }

    if (reservasi.status === 'SELESAI') {
      return NextResponse.json({ error: 'Reservasi sudah selesai, tidak bisa dibatalkan' }, { status: 400 })
    }

    // Cek H-3 jam
    const sekarang = new Date()
    const tanggalStr = new Date(reservasi.tanggal).toISOString().split('T')[0]
    const [jamStr, menitStr] = reservasi.jam_mulai.split(':')
    const jadwalMain = new Date(`${tanggalStr}T${jamStr.padStart(2,'0')}:${menitStr}:00`)

    const selisihJam = (jadwalMain.getTime() - sekarang.getTime()) / (1000 * 60 * 60)
    const dpHangus = selisihJam < 3 && reservasi.pembayaran !== null

    await prisma.reservasi.update({
      where: { id: reservasiId },
      data: { status: 'BATAL' },
    })

    return NextResponse.json({
      success: true,
      dpHangus,
      selisihJam: Math.round(selisihJam * 10) / 10,
      pesan: dpHangus
        ? 'Pembatalan berhasil. Karena dilakukan kurang dari 3 jam sebelum jadwal, DP tidak dapat dikembalikan.'
        : `Pembatalan berhasil. ${reservasi.pembayaran ? 'Admin akan memproses pengembalian DP Anda.' : ''}`,
    })
  } catch (error) {
    console.error('Error batal reservasi:', error)
    return NextResponse.json({ error: 'Gagal membatalkan reservasi' }, { status: 500 })
  }
}