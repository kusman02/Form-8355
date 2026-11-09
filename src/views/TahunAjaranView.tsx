import React, { useState } from 'react';
import { SchoolProfile, Officials } from '../types';
import { Calendar, Save, Plus, CheckCircle2, FileText, Users, Clock, ArrowRight, ShieldCheck, Sparkles, MapPin, Laptop, Check } from 'lucide-react';
import { isElectronApp, setStoredTahunAjaran, setStoredSignatureLocationDate, formatSignatureDate } from '../utils/electronBridge';

interface TahunAjaranViewProps {
  tahunAjaran: string;
  onSaveTahunAjaran: (newYear: string) => void;
  school?: SchoolProfile;
  officials?: Officials;
  onSaveSchool?: (updated: SchoolProfile) => void;
  showToast: (msg: string) => void;
}

const DEFAULT_YEARS = [
  '2023/2024',
  '2024/2025',
  '2025/2026',
  '2026/2027',
  '2027/2028',
  '2028/2029',
  '2029/2030'
];

export const TahunAjaranView: React.FC<TahunAjaranViewProps> = ({
  tahunAjaran,
  onSaveTahunAjaran,
  school,
  officials,
  onSaveSchool,
  showToast
}) => {
  // Available list of years in storage
  const [availableYears, setAvailableYears] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smpn18_tahun_ajaran_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (!parsed.includes(tahunAjaran)) parsed.push(tahunAjaran);
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    const list = [...DEFAULT_YEARS];
    if (!list.includes(tahunAjaran)) list.push(tahunAjaran);
    return list;
  });

  const [selectedYear, setSelectedYear] = useState<string>(tahunAjaran);
  const [customYear, setCustomYear] = useState<string>('');
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);

  // Titimangsa (Tempat dan Tanggal Sebelum Tanda Tangan)
  const [tempat, setTempat] = useState<string>(school?.tempat || 'Jakarta');
  const [tanggal, setTanggal] = useState<string>(school?.tanggal || '30 Oktober 2026');

  const isDesktop = isElectronApp();

  const handleSelectYear = (year: string) => {
    setSelectedYear(year);
  };

  const handleSetCurrentDate = () => {
    const today = new Date();
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const formatted = `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    setTanggal(formatted);
    showToast(`Tanggal diatur ke hari ini: ${formatted}`);
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanYear = selectedYear.trim();
    if (!cleanYear) {
      showToast("Pilih atau masukkan tahun ajaran terlebih dahulu.");
      return;
    }

    // 1. Save Tahun Ajaran to App state and persistent storage
    onSaveTahunAjaran(cleanYear);
    setStoredTahunAjaran(cleanYear);

    // 2. Save Tempat & Tanggal to School Profile and persistent storage
    setStoredSignatureLocationDate(tempat.trim(), tanggal.trim());
    if (onSaveSchool && school) {
      onSaveSchool({
        ...school,
        tempat: tempat.trim(),
        tanggal: tanggal.trim()
      });
    }

    showToast(`Tahun Ajaran (${cleanYear}) & Titimangsa (${tempat}, ${tanggal}) berhasil disimpan!`);
  };

  const handleAddCustomYear = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = customYear.trim();
    if (!clean) {
      showToast("Masukkan format tahun ajaran, contoh: 2030/2031");
      return;
    }

    if (availableYears.includes(clean)) {
      setSelectedYear(clean);
      setCustomYear('');
      setIsAddingCustom(false);
      showToast(`Tahun ajaran ${clean} sudah ada dalam daftar.`);
      return;
    }

    const updated = [...availableYears, clean].sort();
    setAvailableYears(updated);
    localStorage.setItem('smpn18_tahun_ajaran_list', JSON.stringify(updated));
    setSelectedYear(clean);
    setCustomYear('');
    setIsAddingCustom(false);
    showToast(`Tahun ajaran baru ${clean} berhasil ditambahkan!`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Pengaturan Tahun Ajaran & Titimangsa Pengesahan
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur tahun pelajaran serta tempat & tanggal sebelum tanda tangan yang terhubung ke seluruh dokumen resmi (Web & Desktop Electron)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Electron Status Badge */}
            <span className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 rounded-full text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5" />
              <span>{isDesktop ? 'Mode Desktop (Electron)' : 'Kompatibel Desktop (Electron) & Web'}</span>
            </span>

            <span className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>T.A Aktif: <strong>{tahunAjaran}</strong></span>
            </span>
          </div>
        </div>

        {/* 1. SELEKSI TAHUN AJARAN */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Active Highlight Box */}
          <div className="md:col-span-1 p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-100">
                  Tahun Pelajaran Terpilih
                </span>
                <CheckCircle2 className="w-4 h-4 text-blue-200" />
              </div>
              <div className="text-3xl font-black tracking-tight pt-2">
                {selectedYear}
              </div>
              <p className="text-xs text-blue-100/90 pt-1">
                {selectedYear === tahunAjaran ? 'Sedang aktif di seluruh sistem' : 'Perubahan siap diterapkan'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-blue-400/30">
              <button
                type="button"
                onClick={() => handleSaveAll()}
                className="w-full py-2 px-3 bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl shadow transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan & Terapkan Semua</span>
              </button>
            </div>
          </div>

          {/* Grid Selection */}
          <div className="md:col-span-2 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Pilih Dari Daftar Tahun Pelajaran:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {availableYears.map(year => {
                  const isSelected = selectedYear === year;
                  const isCurrentActive = tahunAjaran === year;
                  return (
                    <button
                      key={year}
                      type="button"
                      onClick={() => handleSelectYear(year)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <span className="text-xs">{year}</span>
                      {isCurrentActive && (
                        <span className={`text-[9px] font-semibold ${isSelected ? 'text-blue-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          (Aktif Saat Ini)
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tambah Tahun Ajaran Manual */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {!isAddingCustom ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Tahun Ajaran Lain
                </button>
              ) : (
                <form onSubmit={handleAddCustomYear} className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    placeholder="Contoh: 2030/2031"
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 w-36"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsAddingCustom(false); setCustomYear(''); }}
                    className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    Batal
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* 2. TITIMANGSA PENGESAHAN (TEMPAT & TANGGAL SEBELUM TANDA TANGAN) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Titimangsa Pengesahan (Tempat & Tanggal Sebelum Tanda Tangan)
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Teks tempat dan tanggal ini akan otomatis dicetak tepat di atas blok tanda tangan pada seluruh dokumen resmi sekolah
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
            {/* Input Form Column */}
            <div className="md:col-span-7 space-y-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tempat / Kota (Sebelum Tanda Tangan)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={tempat}
                    onChange={(e) => setTempat(e.target.value)}
                    placeholder="Contoh: Jakarta"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                  Contoh: Jakarta, Bandung, Surabaya, Semarang, dsb.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tanggal Surat / Pengesahan (Sebelum Tanda Tangan)
                  </label>
                  <button
                    type="button"
                    onClick={handleSetCurrentDate}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Clock className="w-3 h-3" /> Pakai Tanggal Hari Ini
                  </button>
                </div>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={tanggal}
                    onChange={(e) => setTanggal(e.target.value)}
                    placeholder="Contoh: 30 Oktober 2026"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                  Contoh: 30 Oktober 2026, 31 Juli 2026, 15 Januari 2027
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSaveAll()}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan Titimangsa & Tahun Ajaran</span>
                </button>
              </div>
            </div>

            {/* Live Signature Preview Column */}
            <div className="md:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-3">
                  Pratinjau Hasil Cetak Pengesahan Dokumen
                </span>
                <div className="text-center font-sans space-y-1 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700/80">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {formatSignatureDate(tempat, tanggal)}
                  </p>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kepala {school?.name || 'Sekolah'}
                  </p>
                  <div className="h-14 flex items-center justify-center py-1">
                    {officials?.kepsekTtdUrl ? (
                      <img src={officials.kepsekTtdUrl} alt="TTD Kepsek" className="max-h-12 object-contain" />
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">(Ruang Tanda Tangan & Stempel)</span>
                    )}
                  </div>
                  <p className="text-xs font-bold underline uppercase text-slate-900 dark:text-white">
                    {officials?.kepsekName || 'Drs. H. Sukirman, M.Pd.'}
                  </p>
                  <p className="text-[10.5px] font-mono text-slate-600 dark:text-slate-400">
                    NIP. {officials?.kepsekNip || '196508121990031004'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Otomatis diterapkan di Form 8355, Daftar Absen, Daftar Siswa, dan Rekapitulasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. DOKUMEN YANG TERHUBUNG */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Dokumen & Laporan Yang Terhubung:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: 'Buku Induk Form 8355',
                desc: 'Tercetak di header atas dan ringkasan rekapitulasi semester aktif.',
                icon: FileText
              },
              {
                title: 'Daftar Hadir / Absensi Siswa',
                desc: 'Tercetak di kop surat Lembar 1 dan titimangsa tanda tangan Lembar 2.',
                icon: Clock
              },
              {
                title: 'Daftar Peserta Didik per Kelas',
                desc: 'Tercetak di bawah judul dokumen, titimangsa, dan file ekspor Excel.',
                icon: Users
              },
              {
                title: 'Rekapitulasi L/P Siswa',
                desc: 'Menjadi acuan periode statistik data pokok rombel serta titimangsa tanda tangan.',
                icon: ShieldCheck
              },
              {
                title: 'Daftar Mutasi Siswa',
                desc: 'Menjadi filter tahun kalender mutasi serta titimangsa tanda tangan rekapitulasi.',
                icon: ArrowRight
              },
              {
                title: 'Kategori Usia Peserta Didik',
                desc: 'Menentukan perhitungan distribusi umur serta titimangsa tanda tangan resmi.',
                icon: Calendar
              }
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-start gap-3 shadow-xs"
                >
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mt-0.5">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {item.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. PANDUAN ELECTRON DESKTOP APPLICATION */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
            <Laptop className="w-4 h-4 text-blue-500" />
            <span>Informasi Kompatibilitas Electron Desktop</span>
          </div>
          <p className="leading-relaxed">
            Aplikasi ini telah dilengkapi skrip desktop Electron lengkap (<code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">electron/main.cjs</code> dan <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">electron/preload.cjs</code>). Seluruh pengaturan Tahun Ajaran serta Tempat dan Tanggal disimpan secara permanen di penyimpanan lokal (LocalStorage & IPC) dan dapat langsung dipaketkan menjadi file installer desktop (<code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">.exe</code>, <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">.dmg</code>, atau <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-[11px]">.AppImage</code>) secara offline tanpa memerlukan koneksi internet.
          </p>
        </div>
      </div>
    </div>
  );
};
