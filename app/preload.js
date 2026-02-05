const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Function to open external links
  openInBrowser: (url) => ipcRenderer.send('open-external-url', url),

  // Optional: Get app version (useful for your "About" or "Update" UI)
  getAppVersion: () => ipcRenderer.invoke('get-app-version')
});