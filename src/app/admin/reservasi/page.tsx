"use client";
import { useState, useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";

const statusClass: Record<string, string> = {
  PENDING: "badge-pending",
  KONFIRMASI: "badge-konfirmasi",
  SELESAI: "badge-selesai",
  BATAL: "badge-batal",
};

const statusPembayaranStyle: Record<string, string> = {
  MENUNGGU: "bg-yellow-100 text-yellow-700",
  VERIFIED: "bg-green-100 text-green-700",
  DITOLAK: "bg-red-100 text-red-700",
};

export default function AdminReservasiPage() {
  const [reservasi, setReservasi] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReservasi, setSelectedReservasi] = useState<any | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadData = () => {
    fetch("/api/reservasi")
      .then((r) => r.json())
      .then((data) => { setReservasi(data); setLoading(false); });
  };

  useEffect(loadData, []);

  const updateStatus = async (id: number, status: string) => {
    setUpdating(true);
    await fetch(`/api/reservasi/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setUpdating(false);
    setSelectedReservasi(null);
    loadData();
  };

  const hapus = async (id: number) => {
    if (!confirm("Yakin hapus reservasi ini?")) return;
    await fetch(`/api/reservasi/${id}`, { method: "DELETE" });
    loadData();
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(n);

  const Row = ({ label, value, bold, mono }: { label: string; value: string; bold?: boolean; mono?: boolean }) => (
    <div className="flex justify-between items-start gap-4">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-right ${bold ? "font-bold text-primary-700" : "font-medium text-gray-800"} ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  );

  const DetailModal = ({ r, onClose }: { r: any; onClose: () => void }) => {
    const p = r.pembayaran;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Header */}
          <div className="bg-primary-600 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-white font-bold text-lg">Rincian Booking</h2>
              <p className="text-primary-200 text-xs">#{r.id} · {r.lapangan?.nama}</p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">×</button>
          </div>

          <div className="px-6 py-5 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* Data Pemesan */}
            <section>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data Pemesan</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <Row label="Nama" value={r.nama_pemesan} />
                <Row label="No. HP" value={r.no_hp || "-"} />
                <Row label="Tanggal" value={new Date(r.tanggal).toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })} />
                <Row label="Waktu" value={`${r.jam_mulai} – ${r.jam_selesai}`} />
                <Row label="Total Harga" value={formatRupiah(r.total_harga)} bold />
                {r.dp > 0 && <Row label="DP" value={formatRupiah(r.dp)} />}
              </div>
            </section>

            {/* Detail Pembayaran */}
            {p ? (
              <section>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Detail Pembayaran</p>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Status Bayar</span>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusPembayaranStyle[p.statusPembayaran]}`}>
                      {p.statusPembayaran}
                    </span>
                  </div>
                  <Row label="Metode" value={
                    p.metodePembayaran === "TRANSFER_BANK" ? "Transfer Bank"
                    : p.metodePembayaran === "EWALLET" ? "E-Wallet"
                    : "Tunai (di lokasi)"
                  } />
                  <Row label="Jumlah Dibayar" value={formatRupiah(Number(p.jumlahBayar))} bold />
                  {p.metodePembayaran === "TRANSFER_BANK" && (
                    <>
                      <hr className="border-gray-200" />
                      <Row label="Bank" value={p.namaBank || "-"} />
                      <Row label="No. Rekening" value={p.nomorRekening || "-"} mono />
                      <Row label="Atas Nama" value={p.namaPengirim || "-"} />
                    </>
                  )}
                  {p.metodePembayaran === "EWALLET" && (
                    <>
                      <hr className="border-gray-200" />
                      <Row label="E-Wallet" value={p.namaEwallet || "-"} />
                      <Row label="Nomor" value={p.nomorEwallet || "-"} mono />
                    </>
                  )}
                  {p.metodePembayaran === "TUNAI" && (
                    <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                      💵 Pembayaran dilakukan langsung di kasir GOR.
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-700">
                ⚠️ Belum ada data pembayaran dari pemesan.
              </div>
            )}

            {/* Status Reservasi */}
            <section>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Status Reservasi</p>
              <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${statusClass[r.status]}`}>
                {r.status}
              </span>
            </section>
          </div>

          {/* Tombol Aksi */}
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            {r.status !== "KONFIRMASI" && r.status !== "SELESAI" && (
              <button disabled={updating} onClick={() => updateStatus(r.id, "KONFIRMASI")}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {updating ? "Memproses..." : "✓ Konfirmasi"}
              </button>
            )}
            {r.status !== "BATAL" && r.status !== "SELESAI" && (
              <button disabled={updating} onClick={() => updateStatus(r.id, "BATAL")}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                ✕ Tolak
              </button>
            )}
            {(r.status === "KONFIRMASI" || r.status === "SELESAI" || r.status === "BATAL") && (
              <button disabled={updating} onClick={() => updateStatus(r.id, "SELESAI")}
                className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                Tandai Selesai
              </button>
            )}
            <button onClick={onClose}
              className="px-4 py-2.5 text-gray-500 text-sm rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-primary-50">
      <AdminSidebar />
      {selectedReservasi && (
        <DetailModal r={selectedReservasi} onClose={() => setSelectedReservasi(null)} />
      )}
      <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Manajemen Reservasi</h1>
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="text-gray-500 border-b border-gray-100 bg-gray-50">
                    {["Pemesan", "Lapangan", "Tanggal", "Waktu", "Total", "Status", "Aksi"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservasi.map((r) => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{r.nama_pemesan}</td>
                      <td className="px-4 py-3 text-gray-600">{r.lapangan.nama}</td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {new Date(r.tanggal).toLocaleDateString("id-ID")}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{r.jam_mulai}–{r.jam_selesai}</td>
                      <td className="px-4 py-3 text-primary-700 font-semibold whitespace-nowrap">{formatRupiah(r.total_harga)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${statusClass[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => setSelectedReservasi(r)}
                            className="text-primary-600 hover:text-primary-800 text-xs bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg font-semibold transition-colors">
                            Detail
                          </button>
                          <button onClick={() => hapus(r.id)}
                            className="text-red-500 hover:text-red-700 text-xs bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-lg transition-colors">
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}