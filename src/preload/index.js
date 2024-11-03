import { contextBridge} from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  getConfiguration: () => electronAPI.ipcRenderer.invoke('IPC_GetConfig'),
  setHomeDirectory: (homeDir) => electronAPI.ipcRenderer.invoke('IPC_SetHomeDir', homeDir),
  sendToTrash: (file) => electronAPI.ipcRenderer.invoke('IPC_SendToTrash',file),
  clearTrash: () => electronAPI.ipcRenderer.invoke('IPC_ClearTrash'),
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI.ipcRenderer
  window.api = api
}
