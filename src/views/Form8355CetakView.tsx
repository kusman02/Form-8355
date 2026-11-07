import React, { useState } from 'react';
import { Student, SchoolProfile, Officials, LogoConfig } from '../types';
import { KopSurat } from '../components/KopSurat';
import { Filter, Printer } from 'lucide-react';
import { downloadElementAsPDF } from '../utils/pdfExport';

interface Form8355CetakViewProps {
  students: Student[];
  school: SchoolProfile;
  officials: Officials;
  logos: LogoConfig;
  rombelList: string[];
  tahunAjaran?: string;
  showToast: (msg: string) => void;
}

export const Form8355CetakView: React.FC<Form8355CetakViewProps> = ({
  students,
  school,
  officials,
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

  const p1Students = filtered.slice(0, 18);
  const p2Students = filtered.slice(18, 36);

  const rombelTitle = filterRombel ? `KELAS ${filterRombel}` : 'SEMUA KELAS';

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    showToast("Sedang memproses unduhan PDF Form 8355 (2 Halaman Landscape F4)...");
    const cleanRombel = filterRombel ? filterRombel.replace(/\s+/g, '_') : 'Semua_Kelas';
    const success = await downloadElementAsPDF({
      elementId: 'printable-form8355-area',
      filename: `Form_8355_${cleanRombel}_SMPN18.pdf`,
      orientation: 'landscape'
    });
    setIsExporting(false);
    if (success) {
      showToast("Dokumen PDF Form 8355 berhasil diunduh!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Filter & Print Controls */}
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
          <span className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-900/50">
            {filtered.length} Siswa Terpilih (Format 2 Halaman F4)
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            disabled={isExporting}
            onClick={handleDownloadPDF}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
          >
            <Printer className="w-4 h-4" />
            <span>{isExporting ? 'Memproses PDF...' : 'Unduh PDF (2 Halaman)'}</span>
          </button>
        </div>
      </div>

      {/* DOCUMENT PREVIEW CONTAINER (2 PAGES LANDSCAPE F4) */}
      <div className="flex flex-col items-center gap-6 my-4 overflow-x-auto">
        <div id="printable-form8355-area" className="w-full max-w-[1100px] space-y-8">
          
          {/* ==================== PAGE 1 (LEMBAR 1) ==================== */}
          <div className="f4-landscape-page border border-slate-300 shadow-xl relative bg-white text-slate-900 p-6 flex flex-col justify-between page-break-after">
            <div>
              <KopSurat
                school={school}
                logos={logos}
                documentTitle="FORM 8355 PESERTA DIDIK"
                documentSubtitle="BUKU INDUK PESERTA DIDIK KEMENTERIAN PENDIDIKAN"
                compact={true}
              />

              {/* Header Metadata */}
              <div className="flex justify-between items-center text-[10px] font-bold mb-1.5 px-1 text-slate-800">
                <div>KELAS : <span className="text-blue-900 font-black">{rombelTitle}</span></div>
                <div>TAHUN PELAJARAN: <span>{tahunAjaran}</span></div>
              </div>

              {/* Table Page 1 (Rows 1-18) */}
              <table className="w-full border-collapse border border-slate-900 text-[10px] table-f8355-f4">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-900 uppercase text-center">
                    <th className="border border-slate-900 px-1 py-1 w-[3%] text-center">NO</th>
                    <th className="border border-slate-900 px-2 py-1 text-center w-[22%]">NAMA PESERTA DIDIK</th>
                    <th className="border border-slate-900 px-1 py-1 text-center w-[5%]">KELAS</th>
                    <th className="border border-slate-900 px-1 py-1 text-center w-[9%]">
                      <div>NIS</div>
                      <div className="border-t border-slate-400 text-[8px] font-normal">NISN</div>
                    </th>
                    <th className="border border-slate-900 px-1 py-1 text-center w-[3%]">JK</th>
                    <th className="border border-slate-900 px-1.5 py-1 text-center w-[15%]">TEMPAT, TGL LAHIR</th>
                    <th className="border border-slate-900 px-1 py-1 text-center w-[5%]">AGAMA</th>
                    <th className="border border-slate-900 px-1.5 py-1 text-center w-[15%]">NAMA ORANG TUA</th>
                    <th className="border border-slate-900 px-2 py-1 text-center w-[24%]">ALAMAT TINGGAL</th>
                  </tr>
                </thead>
                <tbody className="font-semibold text-slate-900">
                  {Array.from({ length: 18 }).map((_, idx) => {
                    const s = p1Students[idx];
                    if (s) {
                      return (
                        <tr key={s.id || idx}>
                          <td className="border border-slate-900 text-center font-bold">{idx + 1}</td>
                          <td className="border border-slate-900 font-bold uppercase px-2 py-1">{s.nama}</td>
                          <td className="border border-slate-900 text-center font-bold text-blue-900">{s.rombel}</td>
                          <td className="border border-slate-900 text-center font-mono">
                            <div>{s.nis || '-'}</div>
                            <div className="border-t border-slate-300 text-[8px] text-slate-600">{s.nisn || '-'}</div>
                          </td>
                          <td className="border border-slate-900 text-center font-bold">{s.gender}</td>
                          <td className="border border-slate-900 uppercase px-1 py-1 text-center">
                            {s.ttl || `${s.tempatLahir}, ${s.birthDate}`}
                          </td>
                          <td className="border border-slate-900 text-center font-semibold">{s.agama}</td>
                          <td className="border border-slate-900 uppercase px-1 py-1">{s.ortu || '-'}</td>
                          <td className="border border-slate-900 uppercase px-2 py-1 truncate">{s.alamat || '-'}</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={`empty-${idx}`}>
                        <td className="border border-slate-900 text-center font-bold text-slate-400">{idx + 1}</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Page 1 */}
            <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium pt-3 border-t border-slate-200 mt-3">
              <div>Form 8355 Peserta Didik - {school.name}</div>
              <div>Halaman 1 dari 2</div>
            </div>
          </div>

          {/* ==================== PAGE 2 (LEMBAR 2) ==================== */}
          <div className="f4-landscape-page border border-slate-300 shadow-xl relative bg-white text-slate-900 p-6 flex flex-col justify-between">
            <div className="space-y-2">
              {/* Mini Header Page 2 */}
              <div className="flex justify-between items-center pb-2 border-b-2 border-slate-900 mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-800 border border-amber-400 flex items-center justify-center text-amber-300 font-bold text-xs">
                    18
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-blue-900 uppercase leading-none">{school.name}</h3>
                    <p className="text-[9px] font-semibold text-slate-600 uppercase leading-tight">
                      FORM 8355 PESERTA DIDIK — LEMBAR LANJUTAN
                    </p>
                  </div>
                </div>
                <div className="text-right text-[9px] font-bold">
                  <div>KELAS: <span className="text-blue-900 font-black">{rombelTitle}</span></div>
                  <div className="text-slate-600 font-normal">T.A 2026/2027</div>
                </div>
              </div>

              {/* Table Page 2 (Rows 19-36) */}
              <table className="w-full border-collapse border border-slate-900 text-[10px] table-f8355-f4">
                <thead>
                  <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-900 uppercase text-center">
                    <th className="border border-slate-900 px-1 py-1 w-[3%] text-center">NO</th>
                    <th className="border border-slate-900 px-2 py-1 text-center w-[22%]">NAMA PESERTA DIDIK</th>
                    <th className="border border-slate-900 px-1 py-1 text-center w-[5%]">KELAS</th>
                    <th className="border border-slate-900 px-1 py-1 text-center w-[9%]">
                      <div>NIS</div>
                      <div className="border-t border-slate-400 text-[8px] font-normal">NISN</div>
                    </th>
                    <th className="border border-slate-900 px-1 py-1 text-center w-[3%]">JK</th>
                    <th className="border border-slate-900 px-1.5 py-1 text-center w-[15%]">TEMPAT, TGL LAHIR</th>
                    <th className="border border-slate-900 px-1 py-1 text-center w-[5%]">AGAMA</th>
                    <th className="border border-slate-900 px-1.5 py-1 text-center w-[15%]">NAMA ORANG TUA</th>
                    <th className="border border-slate-900 px-2 py-1 text-center w-[24%]">ALAMAT TINGGAL</th>
                  </tr>
                </thead>
                <tbody className="font-semibold text-slate-900">
                  {Array.from({ length: 18 }).map((_, idx) => {
                    const rowNumber = idx + 19;
                    const s = p2Students[idx];
                    if (s) {
                      return (
                        <tr key={s.id || rowNumber}>
                          <td className="border border-slate-900 text-center font-bold">{rowNumber}</td>
                          <td className="border border-slate-900 font-bold uppercase px-2 py-1">{s.nama}</td>
                          <td className="border border-slate-900 text-center font-bold text-blue-900">{s.rombel}</td>
                          <td className="border border-slate-900 text-center font-mono">
                            <div>{s.nis || '-'}</div>
                            <div className="border-t border-slate-300 text-[8px] text-slate-600">{s.nisn || '-'}</div>
                          </td>
                          <td className="border border-slate-900 text-center font-bold">{s.gender}</td>
                          <td className="border border-slate-900 uppercase px-1 py-1 text-center">
                            {s.ttl || `${s.tempatLahir}, ${s.birthDate}`}
                          </td>
                          <td className="border border-slate-900 text-center font-semibold">{s.agama}</td>
                          <td className="border border-slate-900 uppercase px-1 py-1">{s.ortu || '-'}</td>
                          <td className="border border-slate-900 uppercase px-2 py-1 truncate">{s.alamat || '-'}</td>
                        </tr>
                      );
                    }
                    return (
                      <tr key={`empty-p2-${idx}`}>
                        <td className="border border-slate-900 text-center font-bold text-slate-400">{rowNumber}</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                        <td className="border border-slate-900">&nbsp;</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Official Legal Signatures */}
            <div className="mt-4">
              <div className="flex justify-between items-start text-[10px] font-semibold px-12 pt-2">
                <div className="text-center space-y-1">
                  <p>Mengetahui,</p>
                  <p className="font-bold">Pengawas Sekolah Pembina</p>
                  <div className="h-12 flex items-center justify-center">
                    {officials.pengawasTtdUrl && (
                      <img src={officials.pengawasTtdUrl} alt="TTD Pengawas" className="max-h-12 object-contain" />
                    )}
                  </div>
                  <p className="font-bold underline uppercase">
                    {officials.pengawasName || '...........................................'}
                  </p>
                  <p className="text-slate-600 font-normal">
                    NIP. {officials.pengawasNip || '...........................................'}
                  </p>
                </div>

                <div className="text-center space-y-1">
                  <p>{school.tempat || 'Jakarta'}, {school.tanggal || '30 Oktober 2026'}</p>
                  <p className="font-bold">Kepala {school.name ? school.name : 'Sekolah'}</p>
                  <div className="h-12 flex items-center justify-center">
                    {officials.kepsekTtdUrl && (
                      <img src={officials.kepsekTtdUrl} alt="TTD Kepsek" className="max-h-12 object-contain" />
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

              {/* Footer Page 2 */}
              <div className="flex justify-between items-center text-[9px] text-slate-500 font-medium pt-3 border-t border-slate-200 mt-2">
                <div>Form 8355 Peserta Didik - {school.name}</div>
                <div>Halaman 2 dari 2</div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
