"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import TombolBatal from "@/components/TombolBatal";

const statusClass: Record<string, string> = {
  PENDING: "badge-pending",
  KONFIRMASI: "badge-konfirmasi",
  SELESAI: "badge-selesai",
  BATAL: "badge-batal",
};

const statusLabel: Record<string, string> = {
  PENDING: "Menunggu",
  KONFIRMASI: "Dikonfirmasi",
  SELESAI: "Selesai",
  BATAL: "Dibatalkan",
};

export default function RiwayatPage() {
  const [reservasi, setReservasi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    fetch("/api/reservasi")
      .then((r) => r.json())
      .then((data) => { setReservasi(data); setLoading(false); });
  };

  useEffect(loadData, []);

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Riwayat Reservasi</h1>
        {loading ? <p className="text-gray-400">Memuat data...</p>
        : reservasi.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-400">Belum ada reservasi</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservasi.map((r) => (
              <div key={r.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">{r.lapangan.nama}</h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {new Date(r.tanggal).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                    </p>
                    <p className="text-gray-700 text-sm mt-1">
                      {r.jam_mulai} – {r.jam_selesai} ({r.durasi} jam)
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <span className={statusClass[r.status]}>{statusLabel[r.status]}</span>
                    <p className="text-primary-700 font-bold">{formatRupiah(r.total_harga)}</p>
                    {r.dp > 0 && <p className="text-gray-400 text-xs">DP: {formatRupiah(r.dp)}</p>}
                    <TombolBatal reservasi={r} onBerhasil={loadData} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}