import React, { useRef } from 'react';
import { LogoConfig } from '../types';
import { Image, Upload, RotateCcw, Sparkles, Save } from 'lucide-react';
import { initialLogoConfig } from '../data/initialData';
import { SchoolEmblemSvg, SchoolLogo } from '../components/BrandLogos';

interface UploadLogoViewProps {
  logos: LogoConfig;
  onSave: (logos: LogoConfig) => void;
  showToast: (msg: string) => void;
}

export const UploadLogoView: React.FC<UploadLogoViewProps> = ({
  logos,
  onSave,
  showToast
}) => {
  const [sidebarText, setSidebarText] = React.useState(logos.sidebarTextName || 'SMPN 18 JAKARTA');
  const fileInstansiRef = useRef<HTMLInputElement>(null);
  const fileSekolahRef = useRef<HTMLInputElement>(null);
  const fileSidebarRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (type: 'instansi' | 'sekolah' | 'sidebar', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        showToast("Ukuran berkas logo maksimal 3MB!");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (type === 'instansi') {
          onSave({ ...logos, instansiLogoUrl: result });
        } else if (type === 'sekolah') {
          onSave({ ...logos, sekolahLogoUrl: result });
        } else if (type === 'sidebar') {
          onSave({ ...logos, sidebarLogoUrl: result });
        }
        showToast("Logo berhasil diperbarui!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogos = () => {
    onSave({
      ...initialLogoConfig,
      sidebarTextName: sidebarText
    });
    showToast("Logo dikembalikan ke pengaturan bawaan.");
  };

  const handleSaveSidebarText = () => {
    if (!sidebarText.trim()) {
      showToast("Nama sekolah tidak boleh kosong!");
      return;
    }
    onSave({
      ...logos,
      sidebarTextName: sidebarText.trim().toUpperCase()
    });
    showToast("Teks nama sekolah sidebar berhasil disimpan!");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Image className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Pengaturan Logo Dokumen & Identitas Sidebar
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah logo kustom untuk kop surat resmi F4 dan navigasi samping
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetLogos}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Logo Bawaan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Logo Instansi */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center space-y-4 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-white">Logo Instansi (Kop Kiri)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Pemprov DKI / Lambang Daerah</p>
            </div>

            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-2 bg-white dark:bg-slate-900 overflow-hidden shadow-inner">
              {logos.instansiLogoUrl ? (
                <img src={logos.instansiLogoUrl} className="max-h-full max-w-full object-contain" alt="Logo Instansi" />
              ) : (
                <svg className="w-20 h-24" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 5 L90 25 V75 L50 115 L10 75 V25 Z" fill="#E53E3E" stroke="#FFD700" strokeWidth="3"/>
                  <path d="M50 15 L80 32 V68 L50 100 L20 68 V32 Z" fill="#3182CE"/>
                  <circle cx="50" cy="55" r="18" fill="#ECC94B"/>
                  <text x="50" y="60" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1A202C">JAYA</text>
                </svg>
              )}
            </div>

            <input
              type="file"
              ref={fileInstansiRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload('instansi', e)}
            />
            <button
              type="button"
              onClick={() => fileInstansiRef.current?.click()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" /> Unggah Logo Instansi
            </button>
          </div>

          {/* 2. Logo Sekolah */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center space-y-4 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-white">Logo Sekolah (Kop Kanan)</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Logo SMPN 18 / Tut Wuri Handayani</p>
            </div>

            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-2 bg-white dark:bg-slate-900 overflow-hidden shadow-inner">
              {logos.sekolahLogoUrl ? (
                <img src={logos.sekolahLogoUrl} className="max-h-full max-w-full object-contain" alt="Logo Sekolah" />
              ) : (
                <SchoolEmblemSvg className="w-20 h-20" />
              )}
            </div>

            <input
              type="file"
              ref={fileSekolahRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload('sekolah', e)}
            />
            <button
              type="button"
              onClick={() => fileSekolahRef.current?.click()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" /> Unggah Logo Sekolah
            </button>
          </div>

          {/* 3. Logo Sidebar */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center space-y-4 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-800 dark:text-white">Logo Sidebar Navigasi</h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Ikon brand pada menu navigasi samping</p>
            </div>

            <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center p-2 bg-white dark:bg-slate-900 overflow-hidden shadow-inner">
              {logos.sidebarLogoUrl ? (
                <img src={logos.sidebarLogoUrl} className="max-h-full max-w-full object-contain" alt="Logo Sidebar" />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <SchoolLogo url={logos.sekolahLogoUrl} className="w-16 h-16 object-contain" fallbackClassName="w-16 h-16" />
                  <span className="text-[9px] text-slate-400 mt-1 font-medium">Bawaan Sistem</span>
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileSidebarRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload('sidebar', e)}
            />
            <button
              type="button"
              onClick={() => fileSidebarRef.current?.click()}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Upload className="w-3.5 h-3.5" /> Unggah Logo Sidebar
            </button>
          </div>
        </div>

        {/* Sidebar Text Customization */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Kustomisasi Tulisan Nama Sekolah pada Sidebar Navigasi
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={sidebarText}
              onChange={(e) => setSidebarText(e.target.value)}
              placeholder="SMPN 18 JAKARTA"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold uppercase text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 transition"
            />
            <button
              type="button"
              onClick={handleSaveSidebarText}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Save className="w-4 h-4" /> Simpan Teks Sidebar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
