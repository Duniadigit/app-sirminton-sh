import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const lapangan = await prisma.lapangan.findMany({ orderBy: { id: "asc" } });
  return NextResponse.json(lapangan);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await request.json();
  const { nama, jenis, deskripsi, harga_per_jam, kapasitas, status, image } = data;

  const lapangan = await prisma.lapangan.create({
    data: { nama, jenis, deskripsi, harga_per_jam, kapasitas, status, image },
  });
  return NextResponse.json(lapangan, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const data = await request.json();
  const { id, nama, jenis, deskripsi, harga_per_jam, kapasitas, status, image } = data;

  if (!id) {
    return NextResponse.json({ error: "ID lapangan diperlukan" }, { status: 400 });
  }

  const lapangan = await prisma.lapangan.update({
    where: { id },
    data: { nama, jenis, deskripsi, harga_per_jam, kapasitas, status, image },
  });
  return NextResponse.json(lapangan);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID lapangan diperlukan" }, { status: 400 });
  }

  await prisma.lapangan.delete({ where: { id } });
  return NextResponse.json({ message: "Lapangan berhasil dihapus" });
}