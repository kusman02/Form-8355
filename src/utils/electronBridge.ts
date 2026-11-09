/**
 * Electron & Web Universal Bridge & Desktop Database Client
 * Provides cross-environment support for:
 * 1. Detecting if the application is running in an Electron desktop shell.
 * 2. Persistent file-based JSON database engine in Electron (userData/database/form8355.db.json).
 * 3. Fallback to localStorage in web browsers with identical data structures.
 * 4. Desktop backup, restore, reset, and stats inspection.
 * 5. Formatting titimangsa: `${tempat}, ${tanggal}` consistently across all documents.
 */

export interface SignatureLocationDate {
  tempat: string;
  tanggal: string;
}

export interface DatabaseCounts {
  students: number;
  waliList: number;
  mutasiList: number;
  userAccounts: number;
}

export interface DatabaseStats {
  isElectron: boolean;
  dbPath?: string;
  dbDir?: string;
  backupsDir?: string;
  fileSize: string;
  lastModified: string;
  backupsCount: number;
  counts: DatabaseCounts;
  tahunAjaran: string;
  schoolName: string;
}

export interface ElectronDBAPI {
  getAll: () => Promise<any>;
  saveAll: (payload: any) => Promise<boolean>;
  getCollection: (name: string) => Promise<any>;
  saveCollection: (name: string, data: any) => Promise<boolean>;
  insertItem: (collection: string, item: any) => Promise<any>;
  updateItem: (collection: string, id: string | number, updates: any) => Promise<boolean>;
  deleteItem: (collection: string, id: string | number) => Promise<boolean>;
  getStats: () => Promise<DatabaseStats | null>;
  backupDialog: () => Promise<{ success: boolean; filePath?: string; message?: string }>;
  restoreDialog: () => Promise<{ success: boolean; data?: any; message?: string }>;
  resetDialog: (seed?: any) => Promise<{ success: boolean; data?: any }>;
  openFolder: () => Promise<{ success: boolean; path?: string; message?: string }>;
}

export interface ElectronAPI {
  isElectron: boolean;
  platform?: string;
  getSetting?: (key: string) => Promise<any>;
  saveSetting?: (key: string, value: any) => Promise<boolean>;
  printToPDF?: (options?: any) => Promise<boolean>;
  db?: ElectronDBAPI;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    electron?: any;
    require?: any;
  }
}

/**
 * Detects whether the app is executing inside an Electron desktop window
 */
export const isElectronApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    window.electronAPI?.isElectron ||
    window.electron ||
    (typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes(' electron/')) ||
    (window as any).process?.versions?.electron
  );
};

// Storage keys for browser fallback
export const STORAGE_KEYS = {
  SCHOOL: 'smpn18_schoolProfile_v2',
  OFFICIALS: 'smpn18_officials_v2',
  LOGOS: 'smpn18_logos',
  USERS: 'smpn18_userAccounts',
  WALIS: 'smpn18_waliList',
  STUDENTS: 'smpn18_students',
  MUTASI: 'smpn18_mutasiList',
  TAHUN_AJARAN: 'smpn18_tahun_ajaran',
  TAHUN_AJARAN_LIST: 'smpn18_tahun_ajaran_list',
  TEMPAT: 'smpn18_titimangsa_tempat',
  TANGGAL: 'smpn18_titimangsa_tanggal',
  DARK_MODE: 'smpn18_dark_mode'
};

/**
 * Get current Tahun Ajaran
 */
export const getStoredTahunAjaran = (fallback = '2026/2027'): string => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.TAHUN_AJARAN) || fallback;
    }
  } catch {
    // Ignore error
  }
  return fallback;
};

/**
 * Save Tahun Ajaran to LocalStorage and Electron if available
 */
export const setStoredTahunAjaran = (year: string): void => {
  const cleanYear = year.trim();
  if (!cleanYear) return;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TAHUN_AJARAN, cleanYear);
    }
    if (window.electronAPI?.db?.saveCollection) {
      window.electronAPI.db.saveCollection('tahunAjaran', cleanYear);
    }
  } catch (e) {
    console.warn('Error saving tahun ajaran:', e);
  }
};

/**
 * Get tempat dan tanggal sebelum tanda tangan (Titimangsa)
 */
export const getStoredSignatureLocationDate = (
  fallbackTempat = 'Jakarta',
  fallbackTanggal = '30 Oktober 2026'
): SignatureLocationDate => {
  let tempat = fallbackTempat;
  let tanggal = fallbackTanggal;
  try {
    if (typeof localStorage !== 'undefined') {
      const savedTempat = localStorage.getItem(STORAGE_KEYS.TEMPAT);
      const savedTanggal = localStorage.getItem(STORAGE_KEYS.TANGGAL);
      if (savedTempat) tempat = savedTempat;
      if (savedTanggal) tanggal = savedTanggal;
    }
  } catch {
    // Ignore error
  }
  return { tempat, tanggal };
};

/**
 * Save tempat dan tanggal sebelum tanda tangan
 */
export const setStoredSignatureLocationDate = (tempat: string, tanggal: string): void => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TEMPAT, tempat);
      localStorage.setItem(STORAGE_KEYS.TANGGAL, tanggal);
    }
    if (window.electronAPI?.saveSetting) {
      window.electronAPI.saveSetting('titimangsa', { tempat, tanggal });
    }
  } catch (e) {
    console.warn('Error saving titimangsa:', e);
  }
};

/**
 * Standard Indonesian Titimangsa Formatter
 * E.g. "Jakarta, 30 Oktober 2026"
 */
export const formatSignatureDate = (tempat?: string, tanggal?: string): string => {
  const cleanTempat = (tempat && tempat.trim()) ? tempat.trim() : 'Jakarta';
  const cleanTanggal = (tanggal && tanggal.trim()) ? tanggal.trim() : '30 Oktober 2026';
  return `${cleanTempat}, ${cleanTanggal}`;
};

/**
 * Sync an entity collection to Electron Desktop Database & LocalStorage
 */
export const syncCollectionToDatabase = async (collectionName: string, data: any): Promise<void> => {
  try {
    if (window.electronAPI?.db?.saveCollection) {
      await window.electronAPI.db.saveCollection(collectionName, data);
    }
  } catch (err) {
    console.warn(`Failed to sync ${collectionName} to Electron DB:`, err);
  }
};

/**
 * Fetch full database stats (storage path, size, counts)
 */
export const getDatabaseStats = async (): Promise<DatabaseStats> => {
  if (isElectronApp() && window.electronAPI?.db?.getStats) {
    const stats = await window.electronAPI.db.getStats();
    if (stats) return stats;
  }

  // Browser fallback stats
  let totalBytes = 0;
  let studentsCount = 0;
  let waliCount = 0;
  let mutasiCount = 0;
  let usersCount = 0;
  let schoolName = 'SMP NEGERI 18 JAKARTA';
  let tahunAjaran = '2026/2027';

  try {
    if (typeof localStorage !== 'undefined') {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('smpn18_')) {
          const val = localStorage.getItem(key) || '';
          totalBytes += (key.length + val.length) * 2;
        }
      }
      const st = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (st) studentsCount = JSON.parse(st).length;
      const wl = localStorage.getItem(STORAGE_KEYS.WALIS);
      if (wl) waliCount = JSON.parse(wl).length;
      const mt = localStorage.getItem(STORAGE_KEYS.MUTASI);
      if (mt) mutasiCount = JSON.parse(mt).length;
      const us = localStorage.getItem(STORAGE_KEYS.USERS);
      if (us) usersCount = JSON.parse(us).length;
      const sc = localStorage.getItem(STORAGE_KEYS.SCHOOL);
      if (sc) schoolName = JSON.parse(sc).name || schoolName;
      tahunAjaran = localStorage.getItem(STORAGE_KEYS.TAHUN_AJARAN) || tahunAjaran;
    }
  } catch {}

  const kb = (totalBytes / 1024).toFixed(1);
  return {
    isElectron: false,
    dbPath: 'Browser LocalStorage Virtual Database',
    dbDir: 'Browser Storage (Indexed / LocalStorage Key-Value)',
    fileSize: `${kb} KB`,
    lastModified: new Date().toLocaleDateString('id-ID'),
    backupsCount: 0,
    counts: {
      students: studentsCount,
      waliList: waliCount,
      mutasiList: mutasiCount,
      userAccounts: usersCount
    },
    tahunAjaran,
    schoolName
  };
};

/**
 * Native or Web Database Backup trigger
 */
export const exportDatabaseBackup = async (fullDataPayload?: any): Promise<{ success: boolean; message: string; filePath?: string }> => {
  if (isElectronApp() && window.electronAPI?.db?.backupDialog) {
    const res = await window.electronAPI.db.backupDialog();
    return {
      success: res.success,
      message: res.message || (res.success ? 'Cadangan berhasil disimpan.' : 'Pencadangan dibatalkan.'),
      filePath: res.filePath
    };
  }

  // Web Browser Download fallback
  try {
    const payload = fullDataPayload || {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      school: JSON.parse(localStorage.getItem(STORAGE_KEYS.SCHOOL) || '{}'),
      officials: JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFICIALS) || '{}'),
      logos: JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGOS) || '{}'),
      userAccounts: JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
      waliList: JSON.parse(localStorage.getItem(STORAGE_KEYS.WALIS) || '[]'),
      students: JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]'),
      mutasiList: JSON.parse(localStorage.getItem(STORAGE_KEYS.MUTASI) || '[]'),
      tahunAjaran: localStorage.getItem(STORAGE_KEYS.TAHUN_AJARAN) || '2026/2027'
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Backup_Database_Form8355_${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, message: 'File cadangan JSON berhasil diunduh ke komputer Anda.' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Gagal membuat cadangan database.' };
  }
};
