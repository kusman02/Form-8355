import React, { useState } from 'react';
import { Mutasi, Student, SchoolProfile, Officials, LogoConfig } from '../types';
import { KopSurat } from '../components/KopSurat';
import { ArrowLeftRight, ArrowDownLeft, ArrowUpRight, Users, Plus, List, TableProperties, Search, Calendar, Edit2, Trash2, Printer } from 'lucide-react';
import { downloadElementAsPDF } from '../utils/pdfExport';

interface DaftarMutasiViewProps {
  mutasiList: Mutasi[];
  students: Student[];
  school: SchoolProfile;
  officials: Officials;
  logos: LogoConfig;
  rombelList: string[];
  tahunAjaran?: string;
  onOpenAddModal: () => void;
  onOpenEditModal: (mutasi: Mutasi) => void;
  onDeleteMutasi: (id: string | number) => void;
  showToast: (msg: string) => void;
}

export const DaftarMutasiView: React.FC<DaftarMutasiViewProps> = ({
  mutasiList,
  students,
  school,
  officials,
  logos,
  rombelList,
  tahunAjaran = '2026/2027',
  onOpenAddModal,
  onOpenEditModal,
  onDeleteMutasi,
  showToast
}) => {
  const [subTab, setSubTab] = useState<'daftar' | 'rekap'>('daftar');
  const [isExportingDaftar, setIsExportingDaftar] = useState(false);
  const [isExportingRekap, setIsExportingRekap] = useState(false);
  const [filterBulan, setFilterBulan] = useState('');
  const [filterJenis, setFilterJenis] = useState('');
  const [filterRombel, setFilterRombel] = useState('');
  const [search, setSearch] = useState('');

  const masukCount = mutasiList.filter(m => m.jenis === 'MASUK').length;
  const keluarCount = mutasiList.filter(m => m.jenis === 'KELUAR').length;
  const saldoSelisih = masukCount - keluarCount;

  // Filter for Tab 1
  const filteredMutasi = mutasiList.filter(m => {
    const matchBulan = !filterBulan || (m.tanggal && m.tanggal.split('-')[1] === filterBulan);
    const matchJenis = !filterJenis || m.jenis === filterJenis;
    const matchRombel = !filterRombel || m.rombel === filterRombel;
    const matchSearch = !search ||
      m.nama.toLowerCase().includes(search.toLowerCase()) ||
      m.sekolah.toLowerCase().includes(search.toLowerCase()) ||
      (m.nis && m.nis.includes(search)) ||
      (m.nisn && m.nisn.includes(search)) ||
      (m.alasan && m.alasan.toLowerCase().includes(search)) ||
      (m.noSurat && m.noSurat.toLowerCase().includes(search));
    return matchBulan && matchJenis && matchRombel && matchSearch;
  });

  // Rekap Matrix per Rombel for Tab 2
  const rekapRows = rombelList.map((r, idx) => {
    const cleanRombel = r.replace(/^KELAS\s+/i, '');
    const studentsRombel = students.filter(s => s.rombel.replace(/^KELAS\s+/i, '') === cleanRombel);
    const akhirL = studentsRombel.filter(s => s.gender === 'L').length;
    const akhirP = studentsRombel.filter(s => s.gender === 'P').length;

    const mutMasuk = mutasiList.filter(m => m.rombel.replace(/^KELAS\s+/i, '') === cleanRombel && m.jenis === 'MASUK');
    const mMasukL = mutMasuk.filter(m => m.gender === 'L').length;
    const mMasukP = mutMasuk.filter(m => m.gender === 'P').length;

    const mutKeluar = mutasiList.filter(m => m.rombel.replace(/^KELAS\s+/i, '') === cleanRombel && m.jenis === 'KELUAR');
    const mKeluarL = mutKeluar.filter(m => m.gender === 'L').length;
    const mKeluarP = mutKeluar.filter(m => m.gender === 'P').length;

    const awalL = akhirL - mMasukL + mKeluarL;
    const awalP = akhirP - mMasukP + mKeluarP;

    return {
      no: idx + 1,
      rombel: `KELAS ${cleanRombel}`,
      awalL,
      awalP,
      awalJml: awalL + awalP,
      mMasukL,
      mMasukP,
      mMasukJml: mMasukL + mMasukP,
      mKeluarL,
      mKeluarP,
      mKeluarJml: mKeluarL + mKeluarP,
      akhirL,
      akhirP,
      akhirJml: akhirL + akhirP
    };
  });

  const totalAwalL = rekapRows.reduce((acc, r) => acc + r.awalL, 0);
  const totalAwalP = rekapRows.reduce((acc, r) => acc + r.awalP, 0);
  const totalMasukL = rekapRows.reduce((acc, r) => acc + r.mMasukL, 0);
  const totalMasukP = rekapRows.reduce((acc, r) => acc + r.mMasukP, 0);
  const totalKeluarL = rekapRows.reduce((acc, r) => acc + r.mKeluarL, 0);
  const totalKeluarP = rekapRows.reduce((acc, r) => acc + r.mKeluarP, 0);
  const totalAkhirL = rekapRows.reduce((acc, r) => acc + r.akhirL, 0);
  const totalAkhirP = rekapRows.reduce((acc, r) => acc + r.akhirP, 0);

  const monthsMap: Record<string, string> = {
    "01": "JANUARI", "02": "FEBRUARI", "03": "MARET", "04": "APRIL",
    "05": "MEI", "06": "JUNI", "07": "JULI", "08": "AGUSTUS",
    "09": "SEPTEMBER", "10": "OKTOBER", "11": "NOVEMBER", "12": "DESEMBER"
  };

  const handleDownloadDaftarPDF = async () => {
    setIsExportingDaftar(true);
    showToast("Sedang memproses unduhan PDF Daftar Mutasi (F4 Portrait)...");
    const success = await downloadElementAsPDF({
      elementId: 'printable-daftarmutasi-area',
      filename: 'Daftar_Mutasi_Peserta_Didik_SMPN18.pdf',
      orientation: 'portrait'
    });
    setIsExportingDaftar(false);
    if (success) {
      showToast("Dokumen PDF Daftar Mutasi berhasil diunduh!");
    }
  };

  const handleDownloadRekapPDF = async () => {
    setIsExportingRekap(true);
    showToast("Sedang memproses unduhan PDF Rekapitulasi Mutasi (F4 Landscape)...");
    const success = await downloadElementAsPDF({
      elementId: 'printable-rekapmutasi-area',
      filename: 'Rekapitulasi_Perhitungan_Mutasi_SMPN18.pdf',
      orientation: 'landscape'
    });
    setIsExportingRekap(false);
    if (success) {
      showToast("Dokumen PDF Rekapitulasi Mutasi berhasil diunduh!");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white shadow-xl overflow-hidden border border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-400/30">
              <ArrowLeftRight className="w-3.5 h-3.5" /> Sistem Administrasi Mutasi Peserta Didik
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Daftar Mutasi Per Bulan & Rekapitulasi Masuk / Keluar
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Pencatatan resmi mutasi siswa masuk dan keluar per bulan beserta rekapitulasi perhitungan saldo peserta didik.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenAddModal}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> Catat Mutasi Baru
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Mutasi Masuk (+)</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">+{masukCount} Siswa</h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">Siswa baru masuk/pindahan</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Mutasi Keluar (-)</p>
            <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">-{keluarCount} Siswa</h3>
            <p className="text-[11px] text-rose-500 font-medium mt-1">Siswa pindah sekolah</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Saldo Selisih Mutasi</p>
            <h3 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
              {saldoSelisih >= 0 ? `+${saldoSelisih}` : saldoSelisih} Siswa
            </h3>
            <p className="text-[11px] text-blue-500 font-medium mt-1">Pertumbuhan bersih rombel</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Siswa Aktif</p>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{students.length} Siswa</h3>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Buku Induk Form 8355</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Sub Tab Buttons */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('daftar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            subTab === 'daftar'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <List className="w-4 h-4" /> Daftar Mutasi Per Bulan
        </button>
        <button
          onClick={() => setSubTab('rekap')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
            subTab === 'rekap'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
          }`}
        >
          <TableProperties className="w-4 h-4" /> Rekapitulasi Perhitungan
        </button>
      </div>

      {/* SUB-TAB 1: DAFTAR MUTASI */}
      {subTab === 'daftar' && (
        <div className="space-y-5">
          {/* Filter Controls Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto flex-1">
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <select
                value={filterBulan}
                onChange={(e) => setFilterBulan(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Semua Bulan</option>
                <option value="01">Januari</option>
                <option value="02">Februari</option>
                <option value="03">Maret</option>
                <option value="04">April</option>
                <option value="05">Mei</option>
                <option value="06">Juni</option>
                <option value="07">Juli</option>
                <option value="08">Agustus</option>
                <option value="09">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>

              <select
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Semua Jenis Mutasi</option>
                <option value="MASUK">MASUK (+)</option>
                <option value="KELUAR">KELUAR (-)</option>
              </select>

              <select
                value={filterRombel}
                onChange={(e) => setFilterRombel(e.target.value)}
                className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Semua Kelas</option>
                {rombelList.map(r => (
                  <option key={r} value={r.replace(/^KELAS\s+/i, '')}>
                    {r.startsWith('KELAS') ? r : `KELAS ${r}`}
                  </option>
                ))}
              </select>

              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari Siswa / Sekolah / No. Surat..."
                  className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                disabled={isExportingDaftar}
                onClick={handleDownloadDaftarPDF}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Printer className="w-4 h-4" />
                <span>{isExportingDaftar ? 'Memproses PDF...' : 'Unduh PDF'}</span>
              </button>
            </div>
          </div>

          {/* Official F4 Portrait Paper Preview */}
          <div className="flex justify-center my-4 overflow-x-auto">
            <div id="printable-daftarmutasi-area" className="paper-f4 p-6 sm:p-8 rounded-xl border border-slate-300 shadow-xl font-sans text-slate-900 bg-white">
              <KopSurat
                school={school}
                logos={logos}
                documentTitle="DAFTAR MUTASI PESERTA DIDIK"
                documentSubtitle="BUKU CATATAN MUTASI MASUK DAN KELUAR RESMI SEKOLAH"
              />

              <div className="flex justify-between items-center text-[11px] font-bold mb-2 px-1">
                <div>BULAN : <span className="text-blue-900 uppercase">{filterBulan ? monthsMap[filterBulan] : 'SEMUA BULAN'}</span></div>
                <div>TAHUN PELAJARAN: <span>{tahunAjaran}</span></div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-900 text-xs">
                  <thead>
                    <tr className="bg-slate-100 font-bold text-slate-900 border-b border-slate-900 uppercase text-center">
                      <th className="border border-slate-900 px-2 py-2 w-8">NO</th>
                      <th className="border border-slate-900 px-2 py-2 w-24">TANGGAL</th>
                      <th className="border border-slate-900 px-3 py-2 text-left">NAMA PESERTA DIDIK</th>
                      <th className="border border-slate-900 px-2 py-2 w-16">KELAS</th>
                      <th className="border border-slate-900 px-2 py-2 w-24">NIS / NISN</th>
                      <th className="border border-slate-900 px-2 py-2 w-10">JK</th>
                      <th className="border border-slate-900 px-2 py-2 w-24">JENIS MUTASI</th>
                      <th className="border border-slate-900 px-3 py-2 text-left">SEKOLAH ASAL / TUJUAN</th>
                      <th className="border border-slate-900 px-3 py-2 text-left">ALASAN & NO. SURAT</th>
                      <th data-html2canvas-ignore="true" className="border border-slate-900 px-2 py-2 w-16 no-print no-pdf">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium text-slate-900">
                    {filteredMutasi.map((m, idx) => {
                      const isMasuk = m.jenis === 'MASUK';
                      const badgeClass = isMasuk
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300';

                      return (
                        <tr key={m.id} className="hover:bg-slate-50 transition">
                          <td className="border border-slate-900 text-center font-bold px-2 py-2">{idx + 1}</td>
                          <td className="border border-slate-900 text-center font-mono text-[11px] px-2 py-2">{m.tanggal}</td>
                          <td className="border border-slate-900 font-bold uppercase px-3 py-2">{m.nama}</td>
                          <td className="border border-slate-900 text-center font-bold text-blue-900 px-2 py-2">{m.rombel}</td>
                          <td className="border border-slate-900 text-center font-mono text-[10px] px-2 py-2">
                            <div>{m.nis || '-'}</div>
                            <div className="text-[9px] text-slate-500">{m.nisn || '-'}</div>
                          </td>
                          <td className="border border-slate-900 text-center font-bold px-2 py-2">{m.gender}</td>
                          <td className="border border-slate-900 text-center px-2 py-2">
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border ${badgeClass}`}>
                              {isMasuk ? 'MASUK (+)' : 'KELUAR (-)'}
                            </span>
                          </td>
                          <td className="border border-slate-900 font-semibold px-3 py-2">{m.sekolah}</td>
                          <td className="border border-slate-900 px-3 py-2 text-[11px]">
                            <div className="font-semibold text-slate-900">{m.alasan || '-'}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{m.noSurat || ''}</div>
                          </td>
                          <td data-html2canvas-ignore="true" className="border border-slate-900 text-center px-2 py-2 no-print no-pdf">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onOpenEditModal(m)}
                                className="p-1 text-amber-600 hover:bg-amber-50 rounded transition"
                                title="Edit Mutasi"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteMutasi(m.id)}
                                className="p-1 text-rose-600 hover:bg-rose-50 rounded transition"
                                title="Hapus Mutasi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMutasi.length === 0 && (
                      <tr>
                        <td colSpan={10} className="text-center py-6 text-slate-400 font-medium border border-slate-900 mutasi-empty-cell">
                          Tidak ada riwayat mutasi siswa ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Signature Area */}
              <div className="mt-8 flex justify-end items-start text-xs font-semibold px-6">
                <div className="text-center space-y-1">
                  <p>{school.tempat || 'Jakarta'}, {school.tanggal || '30 Oktober 2026'}</p>
                  <p className="font-bold">Kepala {school.name ? school.name : 'Sekolah'}</p>
                  <div className="h-16 flex items-center justify-center">
                    {officials.kepsekTtdUrl && (
                      <img src={officials.kepsekTtdUrl} alt="TTD Kepsek" className="max-h-16 object-contain" />
                    )}
                  </div>
                  <p className="font-bold underline uppercase">
                    {officials.kepsekName || '...........................................'}
                  </p>
                  <p className="text-slate-700 font-normal">
                    NIP. {officials.kepsekNip || '...........................................'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: REKAPITULASI PERHITUNGAN */}
      {subTab === 'rekap' && (
        <div className="space-y-5">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                <TableProperties className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Rekapitulasi Perhitungan Mutasi Siswa</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Perhitungan saldo mutasi bulanan dan per kelas dalam format resmi F4 Landscape
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={isExportingRekap}
                onClick={handleDownloadRekapPDF}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Printer className="w-4 h-4" />
                <span>{isExportingRekap ? 'Memproses PDF...' : 'Unduh PDF Landscape (F4)'}</span>
              </button>
            </div>
          </div>

          {/* OFFICIAL REKAP F4 LANDSCAPE PREVIEW PAPER */}
          <div className="flex justify-center my-4 overflow-x-auto">
            <div id="printable-rekapmutasi-area" className="f4-landscape-page p-6 rounded-xl border border-slate-300 shadow-xl font-sans text-slate-900 bg-white">
              <KopSurat
                school={school}
                logos={logos}
                documentTitle="REKAPITULASI PERHITUNGAN JUMLAH MUTASI PESERTA DIDIK"
                documentSubtitle={`TAHUN PELAJARAN ${tahunAjaran}`}
                compact={true}
              />

              {/* Stats Bar */}
              <div className="flex justify-between items-center text-[10px] font-bold mb-2 px-1 text-slate-800 border-b pb-1">
                <div>Total Siswa Terdata: <span className="text-blue-900 font-extrabold">{students.length} SISWA</span></div>
                <div>Total Mutasi Masuk: <span className="text-emerald-700 font-extrabold">+{masukCount}</span></div>
                <div>Total Mutasi Keluar: <span className="text-rose-700 font-extrabold">-{keluarCount}</span></div>
                <div>Saldo Net: <span className="text-blue-900 font-extrabold">{saldoSelisih >= 0 ? `+${saldoSelisih}` : saldoSelisih}</span></div>
              </div>

              <p className="text-[10px] font-bold text-slate-900 uppercase mb-1">
                REKAPITULASI PERHITUNGAN MUTASI PER ROMBEL / KELAS (SEMUA BULAN / T.A {tahunAjaran})
              </p>

              {/* Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-900 text-[9px] text-center">
                  <thead>
                    <tr className="bg-slate-200 font-bold text-slate-900 uppercase border-b border-slate-900">
                      <th rowSpan={2} className="border border-slate-900 px-2 py-2 w-8">NO</th>
                      <th rowSpan={2} className="border border-slate-900 px-3 py-2 text-left w-32">KELAS</th>
                      <th colSpan={3} className="border border-slate-900 px-2 py-1 bg-slate-100">AWAL BULAN</th>
                      <th colSpan={3} className="border border-slate-900 px-2 py-1 bg-emerald-100 text-emerald-900">MASUK</th>
                      <th colSpan={3} className="border border-slate-900 px-2 py-1 bg-rose-100 text-rose-900">KELUAR</th>
                      <th colSpan={3} className="border border-slate-900 px-2 py-1 bg-blue-100 text-blue-900">AKHIR BULAN</th>
                    </tr>
                    <tr className="bg-slate-100 font-bold text-slate-900 uppercase text-[8px]">
                      <th className="border border-slate-900 w-12">L</th>
                      <th className="border border-slate-900 w-12">P</th>
                      <th className="border border-slate-900 w-14 font-extrabold bg-slate-200">JML</th>

                      <th className="border border-slate-900 w-12 text-emerald-900">L</th>
                      <th className="border border-slate-900 w-12 text-emerald-900">P</th>
                      <th className="border border-slate-900 w-14 font-extrabold bg-emerald-200 text-emerald-950">JML</th>

                      <th className="border border-slate-900 w-12 text-rose-900">L</th>
                      <th className="border border-slate-900 w-12 text-rose-900">P</th>
                      <th className="border border-slate-900 w-14 font-extrabold bg-rose-200 text-rose-950">JML</th>

                      <th className="border border-slate-900 w-12 text-blue-900">L</th>
                      <th className="border border-slate-900 w-12 text-blue-900">P</th>
                      <th className="border border-slate-900 w-14 font-extrabold bg-blue-200 text-blue-950">JML</th>
                    </tr>
                  </thead>
                  <tbody className="font-semibold text-slate-900">
                    {rekapRows.map((row) => (
                      <tr key={row.rombel} className="hover:bg-slate-50 transition">
                        <td className="border border-slate-900 py-1.5 px-2 text-center font-bold">{row.no}</td>
                        <td className="border border-slate-900 py-1.5 px-3 text-left font-bold uppercase">{row.rombel}</td>

                        <td className="border border-slate-900 py-1.5 px-2">{row.awalL}</td>
                        <td className="border border-slate-900 py-1.5 px-2">{row.awalP}</td>
                        <td className="border border-slate-900 py-1.5 px-2 font-extrabold bg-slate-100">{row.awalJml}</td>

                        <td className="border border-slate-900 py-1.5 px-2 text-emerald-900">{row.mMasukL}</td>
                        <td className="border border-slate-900 py-1.5 px-2 text-emerald-900">{row.mMasukP}</td>
                        <td className="border border-slate-900 py-1.5 px-2 font-extrabold bg-emerald-50 text-emerald-950">
                          {row.mMasukJml > 0 ? `+${row.mMasukJml}` : 0}
                        </td>

                        <td className="border border-slate-900 py-1.5 px-2 text-rose-900">{row.mKeluarL}</td>
                        <td className="border border-slate-900 py-1.5 px-2 text-rose-900">{row.mKeluarP}</td>
                        <td className="border border-slate-900 py-1.5 px-2 font-extrabold bg-rose-50 text-rose-950">
                          {row.mKeluarJml > 0 ? `-${row.mKeluarJml}` : 0}
                        </td>

                        <td className="border border-slate-900 py-1.5 px-2 text-blue-900">{row.akhirL}</td>
                        <td className="border border-slate-900 py-1.5 px-2 text-blue-900">{row.akhirP}</td>
                        <td className="border border-slate-900 py-1.5 px-2 font-extrabold bg-blue-100 text-blue-950">{row.akhirJml}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200 font-extrabold text-slate-900 border-t-2 border-slate-900">
                      <td colSpan={2} className="border border-slate-900 px-3 py-2 text-center uppercase">TOTAL</td>
                      <td className="border border-slate-900">{totalAwalL}</td>
                      <td className="border border-slate-900">{totalAwalP}</td>
                      <td className="border border-slate-900 bg-slate-300 font-black">{totalAwalL + totalAwalP}</td>

                      <td className="border border-slate-900 text-emerald-900">{totalMasukL}</td>
                      <td className="border border-slate-900 text-emerald-900">{totalMasukP}</td>
                      <td className="border border-slate-900 bg-emerald-200 text-emerald-950 font-black">+{totalMasukL + totalMasukP}</td>

                      <td className="border border-slate-900 text-rose-900">{totalKeluarL}</td>
                      <td className="border border-slate-900 text-rose-900">{totalKeluarP}</td>
                      <td className="border border-slate-900 bg-rose-200 text-rose-950 font-black">-{totalKeluarL + totalKeluarP}</td>

                      <td className="border border-slate-900 text-blue-900">{totalAkhirL}</td>
                      <td className="border border-slate-900 text-blue-900">{totalAkhirP}</td>
                      <td className="border border-slate-900 bg-blue-300 text-blue-950 font-black">{totalAkhirL + totalAkhirP}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Legal Signature */}
              <div className="mt-6 flex justify-end items-start text-xs font-semibold px-6">
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
                  <p className="text-slate-700 font-normal">
                    NIP. {officials.kepsekNip || '...........................................'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
