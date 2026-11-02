import React, { useState, useEffect } from 'react';
import { Mutasi } from '../types';
import { X, ArrowLeftRight, Save } from 'lucide-react';

interface MutasiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (mutasi: Omit<Mutasi, 'id'> & { id?: string | number }, syncMaster: boolean) => void;
  mutasi?: Mutasi | null;
  rombelList: string[];
}

export const MutasiModal: React.FC<MutasiModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mutasi,
  rombelList
}) => {
  const [jenis, setJenis] = useState<'MASUK' | 'KELUAR'>('MASUK');
  const [tanggal, setTanggal] = useState('2026-10-30');
  const [nama, setNama] = useState('');
  const [rombel, setRombel] = useState('VII-A');
  const [nis, setNis] = useState('');
  const [nisn, setNisn] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [sekolah, setSekolah] = useState('');
  const [alasan, setAlasan] = useState('');
  const [noSurat, setNoSurat] = useState('');
  const [syncMaster, setSyncMaster] = useState(true);

  useEffect(() => {
    if (mutasi) {
      setJenis(mutasi.jenis || 'MASUK');
      setTanggal(mutasi.tanggal || '2026-10-30');
      setNama(mutasi.nama || '');
      setRombel(mutasi.rombel || 'VII-A');
      setNis(mutasi.nis || '');
      setNisn(mutasi.nisn || '');
      setGender(mutasi.gender || 'L');
      setSekolah(mutasi.sekolah || '');
      setAlasan(mutasi.alasan || '');
      setNoSurat(mutasi.noSurat || '');
      setSyncMaster(false);
    } else {
      setJenis('MASUK');
      setTanggal(new Date().toISOString().split('T')[0] || '2026-10-30');
      setNama('');
      setRombel(rombelList[0] || 'VII-A');
      setNis('');
      setNisn('');
      setGender('L');
      setSekolah('');
      setAlasan('Pindah Domisili Mengikuti Orang Tua');
      setNoSurat('Surat: 421.3/089/SMPN1-BDG/2026');
      setSyncMaster(true);
    }
  }, [mutasi, rombelList, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !sekolah.trim()) return;

    onSave(
      {
        ...(mutasi ? { id: mutasi.id } : {}),
        jenis,
        tanggal,
        nama: nama.trim().toUpperCase(),
        rombel,
        nis: nis.trim(),
        nisn: nisn.trim(),
        gender,
        sekolah: sekolah.trim(),
        alasan: alasan.trim(),
        noSurat: noSurat.trim()
      },
      syncMaster
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${jenis === 'MASUK' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'}`}>
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                {mutasi ? 'Edit Catatan Mutasi' : 'Catat Mutasi Siswa Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pencatatan mutasi masuk (+) atau mutasi keluar (-)
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Mutasi <span className="text-rose-500">*</span>
              </label>
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value as 'MASUK' | 'KELUAR')}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold outline-none transition ${
                  jenis === 'MASUK' 
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800' 
                    : 'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                }`}
              >
                <option value="MASUK">MASUK (+) (Siswa Pindahan/Baru)</option>
                <option value="KELUAR">KELUAR (-) (Siswa Keluar/Pindah)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tanggal Mutasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Siswa <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: DANANG PRASETYO"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-bold uppercase text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kelas / Rombel
              </label>
              <select
                value={rombel}
                onChange={(e) => setRombel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              >
                {rombelList.map((r) => (
                  <option key={r} value={r.replace(/^KELAS\s+/i, '')}>
                    {r.startsWith('KELAS') ? r : `KELAS ${r}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                NIS
              </label>
              <input
                type="text"
                value={nis}
                onChange={(e) => setNis(e.target.value)}
                placeholder="1016"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Jenis Kelamin
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              NISN (Opsional)
            </label>
            <input
              type="text"
              value={nisn}
              onChange={(e) => setNisn(e.target.value)}
              placeholder="0103348123"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sekolah Asal / Sekolah Tujuan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={sekolah}
              onChange={(e) => setSekolah(e.target.value)}
              placeholder="Contoh: SMPN 1 Bandung"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alasan Mutasi
              </label>
              <input
                type="text"
                value={alasan}
                onChange={(e) => setAlasan(e.target.value)}
                placeholder="Pindah domisili ortu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor Surat Rekomendasi / Mutasi
              </label>
              <input
                type="text"
                value={noSurat}
                onChange={(e) => setNoSurat(e.target.value)}
                placeholder="Surat: 421.3/089/SMPN1-BDG/2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {!mutasi && jenis === 'MASUK' && (
            <label className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 cursor-pointer">
              <input
                type="checkbox"
                checked={syncMaster}
                onChange={(e) => setSyncMaster(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-0"
              />
              <span className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                Otomatis tambahkan siswa ini ke Master Data Siswa Form 8355
              </span>
            </label>
          )}

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-amber-500/25 flex items-center gap-1.5 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              Simpan Data Mutasi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
