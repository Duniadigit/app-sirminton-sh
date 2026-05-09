import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const reservasi = await prisma.reservasi.findUnique({
    where: { id: Number(id) },
    include: { lapangan: true, pembayaran: true },
  });
  if (!reservasi) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(reservasi);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  const { status } = await request.json();
  const reservasi = await prisma.reservasi.update({
    where: { id: Number(id) },
    data: { status },
  });
  return NextResponse.json(reservasi);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.reservasi.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: "Reservasi dihapus" });
}