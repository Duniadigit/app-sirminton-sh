import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Tidak ada file" }, { status: 400 });
  }

  // Validasi tipe file
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Format file tidak didukung" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Buat nama file unik
  const ext = file.name.split(".").pop();
  const filename = `lapangan-${Date.now()}.${ext}`;

  // Pastikan folder ada
  const uploadDir = path.join(process.cwd(), "public", "uploads", "lapangan");
  await mkdir(uploadDir, { recursive: true });

  // Simpan file
  const filepath = path.join(uploadDir, filename);
  await writeFile(filepath, buffer);

  // Return URL yang bisa diakses
  const url = `/uploads/lapangan/${filename}`;
  return NextResponse.json({ url });
}