import React, { useState, useMemo } from 'react';
import { Student, SchoolProfile, Officials, LogoConfig } from '../types';
import { KopSurat } from '../components/KopSurat';
import { calculateAge } from '../utils/helpers';
import { Search, Filter, Printer } from 'lucide-react';
import { downloadElementAsPDF } from '../utils/pdfExport';
import { formatSignatureDate } from '../utils/electronBridge';

interface KategoriUsiaViewProps {
  students: Student[];
  school: SchoolProfile;
  officials: Officials;
  logos: LogoConfig;
  tahunAjaran?: string;
  showToast: (msg: string) => void;
}

export const KategoriUsiaView: React.FC<KategoriUsiaViewProps> = ({
  students,
  school,
  officials,
  logos,
  tahunAjaran = '2026/2027',
  showToast
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [filterRombel, setFilterRombel] = useState('');
  const [filterKat, setFilterKat] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const rombelList = useMemo(() => {
    return Array.from(new Set(students.map(s => s.rombel))).sort();
  }, [students]);

  // Compute student age data
  const studentsWithAge = useMemo(() => {
    return students.map(s => {
      const ageInfo = calculateAge(s.birthDate);
      return {
        ...s,
        ageStr: ageInfo.str,
        category: ageInfo.category,
        years: ageInfo.years
      };
    });
  }, [students]);

  // Filtered student list for detail table
  const filteredStudents = useMemo(() => {
    return studentsWithAge.filter(s => {
      const matchRombel = !filterRombel || s.rombel.replace(/^KELAS\s+/i, '') === filterRombel.replace(/^KELAS\s+/i, '');
      const matchKat = !filterKat || s.category === filterKat;
      const matchSearch = !searchTerm || 
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (s.nis && s.nis.includes(searchTerm)) ||
        (s.nisn && s.nisn.includes(searchTerm));
      return matchRombel && matchKat && matchSearch;
    });
  }, [studentsWithAge, filterRombel, filterKat, searchTerm]);

  // Compute age matrix per rombel
  const matrixData = useMemo(() => {
    let sumU12 = 0;
    let sumU12T = 0;
    let sumU13T = 0;
    let sumU14T = 0;
    let sumU15 = 0;

    const rows = rombelList.map((r, idx) => {
      const rStudents = studentsWithAge.filter(s => s.rombel === r);
      const u12 = rStudents.filter(s => s.category === '< 12 THN').length;
      const u12T = rStudents.filter(s => s.category === '12 THN').length;
      const u13T = rStudents.filter(s => s.category === '13 THN').length;
      const u14T = rStudents.filter(s => s.category === '14 THN').length;
      const u15 = rStudents.filter(s => s.category === '>= 15 THN').length;
      const totalRombel = rStudents.length;

      sumU12 += u12;
      sumU12T += u12T;
      sumU13T += u13T;
      sumU14T += u14T;
      sumU15 += u15;

      return {
        no: idx + 1,
        rombel: r,
        u12,
        u12T,
        u13T,
        u14T,
        u15,
        totalRombel
      };
    });

    return {
      rows,
      totals: {
        sumU12,
        sumU12T,
        sumU13T,
        sumU14T,
        sumU15,
        grandTotal: sumU12 + sumU12T + sumU13T + sumU14T + sumU15
      }
    };
  }, [rombelList, studentsWithAge]);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    showToast("Sedang memproses unduhan PDF (F4 Portrait)...");
    const success = await downloadElementAsPDF({
      elementId: 'printable-usia-area',
      filename: 'Rekapitulasi_Kategori_Usia_SMPN18.pdf',
      orientation: 'portrait'
    });
    setIsExporting(false);
    if (success) {
      showToast("Dokumen PDF Kategori Usia berhasil diunduh!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter and Actions Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto flex-1">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="w-4 h-4" />
          </div>
          <select
            value={filterRombel}
            onChange={(e) => setFilterRombel(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Rombel</option>
            {rombelList.map(r => (
              <option key={r} value={r}>KELAS {r}</option>
            ))}
          </select>

          <select
            value={filterKat}
            onChange={(e) => setFilterKat(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Kategori Usia</option>
            <option value="< 12 THN">&lt; 12 THN</option>
            <option value="12 THN">12 THN</option>
            <option value="13 THN">13 THN</option>
            <option value="14 THN">14 THN</option>
            <option value=">= 15 THN">&ge; 15 THN</option>
          </select>

          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari Nama Siswa / NIS / NISN..."
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
          <span className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900/40">
            {filteredStudents.length} Siswa Terpilih
          </span>
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPDF}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <Printer className="w-4 h-4" />
            <span>{isExporting ? 'Memproses PDF...' : 'Unduh PDF (F4)'}</span>
          </button>
        </div>
      </div>

      {/* Official Paper Document */}
      <div className="flex justify-center my-4 overflow-x-auto">
        <div id="printable-usia-area" className="paper-f4 p-6 sm:p-8 rounded-xl border border-slate-300 shadow-xl font-sans text-slate-900 bg-white">
          <KopSurat
            school={school}
            logos={logos}
            documentTitle="REKAPITULASI DATA PESERTA DIDIK BERDASARKAN KATEGORI USIA DAN ROMBEL"
            documentSubtitle={`TAHUN PELAJARAN ${tahunAjaran}`}
          />

          <div className="flex justify-between items-center text-[11px] font-bold mb-3 px-1 border-b pb-2 text-slate-800">
            <div>Rombel: <span className="font-extrabold uppercase">{filterRombel ? `KELAS ${filterRombel}` : 'SEMUA ROMBEL'}</span></div>
            <div>Kategori Usia: <span className="font-extrabold uppercase">{filterKat || 'SEMUA KATEGORI'}</span></div>
            <div>Jumlah Siswa Terdata: <span className="font-extrabold">{filteredStudents.length} SISWA</span></div>
          </div>

          {/* I. MATRIKS DISTRIBUSI USIA PER ROMBONGAN BELAJAR */}
          <div className="mb-6 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>I. MATRIKS DISTRIBUSI USIA PER ROMBONGAN BELAJAR</span>
            </h4>
            <table className="w-full border-collapse border border-slate-900 text-center text-[11px]">
              <thead>
                <tr className="bg-slate-200 font-bold text-slate-900 border-b border-slate-900 uppercase">
                  <th className="border border-slate-900 px-2 py-2 w-10">NO</th>
                  <th className="border border-slate-900 px-3 py-2 text-left">KELAS / ROMBEL</th>
                  <th className="border border-slate-900 px-2 py-2 w-16">&lt; 12 THN</th>
                  <th className="border border-slate-900 px-2 py-2 w-16">12 THN</th>
                  <th className="border border-slate-900 px-2 py-2 w-16">13 THN</th>
                  <th className="border border-slate-900 px-2 py-2 w-16">14 THN</th>
                  <th className="border border-slate-900 px-2 py-2 w-16">&ge; 15 THN</th>
                  <th className="border border-slate-900 px-2 py-2 w-24">TOTAL SISWA</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-900">
                {matrixData.rows.map(row => (
                  <tr key={row.rombel} className="hover:bg-slate-50">
                    <td className="border border-slate-900 px-2 py-1.5 font-bold">{row.no}</td>
                    <td className="border border-slate-900 px-3 py-1.5 text-left font-bold">KELAS {row.rombel}</td>
                    <td className="border border-slate-900 px-2 py-1.5">{row.u12}</td>
                    <td className="border border-slate-900 px-2 py-1.5">{row.u12T}</td>
                    <td className="border border-slate-900 px-2 py-1.5">{row.u13T}</td>
                    <td className="border border-slate-900 px-2 py-1.5">{row.u14T}</td>
                    <td className="border border-slate-900 px-2 py-1.5">{row.u15}</td>
                    <td className="border border-slate-900 px-2 py-1.5 font-black bg-slate-50">{row.totalRombel}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-900">
                  <td colSpan={2} className="border border-slate-900 px-3 py-2 text-right uppercase font-black">
                    TOTAL KESELURUHAN :
                  </td>
                  <td className="border border-slate-900 px-2 py-2 font-bold">{matrixData.totals.sumU12}</td>
                  <td className="border border-slate-900 px-2 py-2 font-bold">{matrixData.totals.sumU12T}</td>
                  <td className="border border-slate-900 px-2 py-2 font-bold">{matrixData.totals.sumU13T}</td>
                  <td className="border border-slate-900 px-2 py-2 font-bold">{matrixData.totals.sumU14T}</td>
                  <td className="border border-slate-900 px-2 py-2 font-bold">{matrixData.totals.sumU15}</td>
                  <td className="border border-slate-900 px-2 py-2 font-black text-xs bg-slate-200">
                    {matrixData.totals.grandTotal}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* II. RINCIAN DATA NAMA DAN USIA PESERTA DIDIK */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>II. RINCIAN DATA NAMA DAN USIA PESERTA DIDIK</span>
            </h4>
            <table className="w-full border-collapse border border-slate-900 text-[10px]">
              <thead>
                <tr className="bg-slate-200 font-bold text-slate-900 border-b border-slate-900 uppercase text-center">
                  <th className="border border-slate-900 px-2 py-2 w-8">NO</th>
                  <th className="border border-slate-900 px-3 py-2 text-left">NAMA LENGKAP SISWA</th>
                  <th className="border border-slate-900 px-2 py-2 w-16">KELAS</th>
                  <th className="border border-slate-900 px-2 py-2 w-16">NIS</th>
                  <th className="border border-slate-900 px-2 py-2 w-10">JK</th>
                  <th className="border border-slate-900 px-3 py-2 text-left">TEMPAT, TGL LAHIR</th>
                  <th className="border border-slate-900 px-2 py-2 w-24">USIA LENGKAP</th>
                  <th className="border border-slate-900 px-2 py-2 w-24">KATEGORI USIA</th>
                </tr>
              </thead>
              <tbody className="font-medium text-slate-900">
                {filteredStudents.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="border border-slate-900 px-2 py-1 text-center font-bold">{idx + 1}</td>
                    <td className="border border-slate-900 px-3 py-1 font-bold uppercase">{s.nama}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center font-semibold text-blue-900">{s.rombel}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center font-mono">{s.nis || '-'}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center font-bold">{s.gender}</td>
                    <td className="border border-slate-900 px-3 py-1 uppercase">{s.tempatLahir}, {s.birthDate}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center font-semibold">{s.ageStr}</td>
                    <td className="border border-slate-900 px-2 py-1 text-center font-bold text-blue-900">{s.category}</td>
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={8} className="border border-slate-900 text-center py-4 text-slate-500">
                      Tidak ada data siswa yang cocok dengan filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Signature Area */}
          <div className="mt-8 flex justify-end items-start text-xs font-semibold pr-8">
            <div className="text-center space-y-1">
              <p>{formatSignatureDate(school.tempat, school.tanggal)}</p>
              <p className="font-bold">Kepala {school.name || 'Sekolah'}</p>
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
