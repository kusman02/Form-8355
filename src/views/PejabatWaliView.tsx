import React, { useState, useRef, useEffect } from 'react';
import { Officials, WaliKelas } from '../types';
import { User, Users, CheckCircle2, Upload, Save, Trash2, Plus, FileSpreadsheet, Download, Search, Edit2, Info } from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportWaliKelasToExcel, downloadWaliTemplate } from '../utils/helpers';

interface PejabatWaliViewProps {
  officials: Officials;
  waliList: WaliKelas[];
  onSaveOfficials: (officials: Officials) => void;
  onOpenWaliModal: (wali?: WaliKelas | null) => void;
  onDeleteWali: (id: string | number) => void;
  onImportWaliExcel: (imported: WaliKelas[]) => void;
  showToast: (msg: string) => void;
}

export const PejabatWaliView: React.FC<PejabatWaliViewProps> = ({
  officials,
  waliList,
  onSaveOfficials,
  onOpenWaliModal,
  onDeleteWali,
  onImportWaliExcel,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<'pejabat' | 'wali'>('pejabat');
  const [kepsekName, setKepsekName] = useState(officials.kepsekName);
  const [kepsekNip, setKepsekNip] = useState(officials.kepsekNip);
  const [pengawasName, setPengawasName] = useState(officials.pengawasName);
  const [pengawasNip, setPengawasNip] = useState(officials.pengawasNip);
  const [kepsekTtdUrl, setKepsekTtdUrl] = useState(officials.kepsekTtdUrl || '');
  const [pengawasTtdUrl, setPengawasTtdUrl] = useState(officials.pengawasTtdUrl || '');
  const [searchWali, setSearchWali] = useState('');

  useEffect(() => {
    setKepsekName(officials.kepsekName || '');
    setKepsekNip(officials.kepsekNip || '');
    setPengawasName(officials.pengawasName || '');
    setPengawasNip(officials.pengawasNip || '');
    setKepsekTtdUrl(officials.kepsekTtdUrl || '');
    setPengawasTtdUrl(officials.pengawasTtdUrl || '');
  }, [officials]);

  const inputTtdKepsekRef = useRef<HTMLInputElement>(null);
  const inputTtdPengawasRef = useRef<HTMLInputElement>(null);
  const inputImportExcelWaliRef = useRef<HTMLInputElement>(null);

  const handleTtdUpload = (type: 'kepsek' | 'pengawas', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === 'kepsek') {
          setKepsekTtdUrl(result);
        } else {
          setPengawasTtdUrl(result);
        }
        showToast("Tanda tangan digital berhasil diunggah!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSavePejabat = () => {
    onSaveOfficials({
      kepsekName: kepsekName.trim(),
      kepsekNip: kepsekNip.trim(),
      pengawasName: pengawasName.trim(),
      pengawasNip: pengawasNip.trim(),
      kepsekTtdUrl,
      pengawasTtdUrl
    });
    showToast("Data Pejabat & Tanda Tangan berhasil disimpan!");
  };

  const handleClearPejabat = () => {
    setKepsekName('');
    setKepsekNip('');
    setPengawasName('');
    setPengawasNip('');
    setKepsekTtdUrl('');
    setPengawasTtdUrl('');
    onSaveOfficials({
      kepsekName: '',
      kepsekNip: '',
      pengawasName: '',
      pengawasNip: '',
      kepsekTtdUrl: '',
      pengawasTtdUrl: ''
    });
    showToast("Isian data pejabat telah dikosongkan.");
  };

  const handleFileImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws);

          if (!data || data.length === 0) {
            showToast("Berkas Excel tidak memiliki data.");
            return;
          }

          const parsed: WaliKelas[] = data.map((row, idx) => ({
            id: Date.now() + idx,
            rombel: String(row['ROMBEL / KELAS'] || row['ROMBEL'] || row['KELAS'] || `KELAS ${idx + 1}`).trim().toUpperCase(),
            nama: String(row['NAMA WALI KELAS'] || row['NAMA'] || '').trim().toUpperCase(),
            nip: String(row['NIP WALI KELAS'] || row['NIP'] || '').trim()
          })).filter(w => w.nama);

          if (parsed.length > 0) {
            onImportWaliExcel(parsed);
            showToast(`Berhasil mengimpor ${parsed.length} data Wali Kelas!`);
          } else {
            showToast("Tidak ditemukan baris data wali kelas yang valid.");
          }
        } catch {
          showToast("Gagal membaca berkas Excel. Pastikan format sesuai template.");
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const filteredWali = waliList.filter(w => {
    return !searchWali || 
      w.rombel.toLowerCase().includes(searchWali.toLowerCase()) || 
      w.nama.toLowerCase().includes(searchWali.toLowerCase()) || 
      (w.nip && w.nip.includes(searchWali));
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              Input Data Pejabat & Wali Kelas
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Data Kepala Sekolah, Pengawas Pembina, Wali Kelas, serta tanda tangan digital untuk lembar cetak resmi
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={() => setActiveTab('pejabat')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'pejabat'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4" /> Data Pejabat Sekolah
        </button>
        <button
          onClick={() => setActiveTab('wali')}
          className={`px-5 py-3 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
            activeTab === 'wali'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" /> Data Wali Kelas 
          <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300">
            {waliList.length}
          </span>
        </button>
      </div>

      {/* TAB 1: DATA PEJABAT */}
      {activeTab === 'pejabat' && (
        <div className="p-6 space-y-6">
          {/* Guidance Alert Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Kolom data pejabat sengaja dikosongkan. Silakan isi nama dan NIP Kepala Sekolah serta Pengawas Pembina satuan pendidikan Anda. Ikuti format contoh yang tertera di bawah kolom sebagai panduan.
            </p>
          </div>

          {/* Kepala Sekolah Card */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-50/30 dark:bg-slate-800/10">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                <User className="w-4 h-4" />
                <span>Kepala Sekolah</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Penandatangan Form 8355, Rekapitulasi & Mutasi</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={kepsekName}
                  onChange={(e) => setKepsekName(e.target.value)}
                  placeholder="Contoh: Drs. H. Sukirman, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                  Contoh: Drs. H. Sukirman, M.Pd.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  NIP Kepala Sekolah
                </label>
                <input
                  type="text"
                  value={kepsekNip}
                  onChange={(e) => setKepsekNip(e.target.value)}
                  placeholder="Contoh: 196708151993031003"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                  Contoh: 196708151993031003
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Tanda Tangan Digital Kepala Sekolah
              </label>
              <div className="flex items-center gap-4">
                <div className="w-40 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-900 text-slate-400 overflow-hidden relative">
                  {kepsekTtdUrl ? (
                    <img src={kepsekTtdUrl} alt="TTD Kepsek" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] font-medium">Belum ada TTD</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="file"
                    ref={inputTtdKepsekRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleTtdUpload('kepsek', e)}
                  />
                  <button
                    type="button"
                    onClick={() => inputTtdKepsekRef.current?.click()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition active:scale-95 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Tanda Tangan
                  </button>
                  <p className="text-[10px] text-slate-400">Format disarankan PNG latar belakang transparan.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pengawas Pembina Card */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 bg-slate-50/30 dark:bg-slate-800/10">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pengawas Sekolah Pembina</span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Penandatangan Lembar Pengesahan Form 8355</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Nama Lengkap Pengawas Pembina
                </label>
                <input
                  type="text"
                  value={pengawasName}
                  onChange={(e) => setPengawasName(e.target.value)}
                  placeholder="Contoh: Dr. Hj. Nurjanah, M.Pd."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                  Contoh: Dr. Hj. Nurjanah, M.Pd.
                </p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  NIP Pengawas Sekolah
                </label>
                <input
                  type="text"
                  value={pengawasNip}
                  onChange={(e) => setPengawasNip(e.target.value)}
                  placeholder="Contoh: 196504101989022002"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-semibold text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-amber-500 transition"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 italic">
                  Contoh: 196504101989022002
                </p>
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Tanda Tangan Digital Pengawas Pembina
              </label>
              <div className="flex items-center gap-4">
                <div className="w-40 h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-2 bg-white dark:bg-slate-900 text-slate-400 overflow-hidden relative">
                  {pengawasTtdUrl ? (
                    <img src={pengawasTtdUrl} alt="TTD Pengawas" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <span className="text-[10px] font-medium">Belum ada TTD</span>
                    </div>
                  )}
                </div>
                <div className="space-y-1">
                  <input
                    type="file"
                    ref={inputTtdPengawasRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleTtdUpload('pengawas', e)}
                  />
                  <button
                    type="button"
                    onClick={() => inputTtdPengawasRef.current?.click()}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition active:scale-95"
                  >
                    <Upload className="w-3.5 h-3.5" /> Upload Tanda Tangan
                  </button>
                  <p className="text-[10px] text-slate-400">Format disarankan PNG latar belakang transparan.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-between items-center">
            <button
              type="button"
              onClick={handleClearPejabat}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 flex items-center gap-1.5 transition"
            >
              <Trash2 className="w-3.5 h-3.5" /> Kosongkan Isian Pejabat
            </button>
            <button
              type="button"
              onClick={handleSavePejabat}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition active:scale-95"
            >
              <Save className="w-4 h-4" /> Simpan Data Pejabat
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: DATA WALI KELAS */}
      {activeTab === 'wali' && (
        <div className="p-6 space-y-6">
          <input
            type="file"
            ref={inputImportExcelWaliRef}
            accept=".xlsx, .xls"
            className="hidden"
            onChange={handleFileImportExcel}
          />

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => exportWaliKelasToExcel(waliList)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95 transition"
              >
                <FileSpreadsheet className="w-4 h-4" /> Ekspor Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={() => inputImportExcelWaliRef.current?.click()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 active:scale-95 transition"
              >
                <Upload className="w-4 h-4" /> Impor Excel (.xlsx)
              </button>
              <button
                type="button"
                onClick={downloadWaliTemplate}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2 active:scale-95 transition shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-600" /> Format Template (.xlsx)
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenWaliModal(null)}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Plus className="w-4 h-4" /> Tambah Wali Kelas
            </button>
          </div>

          <div className="flex justify-between items-center gap-4 pt-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchWali}
                onChange={(e) => setSearchWali(e.target.value)}
                placeholder="Cari rombel/kelas, nama wali kelas, atau NIP..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/80 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white dark:focus:bg-slate-800 outline-none transition"
              />
            </div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
              Total Rombel: <span className="text-amber-600 dark:text-amber-400 font-extrabold">{waliList.length}</span>
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-800/80 font-bold uppercase text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3.5 px-4 w-14 text-center border-r border-slate-200/60 dark:border-slate-700/60">NO</th>
                  <th className="py-3.5 px-4 w-52 border-r border-slate-200/60 dark:border-slate-700/60">ROMBEL / KELAS</th>
                  <th className="py-3.5 px-4 border-r border-slate-200/60 dark:border-slate-700/60">NAMA WALI KELAS</th>
                  <th className="py-3.5 px-4 w-60 border-r border-slate-200/60 dark:border-slate-700/60">NIP WALI KELAS</th>
                  <th className="py-3.5 px-4 w-28 text-center">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium text-slate-800 dark:text-slate-200">
                {filteredWali.map((w, idx) => (
                  <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <td className="py-3 px-4 text-center font-bold text-slate-500 border-r border-slate-100 dark:border-slate-800">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4 font-bold text-blue-900 dark:text-blue-400 border-r border-slate-100 dark:border-slate-800">
                      {w.rombel}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-white uppercase border-r border-slate-100 dark:border-slate-800">
                      {w.nama}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">
                      {w.nip || '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenWaliModal(w)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-lg transition"
                          title="Edit Wali Kelas"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteWali(w.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/40 rounded-lg transition"
                          title="Hapus Wali Kelas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredWali.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                      Tidak ada data Wali Kelas yang cocok.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[11px] text-slate-400">
              Data Wali Kelas dan Tanda Tangan akan otomatis tercetak pada Form 8355, Daftar Siswa, dan Lembar Absensi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
