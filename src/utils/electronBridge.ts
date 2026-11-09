/**
 * Electron & Web Universal Bridge
 * Provides cross-environment support for:
 * 1. Detecting if the application is running in an Electron desktop shell.
 * 2. Persistent storage for 'tahunAjaran', 'tempat', and 'tanggal' (Titimangsa Pengesahan).
 * 3. Formatting titimangsa: `${tempat}, ${tanggal}` consistently across all documents.
 * 4. Safe IPC communication with Electron main process when available.
 */

export interface SignatureLocationDate {
  tempat: string;
  tanggal: string;
}

export interface ElectronAPI {
  isElectron: boolean;
  platform?: string;
  getSetting?: (key: string) => Promise<any>;
  saveSetting?: (key: string, value: any) => Promise<boolean>;
  printToPDF?: (options?: any) => Promise<boolean>;
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

// Storage keys
const KEY_TAHUN_AJARAN = 'smpn18_tahun_ajaran';
const KEY_TEMPAT = 'smpn18_titimangsa_tempat';
const KEY_TANGGAL = 'smpn18_titimangsa_tanggal';

/**
 * Get current Tahun Ajaran
 */
export const getStoredTahunAjaran = (fallback = '2026/2027'): string => {
  try {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(KEY_TAHUN_AJARAN) || fallback;
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
      localStorage.setItem(KEY_TAHUN_AJARAN, cleanYear);
    }
    if (window.electronAPI?.saveSetting) {
      window.electronAPI.saveSetting('tahunAjaran', cleanYear);
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
      const savedTempat = localStorage.getItem(KEY_TEMPAT);
      const savedTanggal = localStorage.getItem(KEY_TANGGAL);
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
      localStorage.setItem(KEY_TEMPAT, tempat);
      localStorage.setItem(KEY_TANGGAL, tanggal);
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
