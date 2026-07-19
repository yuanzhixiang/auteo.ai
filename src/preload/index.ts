import { contextBridge } from 'electron'

const api = {
  electronVersion: process.versions.electron
}

export type AuteoApi = typeof api

contextBridge.exposeInMainWorld('auteo', api)
