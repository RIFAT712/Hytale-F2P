const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  launchGame: (playerName, javaPath, installPath) => ipcRenderer.invoke('launch-game', playerName, javaPath, installPath),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  saveUsername: (username) => ipcRenderer.invoke('save-username', username),
  loadUsername: () => ipcRenderer.invoke('load-username'),
  saveJavaPath: (javaPath) => ipcRenderer.invoke('save-java-path', javaPath),
  loadJavaPath: () => ipcRenderer.invoke('load-java-path'),
  saveInstallPath: (installPath) => ipcRenderer.invoke('save-install-path', installPath),
  loadInstallPath: () => ipcRenderer.invoke('load-install-path'),
  selectInstallPath: () => ipcRenderer.invoke('select-install-path'),
  isGameInstalled: () => ipcRenderer.invoke('is-game-installed'),
  uninstallGame: () => ipcRenderer.invoke('uninstall-game'),
  onProgressUpdate: (callback) => {
    ipcRenderer.on('progress-update', (event, data) => callback(data));
  }
});
