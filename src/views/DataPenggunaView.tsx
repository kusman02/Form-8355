import React, { useState } from 'react';
import { UserAccount, UserRole } from '../types';
import { Shield, Briefcase, GraduationCap, UserPlus, Search, Edit2, Trash2, AlertCircle } from 'lucide-react';

interface DataPenggunaViewProps {
  users: UserAccount[];
  currentUser: UserAccount | null;
  onOpenUserModal: (user?: UserAccount | null) => void;
  onDeleteUser: (id: string | number) => void;
  showToast: (msg: string) => void;
}

export const DataPenggunaView: React.FC<DataPenggunaViewProps> = ({
  users,
  currentUser,
  onOpenUserModal,
  onDeleteUser
}) => {
  const [roleFilter, setRoleFilter] = useState<string>('Semua');
  const [search, setSearch] = useState('');

  const adminCount = users.filter(u => u.role === 'Admin').length;
  const kepsekCount = users.filter(u => u.role === 'Kepala Sekolah').length;
  const guruCount = users.filter(u => u.role === 'Guru').length;

  const filteredUsers = users.filter(u => {
    const matchRole = roleFilter === 'Semua' || u.role === roleFilter;
    const matchSearch = !search ||
      u.nama.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase())) ||
      (u.info && u.info.toLowerCase().includes(search.toLowerCase()));
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="relative bg-gradient-to-r from-amber-600 via-rose-700 to-indigo-900 rounded-2xl p-6 text-white shadow-xl overflow-hidden border border-amber-500/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm border border-white/20">
              <Shield className="w-3.5 h-3.5" /> Manajemen Akun & Hak Akses
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Data Pengguna Aplikasi Form 8355
            </h2>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Kelola akun resmi untuk <span className="font-bold text-white">Admin</span> (akses penuh), <span className="font-bold text-white">Kepala Sekolah</span> (monitoring dokumen), dan <span className="font-bold text-white">Guru</span> (presensi & data siswa). Akun default sistem: Username <span className="font-bold text-white">123</span> / Password <span className="font-bold text-white">123</span> (Admin).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenUserModal(null)}
              className="px-5 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
            >
              <UserPlus className="w-4 h-4 text-amber-600" /> Tambah Pengguna
            </button>
          </div>
        </div>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Akun Admin</p>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">{adminCount} Akun</h3>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold text-[10px] rounded-lg">
            Akses Penuh
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Kepala Sekolah</p>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">{kepsekCount} Akun</h3>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-extrabold text-[10px] rounded-lg">
            Monitoring
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center border border-emerald-100 dark:border-emerald-900/50">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Guru / Wali Kelas</p>
              <h3 className="text-xl font-black text-slate-800 dark:text-white">{guruCount} Akun</h3>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] rounded-lg">
            Presensi & Data
          </span>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, username, NIP..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
              {['Semua', 'Admin', 'Kepala Sekolah', 'Guru'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    roleFilter === r
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Menampilkan <span className="font-bold text-slate-800 dark:text-white">{filteredUsers.length}</span> dari <span className="font-bold text-slate-800 dark:text-white">{users.length}</span> pengguna
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 font-bold uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                <th className="py-3 px-4 w-12 text-center">NO</th>
                <th className="py-3 px-4">NAMA PENGGUNA</th>
                <th className="py-3 px-4 w-36">USERNAME</th>
                <th className="py-3 px-4 w-44">KATA SANDI</th>
                <th className="py-3 px-4 w-44">PERAN (HAK AKSES)</th>
                <th className="py-3 px-4">INFORMASI TAMBAHAN</th>
                <th className="py-3 px-4 w-20 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
              {filteredUsers.map((u, idx) => {
                const badgeColor = u.role === 'Admin' 
                  ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300' 
                  : (u.role === 'Kepala Sekolah' ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300');

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 text-center font-bold text-slate-500">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <span>{u.nama}</span>
                        {currentUser?.id === u.id && (
                          <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded">Akun Anda</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">{u.email || '-'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-200">{u.username}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">••••••••</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold ${badgeColor}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 text-xs">{u.info || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenUserModal(u)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition cursor-pointer"
                          title="Edit Pengguna"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition cursor-pointer"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-slate-400 font-medium">
                    Tidak ada akun pengguna yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3.5 bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Ketentuan Hak Akses:</span> Akun berstatus <span className="font-bold">Admin</span> memiliki akses penuh mengelola data siswa, mutasi, pengaturan sistem, serta manajemen pengguna. Akun <span className="font-bold">Kepala Sekolah</span> dan <span className="font-bold">Guru</span> hanya dapat melihat rekapitulasi, cetak form 8355, daftar siswa, dan daftar absen tanpa menu pengaturan dan master siswa.
          </div>
        </div>
      </div>
    </div>
  );
};
