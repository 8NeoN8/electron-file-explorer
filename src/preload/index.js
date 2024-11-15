import { contextBridge} from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  testingMsg: () => electronAPI.ipcRenderer.invoke('testingMsg'),
  getConfiguration: () => electronAPI.ipcRenderer.invoke('IPC_GetConfig'),
  setHomeDirectory: (homeDir) => electronAPI.ipcRenderer.invoke('IPC_SetHomeDir', homeDir),
  sendToTrash: (file) => electronAPI.ipcRenderer.invoke('IPC_SendToTrash',file),
  clearTrash: () => electronAPI.ipcRenderer.invoke('IPC_ClearTrash'),
  createFile: async (path, name) => electronAPI.ipcRenderer.invoke('IPC_CreateFile', {path, name}),
  createDir: async (path, name) => electronAPI.ipcRenderer.invoke('IPC_CreateDir', {path, name}),
  getDirInfo: async (dir) => electronAPI. ipcRenderer.invoke('IPC_GetDirInfo', dir),
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
