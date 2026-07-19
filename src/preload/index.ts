import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { AuteoApi } from '../shared/types'

const api: AuteoApi = {
  getSettingsStatus: () => ipcRenderer.invoke('settings:get-status'),
  setApiKey: (key) => ipcRenderer.invoke('settings:set-api-key', key),
  getPathForFile: (file) => webUtils.getPathForFile(file)
}

contextBridge.exposeInMainWorld('auteo', api)
