import { ipcMain } from 'electron'
import * as settings from './settings'

/** Single registration point for every ipcMain handler. */
export function registerIpc(): void {
  ipcMain.handle('settings:get-status', () => settings.getStatus())
  ipcMain.handle('settings:set-api-key', (_event, key: string) => {
    settings.setApiKey(key)
  })
}
