"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import BookingSuccessModal from "@/components/BookingSuccessModal";
import { hitungHarga, formatRupiah, getBadgeWaktu } from "@/lib/hargaUtils";

type Lapangan = { id: number; nama: string; harga_per_jam: number; status: string };

export default function BookingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [lapangan, setLapangan] = useState<Lapangan[]>([]);
  const [form, setForm] = useState({
    lapanganId: "", nama_pemesan: "", no_hp: "",
    tanggal: "", jam_mulai: "08:00", durasi: 1, dp: 0, catatan: "",
  });
  const [infoHarga, setInfoHarga] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sukses, setSukses] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/lapangan")
      .then((r) => r.json())
      .then((data) => setLapangan(data.filter((l: Lapangan) => l.status === "TERSEDIA")));
    if (session?.user?.name) setForm((f) => ({ ...f, nama_pemesan: session.user?.name || "" }));
  }, [session]);

  useEffect(() => {
    const lap = lapangan.find((l) => l.id === Number(form.lapanganId));
    if (lap) {
      const jamInt = parseInt(form.jam_mulai.split(':')[0]);
      setInfoHarga(hitungHarga(jamInt, lap.harga_per_jam, form.durasi));
    } else {
      setInfoHarga(null);
    }
  }, [form.lapanganId, form.jam_mulai, form.durasi, lapangan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/reservasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, lapanganId: Number(form.lapanganId) }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); }
    else {
      const lap = lapangan.find((l) => l.id === Number(form.lapanganId));
      setSukses({
        nomorBooking: `SH-${String(data.id).padStart(6, '0')}`,
        namaLapangan: lap?.nama,
        tanggal: new Date(data.tanggal).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        jamMulai: data.jam_mulai,
        jamSelesai: data.jam_selesai,
        durasi: data.durasi,
        namaWaktu: infoHarga?.namaWaktu,
        totalHarga: data.total_harga,
        jumlahDp: data.dp,
        reservasiId: data.id,
      });
    }
    setLoading(false);
  };

  const selectedLap = lapangan.find((l) => l.id === Number(form.lapanganId));

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Form Booking Lapangan</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2 card space-y-4">
            <div>
              <label className="label">Pilih Lapangan</label>
              <select value={form.lapanganId} onChange={(e) => setForm({ ...form, lapanganId: e.target.value })}
                className="input-field" required>
                <option value="">-- Pilih Lapangan --</option>
                {lapangan.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.nama} — Rp {l.harga_per_jam.toLocaleString("id-ID")}/jam (normal)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Nama Pemesan</label>
                <input type="text" value={form.nama_pemesan}
                  onChange={(e) => setForm({ ...form, nama_pemesan: e.target.value })}
                  className="input-field" required />
              </div>
              <div>
                <label className="label">Nomor HP</label>
                <input type="tel" value={form.no_hp}
                  onChange={(e) => setForm({ ...form, no_hp: e.target.value })}
                  className="input-field" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Tanggal</label>
                <input type="date" value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                  min={new Date().toISOString().split("T")[0]} className="input-field" required />
              </div>
              <div>
                <label className="label">Jam Mulai</label>
                <select value={form.jam_mulai}
                  onChange={(e) => setForm({ ...form, jam_mulai: e.target.value })}
                  className="input-field">
                  {Array.from({ length: 16 }, (_, i) => {
                    const jam = String(i + 6).padStart(2, "0");
                    return <option key={jam} value={`${jam}:00`}>{jam}:00</option>;
                  })}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Durasi: {form.durasi} jam</label>
              <input type="range" min={1} max={4} value={form.durasi}
                onChange={(e) => setForm({ ...form, durasi: Number(e.target.value) })}
                className="w-full accent-primary-600" />
              <div className="flex justify-between text-gray-400 text-xs mt-1">
                <span>1 jam</span><span>2 jam</span><span>3 jam</span><span>4 jam</span>
              </div>
            </div>

            <div>
              <label className="label">Jumlah DP (Rp)</label>
              <input type="number" value={form.dp} min={0}
                onChange={(e) => setForm({ ...form, dp: Number(e.target.value) })}
                className="input-field" />
            </div>

            {/* Info Harga Waktu */}
            {infoHarga && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4">
                <h4 className="font-bold text-primary-900 mb-3">Estimasi Biaya</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kategori Waktu</span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${getBadgeWaktu(infoHarga.namaWaktu).warna}`}>
                      {getBadgeWaktu(infoHarga.namaWaktu).icon} {infoHarga.namaWaktu}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Harga per Jam</span>
                    <span className="font-semibold">{formatRupiah(infoHarga.hargaPerJamFinal)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold text-primary-800">
                    <span>Total Biaya</span>
                    <span className="text-lg">{formatRupiah(infoHarga.totalHarga)}</span>
                  </div>
                </div>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
              {loading ? "Memproses..." : "🏸 Konfirmasi Booking"}
            </button>
          </form>

          {/* Summary */}
          <div className="card h-fit">
            <h3 className="font-bold text-primary-700 mb-4">Ringkasan</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Lapangan</span><span>{selectedLap?.nama || "—"}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Durasi</span><span>{form.durasi} jam</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-bold text-primary-700">
                <span>Total</span>
                <span>{infoHarga ? formatRupiah(infoHarga.totalHarga) : "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Sukses */}
      {sukses && (
        <BookingSuccessModal
          data={sukses}
          onClose={() => setSukses(null)}
          onBayar={() => router.push(`/pembayaran/${sukses.reservasiId}`)}
        />
      )}
    </div>
  );
}