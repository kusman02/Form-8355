import React, { useState } from 'react';
import { SchoolProfile } from '../types';
import { School, Save, Trash2, Info, MapPin, Calendar } from 'lucide-react';
import { setStoredSignatureLocationDate, setStoredTahunAjaran } from '../utils/electronBridge';

interface ProfilSekolahViewProps {
  school: SchoolProfile;
  onSave: (updated: SchoolProfile) => void;
  showToast: (msg: string) => void;
  tahunAjaran?: string;
  onSaveTahunAjaran?: (year: string) => void;
}

export const ProfilSekolahView: React.FC<ProfilSekolahViewProps> = ({
  school,
  onSave,
  showToast,
  tahunAjaran = '2026/2027',
  onSaveTahunAjaran
}) => {
  const [formData, setFormData] = useState<SchoolProfile>(school);
  const [currentTahunAjaran, setCurrentTahunAjaran] = useState<string>(tahunAjaran);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setStoredSignatureLocationDate(formData.tempat || 'Jakarta', formData.tanggal || '30 Oktober 2026');
    showToast("Profil Sekolah & Header Kop berhasil disimpan!");
  };

  const handleClear = () => {
    const emptyProfile: SchoolProfile = {
      instansiAtas: "",
      dinas: "",
      name: "",
      npsn: "",
      address: "",
      tempat: "",
      tanggal: ""
    };
    setFormData(emptyProfile);
    onSave(emptyProfile);
    showToast("Isian kolom profil sekolah telah dikosongkan.");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Profil Sekolah & Kustomisasi Header Kop Surat
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atur identitas lembaga yang akan dicetak di semua formulir dan lembar resmi Form 8355
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Kosongkan Isian Kolom
          </button>
        </div>

        {/* Guidance Alert Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Kolom isian di bawah ini sengaja dikosongkan agar Anda dapat mengisinya sesuai data satuan pendidikan Anda. Ikuti format contoh yang tertera di masing-masing kolom sebagai panduan pengisian.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Instansi Atas
              </label>
              <input
                type="text"
                value={formData.instansiAtas}
                onChange={(e) => setFormData({ ...formData, instansiAtas: e.target.value })}
                placeholder="Contoh: PEMERINTAH PROVINSI DKI JAKARTA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                Contoh: PEMERINTAH PROVINSI DKI JAKARTA
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Dinas / Sub-Instansi
              </label>
              <input
                type="text"
                value={formData.dinas}
                onChange={(e) => setFormData({ ...formData, dinas: e.target.value })}
                placeholder="Contoh: DINAS PENDIDIKAN"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                Contoh: DINAS PENDIDIKAN
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nama Sekolah (Tampil di Kop)
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: SMP NEGERI 18 JAKARTA"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-bold text-blue-900 dark:text-blue-400 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                Contoh: SMP NEGERI 18 JAKARTA
              </p>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                NPSN / Kode Sekolah
              </label>
              <input
                type="text"
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                placeholder="Contoh: 20100232"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
              />
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                Contoh: 20100232
              </p>
            </div>
          </div>

          {/* Tahun Ajaran / Pelajaran Aktif */}
          {onSaveTahunAjaran && (
            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Tahun Ajaran / Pelajaran Aktif</span>
                </span>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Tersambung ke seluruh dokumen</span>
              </label>
              <div className="relative">
                <select
                  value={currentTahunAjaran}
                  onChange={(e) => {
                    const newYear = e.target.value;
                    setCurrentTahunAjaran(newYear);
                    onSaveTahunAjaran(newYear);
                    setStoredTahunAjaran(newYear);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-blue-900 dark:text-blue-300 outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
                >
                  <option value="2023/2024">2023/2024</option>
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026</option>
                  <option value="2026/2027">2026/2027</option>
                  <option value="2027/2028">2027/2028</option>
                  <option value="2028/2029">2028/2029</option>
                  <option value="2029/2030">2029/2030</option>
                </select>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                Tahun pelajaran ini otomatis tercetak pada Form 8355, Daftar Hadir Siswa, dan seluruh rekapitulasi data.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Alamat Lengkap Sekolah
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Contoh: JL. MENTENG KECIL NO. 3 RT 12 RW 9, KEBON SIRIH, MENTENG, JAKARTA PUSAT 10340"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
              Contoh: JL. MENTENG KECIL NO. 3 RT 12 RW 9, KEBON SIRIH, MENTENG, JAKARTA PUSAT 10340
            </p>
          </div>

          {/* Kolom Tempat dan Tanggal Sebelum Tanda Tangan */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                  Tempat & Tanggal Sebelum Tanda Tangan (Titimangsa Cetak)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Teks tempat dan tanggal ini akan dicetak di atas tanda tangan pada lembar Daftar Absen, Form 8355, Daftar Siswa, dan dokumen resmi lainnya.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tempat / Kota (Sebelum Tanda Tangan)
                </label>
                <input
                  type="text"
                  value={formData.tempat ?? ''}
                  onChange={(e) => setFormData({ ...formData, tempat: e.target.value })}
                  placeholder="Contoh: Jakarta"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                  Kota penerbitan dokumen. Contoh: Jakarta, Bandung, Surabaya, dll.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tanggal Dokumen (Sebelum Tanda Tangan)
                </label>
                <input
                  type="text"
                  value={formData.tanggal ?? ''}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  placeholder="Contoh: 30 Oktober 2026"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                  Format tanggal bebas. Contoh: 30 Oktober 2026, 31 Oktober 2026, dll.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/40 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-amber-900/80 dark:text-amber-300/80 font-medium">
                Pratinjau Format di Atas Tanda Tangan:
              </span>
              <span className="font-bold text-amber-950 dark:text-amber-300 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800/60 shadow-xs">
                {formData.tempat || 'Jakarta'}, {formData.tanggal || '30 Oktober 2026'}
              </span>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap justify-between items-center gap-3">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Kosongkan Semua
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Simpan Profil & Header
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
