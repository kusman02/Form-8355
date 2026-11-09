import React, { useState, useEffect } from 'react';
import {
  Database,
  HardDrive,
  FolderOpen,
  Download,
  Upload,
  RefreshCw,
  RotateCcw,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  ShieldCheck,
  Server,
  Layers,
  Users,
  UserCheck,
  ArrowLeftRight,
  School,
  Terminal,
  ExternalLink
} from 'lucide-react';
import {
  isElectronApp,
  getDatabaseStats,
  exportDatabaseBackup,
  DatabaseStats
} from '../utils/electronBridge';
import {
  Student,
  WaliKelas,
  Mutasi,
  UserAccount,
  SchoolProfile,
  Officials,
  LogoConfig
} from '../types';

interface DatabaseDesktopViewProps {
  students: Student[];
  waliList: WaliKelas[];
  mutasiList: Mutasi[];
  userAccounts: UserAccount[];
  school: SchoolProfile;
  officials: Officials;
  logos: LogoConfig;
  tahunAjaran: string;
  onRestoreData?: (restored: {
    students?: Student[];
    waliList?: WaliKelas[];
    mutasiList?: Mutasi[];
    userAccounts?: UserAccount[];
    schoolProfile?: SchoolProfile;
    officials?: Officials;
    logos?: LogoConfig;
    tahunAjaran?: string;
  }) => void;
  showToast: (msg: string) => void;
}

export const DatabaseDesktopView: React.FC<DatabaseDesktopViewProps> = ({
  students,
  waliList,
  mutasiList,
  userAccounts,
  school,
  officials,
  logos,
  tahunAjaran,
  onRestoreData,
  showToast
}) => {
  const isDesktop = isElectronApp();
  const [stats, setStats] = useState<DatabaseStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState<boolean>(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const s = await getDatabaseStats();
      setStats(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [students.length, waliList.length, mutasiList.length, userAccounts.length]);

  // Handle Backup
  const handleBackup = async () => {
    setActionLoading(true);
    try {
      const fullData = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        schoolProfile: school,
        officials,
        logos,
        tahunAjaran,
        students,
        waliList,
        mutasiList,
        userAccounts
      };

      const result = await exportDatabaseBackup(fullData);
      if (result.success) {
        showToast(result.message || 'Cadangan database berhasil disimpan!');
        fetchStats();
      } else if (result.message !== 'Dibatalkan oleh pengguna') {
        showToast(result.message || 'Gagal mencadangkan database');
      }
    } catch (err: any) {
      showToast(err?.message || 'Terjadi kesalahan saat mencadangkan.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Restore
  const handleRestore = async () => {
    if (isDesktop && window.electronAPI?.db?.restoreDialog) {
      setActionLoading(true);
      try {
        const res = await window.electronAPI.db.restoreDialog();
        if (res.success && res.data) {
          if (onRestoreData) {
            onRestoreData(res.data);
          }
          showToast('Database berhasil dipulihkan dari file cadangan!');
          fetchStats();
        } else if (res.message && res.message !== 'Dibatalkan oleh pengguna') {
          showToast(res.message);
        }
      } catch (err: any) {
        showToast(err?.message || 'Gagal memulihkan database.');
      } finally {
        setActionLoading(false);
      }
      return;
    }

    // Web File input fallback
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          if (onRestoreData) {
            onRestoreData({
              students: parsed.students || parsed.studentsList,
              waliList: parsed.waliList,
              mutasiList: parsed.mutasiList,
              userAccounts: parsed.userAccounts || parsed.users,
              schoolProfile: parsed.schoolProfile || parsed.school,
              officials: parsed.officials,
              logos: parsed.logos,
              tahunAjaran: parsed.tahunAjaran
            });
          }
          showToast('Database web berhasil dipulihkan dari file JSON!');
          fetchStats();
        } catch {
          showToast('File JSON tidak valid atau rusak.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  // Handle Open DB Folder
  const handleOpenFolder = async () => {
    if (isDesktop && window.electronAPI?.db?.openFolder) {
      const res = await window.electronAPI.db.openFolder();
      if (res.success) {
        showToast(`Membuka folder database: ${res.path}`);
      } else {
        showToast(res.message || 'Gagal membuka folder penyimpanan');
      }
    } else {
      showToast('Penyimpanan berjalan di memori peramban (Web LocalStorage).');
    }
  };

  // Handle Reset Database
  const handleReset = async () => {
    if (isDesktop && window.electronAPI?.db?.resetDialog) {
      const res = await window.electronAPI.db.resetDialog();
      if (res.success && res.data) {
        if (onRestoreData) {
          onRestoreData(res.data);
        }
        showToast('Database telah direset ke setelan awal pabrik.');
        setResetConfirmOpen(false);
        fetchStats();
        return;
      }
    }

    localStorage.clear();
    showToast('Penyimpanan lokal berhasil dibersihkan.');
    setResetConfirmOpen(false);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800 dark:text-white">
                Pusat Manajemen Database & Backup Desktop
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sistem database offline aman berintegritas tinggi dengan fitur atomic write, backup berkala, dan pemulihan otomatis
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
                isDesktop
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>{isDesktop ? 'Mode Native Desktop (Electron DB)' : 'Mode Universal Web (LocalStorage DB)'}</span>
            </span>

            <button
              type="button"
              onClick={fetchStats}
              disabled={loading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Segarkan Data Statistik"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* 1. STATUS DATABASE ENGINE CARD */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl border border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {isDesktop ? 'Mesin Database Berkas Lokal Aktif' : 'Mesin Database Virtual Browser Aktif'}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Online & Persisten
                </span>
              </div>
              <h4 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>form8355.db.json</span>
                <span className="text-xs font-normal text-slate-400">({stats?.fileSize || '0 KB'})</span>
              </h4>
              <p className="text-xs text-slate-300 font-mono break-all bg-black/40 px-3 py-2 rounded-xl border border-slate-700/60">
                <strong className="text-slate-400 font-sans">Lokasi Berkas: </strong>
                {stats?.dbPath || (isDesktop ? 'Memuat lokasi berkas OS...' : 'Indexed LocalStorage Key-Value Container')}
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end gap-2 w-full md:w-auto">
              {isDesktop && (
                <button
                  type="button"
                  onClick={handleOpenFolder}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-600 transition flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center"
                >
                  <FolderOpen className="w-4 h-4 text-amber-400" />
                  <span>Buka Folder Database</span>
                </button>
              )}
              <div className="text-[11px] text-slate-400">
                Pembaruan: <strong className="text-white">{stats?.lastModified || '-'}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* 2. STATS DATA GRID */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Statistik Isi Database Form 8355:</span>
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-bold">Data Siswa</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {students.length}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Buku Induk Form 8355
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
                <UserCheck className="w-4 h-4" />
                <span className="text-xs font-bold">Wali Kelas</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {waliList.length}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Rombel Terdaftar
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-1">
                <ArrowLeftRight className="w-4 h-4" />
                <span className="text-xs font-bold">Riwayat Mutasi</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {mutasiList.length}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Mutasi Masuk & Keluar
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                <School className="w-4 h-4" />
                <span className="text-xs font-bold">Akun Pengguna</span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white">
                {userAccounts.length}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Admin, Kepsek & Guru
              </p>
            </div>
          </div>
        </div>

        {/* 3. TOMBOL AKSI UTAMA BACKUP & RESTORE */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-emerald-500" />
            <span>Operasi Pemeliharaan & Keamanan Data:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: Backup */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                  <Download className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-white">
                  Cadangkan Database (Backup JSON)
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Ekspor seluruh data siswa, profil sekolah, riwayat mutasi, dan akun pengguna ke file JSON untuk disimpan di flashdisk atau drive aman.
                </p>
              </div>

              <button
                type="button"
                onClick={handleBackup}
                disabled={actionLoading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Download className="w-4 h-4" />
                <span>{actionLoading ? 'Menyimpan...' : 'Cadangkan Sekarang'}</span>
              </button>
            </div>

            {/* Card 2: Restore */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-2">
                  <Upload className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-white">
                  Pulihkan Database (Restore JSON)
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Muat ulang data dari file cadangan sebelumnya. Berguna saat memindahkan aplikasi ke komputer baru atau pemulihan berkas.
                </p>
              </div>

              <button
                type="button"
                onClick={handleRestore}
                disabled={actionLoading}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition active:scale-95 cursor-pointer disabled:opacity-60"
              >
                <Upload className="w-4 h-4" />
                <span>Pilih File & Pulihkan</span>
              </button>
            </div>

            {/* Card 3: Reset */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3">
              <div>
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-2">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-sm text-slate-800 dark:text-white">
                  Reset Database Standar
                </h5>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Mengembalikan struktur dan data default awal aplikasi. Tindakan ini memerlukan konfirmasi keamanan terlebih dahulu.
                </p>
              </div>

              {!resetConfirmOpen ? (
                <button
                  type="button"
                  onClick={() => setResetConfirmOpen(true)}
                  className="w-full py-2.5 px-4 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold text-xs rounded-xl border border-rose-200 dark:border-rose-900 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Database</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Ya, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetConfirmOpen(false)}
                    className="py-2 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. PANDUAN LENGKAP RUNNING & PACKAGING ELECTRON */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-500" />
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Panduan Menjalankan & Memaketkan Aplikasi Desktop Electron
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Langkah-langkah menjalankan aplikasi secara mandiri di komputer offline (Windows, Mac, Linux)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>1. Menjalankan Mode Desktop (Development)</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Buka terminal di folder proyek dan jalankan perintah:
              </p>
              <pre className="p-2.5 bg-slate-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
npm run electron:start
              </pre>
              <p className="text-[11px] text-slate-500 italic">
                Jendela desktop akan terbuka otomatis dengan integrasi berkas database fisik.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>2. Membangun Aset Produksi Desktop</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Bangun berkas bundle distribusi dengan path relatif offline:
              </p>
              <pre className="p-2.5 bg-slate-900 text-blue-400 rounded-lg font-mono text-[11px] overflow-x-auto">
npm run build:electron
              </pre>
              <p className="text-[11px] text-slate-500 italic">
                Seluruh pustaka otomatis dikompilasi ke folder <code className="text-white">dist/</code> siap dibuka secara offline melalui protokol file://.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold">Keamanan & Keandalan Database Desktop (Atomic Writes):</strong>
              <p className="leading-relaxed">
                Database aplikasi disimpan di direktori data aplikasi sistem operasi pengguna (<code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded font-mono text-[11px]">app.getPath('userData')/database/form8355.db.json</code>). Setiap proses penulisan dilakukan secara atomik (menulis ke file sementara <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded font-mono text-[11px]">.tmp</code> lalu me-rename secara instan) sehingga data tidak akan pernah rusak jika komputer mati mendadak. Sistem juga otomatis menyimpan hingga 15 berkas cadangan snapshot bergulir di sub-folder <code className="px-1 py-0.5 bg-blue-100 dark:bg-blue-900/60 rounded font-mono text-[11px]">backups/</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
