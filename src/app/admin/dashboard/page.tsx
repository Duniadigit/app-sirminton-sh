import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/login");

  const [totalBooking, terkonfirmasi, menunggu, selesai, totalPendapatan] =
    await Promise.all([
      prisma.reservasi.count(),
      prisma.reservasi.count({ where: { status: "KONFIRMASI" } }),
      prisma.reservasi.count({ where: { status: "PENDING" } }),
      prisma.reservasi.count({ where: { status: "SELESAI" } }),
      prisma.reservasi.aggregate({
        _sum: { total_harga: true },
        where: { status: { in: ["KONFIRMASI", "SELESAI"] } },
      }),
    ]);

  const reservasiTerbaru = await prisma.reservasi.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: { lapangan: true, user: { select: { nama: true } } },
  });

  const formatRupiah = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

  const statusClass: Record<string, string> = {
    PENDING: "badge-pending",
    KONFIRMASI: "badge-konfirmasi",
    SELESAI: "badge-selesai",
    BATAL: "badge-batal",
  };

  return (
    <div className="flex min-h-screen bg-primary-50">
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-8 pb-24 md:pb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Dashboard Admin</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Total Booking", value: totalBooking, color: "text-gray-900" },
            { label: "Dikonfirmasi", value: terkonfirmasi, color: "text-primary-700" },
            { label: "Menunggu", value: menunggu, color: "text-yellow-700" },
            { label: "Pendapatan", value: formatRupiah(totalPendapatan._sum.total_harga || 0), color: "text-primary-700" },
          ].map(({ label, value, color }) => (
            <div key={label} className="card p-4">
              <p className="text-gray-500 text-xs mb-1">{label}</p>
              <p className={`text-xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tabel — scroll horizontal di HP */}
        <div className="card overflow-hidden p-0">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Reservasi Terbaru</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="text-gray-500 border-b border-gray-100 bg-gray-50">
                  {["Pemesan", "Lapangan", "Tanggal", "Waktu", "Total", "Status"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reservasiTerbaru.map((r) => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{r.nama_pemesan}</td>
                    <td className="px-4 py-3 text-gray-600">{r.lapangan.nama}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(r.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {r.jam_mulai}–{r.jam_selesai}
                    </td>
                    <td className="px-4 py-3 text-primary-700 font-semibold whitespace-nowrap">
                      {formatRupiah(r.total_harga)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={statusClass[r.status]}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}