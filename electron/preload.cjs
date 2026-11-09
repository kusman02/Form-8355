const { contextBridge, ipcRenderer } = require('electron');

// Securely expose APIs to React app running in Electron
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
  
  // General App Settings & Native PDF Print
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  saveSetting: (key, value) => ipcRenderer.invoke('save-setting', { key, value }),
  printToPDF: (options) => ipcRenderer.invoke('print-to-pdf', options),

  // Native File-based Database Engine
  db: {
    getAll: () => ipcRenderer.invoke('db:get-all'),
    saveAll: (payload) => ipcRenderer.invoke('db:save-all', payload),
    getCollection: (name) => ipcRenderer.invoke('db:get-collection', name),
    saveCollection: (name, data) => ipcRenderer.invoke('db:save-collection', { name, data }),
    insertItem: (collection, item) => ipcRenderer.invoke('db:insert-item', { collection, item }),
    updateItem: (collection, id, updates) => ipcRenderer.invoke('db:update-item', { collection, id, updates }),
    deleteItem: (collection, id) => ipcRenderer.invoke('db:delete-item', { collection, id }),
    getStats: () => ipcRenderer.invoke('db:get-stats'),
    backupDialog: () => ipcRenderer.invoke('db:backup-dialog'),
    restoreDialog: () => ipcRenderer.invoke('db:restore-dialog'),
    resetDialog: (seed) => ipcRenderer.invoke('db:reset-dialog', seed),
    openFolder: () => ipcRenderer.invoke('db:open-folder')
  }
});
