import React, { useState } from 'react';
import { Student, SchoolProfile, WaliKelas, Officials, LogoConfig } from '../types';
import { KopSurat } from '../components/KopSurat';
import { SchoolLogo } from '../components/BrandLogos';
import { Filter, Calendar, Printer, FileSpreadsheet, Layers } from 'lucide-react';
import { downloadElementAsPDF } from '../utils/pdfExport';
import * as XLSX from 'xlsx';
import { formatSignatureDate } from '../utils/electronBridge';

interface DaftarAbsenViewProps {
  students: Student[];
  school: SchoolProfile;
  waliList: WaliKelas[];
  officials: Officials;
  logos: LogoConfig;
  rombelList: string[];
  tahunAjaran?: string;
  showToast: (msg: string) => void;
}

export const DaftarAbsenView: React.FC<DaftarAbsenViewProps> = ({
  students,
  school,
  waliList,
  officials,
  logos,
  rombelList,
  tahunAjaran = '2026/2027',
  showToast
}) => {
  // Clean list of rombels
  const cleanRombelList = rombelList.map(r => r.replace(/^KELAS\s+/i, '').trim());

  // Default to first class (e.g. VII-A), or 'ALL'
  const [filterRombel, setFilterRombel] = useState<string>(
    cleanRombelList[0] || 'VII-A'
  );
  const [filterBulan, setFilterBulan] = useState<string>('Oktober');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [zoomScale, setZoomScale] = useState<'100' | '90' | '80'>('100');

  // Determine active classes to display/export
  const activeRombels = filterRombel === 'ALL'
    ? cleanRombelList
    : [filterRombel];

  // Number of days in the selected month
  const getDaysInMonth = (monthName: string): number => {
    const map: Record<string, number> = {
      'Januari': 31, 'Februari': 28, 'Maret': 31, 'April': 30,
      'Mei': 31, 'Juni': 30, 'Juli': 31, 'Agustus': 31,
      'September': 30, 'Oktober': 31, 'November': 30, 'Desember': 31
    };
    return map[monthName] || 31;
  };

  const daysCount = getDaysInMonth(filterBulan);
  const dateCols = Array.from({ length: 31 }, (_, i) => i + 1);

  // Handle Export to Excel
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

        const countL = classStudents.filter(s => s.gender === 'L').length;
        const countP = classStudents.filter(s => s.gender === 'P').length;

        const dateSignText = `${school.tempat || 'Jakarta'}, ${school.tanggal || `${daysCount} ${filterBulan} 2026`}`;

        const sheetData: (string | number)[][] = [
          [school.instansiAtas || 'PEMERINTAH PROVINSI DKI JAKARTA'],
          [school.dinas || 'DINAS PENDIDIKAN'],
          [school.name || 'SMP NEGERI 18 JAKARTA'],
          [`${school.address || 'Alamat Sekolah'} | NPSN: ${school.npsn || '-'}`],
          [""],
          ["DAFTAR HADIR PESERTA DIDIK"],
          [`KELAS : KELAS ${rombel} | BULAN : ${filterBulan.toUpperCase()} 2026 | TAHUN PELAJARAN ${tahunAjaran}`],
          [""],
          [
            "NO.", "NIS", "NISN", "NAMA PESERTA DIDIK", "JK",
            ...dateCols.map(d => String(d)),
            "S", "I", "A", "JML"
          ]
        ];

        // 36 Rows of Students
        for (let i = 0; i < 36; i++) {
          const s = classStudents[i];
          const datesData = dateCols.map(() => "");
          if (s) {
            sheetData.push([
              i + 1,
              s.nis || "",
              s.nisn || "",
              s.nama || "",
              s.gender || "",
              ...datesData,
              "", "", "", ""
            ]);
          } else {
            sheetData.push([i + 1, "", "", "", "", ...datesData, "", "", "", ""]);
          }
        }

        // Summary & Signatures
        sheetData.push([""]);
        sheetData.push(["Catatan Ketidakhadiran: Sakit: ..... % | Izin: ..... % | Alpa: ..... %"]);
        sheetData.push([`Rekapitulasi Siswa: L = ${countL} | P = ${countP} | Total = ${classStudents.length} Siswa`]);
        sheetData.push([""]);
        sheetData.push([
          "", "", "Mengetahui,", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
          dateSignText
        ]);
        sheetData.push([
          "", "", `Kepala ${school.name || 'Sekolah'}`, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
          `Wali Kelas ${rombel}`
        ]);
        sheetData.push([""]);
        sheetData.push([""]);
        sheetData.push([
          "", "", officials.kepsekName || '...........................................', "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
          namaWali
        ]);
        sheetData.push([
          "", "", `NIP. ${officials.kepsekNip || '-'}`, "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
          `NIP. ${nipWali}`
        ]);

        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        ws['!cols'] = [
          { wch: 6 },
          { wch: 12 },
          { wch: 14 },
          { wch: 32 },
          { wch: 6 },
          ...dateCols.map(() => ({ wch: 3.5 })),
          { wch: 5 },
          { wch: 5 },
          { wch: 5 },
          { wch: 6 }
        ];

        const sheetName = `Absen ${rombel}`.substring(0, 31);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });

      const filename = filterRombel === 'ALL'
        ? `Daftar_Absen_Semua_Kelas_${filterBulan}_SMPN18.xlsx`
        : `Daftar_Absen_Kelas_${filterRombel}_${filterBulan}_SMPN18.xlsx`;

      XLSX.writeFile(wb, filename);
      showToast("Daftar Absensi berhasil diekspor ke Excel!");
    } catch {
      showToast("Gagal mengekspor data absensi ke Excel.");
    }
  };

  // Handle Download PDF
  const handleDownloadPDF = async () => {
    setIsExporting(true);
    const toastMsg = filterRombel === 'ALL'
      ? `Sedang memproses unduhan PDF Seluruh Kelas (${activeRombels.length * 2} Halaman Landscape F4)...`
      : `Sedang memproses unduhan PDF Kelas ${filterRombel} (2 Halaman Landscape F4)...`;
    showToast(toastMsg);

    const cleanName = filterRombel === 'ALL' ? 'Semua_Kelas' : `Kelas_${filterRombel.replace(/\s+/g, '_')}`;
    const success = await downloadElementAsPDF({
      elementId: 'printable-daftarabsen-area',
      filename: `Daftar_Absen_${cleanName}_${filterBulan}_SMPN18.pdf`,
      orientation: 'landscape'
    });
    setIsExporting(false);
    if (success) {
      showToast("Dokumen PDF Daftar Absensi berhasil diunduh pas 2 halaman landscape per kelas!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Actions Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500">
            <Filter className="w-4 h-4" />
          </div>

          {/* Rombel Selector */}
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
            <option value="ALL">Semua Kelas (Cetak Seluruh Rombel)</option>
          </select>

          {/* Month Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {[
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
              ].map(b => (
                <option key={b} value={b}>Bulan {b}</option>
              ))}
            </select>
          </div>

          <span className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 rounded-full text-xs font-bold border border-blue-200 dark:border-blue-900/50 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" />
            <span>
              {filterRombel === 'ALL'
                ? `${activeRombels.length} Kelas (Total ${activeRombels.length * 2} Halaman F4 Landscape)`
                : `Kelas ${filterRombel} (Pas 2 Lembar F4 Landscape)`}
            </span>
          </span>

          {/* Zoom / Scale Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1.5">Skala:</span>
            {(['100', '90', '80'] as const).map(scale => (
              <button
                key={scale}
                type="button"
                onClick={() => setZoomScale(scale)}
                className={`px-2 py-0.5 text-xs font-bold rounded-lg transition ${
                  zoomScale === scale
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {scale}%
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
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
                  ? `Unduh PDF (${activeRombels.length * 2} Halaman)`
                  : 'Unduh PDF Absensi (2 Halaman)'}
            </span>
          </button>
        </div>
      </div>

      {/* 2-PAGE LANDSCAPE F4 CONTAINER PER CLASS */}
      <div className="flex flex-col items-center my-4 overflow-x-auto w-full pb-6">
        <div
          id="printable-daftarabsen-area"
          className="w-[1060px] min-w-[1060px] flex flex-col items-center transition-transform origin-top"
          style={{
            transform: zoomScale === '90' ? 'scale(0.9)' : zoomScale === '80' ? 'scale(0.8)' : 'none',
            marginBottom: zoomScale === '90' ? '-80px' : zoomScale === '80' ? '-160px' : '0px'
          }}
        >
          {activeRombels.map((rombel, rombelIdx) => {
            const classStudents = students.filter(
              s => s.rombel.replace(/^KELAS\s+/i, '').trim().toUpperCase() === rombel.toUpperCase()
            );
            const wali = waliList.find(
              w => w.rombel.replace(/^KELAS\s+/i, '').trim().toUpperCase() === rombel.toUpperCase()
            );
            const namaWali = wali ? wali.nama : '...........................................';
            const nipWali = wali ? (wali.nip || '-') : '...........................................';

            const countL = classStudents.filter(s => s.gender === 'L').length;
            const countP = classStudents.filter(s => s.gender === 'P').length;
            const countTotal = countL + countP;

            // Partition 36 rows: Lembar 1 (1 - 20), Lembar 2 (21 - 36)
            const p1Students = classStudents.slice(0, 20);
            const p2Students = classStudents.slice(20, 36);

            const isLastClass = rombelIdx === activeRombels.length - 1;

            const dateSignatureText = formatSignatureDate(school.tempat, school.tanggal || `${daysCount} ${filterBulan} 2026`);

            // Helper to check Sunday
            const monthIndexMap: Record<string, number> = {
              'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3,
              'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7,
              'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
            };
            const mIdx = monthIndexMap[filterBulan] ?? 9;
            const startYear = parseInt(tahunAjaran.split('/')[0]) || 2026;
            const targetYear = mIdx >= 6 ? startYear : startYear + 1;

            const isSunday = (day: number): boolean => {
              if (day > daysCount) return false;
              const d = new Date(targetYear, mIdx, day);
              return d.getDay() === 0;
            };

            return (
              <React.Fragment key={rombel}>
                {/* ==================== LEMBAR 1 (BARIS 1 - 20) ==================== */}
                <div
                  className="f4-landscape-page w-[1060px] min-w-[1060px] bg-white text-slate-900 border border-slate-300 shadow-xl rounded-xl p-3 sm:p-4 flex flex-col justify-between font-sans page-break-after mb-8"
                  style={{ minHeight: '680px', boxSizing: 'border-box' }}
                >
                  <div>
                    {/* Compact Official Header with School Logos */}
                    <KopSurat
                      school={school}
                      logos={logos}
                      compact={true}
                      documentTitle="DAFTAR HADIR PESERTA DIDIK"
                      documentSubtitle={`KELAS : KELAS ${rombel} | BULAN : ${filterBulan.toUpperCase()} 2026 | TAHUN PELAJARAN ${tahunAjaran}`}
                    />

                    {/* Table Lembar 1 (Rows 1 - 20) */}
                    <div className="mt-1">
                      <table
                        className="w-full border-collapse border border-slate-900 text-[8.5px] leading-tight"
                        style={{ tableLayout: 'fixed' }}
                      >
                        <colgroup>
                          <col style={{ width: '3%' }} />
                          <col style={{ width: '5%' }} />
                          <col style={{ width: '6.5%' }} />
                          <col style={{ width: '24%' }} />
                          <col style={{ width: '2.5%' }} />
                          {dateCols.map((d) => (
                            <col key={`col-d1-${d}`} style={{ width: '1.55%' }} />
                          ))}
                          <col style={{ width: '2.7%' }} />
                          <col style={{ width: '2.7%' }} />
                          <col style={{ width: '2.7%' }} />
                          <col style={{ width: '2.85%' }} />
                        </colgroup>
                        <thead>
                          <tr className="bg-slate-100 font-bold text-slate-900 uppercase text-center h-[22px]">
                            <th className="border border-slate-900 px-0.5 py-1 text-center align-middle font-bold text-[8px] bg-slate-100">NO.</th>
                            <th className="border border-slate-900 px-0.5 py-1 text-center align-middle font-bold text-[8px] bg-slate-100">NIS</th>
                            <th className="border border-slate-900 px-0.5 py-1 text-center align-middle font-bold text-[8px] bg-slate-100">NISN</th>
                            <th className="border border-slate-900 px-1.5 py-1 text-left align-middle font-bold text-[8.5px] bg-slate-100">NAMA PESERTA DIDIK</th>
                            <th className="border border-slate-900 px-0.5 py-1 text-center align-middle font-bold text-[8px] bg-slate-100">JK</th>
                            <th colSpan={31} className="border border-slate-900 px-0.5 py-1 text-center align-middle font-bold text-[8.5px] bg-slate-100">
                              TANGGAL BULAN {filterBulan.toUpperCase()}
                            </th>
                            <th colSpan={4} className="border border-slate-900 px-0.5 py-1 text-center bg-slate-200 align-middle font-bold text-[8px]">
                              REKAP
                            </th>
                          </tr>
                          <tr className="bg-slate-50 font-bold text-slate-900 text-center text-[7.5px] h-[18px]">
                            <th className="border border-slate-900 px-0.5 py-0.5 text-center align-middle text-[7px] text-slate-600 font-semibold bg-slate-100">(1)</th>
                            <th className="border border-slate-900 px-0.5 py-0.5 text-center align-middle text-[7px] text-slate-600 font-semibold bg-slate-100">(2)</th>
                            <th className="border border-slate-900 px-0.5 py-0.5 text-center align-middle text-[7px] text-slate-600 font-semibold bg-slate-100">(3)</th>
                            <th className="border border-slate-900 px-1.5 py-0.5 text-left align-middle text-[7px] text-slate-600 font-semibold bg-slate-100">(4)</th>
                            <th className="border border-slate-900 px-0.5 py-0.5 text-center align-middle text-[7px] text-slate-600 font-semibold bg-slate-100">(5)</th>
                            {dateCols.map((d) => {
                              const sun = isSunday(d);
                              const inactive = d > daysCount;
                              return (
                                <th
                                  key={d}
                                  className={`border border-slate-900 px-0 py-0.5 text-center align-middle ${
                                    inactive
                                      ? 'bg-slate-200 text-slate-400 font-medium'
                                      : sun
                                        ? 'bg-rose-100 text-rose-700 font-extrabold'
                                        : 'text-slate-800'
                                  }`}
                                >
                                  {d}
                                </th>
                              );
                            })}
                            <th className="border border-slate-900 bg-amber-100 text-amber-950 font-bold text-center align-middle">S</th>
                            <th className="border border-slate-900 bg-blue-100 text-blue-950 font-bold text-center align-middle">I</th>
                            <th className="border border-slate-900 bg-rose-100 text-rose-950 font-bold text-center align-middle">A</th>
                            <th className="border border-slate-900 bg-slate-200 text-slate-950 font-extrabold text-center align-middle">Jml</th>
                          </tr>
                        </thead>
                        <tbody className="font-medium text-slate-900">
                          {Array.from({ length: 20 }).map((_, idx) => {
                            const s = p1Students[idx];
                            if (s) {
                              return (
                                <tr key={s.id || idx} className="h-[21px] hover:bg-slate-50">
                                  <td className="border border-slate-900 text-center align-middle font-bold text-[8px] px-0.5 py-0">{idx + 1}</td>
                                  <td className="border border-slate-900 text-center align-middle font-mono text-[7.5px] px-0.5 py-0 tracking-tight">{s.nis || '-'}</td>
                                  <td className="border border-slate-900 text-center align-middle font-mono text-[7.5px] px-0.5 py-0 tracking-tight">{s.nisn || '-'}</td>
                                  <td className="border border-slate-900 text-left align-middle px-1.5 py-0">
                                    <div className="uppercase font-bold text-[8.5px] leading-tight break-words text-slate-900">
                                      {s.nama}
                                    </div>
                                  </td>
                                  <td className={`border border-slate-900 text-center align-middle font-bold text-[8px] py-0 ${s.gender === 'L' ? 'text-blue-900' : 'text-pink-900'}`}>
                                    {s.gender}
                                  </td>
                                  {dateCols.map((d) => {
                                    const sun = isSunday(d);
                                    const inactive = d > daysCount;
                                    return (
                                      <td
                                        key={d}
                                        className={`border border-slate-900 text-center align-middle p-0 ${
                                          inactive ? 'bg-slate-200' : sun ? 'bg-rose-50' : ''
                                        }`}
                                      >
                                        {sun ? <span className="text-[6.5px] text-rose-400 font-bold">M</span> : <span>&nbsp;</span>}
                                      </td>
                                    );
                                  })}
                                  <td className="border border-slate-900 bg-amber-50 text-center">&nbsp;</td>
                                  <td className="border border-slate-900 bg-blue-50 text-center">&nbsp;</td>
                                  <td className="border border-slate-900 bg-rose-50 text-center">&nbsp;</td>
                                  <td className="border border-slate-900 bg-slate-100 text-center">&nbsp;</td>
                                </tr>
                              );
                            }
                            return (
                              <tr key={`empty-p1-${idx}`} className="h-[21px]">
                                <td className="border border-slate-900 text-center align-middle font-bold text-slate-400 text-[8px] px-0.5 py-0">{idx + 1}</td>
                                <td className="border border-slate-900 text-center align-middle py-0">&nbsp;</td>
                                <td className="border border-slate-900 text-center align-middle py-0">&nbsp;</td>
                                <td className="border border-slate-900 py-0">&nbsp;</td>
                                <td className="border border-slate-900 py-0">&nbsp;</td>
                                {dateCols.map((d) => {
                                  const sun = isSunday(d);
                                  const inactive = d > daysCount;
                                  return (
                                    <td
                                      key={d}
                                      className={`border border-slate-900 text-center align-middle p-0 ${
                                        inactive ? 'bg-slate-200' : sun ? 'bg-rose-50' : ''
                                      }`}
                                    >
                                      {sun ? <span className="text-[6.5px] text-rose-400 font-bold">M</span> : <span>&nbsp;</span>}
                                    </td>
                                  );
                                })}
                                <td className="border border-slate-900 bg-amber-50">&nbsp;</td>
                                <td className="border border-slate-900 bg-blue-50">&nbsp;</td>
                                <td className="border border-slate-900 bg-rose-50">&nbsp;</td>
                                <td className="border border-slate-900 bg-slate-50">&nbsp;</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer Lembar 1 */}
                  <div className="flex justify-between items-center text-[8px] text-slate-500 font-medium pt-1.5 border-t border-slate-300 mt-1.5">
                    <div>Daftar Hadir Peserta Didik (Lembar 1: Baris 1 - 20) | {school.name || 'SMP Negeri 18 Jakarta'}</div>
                    <div className="font-semibold text-slate-700">Halaman 1 dari 2 (Kelas {rombel})</div>
                  </div>
                </div>

                {/* ==================== LEMBAR 2 (BARIS 21 - 36 + STATISTIK & TANDA TANGAN) ==================== */}
                <div
                  className={`f4-landscape-page w-[1060px] min-w-[1060px] bg-white text-slate-900 border border-slate-300 shadow-xl rounded-xl p-3 sm:p-4 flex flex-col justify-between font-sans ${
                    !isLastClass ? 'page-break-after mb-8' : ''
                  }`}
                  style={{ minHeight: '680px', boxSizing: 'border-box' }}
                >
                  <div>
                    {/* Header Lembar 2 Lanjutan */}
                    <div className="border-b-2 border-slate-900 pb-1 mb-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded border border-slate-300 flex items-center justify-center p-0.5 overflow-hidden">
                          <SchoolLogo url={logos.sekolahLogoUrl || logos.sidebarLogoUrl} className="w-full h-full object-contain" fallbackClassName="w-full h-full" />
                        </div>
                        <div>
                          <h2 className="text-[11px] font-black tracking-wider text-slate-900 uppercase leading-none">
                            DAFTAR HADIR PESERTA DIDIK (LEMBAR 2 / LANJUTAN)
                          </h2>
                          <p className="text-[9px] font-bold text-slate-700 leading-tight mt-0.5">
                            {school.name || 'SMP NEGERI 18 JAKARTA'} &bull; KELAS : <span className="text-blue-900 font-black">KELAS {rombel}</span> &bull; BULAN : <span className="uppercase">{filterBulan}</span> &bull; T.A {tahunAjaran}
                          </p>
                        </div>
                      </div>
                      <div className="text-[8.5px] font-bold px-2 py-0.5 bg-slate-100 rounded text-slate-700 border border-slate-200">
                        Baris 21 - 36 & Pengesahan
                      </div>
                    </div>

                    {/* Table Lembar 2 (Rows 21 - 36: 16 Rows) */}
                    <div className="mt-1">
                      <table
                        className="w-full border-collapse border border-slate-900 text-[8.5px] leading-tight"
                        style={{ tableLayout: 'fixed' }}
                      >
                        <colgroup>
                          <col style={{ width: '3%' }} />
                          <col style={{ width: '5%' }} />
                          <col style={{ width: '6.5%' }} />
                          <col style={{ width: '24%' }} />
                          <col style={{ width: '2.5%' }} />
                          {dateCols.map((d) => (
                            <col key={`col-d2-${d}`} style={{ width: '1.55%' }} />
                          ))}
                          <col style={{ width: '2.7%' }} />
                          <col style={{ width: '2.7%' }} />
                          <col style={{ width: '2.7%' }} />
                          <col style={{ width: '2.85%' }} />
                        </colgroup>
                        <thead>
                          <tr className="bg-slate-100 font-bold text-slate-900 uppercase text-center h-[22px]">
                            <th className="border border-slate-900 px-0.5 py-1 text-center align-middle font-bold text-[8px] bg-slate-100">NO.</th>
                            <th className="border border-slate-900 px-0.5 py-1 text-center align-middle font-bold text-[8px] bg-slate-100">NIS</th>
                            <th className="border border-slate-900 px-0.5 py-1 text-center align-middle font-bold text-[8px] bg-slate-100">NISN</th>
                            <th className="border border-slate-900 px-1.5 py-1 text-left align-middle font-bold text-[8.5px] bg-slate-100">NAMA PESERTA DIDIK</th>
                            <th className="border border-slate-900 px-0.5 py-1 text-center align-middle font-bold text-[8px] bg-slate-100">JK</th>
                            <th colSpan={31} className="border border-slate-900 px-0.5 py-1 text-center align-middle font-bold text-[8.5px] bg-slate-100">
                              TANGGAL BULAN {filterBulan.toUpperCase()}
                            </th>
                            <th colSpan={4} className="border border-slate-900 px-0.5 py-1 text-center bg-slate-200 align-middle font-bold text-[8px]">
                              REKAP
                            </th>
                          </tr>
                          <tr className="bg-slate-50 font-bold text-slate-900 text-center text-[7.5px] h-[18px]">
                            <th className="border border-slate-900 px-0.5 py-0.5 text-center align-middle text-[7px] text-slate-600 font-semibold bg-slate-100">(1)</th>
                            <th className="border border-slate-900 px-0.5 py-0.5 text-center align-middle text-[7px] text-slate-600 font-semibold bg-slate-100">(2)</th>
                            <th className="border border-slate-900 px-0.5 py-0.5 text-center align-middle text-[7px] text-slate-600 font-semibold bg-slate-100">(3)</th>
                            <th className="border border-slate-900 px-1.5 py-0.5 text-left align-middle text-[7px] text-slate-600 font-semibold bg-slate-100">(4)</th>
                            <th className="border border-slate-900 px-0.5 py-0.5 text-center align-middle text-[7px] text-slate-600 font-semibold bg-slate-100">(5)</th>
                            {dateCols.map((d) => {
                              const sun = isSunday(d);
                              const inactive = d > daysCount;
                              return (
                                <th
                                  key={d}
                                  className={`border border-slate-900 px-0 py-0.5 text-center align-middle ${
                                    inactive
                                      ? 'bg-slate-200 text-slate-400 font-medium'
                                      : sun
                                        ? 'bg-rose-100 text-rose-700 font-extrabold'
                                        : 'text-slate-800'
                                  }`}
                                >
                                  {d}
                                </th>
                              );
                            })}
                            <th className="border border-slate-900 bg-amber-100 text-amber-950 font-bold text-center align-middle">S</th>
                            <th className="border border-slate-900 bg-blue-100 text-blue-950 font-bold text-center align-middle">I</th>
                            <th className="border border-slate-900 bg-rose-100 text-rose-950 font-bold text-center align-middle">A</th>
                            <th className="border border-slate-900 bg-slate-200 text-slate-950 font-extrabold text-center align-middle">Jml</th>
                          </tr>
                        </thead>
                        <tbody className="font-medium text-slate-900">
                          {Array.from({ length: 16 }).map((_, idx) => {
                            const rowNum = idx + 21;
                            const s = p2Students[idx];
                            if (s) {
                              return (
                                <tr key={s.id || rowNum} className="h-[21px] hover:bg-slate-50">
                                  <td className="border border-slate-900 text-center align-middle font-bold text-[8px] px-0.5 py-0">{rowNum}</td>
                                  <td className="border border-slate-900 text-center align-middle font-mono text-[7.5px] px-0.5 py-0 tracking-tight">{s.nis || '-'}</td>
                                  <td className="border border-slate-900 text-center align-middle font-mono text-[7.5px] px-0.5 py-0 tracking-tight">{s.nisn || '-'}</td>
                                  <td className="border border-slate-900 text-left align-middle px-1.5 py-0">
                                    <div className="uppercase font-bold text-[8.5px] leading-tight break-words text-slate-900">
                                      {s.nama}
                                    </div>
                                  </td>
                                  <td className={`border border-slate-900 text-center align-middle font-bold text-[8px] py-0 ${s.gender === 'L' ? 'text-blue-900' : 'text-pink-900'}`}>
                                    {s.gender}
                                  </td>
                                  {dateCols.map((d) => {
                                    const sun = isSunday(d);
                                    const inactive = d > daysCount;
                                    return (
                                      <td
                                        key={d}
                                        className={`border border-slate-900 text-center align-middle p-0 ${
                                          inactive ? 'bg-slate-200' : sun ? 'bg-rose-50' : ''
                                        }`}
                                      >
                                        {sun ? <span className="text-[6.5px] text-rose-400 font-bold">M</span> : <span>&nbsp;</span>}
                                      </td>
                                    );
                                  })}
                                  <td className="border border-slate-900 bg-amber-50 text-center">&nbsp;</td>
                                  <td className="border border-slate-900 bg-blue-50 text-center">&nbsp;</td>
                                  <td className="border border-slate-900 bg-rose-50 text-center">&nbsp;</td>
                                  <td className="border border-slate-900 bg-slate-100 text-center">&nbsp;</td>
                                </tr>
                              );
                            }
                            return (
                              <tr key={`empty-p2-${idx}`} className="h-[21px]">
                                <td className="border border-slate-900 text-center align-middle font-bold text-slate-400 text-[8px] px-0.5 py-0">{rowNum}</td>
                                <td className="border border-slate-900 text-center align-middle py-0">&nbsp;</td>
                                <td className="border border-slate-900 text-center align-middle py-0">&nbsp;</td>
                                <td className="border border-slate-900 py-0">&nbsp;</td>
                                <td className="border border-slate-900 py-0">&nbsp;</td>
                                {dateCols.map((d) => {
                                  const sun = isSunday(d);
                                  const inactive = d > daysCount;
                                  return (
                                    <td
                                      key={d}
                                      className={`border border-slate-900 text-center align-middle p-0 ${
                                        inactive ? 'bg-slate-200' : sun ? 'bg-rose-50' : ''
                                      }`}
                                    >
                                      {sun ? <span className="text-[6.5px] text-rose-400 font-bold">M</span> : <span>&nbsp;</span>}
                                    </td>
                                  );
                                })}
                                <td className="border border-slate-900 bg-amber-50">&nbsp;</td>
                                <td className="border border-slate-900 bg-blue-50">&nbsp;</td>
                                <td className="border border-slate-900 bg-rose-50">&nbsp;</td>
                                <td className="border border-slate-900 bg-slate-50">&nbsp;</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Attendance Formulas & Dual Signatures Block */}
                    <div className="mt-2 text-[8.5px] text-slate-900 space-y-1.5">
                      {/* Row 1: Catatan Persentase Ketidakhadiran */}
                      <div className="flex items-center justify-between border border-slate-300 rounded px-3 py-1 bg-slate-50 font-semibold text-[8.5px]">
                        <div>Catatan Sakit (S) : ................. %</div>
                        <div>Ijin (I) : ................. %</div>
                        <div>Alpa (A) : ................. %</div>
                        <div className="text-slate-600 font-medium">Hari Efektif Belajar : 24 Hari</div>
                      </div>

                      {/* Row 2: Formula & Dual Signatures */}
                      <div className="grid grid-cols-12 gap-3 items-stretch">
                        {/* Left: Rumus Kehadiran & Rekap L/P */}
                        <div className="col-span-6 flex flex-col justify-between space-y-1.5">
                          <div className="flex items-center gap-2 border border-slate-200 rounded p-1.5 bg-white">
                            <span className="font-bold text-[9px] text-blue-900">% Kehadiran</span>
                            <span className="font-bold">=</span>
                            <div className="inline-flex flex-col items-center text-center">
                              <span className="border-b border-black font-semibold text-[8px] px-1 pb-0.5">
                                Jumlah Hadir Siswa &times; 100
                              </span>
                              <span className="font-semibold text-[8px] pt-0.5">
                                Jumlah Siswa &times; Hari Efektif
                              </span>
                            </div>
                            <span className="font-bold text-[9px]">= .......... %</span>
                          </div>

                          <div className="flex items-center gap-3 text-[9px] px-2.5 py-1 bg-slate-50 rounded border border-slate-200 font-semibold">
                            <span>Rekap Siswa:</span>
                            <span className="text-blue-900">L = <strong className="font-bold">{countL}</strong></span>
                            <span className="text-pink-900">P = <strong className="font-bold">{countP}</strong></span>
                            <span className="font-extrabold text-slate-900">Total = {countTotal} Siswa</span>
                          </div>
                        </div>

                        {/* Right: Dual Signatures (Kepala Sekolah & Wali Kelas) */}
                        <div className="col-span-6 grid grid-cols-2 gap-2 text-center">
                          {/* Kepala Sekolah */}
                          <div className="flex flex-col justify-between min-h-[82px] border border-slate-200 rounded p-1.5 bg-white">
                            <p className="font-bold text-[8.5px] leading-tight">
                              Mengetahui,<br />Kepala {school.name || 'Sekolah'}
                            </p>
                            <div className="relative">
                              {officials.kepsekTtdUrl && (
                                <img
                                  src={officials.kepsekTtdUrl}
                                  alt="TTD Kepsek"
                                  className="h-6 mx-auto object-contain absolute inset-x-0 -top-5"
                                />
                              )}
                              <p className="font-bold underline uppercase text-[8.5px] truncate">
                                {officials.kepsekName || '...........................................'}
                              </p>
                              <p className="text-[7.5px] font-mono text-slate-700">
                                NIP. {officials.kepsekNip || '...........................................'}
                              </p>
                            </div>
                          </div>

                          {/* Wali Kelas */}
                          <div className="flex flex-col justify-between min-h-[82px] border border-slate-200 rounded p-1.5 bg-white">
                            <p className="font-bold text-[8.5px] leading-tight">
                              {dateSignatureText}<br />Wali Kelas {rombel}
                            </p>
                            <div>
                              <p className="font-bold underline uppercase text-[8.5px] truncate">
                                {namaWali}
                              </p>
                              <p className="text-[7.5px] font-mono text-slate-700">
                                NIP. {nipWali}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Lembar 2 */}
                  <div className="flex justify-between items-center text-[8px] text-slate-500 font-medium pt-1.5 border-t border-slate-300 mt-1.5">
                    <div>Daftar Hadir Peserta Didik (Lembar 2: Baris 21 - 36) | {school.name || 'SMP Negeri 18 Jakarta'}</div>
                    <div className="font-semibold text-slate-700">Halaman 2 dari 2 (Kelas {rombel})</div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
