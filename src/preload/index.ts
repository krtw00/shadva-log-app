import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  addMatch: (match) => ipcRenderer.invoke('db:add-match', match),
  getMatches: () => ipcRenderer.invoke('db:get-matches'),
  deleteMatch: (id) => ipcRenderer.invoke('db:delete-match', id),
  addArchetype: (archetype) => ipcRenderer.invoke('db:add-archetype', archetype),
  getArchetypes: (className?: string) => ipcRenderer.invoke('db:get-archetypes', className),
  updateArchetype: (archetype) => ipcRenderer.invoke('db:update-archetype', archetype),
  deleteArchetype: (id) => ipcRenderer.invoke('db:delete-archetype', id)
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
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
