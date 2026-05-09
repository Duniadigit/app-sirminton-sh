import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const members = await prisma.member.findMany({
    include: {
      user: { select: { id: true, nama: true, email: true, no_hp: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(members)
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { userId, catatan } = await request.json()

    const user = await prisma.user.findUnique({ where: { id: parseInt(userId) } })
    if (!user) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

    const today = new Date()
    const dateStr = today.toISOString().replace(/[-T:.Z]/g, '').slice(0, 8)
    const count = await prisma.member.count()
    const nomorMember = `SH-${dateStr}-${String(count + 1).padStart(4, '0')}`

    const member = await prisma.member.create({
      data: { userId: parseInt(userId), nomorMember, catatan },
      include: { user: { select: { nama: true, email: true } } },
    })

    return NextResponse.json({ success: true, member })
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'User sudah terdaftar sebagai member' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Gagal mendaftarkan member' }, { status: 500 })
  }
}