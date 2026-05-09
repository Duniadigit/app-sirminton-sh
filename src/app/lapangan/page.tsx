"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";

type Lapangan = {
  id: number; nama: string; jenis: string; deskripsi: string;
  harga_per_jam: number; kapasitas: number; status: string;
  image?: string; // ← tambah ini
};

export default function LapanganPage() {
  const [lapangan, setLapangan] = useState<Lapangan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lapangan")
      .then((r) => r.json())
      .then((data) => { setLapangan(data); setLoading(false); });
  }, []);

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Lapangan</h1>
        <p className="text-gray-500 mb-8">Pilih lapangan yang tersedia untuk booking</p>
        {loading ? <p className="text-gray-400">Memuat data...</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lapangan.map((lap) => (
              <div key={lap.id} className="card overflow-hidden p-0">

                {/* Foto atau fallback icon */}
                <div className="relative h-40 w-full bg-primary-50">
                  {lap.image ? (
                    <Image
                      src={lap.image}
                      alt={lap.nama}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-5xl">🏸</span>
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{lap.nama}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      lap.status === "TERSEDIA"
                        ? "bg-primary-100 text-primary-700"
                        : "bg-red-100 text-red-600"
                    }`}>
                      {lap.status === "TERSEDIA" ? "Tersedia" : "Tidak Tersedia"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-3">{lap.deskripsi}</p>
                  <p className="text-primary-700 font-bold">
                    {formatRupiah(lap.harga_per_jam)}/jam
                  </p>
                  <p className="text-gray-400 text-xs">Kapasitas: {lap.kapasitas} orang</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}