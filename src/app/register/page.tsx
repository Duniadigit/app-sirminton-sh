"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ nama: "", email: "", password: "", no_hp: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); setLoading(false); }
    else router.push("/login?registered=true");
  };

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl">🏸</div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Daftar Akun</h1>
          <p className="text-gray-500 text-sm">SIRMINTON-SH</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Nama Lengkap", key: "nama", type: "text", placeholder: "John Doe" },
            { label: "Email", key: "email", type: "email", placeholder: "email@contoh.com" },
            { label: "Nomor HP", key: "no_hp", type: "tel", placeholder: "081234567890" },
            { label: "Password", key: "password", type: "password", placeholder: "Min. 8 karakter" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="label">{label}</label>
              <input type={type} value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="input-field" placeholder={placeholder} required />
            </div>
          ))}
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Mendaftar..." : "Daftar Sekarang"}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6 text-sm">
          Sudah punya akun?{" "}
          <Link href="/login" className="text-primary-600 hover:underline font-medium">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
}