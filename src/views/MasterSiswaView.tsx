import React, { useState, useRef } from 'react';
import { Student } from '../types';
import { Filter, Search, Plus, FileSpreadsheet, Upload, Download, Edit2, Trash2, Users } from 'lucide-react';
import { exportStudentsToExcel, downloadStudentTemplate } from '../utils/helpers';
import * as XLSX from 'xlsx';

interface MasterSiswaViewProps {
  students: Student[];
  rombelList: string[];
  onOpenAddModal: () => void;
  onOpenEditModal: (student: Student) => void;
  onDeleteStudent: (id: string | number) => void;
  onDeleteAllStudents: () => void;
  onImportStudents: (imported: Student[]) => void;
  showToast: (msg: string) => void;
}

export const MasterSiswaView: React.FC<MasterSiswaViewProps> = ({
  students,
  rombelList,
  onOpenAddModal,
  onOpenEditModal,
  onDeleteStudent,
  onDeleteAllStudents,
  onImportStudents,
  showToast
}) => {
  const [filterRombel, setFilterRombel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const fileImportRef = useRef<HTMLInputElement>(null);

  const filteredStudents = students.filter(s => {
    const matchRombel = !filterRombel || s.rombel.replace(/^KELAS\s+/i, '') === filterRombel.replace(/^KELAS\s+/i, '');
    const matchSearch = !searchTerm ||
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.nis && s.nis.includes(searchTerm)) ||
      (s.nisn && s.nisn.includes(searchTerm)) ||
      (s.tempatLahir && s.tempatLahir.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.ortu && s.ortu.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.alamat && s.alamat.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchRombel && matchSearch;
  });

  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

          if (!data || data.length === 0) {
            showToast("Berkas Excel tidak memiliki data.");
            return;
          }

          const parsed: Student[] = data.map((row, idx) => {
            const rawNama = String(row['NAMA PESERTA DIDIK'] || row['NAMA LENGKAP'] || row['NAMA'] || '').trim().toUpperCase();
            const rawRombel = String(row['KELAS'] || row['ROMBEL'] || 'VII-A').trim().toUpperCase().replace(/^KELAS\s+/i, '');
            const rawNis = String(row['NIS'] || '').trim();
            const rawNisn = String(row['NISN'] || '').trim();
            const rawJk = String(row['JENIS KELAMIN (L/P)'] || row['JENIS KELAMIN'] || row['JK'] || 'L').trim().toUpperCase();
            const gender: 'L' | 'P' = (rawJk.startsWith('P') || rawJk === 'PEREMPUAN') ? 'P' : 'L';
            const tempatLahir = String(row['TEMPAT LAHIR'] || 'JAKARTA').trim().toUpperCase();
            const birthDate = String(row['TANGGAL LAHIR (YYYY-MM-DD)'] || row['TANGGAL LAHIR'] || '2013-05-15').trim();
            const agama = String(row['AGAMA'] || 'ISLAM').trim().toUpperCase();
            const ortu = String(row['NAMA ORANG TUA'] || row['ORANG TUA'] || row['ORTU'] || '-').trim().toUpperCase();
            const alamat = String(row['ALAMAT LENGKAP'] || row['ALAMAT'] || '-').trim().toUpperCase();

            return {
              id: Date.now() + idx,
              nama: rawNama,
              rombel: rawRombel,
              nis: rawNis,
              nisn: rawNisn,
              gender,
              tempatLahir,
              birthDate,
              ttl: `${tempatLahir}, ${birthDate}`,
              agama,
              ortu,
              alamat
            };
          }).filter(s => s.nama);

          if (parsed.length > 0) {
            onImportStudents(parsed);
            showToast(`Berhasil mengimpor ${parsed.length} data peserta didik baru!`);
          } else {
            showToast("Tidak ditemukan baris data siswa yang valid pada berkas Excel.");
          }
        } catch {
          showToast("Gagal membaca berkas Excel. Pastikan format kolom sesuai.");
        } finally {
          e.target.value = '';
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in duration-200">
      <input
        type="file"
        ref={fileImportRef}
        accept=".xlsx, .xls"
        className="hidden"
        onChange={handleImportExcel}
      />

      {/* Top Filter and Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-3">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto flex-1">
          <div className="flex items-center gap-2 text-slate-400 pl-1">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={filterRombel}
            onChange={(e) => setFilterRombel(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kelas</option>
            {rombelList.map(r => (
              <option key={r} value={r.replace(/^KELAS\s+/i, '')}>
                {r.startsWith('KELAS') ? r : `KELAS ${r}`}
              </option>
            ))}
          </select>

          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama Siswa / NIS / NISN / Tempat Lahir / Alamat..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          <button
            type="button"
            onClick={downloadStudentTemplate}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Template Excel
          </button>

          <button
            type="button"
            onClick={() => fileImportRef.current?.click()}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-blue-600" /> Impor Excel
          </button>

          <button
            type="button"
            onClick={() => exportStudentsToExcel(filteredStudents, filterRombel)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Ekspor Excel
          </button>

          <button
            type="button"
            onClick={onDeleteAllStudents}
            disabled={students.length === 0}
            className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            title="Hapus seluruh data siswa dari Buku Induk"
          >
            <Trash2 className="w-4 h-4" /> Hapus Semua Data
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Data Siswa
          </button>
        </div>
      </div>

      {/* Sub Header Counter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-bold text-xs text-slate-800 dark:text-white">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Format Data 8355 (Buku Induk Peserta Didik)</span>
        </div>
        <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-900/40">
          Menampilkan {filteredStudents.length} dari {students.length} Siswa Terdaftar
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100/90 dark:bg-slate-800/80 font-bold uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 text-[11px]">
              <th className="py-3 px-3 w-10 text-center">NO.</th>
              <th className="py-3 px-3">NAMA LENGKAP</th>
              <th className="py-3 px-3 w-20 text-center">KELAS</th>
              <th className="py-3 px-3 w-20 text-center">NIS</th>
              <th className="py-3 px-3 w-12 text-center">JK</th>
              <th className="py-3 px-3 w-28 text-center">NISN</th>
              <th className="py-3 px-3">TEMPAT LAHIR</th>
              <th className="py-3 px-3 w-28 text-center">TGL LAHIR</th>
              <th className="py-3 px-3 w-20 text-center">AGAMA</th>
              <th className="py-3 px-3">NAMA ORANG TUA</th>
              <th className="py-3 px-3">ALAMAT LENGKAP</th>
              <th className="py-3 px-3 w-20 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-slate-200">
            {filteredStudents.map((s, idx) => (
              <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                <td className="py-2.5 px-3 text-center font-bold text-slate-500">{idx + 1}</td>
                <td className="py-2.5 px-3 font-bold text-slate-800 dark:text-white uppercase">{s.nama}</td>
                <td className="py-2.5 px-3 text-center font-bold text-blue-600 dark:text-blue-400">{s.rombel}</td>
                <td className="py-2.5 px-3 text-center font-mono font-semibold">{s.nis || '-'}</td>
                <td className={`py-2.5 px-3 text-center font-bold ${s.gender === 'L' ? 'text-blue-600' : 'text-pink-600'}`}>
                  {s.gender}
                </td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-600 dark:text-slate-400">{s.nisn || '-'}</td>
                <td className="py-2.5 px-3 uppercase text-slate-700 dark:text-slate-300 text-[11px] font-semibold">{s.tempatLahir}</td>
                <td className="py-2.5 px-3 text-center font-mono text-slate-700 dark:text-slate-300 text-[11px]">{s.birthDate}</td>
                <td className="py-2.5 px-3 text-center uppercase">{s.agama}</td>
                <td className="py-2.5 px-3 uppercase text-slate-700 dark:text-slate-300 text-[11px]">{s.ortu || '-'}</td>
                <td className="py-2.5 px-3 uppercase text-slate-600 dark:text-slate-400 text-[11px] max-w-xs truncate" title={s.alamat}>
                  {s.alamat || '-'}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => onOpenEditModal(s)}
                      className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg transition"
                      title="Edit Siswa"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteStudent(s.id)}
                      className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-lg transition"
                      title="Hapus Siswa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredStudents.length === 0 && (
              <tr>
                <td colSpan={12} className="text-center py-8 text-slate-400 font-medium">
                  Tidak ada data peserta didik yang cocok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
