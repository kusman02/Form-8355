import React, { useState } from 'react';
import { Student, SchoolProfile, WaliKelas, LogoConfig } from '../types';
import { KopSurat } from '../components/KopSurat';
import { Filter, FileSpreadsheet, Printer, Layers } from 'lucide-react';
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
  // Default to first class if available, or 'VII-A'
  const [filterRombel, setFilterRombel] = useState<string>(
    rombelList[0]?.replace(/^KELAS\s+/i, '') || 'VII-A'
  );
  const [isExporting, setIsExporting] = useState(false);

  // Clean list of rombels
  const cleanRombelList = rombelList.map(r => r.replace(/^KELAS\s+/i, '').trim());

  // Determine active classes to display/export
  const activeRombels = filterRombel === 'ALL'
    ? cleanRombelList
    : [filterRombel];

  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      activeRombels.forEach(rombel => {
        const classStudents = students.filter(
          s => s.rombel.replace(/^KELAS\s+/i, '').trim().toUpperCase() === rombel.toUpperCase()
        );
        const wali = waliList.find(
          w => w.rombel.replace(/^KELAS\s+/i, '').trim().toUpperCase() === rombel.toUpperCase()
        );
        const namaWali = wali ? wali.nama : '...........................................';
        const nipWali = wali ? (wali.nip || '-') : '...........................................';

        const sheetData: (string | number)[][] = [
          [school.instansiAtas],
          [school.dinas],
          [school.name],
          [`${school.address} | NPSN: ${school.npsn}`],
          [""],
          ["DAFTAR PESERTA DIDIK"],
          [`KELAS : KELAS ${rombel} | TAHUN PELAJARAN ${tahunAjaran}`],
          [""],
          ["NO.", "NIS", "NISN", "NAMA PESERTA DIDIK", "JK", "AGAMA"]
        ];

        for (let i = 0; i < 36; i++) {
          const s = classStudents[i];
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
        sheetData.push(["", "", "", "", "", `${school.tempat || 'Jakarta'}, ${school.tanggal || '30 Oktober 2026'}`]);
        sheetData.push(["", "", "", "", "", `Wali Kelas ${rombel}`]);
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

        // Sheet name max 31 chars
        const sheetName = `Kelas ${rombel}`.substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      const filename = filterRombel === 'ALL'
        ? `Daftar_Siswa_Semua_Kelas_SMPN18.xlsx`
        : `Daftar_Siswa_Kelas_${filterRombel}_SMPN18.xlsx`;

      XLSX.writeFile(wb, filename);
      showToast("Daftar siswa lengkap berhasil diunduh ke Excel!");
    } catch {
      showToast("Gagal mengekspor data ke Excel.");
    }
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    const toastMsg = filterRombel === 'ALL'
      ? `Sedang memproses unduhan PDF Seluruh Kelas (1 Halaman / Kelas F4 Portrait)...`
      : `Sedang memproses unduhan PDF Kelas ${filterRombel} (1 Halaman F4 Portrait)...`;
    showToast(toastMsg);

    const cleanName = filterRombel === 'ALL' ? 'Semua_Kelas' : `Kelas_${filterRombel.replace(/\s+/g, '_')}`;
    const success = await downloadElementAsPDF({
      elementId: 'printable-daftarsiswa-area',
      filename: `Daftar_Siswa_${cleanName}_SMPN18.pdf`,
      orientation: 'portrait'
    });
    setIsExporting(false);
    if (success) {
      showToast("Dokumen PDF Daftar Siswa berhasil diunduh pas 1 halaman per kelas!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Actions */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={filterRombel}
            onChange={(e) => setFilterRombel(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {cleanRombelList.map(r => (
              <option key={r} value={r}>
                KELAS {r}
              </option>
            ))}
            <option value="ALL">Semua Kelas (1 Halaman Per Kelas)</option>
          </select>
          <span className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-900/50 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>
              {filterRombel === 'ALL'
                ? `${cleanRombelList.length} Kelas (1 Halaman / Kelas)`
                : `Kelas ${filterRombel} (Pas 1 Halaman F4)`}
            </span>
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
            <span>
              {isExporting
                ? 'Memproses PDF...'
                : filterRombel === 'ALL'
                  ? `Unduh PDF (${cleanRombelList.length} Halaman)`
                  : 'Unduh PDF (1 Halaman)'}
            </span>
          </button>
        </div>
      </div>

      {/* Official F4 Portrait Paper Preview */}
      <div className="flex flex-col items-center my-4 overflow-x-auto">
        <div id="printable-daftarsiswa-area" className="w-full max-w-[960px]">
          {activeRombels.map((rombel, idx) => {
            const classStudents = students.filter(
              s => s.rombel.replace(/^KELAS\s+/i, '').trim().toUpperCase() === rombel.toUpperCase()
            );
            const wali = waliList.find(
              w => w.rombel.replace(/^KELAS\s+/i, '').trim().toUpperCase() === rombel.toUpperCase()
            );
            const isLast = idx === activeRombels.length - 1;

            return (
              <div
                key={rombel}
                className={`paper-f4 pt-2.5 px-6 pb-2.5 sm:pt-3.5 sm:px-8 sm:pb-3 rounded-xl border border-slate-300 shadow-xl font-sans text-slate-900 bg-white min-h-[1060px] flex flex-col justify-between ${
                  !isLast ? 'page-break-after mb-8' : ''
                }`}
              >
                <div>
                  {/* Kop Surat (Compact mode to push kop up towards top) */}
                  <KopSurat
                    school={school}
                    logos={logos}
                    compact={true}
                    documentTitle="DAFTAR PESERTA DIDIK"
                    documentSubtitle={`KELAS : KELAS ${rombel} | TAHUN PELAJARAN ${tahunAjaran}`}
                  />

                  {/* Table 36 Rows with Adequate Cell Padding so text never touches borders */}
                  <div className="overflow-x-auto mt-1">
                    <table className="table-daftarsiswa w-full border-collapse border border-slate-900 text-[10px]">
                      <thead>
                        <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-900 uppercase text-center h-[26px]">
                          <th className="border border-slate-900 px-1 py-1 w-10 text-center align-middle font-bold text-[9.5px]">NO.</th>
                          <th className="border border-slate-900 px-2 py-1 w-24 text-center align-middle font-bold text-[9.5px]">NIS</th>
                          <th className="border border-slate-900 px-2 py-1 w-28 text-center align-middle font-bold text-[9.5px]">NISN</th>
                          <th className="border border-slate-900 px-3 py-1 text-left align-middle font-bold text-[9.5px]">NAMA PESERTA DIDIK</th>
                          <th className="border border-slate-900 px-1.5 py-1 w-12 text-center align-middle font-bold text-[9.5px]">JK</th>
                          <th className="border border-slate-900 px-2 py-1 w-28 text-center align-middle font-bold text-[9.5px]">AGAMA</th>
                        </tr>
                      </thead>
                      <tbody className="font-medium text-slate-900">
                        {Array.from({ length: 36 }).map((_, rowIdx) => {
                          const s = classStudents[rowIdx];
                          if (s) {
                            return (
                              <tr key={s.id || rowIdx} className="h-[22.5px] hover:bg-slate-50">
                                <td className="border border-slate-900 text-center align-middle font-bold text-[9.5px] px-1 py-[3px]">
                                  {rowIdx + 1}
                                </td>
                                <td className="border border-slate-900 text-center align-middle font-mono text-[9px] px-2 py-[3px]">
                                  {s.nis || '-'}
                                </td>
                                <td className="border border-slate-900 text-center align-middle font-mono text-[9px] px-2 py-[3px]">
                                  {s.nisn || '-'}
                                </td>
                                <td className="border border-slate-900 text-left align-middle font-bold uppercase text-[9.5px] px-3 py-[3px] truncate max-w-[280px]">
                                  {s.nama}
                                </td>
                                <td
                                  className={`border border-slate-900 text-center align-middle font-bold text-[9.5px] px-1.5 py-[3px] ${
                                    s.gender === 'L' ? 'text-blue-900' : 'text-pink-900'
                                  }`}
                                >
                                  {s.gender}
                                </td>
                                <td className="border border-slate-900 text-center align-middle uppercase text-[9px] px-2 py-[3px]">
                                  {s.agama || 'ISLAM'}
                                </td>
                              </tr>
                            );
                          }
                          return (
                            <tr key={`empty-${rombel}-${rowIdx}`} className="h-[22.5px]">
                              <td className="border border-slate-900 text-center align-middle font-bold text-slate-300 text-[9px] px-1 py-[3px]">
                                {rowIdx + 1}
                              </td>
                              <td className="border border-slate-900 align-middle px-2 py-[3px]">&nbsp;</td>
                              <td className="border border-slate-900 align-middle px-2 py-[3px]">&nbsp;</td>
                              <td className="border border-slate-900 align-middle px-3 py-[3px]">&nbsp;</td>
                              <td className="border border-slate-900 align-middle px-1.5 py-[3px]">&nbsp;</td>
                              <td className="border border-slate-900 align-middle px-2 py-[3px]">&nbsp;</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Signature Area (Diperkecil dan rapi merapat ke bawah tabel) */}
                <div className="mt-2 flex justify-end items-start text-xs font-semibold px-4 pt-1">
                  <div className="text-center text-[9px] space-y-0.5 leading-snug">
                    <p className="text-slate-800">{school.tempat || 'Jakarta'}, {school.tanggal || '30 Oktober 2026'}</p>
                    <p className="font-bold text-slate-900">Wali Kelas {rombel}</p>
                    <div className="h-7 flex items-center justify-center">
                      {/* Space for signature stamp/sign */}
                    </div>
                    <p className="font-bold underline uppercase text-[9.5px] text-slate-900">
                      {wali ? wali.nama : '...........................................'}
                    </p>
                    <p className="text-slate-700 font-normal text-[8.5px]">
                      NIP. {wali ? (wali.nip || '-') : '...........................................'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
