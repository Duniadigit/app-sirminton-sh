export function hitungHarga(jamMulai, hargaBasar, durasi) {
  let multiplier = 1.0
  let namaWaktu = 'Pagi'

  if (jamMulai >= 6 && jamMulai < 12) { multiplier = 1.0; namaWaktu = 'Pagi' }
  else if (jamMulai >= 12 && jamMulai < 17) { multiplier = 1.2; namaWaktu = 'Siang' }
  else if (jamMulai >= 17 && jamMulai <= 22) { multiplier = 1.5; namaWaktu = 'Malam' }

  const hargaPerJamFinal = Math.round(hargaBasar * multiplier)
  return { totalHarga: hargaPerJamFinal * durasi, multiplier, namaWaktu, hargaPerJamFinal }
}

export function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(angka)
}

export function getBadgeWaktu(namaWaktu) {
  const map = {
    Pagi:  { warna: 'bg-yellow-100 text-yellow-700', icon: '🌅' },
    Siang: { warna: 'bg-orange-100 text-orange-700', icon: '☀️' },
    Malam: { warna: 'bg-indigo-100 text-indigo-700', icon: '🌙' },
  }
  return map[namaWaktu] ?? map.Pagi
}