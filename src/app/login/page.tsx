"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("Email atau password salah");
      setLoading(false);
    } else {
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      if (session?.user?.role === "ADMIN") router.push("/admin/dashboard");
      else router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-primary-50 flex items-center justify-center">
      <div className="card w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl">🏸</div>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">SIRMINTON-SH</h1>
          <p className="text-gray-500 text-sm">Sistem Reservasi Lapangan Badminton</p>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-4 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="input-field" placeholder="email@contoh.com" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="input-field" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6 text-sm">
          Belum punya akun?{" "}
          <Link href="/register" className="text-primary-600 hover:underline font-medium">
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}