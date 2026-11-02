import React, { useState } from 'react';
import { Student, SchoolProfile, WaliKelas, LogoConfig } from '../types';
import { KopSurat } from '../components/KopSurat';
import { Filter, FileSpreadsheet, Printer } from 'lucide-react';
import * as XLSX from 'xlsx';
import { downloadElementAsPDF } from '../utils/pdfExport';

interface DaftarSiswaViewProps {
  students: Student[];
  school: SchoolProfile;
  waliList: WaliKelas[];
  logos: LogoConfig;
  rombelList: string[];
  tahunAjaran?: string;
  showToast: (msg: string) => void;
}

export const DaftarSiswaView: React.FC<DaftarSiswaViewProps> = ({
  students,
  school,
  waliList,
  logos,
  rombelList,
  tahunAjaran = '2026/2027',
  showToast
}) => {
  const [filterRombel, setFilterRombel] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const filtered = students.filter(s => {
    return !filterRombel || s.rombel.replace(/^KELAS\s+/i, '') === filterRombel.replace(/^KELAS\s+/i, '');
  });

  const wali = waliList.find(w => w.rombel.replace(/^KELAS\s+/i, '') === filterRombel.replace(/^KELAS\s+/i, ''));
  const rombelDisplay = filterRombel ? `KELAS ${filterRombel}` : 'SEMUA KELAS';

  const handleExportExcel = () => {
    try {
      const namaWali = wali ? wali.nama : '...........................................';
      const nipWali = wali ? (wali.nip || '-') : '...........................................';

      const sheetData: (string | number)[][] = [
        [school.instansiAtas],
        [school.dinas],
        [school.name],
        [`${school.address} | NPSN: ${school.npsn}`],
        [""],
        ["DAFTAR PESERTA DIDIK"],
        [`KELAS : ${rombelDisplay} | TAHUN PELAJARAN 2026/2027`],
        [""],
        ["NO.", "NIS", "NISN", "NAMA PESERTA DIDIK", "JK", "AGAMA"]
      ];

      for (let i = 0; i < 36; i++) {
        const s = filtered[i];
        if (s) {
          sheetData.push([
            i + 1,
            s.nis || "",
            s.nisn || "",
            s.nama || "",
            s.gender || "",
            s.agama || "ISLAM"
          ]);
        } else {
          sheetData.push([i + 1, "", "", "", "", ""]);
        }
      }

      sheetData.push([""]);
      sheetData.push(["", "", "", "", "", "Jakarta, 30 Oktober 2026"]);
      sheetData.push(["", "", "", "", "", `Wali Kelas ${filterRombel ? filterRombel : ''}`]);
      sheetData.push([""]);
      sheetData.push([""]);
      sheetData.push(["", "", "", "", "", namaWali]);
      sheetData.push(["", "", "", "", "", `NIP. ${nipWali}`]);

      const ws = XLSX.utils.aoa_to_sheet(sheetData);
      ws['!cols'] = [
        { wch: 6 },
        { wch: 14 },
        { wch: 16 },
        { wch: 38 },
        { wch: 8 },
        { wch: 16 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Daftar Siswa");
      XLSX.writeFile(wb, `Daftar_Siswa_${filterRombel || 'Semua_Kelas'}_SMPN18.xlsx`);
      showToast("Daftar siswa lengkap dengan Kop & TTD berhasil diunduh!");
    } catch {
      showToast("Gagal mengekspor data ke Excel.");
    }
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    showToast("Sedang memproses unduhan PDF Daftar Siswa (F4 Portrait)...");
    const cleanRombel = filterRombel ? filterRombel.replace(/\s+/g, '_') : 'Semua_Kelas';
    const success = await downloadElementAsPDF({
      elementId: 'printable-daftarsiswa-area',
      filename: `Daftar_Siswa_${cleanRombel}_SMPN18.pdf`,
      orientation: 'portrait'
    });
    setIsExporting(false);
    if (success) {
      showToast("Dokumen PDF Daftar Siswa berhasil diunduh!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
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
          <span className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-900/50">
            {filtered.length} Siswa (Format 1 Halaman F4)
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" /> Unduh Excel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <Printer className="w-4 h-4" />
            <span>{isExporting ? 'Memproses PDF...' : 'Unduh PDF (1 Halaman)'}</span>
          </button>
        </div>
      </div>

      {/* Official F4 Portrait Paper Preview */}
      <div className="flex justify-center my-4 overflow-x-auto">
        <div id="printable-daftarsiswa-area" className="paper-f4 p-6 sm:p-8 rounded-xl border border-slate-300 shadow-xl font-sans text-slate-900 bg-white">
          <KopSurat
            school={school}
            logos={logos}
            documentTitle="DAFTAR PESERTA DIDIK"
            documentSubtitle={`KELAS : ${rombelDisplay} | TAHUN PELAJARAN ${tahunAjaran}`}
          />

          {/* Table 36 Rows */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-900 text-xs">
              <thead>
                <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-900 uppercase text-center">
                  <th className="border border-slate-900 px-2 py-2 w-10">NO.</th>
                  <th className="border border-slate-900 px-2 py-2 w-24">NIS</th>
                  <th className="border border-slate-900 px-2 py-2 w-28">NISN</th>
                  <th className="border border-slate-900 px-3 py-2 text-left">NAMA PESERTA DIDIK</th>
                  <th className="border border-slate-900 px-2 py-2 w-12">JK</th>
                  <th className="border border-slate-900 px-3 py-2 w-28">AGAMA</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-900">
                {Array.from({ length: 36 }).map((_, idx) => {
                  const s = filtered[idx];
                  if (s) {
                    return (
                      <tr key={s.id || idx}>
                        <td className="border border-slate-900 text-center font-bold py-1">{idx + 1}</td>
                        <td className="border border-slate-900 text-center font-mono py-1">{s.nis || '-'}</td>
                        <td className="border border-slate-900 text-center font-mono py-1">{s.nisn || '-'}</td>
                        <td className="border border-slate-900 font-bold uppercase px-2 py-1">{s.nama}</td>
                        <td className={`border border-slate-900 text-center font-bold py-1 ${s.gender === 'L' ? 'text-blue-900' : 'text-pink-900'}`}>
                          {s.gender}
                        </td>
                        <td className="border border-slate-900 text-center uppercase py-1">{s.agama || 'ISLAM'}</td>
                      </tr>
                    );
                  }
                  return (
                    <tr key={`empty-${idx}`}>
                      <td className="border border-slate-900 text-center font-bold text-slate-400 py-1">{idx + 1}</td>
                      <td className="border border-slate-900 py-1">&nbsp;</td>
                      <td className="border border-slate-900 py-1">&nbsp;</td>
                      <td className="border border-slate-900 py-1">&nbsp;</td>
                      <td className="border border-slate-900 py-1">&nbsp;</td>
                      <td className="border border-slate-900 py-1">&nbsp;</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Wali Kelas Signature Area */}
          <div className="mt-6 flex justify-end items-start text-xs font-semibold px-6">
            <div className="text-center space-y-1">
              <p>Jakarta, 30 Oktober 2026</p>
              <p className="font-bold">Wali Kelas {filterRombel ? filterRombel : ''}</p>
              <div className="h-16 flex items-center justify-center">
                {/* Space for physical/digital signature */}
              </div>
              <p className="font-bold underline uppercase">
                {wali ? wali.nama : '...........................................'}
              </p>
              <p className="text-slate-700 font-normal">
                NIP. {wali ? (wali.nip || '-') : '...........................................'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
