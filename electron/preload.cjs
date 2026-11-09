const { contextBridge, ipcRenderer } = require('electron');

// Securely expose APIs to React app running in Electron
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  saveSetting: (key, value) => ipcRenderer.invoke('save-setting', { key, value }),
  printToPDF: (options) => ipcRenderer.invoke('print-to-pdf', options)
});
