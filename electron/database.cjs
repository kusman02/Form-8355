const fs = require('fs');
const path = require('path');
const { app } = require('electron');

/**
 * Robust JSON File-based Desktop Database Engine for Electron
 * - Atomic disk writes (temp file + rename)
 * - Automatic snapshot backups
 * - Full CRUD for all collections
 * - Schema validation & recovery
 */

function getDatabaseDir() {
  const baseDir = app.getPath('userData');
  const dbDir = path.join(baseDir, 'database');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  return dbDir;
}

function getDatabasePath() {
  return path.join(getDatabaseDir(), 'form8355.db.json');
}

function getBackupsDir() {
  const bDir = path.join(getDatabaseDir(), 'backups');
  if (!fs.existsSync(bDir)) {
    fs.mkdirSync(bDir, { recursive: true });
  }
  return bDir;
}

// In-memory cache
let _cachedDb = null;

/**
 * Returns default empty database structure
 */
function getDefaultSchema() {
  return {
    version: '2.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    schoolProfile: {
      instansiAtas: 'PEMERINTAH PROVINSI DAERAH KHUSUS IBUKOTA JAKARTA',
      dinas: 'DINAS PENDIDIKAN',
      name: 'SMP NEGERI 18 JAKARTA',
      npsn: '20100232',
      address: 'Jl. Menteng Kecil No. 3 RT 12 RW 9, Kebon Sirih, Menteng, Jakarta Pusat 10340',
      tempat: 'Jakarta',
      tanggal: '30 Oktober 2026'
    },
    officials: {
      kepsekName: 'Drs. H. Sukirman, M.Pd.',
      kepsekNip: '196508121990031004',
      pengawasName: 'Dra. Hj. Siti Rahmawati, M.M.',
      pengawasNip: '196703151992032001',
      kepsekTtdUrl: '',
      pengawasTtdUrl: ''
    },
    logos: {
      instansiLogoUrl: '',
      sekolahLogoUrl: '',
      sidebarLogoUrl: '',
      sidebarTextName: 'SMPN 18 JAKARTA'
    },
    tahunAjaran: '2026/2027',
    availableYears: ['2023/2024', '2024/2025', '2025/2026', '2026/2027', '2027/2028', '2028/2029', '2029/2030'],
    userAccounts: [
      {
        id: 1,
        nama: 'Nuryaman, S.Kom.',
        email: 'admin@smpn18.sch.id',
        username: '123',
        password: '123',
        role: 'Admin',
        info: 'Operator Utama Sistem Data 8355'
      },
      {
        id: 2,
        nama: 'Drs. H. Sukirman, M.Pd.',
        email: 'kepsek@smpn18.sch.id',
        username: 'kepsek',
        password: '123',
        role: 'Kepala Sekolah',
        info: 'Kepala SMPN 18 Jakarta'
      },
      {
        id: 3,
        nama: 'Dra. Hj. Siti Marwiyah, M.Pd.',
        email: 'marwiyah@smpn18.sch.id',
        username: 'guru',
        password: '123',
        role: 'Guru',
        info: 'Wali Kelas VII-A'
      }
    ],
    waliList: [
      { id: 1, rombel: 'KELAS VII-A', nama: 'Dra. Hj. Siti Marwiyah, M.Pd.', nip: '196804151994122001' },
      { id: 2, rombel: 'KELAS VII-B', nama: 'Bambang Sutrisno, S.Pd.', nip: '197203101998021003' },
      { id: 3, rombel: 'KELAS VII-C', nama: 'Sri Wahyuni, M.Pd.', nip: '197509202000122002' },
      { id: 4, rombel: 'KELAS VIII-A', nama: 'Ahmad Fauzi, S.Pd.', nip: '198001052005011004' },
      { id: 5, rombel: 'KELAS VIII-B', nama: 'Rina Kartika, M.Pd.', nip: '198206142008012007' },
      { id: 6, rombel: 'KELAS IX-A', nama: 'Drs. Hendro Wibowo', nip: '196611221993031002' }
    ],
    students: [],
    mutasiList: [],
    settings: {
      darkMode: false,
      autoBackup: true,
      backupIntervalHours: 24
    }
  };
}

/**
 * Creates an automatic snapshot backup of the current database
 */
function createAutoBackup(data) {
  try {
    const bDir = getBackupsDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(bDir, `backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf-8');

    // Keep only the most recent 15 backups to save disk space
    const files = fs.readdirSync(bDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .map(f => ({ name: f, time: fs.statSync(path.join(bDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 15) {
      files.slice(15).forEach(f => {
        try {
          fs.unlinkSync(path.join(bDir, f.name));
        } catch {}
      });
    }
  } catch (err) {
    console.error('Failed to create auto backup:', err);
  }
}

/**
 * Reads database from disk with caching and error recovery
 */
function readDatabase() {
  const dbPath = getDatabasePath();

  if (_cachedDb) {
    return _cachedDb;
  }

  if (fs.existsSync(dbPath)) {
    try {
      const content = fs.readFileSync(dbPath, 'utf-8');
      const parsed = JSON.parse(content);
      _cachedDb = Object.assign(getDefaultSchema(), parsed);
      return _cachedDb;
    } catch (err) {
      console.error('Database file corrupted, attempting restore from latest backup:', err);
      // Attempt restore from backup
      const bDir = getBackupsDir();
      const backups = fs.readdirSync(bDir)
        .filter(f => f.endsWith('.json'))
        .map(f => path.join(bDir, f))
        .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());

      if (backups.length > 0) {
        try {
          const restored = JSON.parse(fs.readFileSync(backups[0], 'utf-8'));
          _cachedDb = Object.assign(getDefaultSchema(), restored);
          saveDatabase(_cachedDb, false);
          return _cachedDb;
        } catch {}
      }
    }
  }

  // First run: seed default database
  const freshDb = getDefaultSchema();
  saveDatabase(freshDb, false);
  _cachedDb = freshDb;
  return _cachedDb;
}

/**
 * Saves database atomically to disk: write to .tmp then rename
 */
function saveDatabase(data, makeBackup = true) {
  try {
    const dbPath = getDatabasePath();
    const tmpPath = `${dbPath}.tmp`;
    
    data.updatedAt = new Date().toISOString();
    const content = JSON.stringify(data, null, 2);

    fs.writeFileSync(tmpPath, content, 'utf-8');
    fs.renameSync(tmpPath, dbPath);
    _cachedDb = data;

    if (makeBackup) {
      createAutoBackup(data);
    }
    return true;
  } catch (err) {
    console.error('Failed to save database atomically:', err);
    return false;
  }
}

/**
 * Database Module Interface
 */
const Database = {
  // Get entire database
  getAll() {
    return readDatabase();
  },

  // Save entire database
  saveAll(payload) {
    if (!payload || typeof payload !== 'object') return false;
    const current = readDatabase();
    const merged = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString()
    };
    return saveDatabase(merged, true);
  },

  // Get single collection or property
  getCollection(name) {
    const db = readDatabase();
    return db[name] !== undefined ? db[name] : null;
  },

  // Save single collection or property
  saveCollection(name, data) {
    const db = readDatabase();
    db[name] = data;
    return saveDatabase(db, true);
  },

  // Insert item into collection
  insertItem(collectionName, item) {
    const db = readDatabase();
    if (!Array.isArray(db[collectionName])) {
      db[collectionName] = [];
    }
    const newItem = {
      ...item,
      id: item.id || Date.now()
    };
    db[collectionName].unshift(newItem);
    const success = saveDatabase(db, true);
    return success ? newItem : null;
  },

  // Update item in collection
  updateItem(collectionName, id, updates) {
    const db = readDatabase();
    if (!Array.isArray(db[collectionName])) return false;
    const idx = db[collectionName].findIndex(x => String(x.id) === String(id));
    if (idx === -1) return false;
    db[collectionName][idx] = { ...db[collectionName][idx], ...updates };
    return saveDatabase(db, true);
  },

  // Delete item from collection
  deleteItem(collectionName, id) {
    const db = readDatabase();
    if (!Array.isArray(db[collectionName])) return false;
    db[collectionName] = db[collectionName].filter(x => String(x.id) !== String(id));
    return saveDatabase(db, true);
  },

  // Export full backup to chosen file path
  exportBackup(targetPath) {
    try {
      const db = readDatabase();
      fs.writeFileSync(targetPath, JSON.stringify(db, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error exporting backup:', err);
      return false;
    }
  },

  // Import backup from file path
  importBackup(sourcePath) {
    try {
      if (!fs.existsSync(sourcePath)) return false;
      const content = fs.readFileSync(sourcePath, 'utf-8');
      const parsed = JSON.parse(content);
      if (!parsed || typeof parsed !== 'object') return false;
      
      const schema = getDefaultSchema();
      const merged = { ...schema, ...parsed, updatedAt: new Date().toISOString() };
      return saveDatabase(merged, true);
    } catch (err) {
      console.error('Error importing backup:', err);
      return false;
    }
  },

  // Reset database to initial default
  resetToDefault(initialSeed = null) {
    const fresh = initialSeed && typeof initialSeed === 'object' 
      ? { ...getDefaultSchema(), ...initialSeed }
      : getDefaultSchema();
    return saveDatabase(fresh, true);
  },

  // Get statistics
  getStats() {
    try {
      const dbPath = getDatabasePath();
      const bDir = getBackupsDir();
      const db = readDatabase();

      let fileSize = '0 KB';
      let lastModified = '-';
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        const kb = (stats.size / 1024).toFixed(1);
        fileSize = stats.size > 1024 * 1024 ? `${(stats.size / (1024 * 1024)).toFixed(2)} MB` : `${kb} KB`;
        lastModified = stats.mtime.toLocaleString('id-ID');
      }

      const backupsCount = fs.existsSync(bDir)
        ? fs.readdirSync(bDir).filter(f => f.endsWith('.json')).length
        : 0;

      return {
        isElectron: true,
        dbPath,
        dbDir: getDatabaseDir(),
        backupsDir: bDir,
        fileSize,
        lastModified,
        backupsCount,
        counts: {
          students: Array.isArray(db.students) ? db.students.length : 0,
          waliList: Array.isArray(db.waliList) ? db.waliList.length : 0,
          mutasiList: Array.isArray(db.mutasiList) ? db.mutasiList.length : 0,
          userAccounts: Array.isArray(db.userAccounts) ? db.userAccounts.length : 0
        },
        tahunAjaran: db.tahunAjaran || '2026/2027',
        schoolName: db.schoolProfile?.name || 'SMP NEGERI 18 JAKARTA'
      };
    } catch (err) {
      console.error('Error getting stats:', err);
      return null;
    }
  }
};

module.exports = Database;
