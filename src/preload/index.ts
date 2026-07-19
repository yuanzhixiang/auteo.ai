import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { AuteoApi, TranscribeProgress } from '../shared/types'

const api: AuteoApi = {
  getSettingsStatus: () => ipcRenderer.invoke('settings:get-status'),
  setApiKey: (key) => ipcRenderer.invoke('settings:set-api-key', key),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  transcribeVideo: (videoPath) => ipcRenderer.invoke('transcribe:run', videoPath),
  registerMedia: (videoPath) => ipcRenderer.invoke('media:register', videoPath),
  onTranscribeProgress: (callback) => {
    const listener = (_event: unknown, progress: TranscribeProgress): void => callback(progress)
    ipcRenderer.on('transcribe:progress', listener)
    return () => {
      ipcRenderer.removeListener('transcribe:progress', listener)
    }
  }
}

contextBridge.exposeInMainWorld('auteo', api)
