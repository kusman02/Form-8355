const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'Aplikasi Form 8355 & Administrasi Siswa',
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

function getSettingsPath() {
  return path.join(app.getPath('userData'), 'app-settings.json');
}

// IPC Handlers for Settings Persistence
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
    const pdfData = await mainWindow.webContents.printToPDF({
      landscape: options.orientation === 'landscape',
      pageSize: 'A4',
      printBackground: true,
      margins: { top: 0.2, bottom: 0.2, left: 0.2, right: 0.2 }
    });

    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Simpan Dokumen PDF',
      defaultPath: options.filename || 'Dokumen_Sekolah.pdf',
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
