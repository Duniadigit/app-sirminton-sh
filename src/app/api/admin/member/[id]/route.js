import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { statusMember, catatan } = await request.json()
  const member = await prisma.member.update({
    where: { id: parseInt(params.id) },
    data: { statusMember, catatan },
  })
  return NextResponse.json({ success: true, member })
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  await prisma.member.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ success: true })
}