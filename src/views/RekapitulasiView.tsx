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
    showToast("Sedang memproses unduhan PDF (F4 Portrait)...");
    const success = await downloadElementAsPDF({
      elementId: 'printable-rekap-area',
      filename: 'Rekapitulasi_Siswa_LP_SMPN18.pdf',
      orientation: 'portrait'
    });
    setIsExporting(false);
    if (success) {
      showToast("Dokumen PDF Rekapitulasi berhasil diunduh!");
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
              Tabel rekapitulasi komparasi gender putra dan putri untuk setiap rombongan belajar (T.A 2026/2027). Tersedia format cetak dan unduh dokumen resmi ukuran F4 Portrait.
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
              <span>{isExporting ? 'Memproses PDF...' : 'Unduh PDF (F4)'}</span>
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

      {/* Official Printable Paper Container */}
      <div className="flex justify-center my-6">
        <div id="printable-rekap-area" className="paper-f4 p-6 sm:p-8 rounded-xl border border-slate-300 shadow-xl font-sans text-slate-900 bg-white">
          <KopSurat
            school={school}
            logos={logos}
            documentTitle="REKAPITULASI JUMLAH PESERTA DIDIK MENURUT JENIS KELAMIN PER ROMBEL"
            documentSubtitle={`TAHUN PELAJARAN ${tahunAjaran}`}
          />

          <div className="flex justify-between items-center text-xs font-bold mb-3 px-1 text-slate-800">
            <div>Satuan Pendidikan: <span className="font-extrabold uppercase">{school.name}</span></div>
            <div>Total Rombel: <span className="font-extrabold">{rombels.length} KELAS</span></div>
            <div>Total Siswa: <span className="font-extrabold">{total} SISWA</span></div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-slate-900 text-center text-xs">
              <thead>
                <tr className="bg-slate-200 text-slate-900 font-bold uppercase border-b border-slate-900">
                  <th className="border border-slate-900 px-2 py-2.5 w-12">NO</th>
                  <th className="border border-slate-900 px-3 py-2.5 w-36">ROMBEL / KELAS</th>
                  <th className="border border-slate-900 px-4 py-2.5 text-left">WALI KELAS</th>
                  <th className="border border-slate-900 px-3 py-2.5 w-28 text-blue-900">LAKI-LAKI (L)</th>
                  <th className="border border-slate-900 px-3 py-2.5 w-28 text-pink-900">PEREMPUAN (P)</th>
                  <th className="border border-slate-900 px-3 py-2.5 w-28">JUMLAH (L+P)</th>
                  <th className="border border-slate-900 px-4 py-2.5 w-40">PROPORSI (% L : % P)</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-800">
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
                    <tr key={r} className="hover:bg-slate-50">
                      <td className="border border-slate-900 px-2 py-2 text-center font-bold">{idx + 1}</td>
                      <td className="border border-slate-900 px-3 py-2 text-center font-bold">KELAS {r}</td>
                      <td className="border border-slate-900 px-4 py-2 text-left uppercase">{waliName}</td>
                      <td className="border border-slate-900 px-3 py-2 text-center text-blue-900 font-bold">{countL}</td>
                      <td className="border border-slate-900 px-3 py-2 text-center text-pink-900 font-bold">{countP}</td>
                      <td className="border border-slate-900 px-3 py-2 text-center font-black">{subtotal}</td>
                      <td className="border border-slate-900 px-4 py-2 text-center">{pL}% L : {pP}% P</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-900 text-center">
                  <td colSpan={3} className="border border-slate-900 px-3 py-2.5 text-right font-black">TOTAL KESELURUHAN:</td>
                  <td className="border border-slate-900 px-3 py-2.5 text-blue-900 text-sm font-black">{male}</td>
                  <td className="border border-slate-900 px-3 py-2.5 text-pink-900 text-sm font-black">{female}</td>
                  <td className="border border-slate-900 px-3 py-2.5 text-sm font-black">{total}</td>
                  <td className="border border-slate-900 px-3 py-2.5 text-xs font-bold">{malePct}% L : {femalePct}% P</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal Signature Area */}
          <div className="mt-10 flex justify-end items-start text-xs font-semibold px-6">
            <div className="text-center space-y-1">
              <p>Jakarta, 30 Oktober 2026</p>
              <p className="font-bold">Kepala {school.name ? school.name : 'Sekolah'}</p>
              <div className="h-16 flex items-center justify-center">
                {officials.kepsekTtdUrl && (
                  <img src={officials.kepsekTtdUrl} alt="TTD Kepsek" className="max-h-16 object-contain" />
                )}
              </div>
              <p className="font-bold underline uppercase">
                {officials.kepsekName || '...........................................'}
              </p>
              <p className="text-slate-600 font-normal">
                NIP. {officials.kepsekNip || '...........................................'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
