'use client'

import { useState, useEffect } from 'react'
import { UserCheck, UserPlus, Search, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminSidebar from '@/components/AdminSidebar'

export default function MemberAdminPage() {
  const [members, setMembers] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showTambah, setShowTambah] = useState(false)
  const [formTambah, setFormTambah] = useState({ userId: '', catatan: '' })
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    const [mRes, uRes] = await Promise.all([fetch('/api/admin/member'), fetch('/api/admin/users')])
    const [mJson, uJson] = await Promise.all([mRes.json(), uRes.json()])
    setMembers(mJson)
    const memberUserIds = mJson.map((m) => m.userId)
    setUsers(uJson.filter((u) => !memberUserIds.includes(u.id) && u.role === 'USER'))
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleTambahMember = async () => {
    if (!formTambah.userId) { toast.error('Pilih user terlebih dahulu'); return }
    setSubmitting(true)
    const res = await fetch('/api/admin/member', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formTambah),
    })
    const data = await res.json()
    if (res.ok) {
      toast.success(`Member ${data.member.user.nama} berhasil ditambahkan!`)
      setShowTambah(false); setFormTambah({ userId: '', catatan: '' }); fetchData()
    } else { toast.error(data.error) }
    setSubmitting(false)
  }

  const handleToggleStatus = async (member) => {
    const statusBaru = member.statusMember === 'AKTIF' ? 'NONAKTIF' : 'AKTIF'
    const res = await fetch(`/api/admin/member/${member.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statusMember: statusBaru }),
    })
    if (res.ok) { toast.success(`Status member diubah ke ${statusBaru}`); fetchData() }
  }

  const handleHapus = async (id, nama) => {
    if (!confirm(`Hapus member ${nama}?`)) return
    const res = await fetch(`/api/admin/member/${id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Member dihapus'); fetchData() }
  }

  const filtered = members.filter((m) =>
    m.user.nama.toLowerCase().includes(search.toLowerCase()) ||
    m.nomorMember.toLowerCase().includes(search.toLowerCase()) ||
    m.user.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-primary-50">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pencatatan Member</h1>
            <p className="text-gray-500 text-sm mt-1">{members.length} member terdaftar</p>
          </div>
          <button onClick={() => setShowTambah(true)} className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Tambah Member
          </button>
        </div>

        <div className="card mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Cari nama, nomor member, atau email..."
              className="input-field pl-10" value={search}
              onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="card overflow-hidden p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    {["No. Member", "Nama", "Kontak", "Tgl Daftar", "Status", "Catatan", "Aksi"].map(h => (
                      <th key={h} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">
                      <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                      Belum ada data member
                    </td></tr>
                  ) : (
                    filtered.map((m) => (
                      <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-lg font-bold">
                            {m.nomorMember}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium">{m.user.nama}</td>
                        <td className="py-3 px-4">
                          <p className="text-gray-700">{m.user.email}</p>
                          <p className="text-gray-400 text-xs">{m.user.no_hp}</p>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(m.tanggalDaftar).toLocaleDateString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className={m.statusMember === 'AKTIF' ? 'badge-konfirmasi' : 'badge-batal'}>
                            {m.statusMember}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500 text-xs max-w-[160px] truncate">{m.catatan || '—'}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button onClick={() => handleToggleStatus(m)}
                              className="p-1.5 rounded-lg hover:bg-gray-100" title="Toggle Status">
                              {m.statusMember === 'AKTIF'
                                ? <ToggleRight className="w-5 h-5 text-primary-600" />
                                : <ToggleLeft className="w-5 h-5 text-gray-400" />}
                            </button>
                            <button onClick={() => handleHapus(m.id, m.user.nama)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Tambah Member */}
        {showTambah && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowTambah(false)} />
            <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-bold mb-4">Tambah Member Baru</h3>
              <div className="space-y-4">
                <div>
                  <label className="label">Pilih User</label>
                  <select className="input-field" value={formTambah.userId}
                    onChange={(e) => setFormTambah({ ...formTambah, userId: e.target.value })}>
                    <option value="">-- Pilih User --</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.nama} ({u.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Catatan (opsional)</label>
                  <textarea className="input-field" rows={3} placeholder="Contoh: Member VIP..."
                    value={formTambah.catatan}
                    onChange={(e) => setFormTambah({ ...formTambah, catatan: e.target.value })} />
                </div>
                <div className="bg-primary-50 rounded-xl p-3">
                  <p className="text-xs text-primary-700">Nomor member digenerate otomatis: <strong>SH-YYYYMMDD-XXXX</strong></p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={handleTambahMember} disabled={submitting}
                  className="btn-primary flex-1 disabled:opacity-50">
                  {submitting ? 'Menyimpan...' : 'Simpan Member'}
                </button>
                <button onClick={() => setShowTambah(false)} className="btn-secondary flex-1">Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}