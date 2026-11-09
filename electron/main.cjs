const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Database = require('./database.cjs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'Sistem Data Form 8355 SMPN 18 Jakarta - Desktop Edition',
    backgroundColor: '#090d16',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false
    },
    autoHideMenuBar: false
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const devUrl = process.env.ELECTRON_START_URL || 'http://localhost:3000/Form-8355/';

  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(devUrl);
  } else {
    const distPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(distPath)) {
      mainWindow.loadFile(distPath);
    } else {
      mainWindow.loadURL(devUrl);
    }
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ==========================================
// IPC HANDLERS: DESKTOP DATABASE ENGINE
// ==========================================

// 1. Get entire database
ipcMain.handle('db:get-all', async () => {
  return Database.getAll();
});

// 2. Save entire database
ipcMain.handle('db:save-all', async (event, payload) => {
  return Database.saveAll(payload);
});

// 3. Get single collection
ipcMain.handle('db:get-collection', async (event, name) => {
  return Database.getCollection(name);
});

// 4. Save single collection
ipcMain.handle('db:save-collection', async (event, { name, data }) => {
  return Database.saveCollection(name, data);
});

// 5. Insert item into collection
ipcMain.handle('db:insert-item', async (event, { collection, item }) => {
  return Database.insertItem(collection, item);
});

// 6. Update item in collection
ipcMain.handle('db:update-item', async (event, { collection, id, updates }) => {
  return Database.updateItem(collection, id, updates);
});

// 7. Delete item from collection
ipcMain.handle('db:delete-item', async (event, { collection, id }) => {
  return Database.deleteItem(collection, id);
});

// 8. Get database statistics & storage path info
ipcMain.handle('db:get-stats', async () => {
  return Database.getStats();
});

// 9. Native Save Backup Dialog
ipcMain.handle('db:backup-dialog', async () => {
  if (!mainWindow) return { success: false, message: 'Window not ready' };
  try {
    const dateStr = new Date().toISOString().slice(0, 10);
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Cadangkan Database Aplikasi Form 8355',
      defaultPath: `Backup_Database_Form8355_${dateStr}.json`,
      filters: [{ name: 'JSON Backup Database', extensions: ['json'] }]
    });

    if (filePath) {
      const ok = Database.exportBackup(filePath);
      return { success: ok, filePath, message: ok ? 'Database berhasil dicadangkan' : 'Gagal mencadangkan database' };
    }
    return { success: false, message: 'Dibatalkan oleh pengguna' };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// 10. Native Restore Backup Dialog
ipcMain.handle('db:restore-dialog', async () => {
  if (!mainWindow) return { success: false, message: 'Window not ready' };
  try {
    const { filePaths } = await dialog.showOpenDialog(mainWindow, {
      title: 'Pilih File Cadangan Database Form 8355',
      filters: [{ name: 'JSON Database Backup', extensions: ['json'] }],
      properties: ['openFile']
    });

    if (filePaths && filePaths.length > 0) {
      const ok = Database.importBackup(filePaths[0]);
      if (ok) {
        const fullData = Database.getAll();
        return { success: true, data: fullData, message: 'Database berhasil dipulihkan dari cadangan' };
      }
      return { success: false, message: 'Format file cadangan tidak valid' };
    }
    return { success: false, message: 'Dibatalkan oleh pengguna' };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// 11. Reset Database to Default
ipcMain.handle('db:reset-dialog', async (event, initialSeed) => {
  const ok = Database.resetToDefault(initialSeed);
  if (ok) {
    return { success: true, data: Database.getAll() };
  }
  return { success: false };
});

// 12. Open Database Storage Folder in OS File Explorer
ipcMain.handle('db:open-folder', async () => {
  try {
    const stats = Database.getStats();
    if (stats && stats.dbDir) {
      await shell.openPath(stats.dbDir);
      return { success: true, path: stats.dbDir };
    }
    return { success: false };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

// ==========================================
// IPC HANDLERS: GENERAL SETTINGS & PDF PRINT
// ==========================================

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'app-settings.json');
}

ipcMain.handle('get-setting', async (event, key) => {
  try {
    const filePath = getSettingsPath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      return key ? data[key] : data;
    }
  } catch (err) {
    console.error('Error reading settings:', err);
  }
  return null;
});

ipcMain.handle('save-setting', async (event, { key, value }) => {
  try {
    const filePath = getSettingsPath();
    let currentData = {};
    if (fs.existsSync(filePath)) {
      try {
        currentData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      } catch {}
    }
    currentData[key] = value;
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving setting:', err);
    return false;
  }
});

// Native Print to PDF via Electron
ipcMain.handle('print-to-pdf', async (event, options = {}) => {
  if (!mainWindow) return false;
  try {
    const isLandscape = options.orientation === 'landscape';
    const pdfData = await mainWindow.webContents.printToPDF({
      landscape: isLandscape,
      pageSize: 'A4',
      printBackground: true,
      margins: { top: 0.2, bottom: 0.2, left: 0.2, right: 0.2 }
    });

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Simpan Dokumen PDF (Desktop)',
      defaultPath: options.filename || 'Dokumen_Form8355.pdf',
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }]
    });

    if (filePath) {
      fs.writeFileSync(filePath, pdfData);
      return true;
    }
  } catch (err) {
    console.error('Failed to print to PDF:', err);
  }
  return false;
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
