import React, { useState, useEffect } from 'react';
import { WaliKelas } from '../types';
import { X, Users, Save } from 'lucide-react';

interface WaliKelasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wali: Omit<WaliKelas, 'id'> & { id?: string | number }) => void;
  wali?: WaliKelas | null;
}

export const WaliKelasModal: React.FC<WaliKelasModalProps> = ({
  isOpen,
  onClose,
  onSave,
  wali
}) => {
  const [rombel, setRombel] = useState('KELAS VII-A');
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');

  useEffect(() => {
    if (wali) {
      setRombel(wali.rombel || 'KELAS VII-A');
      setNama(wali.nama || '');
      setNip(wali.nip || '');
    } else {
      setRombel('KELAS VII-A');
      setNama('');
      setNip('');
    }
  }, [wali, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rombel.trim() || !nama.trim()) return;

    onSave({
      ...(wali ? { id: wali.id } : {}),
      rombel: rombel.trim().toUpperCase(),
      nama: nama.trim().toUpperCase(),
      nip: nip.trim()
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                {wali ? 'Edit Data Wali Kelas' : 'Tambah Wali Kelas Baru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data penandatangan daftar siswa & absensi
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Rombel / Kelas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={rombel}
              onChange={(e) => setRombel(e.target.value)}
              placeholder="Contoh: KELAS VII-A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-bold uppercase text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nama Lengkap Wali Kelas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Dra. Hj. Siti Marwiyah, M.Pd."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-bold uppercase text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              NIP Wali Kelas
            </label>
            <input
              type="text"
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              placeholder="196804151994122001 (opsional)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-1.5 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              Simpan Data Wali Kelas
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
