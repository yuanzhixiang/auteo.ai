import { contextBridge, ipcRenderer } from 'electron'
import type { AuteoApi } from '../shared/types'

const api: AuteoApi = {
  getSettingsStatus: () => ipcRenderer.invoke('settings:get-status'),
  setApiKey: (key) => ipcRenderer.invoke('settings:set-api-key', key)
}

contextBridge.exposeInMainWorld('auteo', api)
