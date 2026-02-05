const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openInBrowser: (url) => ipcRenderer.send('open-external-url', url),
  restartApp: () => ipcRenderer.send('restart-app'),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (event, value) => callback(value)),
  onUpdateFinished: (callback) => ipcRenderer.on('update-finished', () => callback()),
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});