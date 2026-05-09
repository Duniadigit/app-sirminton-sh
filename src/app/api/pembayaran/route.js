import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      reservasiId, metodePembayaran, jumlahBayar,
      namaBank, nomorRekening, namaPengirim,
      namaEwallet, nomorEwallet,
    } = body

    const reservasi = await prisma.reservasi.findFirst({
      where: { id: parseInt(reservasiId), userId: parseInt(session.user.id) },
    })
    if (!reservasi) return NextResponse.json({ error: 'Reservasi tidak ditemukan' }, { status: 404 })

    const pembayaranAda = await prisma.pembayaran.findUnique({
      where: { reservasiId: parseInt(reservasiId) },
    })
    if (pembayaranAda) return NextResponse.json({ error: 'Pembayaran sudah ada' }, { status: 400 })

    const pembayaran = await prisma.pembayaran.create({
      data: {
        reservasiId: parseInt(reservasiId),
        metodePembayaran,
        jumlahBayar: parseFloat(jumlahBayar),
        namaBank: metodePembayaran === 'TRANSFER_BANK' ? namaBank : null,
        nomorRekening: metodePembayaran === 'TRANSFER_BANK' ? nomorRekening : null,
        namaPengirim: metodePembayaran === 'TRANSFER_BANK' ? namaPengirim : null,
        namaEwallet: metodePembayaran === 'EWALLET' ? namaEwallet : null,
        nomorEwallet: metodePembayaran === 'EWALLET' ? nomorEwallet : null,
        statusPembayaran: 'MENUNGGU',
      },
    })

    return NextResponse.json({ success: true, pembayaran })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menyimpan pembayaran' }, { status: 500 })
  }
}