import React, { useState } from 'react';
import { Student, SchoolProfile, WaliKelas, Officials } from '../types';
import { Filter, Calendar, Printer } from 'lucide-react';
import { downloadElementAsPDF } from '../utils/pdfExport';

interface DaftarAbsenViewProps {
  students: Student[];
  school: SchoolProfile;
  waliList: WaliKelas[];
  officials: Officials;
  rombelList: string[];
  tahunAjaran?: string;
  showToast: (msg: string) => void;
}

export const DaftarAbsenView: React.FC<DaftarAbsenViewProps> = ({
  students,
  school,
  waliList,
  officials,
  rombelList,
  tahunAjaran = '2026/2027',
  showToast
}) => {
  const [filterRombel, setFilterRombel] = useState('');
  const [filterBulan, setFilterBulan] = useState('Oktober');
  const [isExporting, setIsExporting] = useState(false);

  const filtered = students.filter(s => {
    return !filterRombel || s.rombel.replace(/^KELAS\s+/i, '') === filterRombel.replace(/^KELAS\s+/i, '');
  });

  const countL = filtered.filter(s => s.gender === 'L').length;
  const countP = filtered.filter(s => s.gender === 'P').length;
  const countTotal = countL + countP;

  const wali = waliList.find(w => w.rombel.replace(/^KELAS\s+/i, '') === filterRombel.replace(/^KELAS\s+/i, ''));
  const rombelTitle = filterRombel ? `KELAS ${filterRombel}` : 'SEMUA KELAS';

  const p1Students = filtered.slice(0, 26);
  const p2Students = filtered.slice(26, 36);

  const dateCols = Array.from({ length: 31 });

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    showToast("Sedang memproses unduhan PDF Daftar Absensi (2 Halaman Landscape F4)...");
    const cleanRombel = filterRombel ? filterRombel.replace(/\s+/g, '_') : 'Semua_Kelas';
    const success = await downloadElementAsPDF({
      elementId: 'printable-daftarabsen-area',
      filename: `Daftar_Absen_${cleanRombel}_${filterBulan}_SMPN18.pdf`,
      orientation: 'landscape'
    });
    setIsExporting(false);
    if (success) {
      showToast("Dokumen PDF Daftar Absensi berhasil diunduh!");
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
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kelas</option>
            {rombelList.map(r => (
              <option key={r} value={r.replace(/^KELAS\s+/i, '')}>
                {r.startsWith('KELAS') ? r : `KELAS ${r}`}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={filterBulan}
              onChange={(e) => setFilterBulan(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[
                'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
              ].map(b => (
                <option key={b} value={b}>Bulan {b}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <Printer className="w-4 h-4" />
            <span>{isExporting ? 'Memproses PDF...' : 'Unduh PDF Absensi'}</span>
          </button>
        </div>
      </div>

      {/* 2-PAGE LANDSCAPE F4 CONTAINER */}
      <div id="printable-daftarabsen-area" className="flex flex-col items-center gap-6 my-4 overflow-x-auto">
        
        {/* ==================== LEMBAR 1 (BARIS 1 - 26) ==================== */}
        <div className="f4-landscape-page border border-slate-300 shadow-xl relative bg-white text-slate-900 flex flex-col justify-between p-4 page-break-after">
          <div>
            {/* Header Judul Lembar 1 */}
            <div className="text-center mb-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase">
                  DAFTAR ABSENSI PESERTA DIDIK
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  T.A {tahunAjaran}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                KELAS : <span className="text-blue-900 uppercase">{rombelTitle}</span> | BULAN: <span className="uppercase">{filterBulan}</span>
              </p>
            </div>

            {/* Table Lembar 1 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-900 text-[9px] table-f8355-f4">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900 uppercase text-center">
                    <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-[3%] text-center align-middle">NO.</th>
                    <th rowSpan={2} className="border border-slate-900 px-1.5 py-1 text-left w-[22%] align-middle">NAMA PESERTA DIDIK</th>
                    <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-[5%] text-center align-middle">NIS</th>
                    <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-[3%] text-center align-middle">JK</th>
                    <th colSpan={31} className="border border-slate-900 px-0.5 py-0.5 text-center align-middle">TANGGAL PER BULAN</th>
                    <th colSpan={4} className="border border-slate-900 px-1 py-0.5 text-center bg-slate-200 align-middle">REKAP</th>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900 text-center text-[7.5px]">
                    {dateCols.map((_, i) => (
                      <th key={i} className="border border-slate-900 w-[1.8%]">{i + 1}</th>
                    ))}
                    <th className="border border-slate-900 w-[2%] bg-amber-50">S</th>
                    <th className="border border-slate-900 w-[2%] bg-blue-50">I</th>
                    <th className="border border-slate-900 w-[2%] bg-rose-50">A</th>
                    <th className="border border-slate-900 w-[2.5%] bg-slate-200">Jml</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-slate-900">
                  {Array.from({ length: 26 }).map((_, idx) => {
                    const s = p1Students[idx];
                    if (s) {
                      return (
                        <tr key={s.id || idx} className="hover:bg-slate-50">
                          <td className="border border-slate-900 text-center font-bold py-0.5">{idx + 1}</td>
                          <td className="border border-slate-900 font-bold uppercase px-1.5 py-0.5 truncate">{s.nama}</td>
                          <td className="border border-slate-900 text-center font-mono py-0.5">{s.nis || '-'}</td>
                          <td className={`border border-slate-900 text-center font-bold py-0.5 ${s.gender === 'L' ? 'text-blue-900' : 'text-pink-900'}`}>
                            {s.gender}
                          </td>
                          {dateCols.map((_, di) => (
                            <td key={di} className="border border-slate-900">&nbsp;</td>
                          ))}
                          <td className="border border-slate-900 bg-amber-50/50">&nbsp;</td>
                          <td className="border border-slate-900 bg-blue-50/50">&nbsp;</td>
                          <td className="border border-slate-900 bg-rose-50/50">&nbsp;</td>
                          <td className="border border-slate-900 bg-slate-100">&nbsp;</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={`empty-p1-${idx}`}>
                        <td className="border border-slate-900 text-center font-bold text-slate-400 py-0.5">{idx + 1}</td>
                        <td className="border border-slate-900 py-0.5">&nbsp;</td>
                        <td className="border border-slate-900 py-0.5">&nbsp;</td>
                        <td className="border border-slate-900 py-0.5">&nbsp;</td>
                        {dateCols.map((_, di) => (
                          <td key={di} className="border border-slate-900">&nbsp;</td>
                        ))}
                        <td className="border border-slate-900 bg-amber-50/30">&nbsp;</td>
                        <td className="border border-slate-900 bg-blue-50/30">&nbsp;</td>
                        <td className="border border-slate-900 bg-rose-50/30">&nbsp;</td>
                        <td className="border border-slate-900 bg-slate-100">&nbsp;</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-between items-center text-[8.5px] text-slate-500 font-medium pt-1 border-t border-slate-200 mt-1">
            <div>Daftar Absensi Peserta Didik - {school.name}</div>
            <div>Halaman 1 dari 2</div>
          </div>
        </div>

        {/* ==================== LEMBAR 2 (BARIS 27 - 36 + FORMULA & SIGNATURE) ==================== */}
        <div className="f4-landscape-page border border-slate-300 shadow-xl relative bg-white text-slate-900 flex flex-col justify-between p-4">
          <div>
            {/* Header Lembar 2 */}
            <div className="text-center mb-2">
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-sm font-black tracking-wider text-slate-900 uppercase">
                  DAFTAR ABSENSI PESERTA DIDIK
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  T.A {tahunAjaran}
                </span>
              </div>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                KELAS : <span className="text-blue-900 uppercase">{rombelTitle}</span> | BULAN: <span className="uppercase">{filterBulan}</span>
              </p>
            </div>

            {/* Table Lembar 2 (Rows 27 - 36) */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-slate-900 text-[9px] table-f8355-f4">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900 uppercase text-center">
                    <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-[3%] text-center align-middle">NO.</th>
                    <th rowSpan={2} className="border border-slate-900 px-1.5 py-1 text-left w-[22%] align-middle">NAMA PESERTA DIDIK</th>
                    <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-[5%] text-center align-middle">NIS</th>
                    <th rowSpan={2} className="border border-slate-900 px-1 py-1 w-[3%] text-center align-middle">JK</th>
                    <th colSpan={31} className="border border-slate-900 px-0.5 py-0.5 text-center align-middle">TANGGAL PER BULAN</th>
                    <th colSpan={4} className="border border-slate-900 px-1 py-0.5 text-center bg-slate-200 align-middle">REKAP</th>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900 text-center text-[7.5px]">
                    {dateCols.map((_, i) => (
                      <th key={i} className="border border-slate-900 w-[1.8%]">{i + 1}</th>
                    ))}
                    <th className="border border-slate-900 w-[2%] bg-amber-50">S</th>
                    <th className="border border-slate-900 w-[2%] bg-blue-50">I</th>
                    <th className="border border-slate-900 w-[2%] bg-rose-50">A</th>
                    <th className="border border-slate-900 w-[2.5%] bg-slate-200">Jml</th>
                  </tr>
                </thead>
                <tbody className="font-medium text-slate-900">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const rowNumber = idx + 27;
                    const s = p2Students[idx];
                    if (s) {
                      return (
                        <tr key={s.id || rowNumber} className="hover:bg-slate-50">
                          <td className="border border-slate-900 text-center font-bold py-0.5">{rowNumber}</td>
                          <td className="border border-slate-900 font-bold uppercase px-1.5 py-0.5 truncate">{s.nama}</td>
                          <td className="border border-slate-900 text-center font-mono py-0.5">{s.nis || '-'}</td>
                          <td className={`border border-slate-900 text-center font-bold py-0.5 ${s.gender === 'L' ? 'text-blue-900' : 'text-pink-900'}`}>
                            {s.gender}
                          </td>
                          {dateCols.map((_, di) => (
                            <td key={di} className="border border-slate-900">&nbsp;</td>
                          ))}
                          <td className="border border-slate-900 bg-amber-50/50">&nbsp;</td>
                          <td className="border border-slate-900 bg-blue-50/50">&nbsp;</td>
                          <td className="border border-slate-900 bg-rose-50/50">&nbsp;</td>
                          <td className="border border-slate-900 bg-slate-100">&nbsp;</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={`empty-p2-${idx}`}>
                        <td className="border border-slate-900 text-center font-bold text-slate-400 py-0.5">{rowNumber}</td>
                        <td className="border border-slate-900 py-0.5">&nbsp;</td>
                        <td className="border border-slate-900 py-0.5">&nbsp;</td>
                        <td className="border border-slate-900 py-0.5">&nbsp;</td>
                        {dateCols.map((_, di) => (
                          <td key={di} className="border border-slate-900">&nbsp;</td>
                        ))}
                        <td className="border border-slate-900 bg-amber-50/30">&nbsp;</td>
                        <td className="border border-slate-900 bg-blue-50/30">&nbsp;</td>
                        <td className="border border-slate-900 bg-rose-50/30">&nbsp;</td>
                        <td className="border border-slate-900 bg-slate-100">&nbsp;</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Attendance Formulas & Dual Signatures */}
            <div className="mt-3 text-[10px] text-slate-900 space-y-3 font-sans">
              <div className="grid grid-cols-12 gap-2 border-b border-slate-200 pb-2">
                <div className="col-span-4 font-medium">Catatan Sakit ......................... %</div>
                <div className="col-span-4 font-medium">Ijin ......................... %</div>
                <div className="col-span-4 font-medium">Alpa ......................... %</div>
              </div>

              <div className="grid grid-cols-12 gap-2 items-start pt-1">
                {/* Left Column: Formulas & Student Counts */}
                <div className="col-span-7 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">% Absen</span>
                    <div className="inline-flex flex-col items-center text-center px-2">
                      <span className="border-b-2 border-black font-semibold text-[10px] px-2 pb-0.5">
                        Jumlah Absen x 100
                      </span>
                      <span className="font-semibold text-[10px] pt-0.5">
                        Jumlah Siswa x Jumlah hari efektif
                      </span>
                    </div>
                    <span className="font-bold text-xs">= ......................... %</span>
                  </div>

                  <div className="space-y-0.5 font-mono text-[10px] pt-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold w-4">L</span>
                      <span>:</span>
                      <span className="font-bold">{countL}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold w-4">P</span>
                      <span>:</span>
                      <span className="font-bold">{countP}</span>
                    </div>
                    <div className="flex items-center gap-2 border-t border-slate-400 w-24 pt-0.5">
                      <span className="font-bold w-4">T</span>
                      <span>:</span>
                      <span className="font-extrabold text-blue-900">{countTotal} Siswa</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Dual Signatures (Kepala Sekolah & Wali Kelas) */}
                <div className="col-span-5 grid grid-cols-2 gap-4 text-center">
                  <div className="flex flex-col justify-between h-24">
                    <p className="font-bold text-[10px]">Kepala {school.name ? school.name : 'Sekolah'}</p>
                    <div className="space-y-0.5">
                      <p className="font-bold underline uppercase text-[10px]">
                        {officials.kepsekName || '...........................................'}
                      </p>
                      <p className="text-[9px] font-mono text-slate-700">
                        NIP. {officials.kepsekNip || '...........................................'}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between h-24">
                    <p className="font-bold text-[10px]">
                      Wali Kelas {filterRombel ? filterRombel : ''}
                    </p>
                    <div className="space-y-0.5">
                      <p className="font-bold underline uppercase text-[10px]">
                        {wali ? wali.nama : '...........................................'}
                      </p>
                      <p className="text-[9px] font-mono text-slate-700">
                        NIP. {wali ? (wali.nip || '-') : '...........................................'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[8.5px] text-slate-500 font-medium pt-1 border-t border-slate-200 mt-1">
            <div>Daftar Absensi Peserta Didik - {school.name || 'Satuan Pendidikan'}</div>
            <div>Halaman 2 dari 2</div>
          </div>
        </div>

      </div>
    </div>
  );
};
