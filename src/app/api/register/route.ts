import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { nama, email, password, no_hp } = await request.json();

    if (!nama || !email || !password || !no_hp) {
      return NextResponse.json({ error: "Semua field harus diisi" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { nama, email, password: hashedPassword, no_hp, role: "USER" },
    });

    return NextResponse.json({ message: "Registrasi berhasil", userId: user.id });
  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}