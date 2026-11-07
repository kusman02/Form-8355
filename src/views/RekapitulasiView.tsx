import React, { useState } from 'react';
import { Student, WaliKelas, SchoolProfile, Officials, LogoConfig } from '../types';
import { KopSurat } from '../components/KopSurat';
import { Users, UserCheck, UserMinus, GraduationCap, Printer, Sparkles } from 'lucide-react';
import { downloadElementAsPDF } from '../utils/pdfExport';

interface RekapitulasiViewProps {
  students: Student[];
  waliList: WaliKelas[];
  school: SchoolProfile;
  officials: Officials;
  logos: LogoConfig;
  tahunAjaran?: string;
  showToast: (msg: string) => void;
}

export const RekapitulasiView: React.FC<RekapitulasiViewProps> = ({
  students,
  waliList,
  school,
  officials,
  logos,
  tahunAjaran = '2026/2027',
  showToast
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const total = students.length;
  const male = students.filter(s => s.gender === 'L').length;
  const female = students.filter(s => s.gender === 'P').length;
  const malePct = total > 0 ? ((male / total) * 100).toFixed(1) : '0';
  const femalePct = total > 0 ? ((female / total) * 100).toFixed(1) : '0';

  // Get unique rombels
  const rombels = Array.from(new Set(students.map(s => s.rombel))).sort();

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    showToast("Sedang memproses unduhan PDF Rekapitulasi L/P (F4 Portrait)...");
    const success = await downloadElementAsPDF({
      elementId: 'printable-rekap-area',
      filename: 'Rekapitulasi_Siswa_LP_F4_SMPN18.pdf',
      orientation: 'portrait'
    });
    setIsExporting(false);
    if (success) {
      showToast("Dokumen PDF Rekapitulasi (F4 Portrait) berhasil diunduh!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-xl overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Rekapitulasi Data Pokok Rombel SMPN 18 Jakarta
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Rekapitulasi Jumlah Siswa Laki-Laki dan Perempuan Per Kelas
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Tabel rekapitulasi komparasi gender putra dan putri untuk setiap rombongan belajar (T.A {tahunAjaran}). Format cetak dan unduh dokumen resmi ukuran F4 Portrait (1 Halaman).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition active:scale-95 cursor-pointer disabled:opacity-60"
            >
              <Printer className="w-4 h-4" />
              <span>{isExporting ? 'Memproses PDF...' : 'Unduh PDF (F4 Portrait)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Peserta Didik</p>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{total}</h3>
            <p className="text-[11px] text-blue-600 font-medium mt-1">Semua Rombel Terdata</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Siswa Laki-Laki (L)</p>
            <h3 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">{male}</h3>
            <p className="text-[11px] text-blue-500 font-medium mt-1">{malePct}% dari total siswa</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Siswa Perempuan (P)</p>
            <h3 className="text-3xl font-extrabold text-pink-600 dark:text-pink-400 mt-1">{female}</h3>
            <p className="text-[11px] text-pink-500 font-medium mt-1">{femalePct}% dari total siswa</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 dark:text-pink-400 flex items-center justify-center">
            <UserMinus className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Rombongan Belajar</p>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{rombels.length} Rombel</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Kelas VII, VIII, & IX</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Official Printable Paper Container (F4 Portrait) */}
      <div className="flex justify-center my-6 overflow-x-auto">
        <div id="printable-rekap-area" className="paper-f4 pt-3 px-6 pb-4 sm:pt-4 sm:px-8 sm:pb-6 rounded-xl border border-slate-300 shadow-xl font-sans text-slate-900 bg-white max-w-[850px] w-full">
          <KopSurat
            school={school}
            logos={logos}
            compact={true}
            documentTitle="REKAPITULASI JUMLAH PESERTA DIDIK MENURUT JENIS KELAMIN PER ROMBEL"
            documentSubtitle={`TAHUN PELAJARAN ${tahunAjaran}`}
          />

          <div className="flex justify-between items-center text-xs font-bold my-2 px-1 text-slate-800 border-b border-slate-300 pb-1.5">
            <div>Satuan Pendidikan: <span className="font-extrabold uppercase">{school.name}</span></div>
            <div>Total Rombel: <span className="font-extrabold">{rombels.length} KELAS</span></div>
            <div>Total Siswa: <span className="font-extrabold">{total} SISWA</span></div>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full border-collapse border border-slate-900 text-center text-xs table-fixed">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold uppercase border-b border-slate-900 text-[11px] h-[30px]">
                  <th className="border border-slate-900 px-1 py-1.5 w-10 text-center align-middle font-bold">NO</th>
                  <th className="border border-slate-900 px-2 py-1.5 w-28 text-center align-middle font-bold">ROMBEL / KELAS</th>
                  <th className="border border-slate-900 px-3 py-1.5 text-left align-middle font-bold">WALI KELAS</th>
                  <th className="border border-slate-900 px-2 py-1.5 w-24 text-center align-middle text-blue-900 font-bold">LAKI-LAKI (L)</th>
                  <th className="border border-slate-900 px-2 py-1.5 w-24 text-center align-middle text-pink-900 font-bold">PEREMPUAN (P)</th>
                  <th className="border border-slate-900 px-2 py-1.5 w-24 text-center align-middle font-black">JUMLAH (L+P)</th>
                  <th className="border border-slate-900 px-2 py-1.5 w-32 text-center align-middle font-bold">PROPORSI (% L : % P)</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-800 text-[11px]">
                {rombels.map((r, idx) => {
                  const rombelStudents = students.filter(s => s.rombel === r);
                  const countL = rombelStudents.filter(s => s.gender === 'L').length;
                  const countP = rombelStudents.filter(s => s.gender === 'P').length;
                  const subtotal = countL + countP;

                  const wali = waliList.find(w => w.rombel.replace(/^KELAS\s+/i, '') === r.replace(/^KELAS\s+/i, ''));
                  const waliName = wali ? wali.nama : 'BELUM DITETAPKAN';

                  const pL = subtotal > 0 ? ((countL / subtotal) * 100).toFixed(0) : 0;
                  const pP = subtotal > 0 ? ((countP / subtotal) * 100).toFixed(0) : 0;

                  return (
                    <tr key={r} className="hover:bg-slate-50 h-[26px]">
                      <td className="border border-slate-900 px-1 py-1 text-center align-middle font-bold">{idx + 1}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center align-middle font-bold">KELAS {r}</td>
                      <td className="border border-slate-900 px-3 py-1 text-left align-middle uppercase truncate max-w-[200px]">{waliName}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center align-middle text-blue-900 font-bold">{countL}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center align-middle text-pink-900 font-bold">{countP}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center align-middle font-black">{subtotal}</td>
                      <td className="border border-slate-900 px-2 py-1 text-center align-middle">{pL}% L : {pP}% P</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-900 text-center h-[30px] text-[11px]">
                  <td colSpan={3} className="border border-slate-900 px-3 py-1.5 text-right align-middle font-black">TOTAL KESELURUHAN:</td>
                  <td className="border border-slate-900 px-2 py-1.5 text-blue-900 align-middle text-xs font-black">{male}</td>
                  <td className="border border-slate-900 px-2 py-1.5 text-pink-900 align-middle text-xs font-black">{female}</td>
                  <td className="border border-slate-900 px-2 py-1.5 text-slate-900 align-middle text-xs font-black">{total}</td>
                  <td className="border border-slate-900 px-2 py-1.5 text-slate-900 align-middle text-[10px] font-bold">{malePct}% L : {femalePct}% P</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal Signature Area */}
          <div className="mt-8 flex justify-end items-start text-xs font-semibold px-4">
            <div className="text-center space-y-0.5 min-w-[210px] text-xs">
              <p className="text-slate-800">{school.tempat || 'Jakarta'}, {school.tanggal || '30 Oktober 2026'}</p>
              <p className="font-bold text-slate-900">Kepala {school.name || 'SMP Negeri 18 Jakarta'}</p>
              <div className="h-14 flex items-center justify-center my-1">
                {officials.kepsekTtdUrl && (
                  <img src={officials.kepsekTtdUrl} alt="TTD Kepsek" className="max-h-14 object-contain" />
                )}
              </div>
              <p className="font-bold underline uppercase text-slate-900">
                {officials.kepsekName || '...........................................'}
              </p>
              <p className="text-slate-600 font-normal text-[11px]">
                NIP. {officials.kepsekNip || '...........................................'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
