import React, { useState } from 'react';
import { Calendar, Save, Plus, CheckCircle2, FileText, Users, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface TahunAjaranViewProps {
  tahunAjaran: string;
  onSaveTahunAjaran: (newYear: string) => void;
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
  showToast
}) => {
  // Available list of years in storage
  const [availableYears, setAvailableYears] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smpn18_tahun_ajaran_list');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Ensure current year is in list
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

  const handleSelectYear = (year: string) => {
    setSelectedYear(year);
  };

  const handleSaveActiveYear = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedYear.trim()) {
      showToast("Pilih atau masukkan tahun ajaran terlebih dahulu.");
      return;
    }
    onSaveTahunAjaran(selectedYear.trim());
    showToast(`Tahun Ajaran aktif berhasil disimpan: ${selectedYear.trim()}`);
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
                Pengaturan Tahun Ajaran / Pelajaran
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tentukan tahun pelajaran aktif yang berlaku untuk seluruh buku induk, cetak formulir, absensi, dan data mutasi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/50 rounded-full text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aktif Saat Ini: <strong>{tahunAjaran}</strong></span>
            </span>
          </div>
        </div>

        {/* Current Active Highlight Box */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                {selectedYear === tahunAjaran ? 'Sedang aktif di seluruh sistem' : 'Perubahan belum disimpan'}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-blue-400/30">
              <button
                type="button"
                onClick={() => handleSaveActiveYear()}
                disabled={selectedYear === tahunAjaran}
                className="w-full py-2 px-3 bg-white hover:bg-blue-50 text-blue-900 font-bold text-xs rounded-xl shadow transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{selectedYear === tahunAjaran ? 'Sudah Aktif' : 'Terapkan Tahun Ajaran Ini'}</span>
              </button>
            </div>
          </div>

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
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25 ring-2 ring-blue-500/20'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-blue-400'
                      }`}
                    >
                      <span className="text-[13px]">{year}</span>
                      {isCurrentActive && (
                        <span className={`text-[9px] font-semibold ${isSelected ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}>
                          &bull; Aktif
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Add Custom Year */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {!isAddingCustom ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 cursor-pointer self-start"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Tahun Ajaran Baru...
                </button>
              ) : (
                <form onSubmit={handleAddCustomYear} className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    placeholder="Contoh: 2030/2031"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
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

        {/* Affected Documents Section */}
        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Dokumen & Laporan Yang Terhubung dengan Tahun Ajaran Ini:</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                title: 'Buku Induk Form 8355',
                desc: 'Tercetak di header atas dan ringkasan rekapitulasi siswa semester aktif.',
                icon: FileText
              },
              {
                title: 'Daftar Hadir / Absensi Siswa',
                desc: 'Tercetak di kop surat resmi Lembar 1 dan header lanjutan Lembar 2.',
                icon: Clock
              },
              {
                title: 'Daftar Peserta Didik per Kelas',
                desc: 'Tercetak di bawah judul dokumen serta pada file ekspor Excel.',
                icon: Users
              },
              {
                title: 'Rekapitulasi L/P Siswa',
                desc: 'Menjadi acuan periode statistik data pokok rombongan belajar.',
                icon: ShieldCheck
              },
              {
                title: 'Daftar Mutasi Siswa',
                desc: 'Menjadi filter tahun kalender pergerakan siswa masuk dan keluar.',
                icon: ArrowRight
              },
              {
                title: 'Kategori Usia Peserta Didik',
                desc: 'Menentukan perhitungan distribusi umur pada periode tahun ajaran aktif.',
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
      </div>
    </div>
  );
};
