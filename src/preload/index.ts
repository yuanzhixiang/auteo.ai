import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { AuteoApi, TranscribeProgress } from '../shared/types'

const api: AuteoApi = {
  getSettingsStatus: () => ipcRenderer.invoke('settings:get-status'),
  setApiKey: (key) => ipcRenderer.invoke('settings:set-api-key', key),
  getPathForFile: (file) => webUtils.getPathForFile(file),
  transcribeVideo: (videoPath, force) => ipcRenderer.invoke('transcribe:run', videoPath, force),
  registerMedia: (videoPath) => ipcRenderer.invoke('media:register', videoPath),
  exportSrt: (transcript) => ipcRenderer.invoke('export:srt', transcript),
  listProjects: () => ipcRenderer.invoke('project:list'),
  openProject: (id) => ipcRenderer.invoke('project:open', id),
  saveProject: (transcript) => ipcRenderer.invoke('project:save', transcript),
  deleteProject: (id) => ipcRenderer.invoke('project:delete', id),
  onTranscribeProgress: (callback) => {
    const listener = (_event: unknown, progress: TranscribeProgress): void => callback(progress)
    ipcRenderer.on('transcribe:progress', listener)
    return () => {
      ipcRenderer.removeListener('transcribe:progress', listener)
    }
  }
}

contextBridge.exposeInMainWorld('auteo', api)
