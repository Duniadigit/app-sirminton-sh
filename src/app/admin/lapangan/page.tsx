"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import AdminSidebar from "@/components/AdminSidebar";

type Lapangan = {
  id: number; nama: string; jenis: string; deskripsi: string;
  harga_per_jam: number; kapasitas: number; status: string; image?: string;
};

const defaultForm = {
  nama: "", jenis: "Badminton", deskripsi: "",
  harga_per_jam: 50000, kapasitas: 4, image: "",
};

export default function AdminLapanganPage() {
  const [lapangan, setLapangan] = useState<Lapangan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [preview, setPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const loadData = () => {
    fetch("/api/lapangan").then((r) => r.json()).then(setLapangan);
  };
  useEffect(loadData, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Tampilkan preview lokal dulu
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    // Upload ke server
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();

    if (data.url) {
      setForm((f) => ({ ...f, image: data.url }));
    } else {
      alert("Upload gagal: " + data.error);
      setPreview("");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editId ? `/api/lapangan/${editId}` : "/api/lapangan";
    const method = editId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    handleCloseForm();
    loadData();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditId(null);
    setForm(defaultForm);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleEdit = (lap: Lapangan) => {
    setForm({
      nama: lap.nama, jenis: lap.jenis, deskripsi: lap.deskripsi,
      harga_per_jam: lap.harga_per_jam, kapasitas: lap.kapasitas,
      image: lap.image ?? "",
    });
    setPreview(lap.image ?? "");
    setEditId(lap.id);
    setShowForm(true);
  };

  const toggleStatus = async (lap: Lapangan) => {
    const newStatus = lap.status === "TERSEDIA" ? "TIDAK_TERSEDIA" : "TERSEDIA";
    await fetch(`/api/lapangan/${lap.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    loadData();
  };

  const hapus = async (id: number) => {
    if (!confirm("Yakin hapus lapangan ini?")) return;
    await fetch(`/api/lapangan/${id}`, { method: "DELETE" });
    loadData();
  };

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency", currency: "IDR", minimumFractionDigits: 0,
    }).format(n);

  return (
    <div className="flex min-h-screen bg-primary-50">
      <AdminSidebar />
      <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Manajemen Lapangan</h1>
          <button
            onClick={() => { setShowForm(true); setEditId(null); setForm(defaultForm); setPreview(""); }}
            className="btn-primary text-sm"
          >
            + Tambah
          </button>
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
              <h2 className="font-bold text-lg mb-4">
                {editId ? "Edit Lapangan" : "Tambah Lapangan"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { label: "Nama Lapangan", key: "nama", type: "text" },
                  { label: "Jenis", key: "jenis", type: "text" },
                  { label: "Deskripsi", key: "deskripsi", type: "text" },
                  { label: "Harga per Jam (Rp)", key: "harga_per_jam", type: "number" },
                  { label: "Kapasitas (orang)", key: "kapasitas", type: "number" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: type === "number" ? Number(e.target.value) : e.target.value })
                      }
                      className="input-field"
                      required
                    />
                  </div>
                ))}

                {/* Upload Foto */}
                <div>
                  <label className="label">Foto Lapangan</label>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0
                      file:text-sm file:font-medium file:bg-primary-100
                      file:text-primary-700 hover:file:bg-primary-200 cursor-pointer"
                  />
                  {uploading && (
                    <p className="text-xs text-primary-600 mt-1 animate-pulse">
                      ⏳ Mengupload foto...
                    </p>
                  )}
                </div>

                {/* Preview Foto */}
                {preview && (
                  <div className="relative h-36 w-full rounded-xl overflow-hidden border border-gray-200">
                    <Image src={preview} alt="preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => { setPreview(""); setForm((f) => ({ ...f, image: "" })); if (fileRef.current) fileRef.current.value = ""; }}
                      className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full"
                    >
                      Hapus
                    </button>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={uploading}
                    className="btn-primary flex-1 disabled:opacity-50"
                  >
                    {editId ? "Simpan" : "Tambah"}
                  </button>
                  <button type="button" onClick={handleCloseForm} className="btn-secondary flex-1">
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Grid Lapangan */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {lapangan.map((lap) => (
            <div key={lap.id} className="card overflow-hidden p-0">

              {/* Foto atau placeholder */}
              <div className="relative h-32 w-full bg-primary-50">
                {lap.image ? (
                  <Image
                    src={lap.image}
                    alt={lap.nama}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-4xl">🏸</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold">{lap.nama}</h3>
                  <button
                    onClick={() => toggleStatus(lap)}
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      lap.status === "TERSEDIA"
                        ? "bg-primary-100 text-primary-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {lap.status === "TERSEDIA" ? "Aktif" : "Nonaktif"}
                  </button>
                </div>
                <p className="text-primary-700 font-semibold text-sm">
                  {formatRupiah(lap.harga_per_jam)}/jam
                </p>
                <p className="text-gray-400 text-xs mb-3">Kapasitas: {lap.kapasitas} orang</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(lap)}
                    className="flex-1 bg-blue-50 text-blue-600 py-1.5 rounded text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => hapus(lap.id)}
                    className="flex-1 bg-red-50 text-red-600 py-1.5 rounded text-xs font-medium"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}