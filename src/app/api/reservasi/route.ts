import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function hitungHarga(jamMulai: number, hargaBasar: number, durasi: number) {
  let multiplier = 1.0;
  let namaWaktu = 'Pagi';
  if (jamMulai >= 6 && jamMulai < 12) { multiplier = 1.0; namaWaktu = 'Pagi'; }
  else if (jamMulai >= 12 && jamMulai < 17) { multiplier = 1.2; namaWaktu = 'Siang'; }
  else if (jamMulai >= 17 && jamMulai <= 22) { multiplier = 1.5; namaWaktu = 'Malam'; }
  const hargaPerJamFinal = Math.round(hargaBasar * multiplier);
  return { totalHarga: hargaPerJamFinal * durasi, namaWaktu };
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const reservasi = await prisma.reservasi.findMany({
    where: user.role === "ADMIN" ? {} : { userId: Number(user.id) },
    include: {
      lapangan: true,
      user: { select: { nama: true, email: true } },
      pembayaran: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reservasi);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  const { lapanganId, nama_pemesan, no_hp, tanggal, jam_mulai, durasi, dp, catatan } =
    await request.json();

  const lapangan = await prisma.lapangan.findUnique({ where: { id: lapanganId } });
  if (!lapangan) return NextResponse.json({ error: "Lapangan tidak ditemukan" }, { status: 404 });

  // Hitung jam selesai
  const [jam, menit] = jam_mulai.split(":").map(Number);
  const jamSelesaiTotal = jam + durasi;
  const jam_selesai = `${String(jamSelesaiTotal).padStart(2, "0")}:${String(menit).padStart(2, "0")}`;

  // Hitung total harga berdasarkan waktu
  const jamInt = parseInt(jam_mulai.split(':')[0]);
  const { totalHarga } = hitungHarga(jamInt, lapangan.harga_per_jam, durasi);

  // Cek double booking
  const conflict = await prisma.reservasi.findFirst({
    where: {
      lapanganId,
      tanggal: new Date(tanggal),
      status: { in: ["PENDING", "KONFIRMASI"] },
      OR: [
        { jam_mulai: { lte: jam_mulai }, jam_selesai: { gt: jam_mulai } },
        { jam_mulai: { lt: jam_selesai }, jam_selesai: { gte: jam_selesai } },
        { jam_mulai: { gte: jam_mulai }, jam_selesai: { lte: jam_selesai } },
      ],
    },
  });

  if (conflict) {
    return NextResponse.json({ error: "Lapangan sudah dipesan pada waktu tersebut" }, { status: 409 });
  }

  const reservasi = await prisma.reservasi.create({
    data: {
      userId: Number(user.id),
      lapanganId,
      nama_pemesan,
      no_hp,
      tanggal: new Date(tanggal),
      jam_mulai,
      jam_selesai,
      durasi,
      total_harga: totalHarga,
      dp: dp || 0,
      catatan,
      status: "PENDING",
    },
    include: { lapangan: true },
  });

  return NextResponse.json(reservasi);
}