const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Admin
  const hashedPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@sirminton.com' },
    update: {},
    create: {
      nama: 'Administrator',
      email: 'admin@sirminton.com',
      password: hashedPassword,
      no_hp: '081234567890',
      role: 'ADMIN',
    },
  })

  // 4 Lapangan
  const lapangan = [
    { nama: 'Lapangan A', jenis: 'Badminton', harga_per_jam: 50000, kapasitas: 4 },
    { nama: 'Lapangan B', jenis: 'Badminton', harga_per_jam: 50000, kapasitas: 4 },
    { nama: 'Lapangan C', jenis: 'Badminton', harga_per_jam: 60000, kapasitas: 4 },
    { nama: 'Lapangan D', jenis: 'Badminton', harga_per_jam: 60000, kapasitas: 4 },
  ]

  for (const lap of lapangan) {
    await prisma.lapangan.upsert({
      where: { id: lapangan.indexOf(lap) + 1 },
      update: {},
      create: { ...lap, deskripsi: 'Lapangan badminton standar dengan lantai vinyl' },
    })
  }

  // Seed Harga Waktu
  await prisma.hargaWaktu.createMany({
    data: [
      { namaWaktu: 'Pagi',  jamMulai: 6,  jamSelesai: 12, multiplier: 1.0, keterangan: 'Harga normal (06:00 - 12:00)' },
      { namaWaktu: 'Siang', jamMulai: 12, jamSelesai: 17, multiplier: 1.2, keterangan: 'Harga siang +20% (12:00 - 17:00)' },
      { namaWaktu: 'Malam', jamMulai: 17, jamSelesai: 22, multiplier: 1.5, keterangan: 'Harga malam +50% (17:00 - 22:00)' },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed selesai! Admin: admin@sirminton.com / admin123')
}

main().catch(console.error).finally(() => prisma.$disconnect())