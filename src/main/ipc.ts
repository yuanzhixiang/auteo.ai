import { ipcMain } from 'electron'
import fs from 'node:fs'
import type { TranscribeProgress, Transcript } from '../shared/types'
import { transcribeAudio } from './asr'
import { extractAudio } from './ffmpeg'
import * as settings from './settings'

/** Single registration point for every ipcMain handler. */
export function registerIpc(): void {
  ipcMain.handle('settings:get-status', () => settings.getStatus())
  ipcMain.handle('settings:set-api-key', (_event, key: string) => {
    settings.setApiKey(key)
  })

  ipcMain.handle('transcribe:run', async (event, videoPath: string): Promise<Transcript> => {
    const apiKey = settings.getApiKey()
    if (!apiKey) {
      throw new Error('API_KEY_MISSING: Configure the Volcano Engine API key in Settings first')
    }

    const sendProgress = (progress: TranscribeProgress): void => {
      if (!event.sender.isDestroyed()) event.sender.send('transcribe:progress', progress)
    }

    sendProgress({ phase: 'extracting' })
    const audioPath = await extractAudio(videoPath)
    try {
      sendProgress({ phase: 'transcribing' })
      return await transcribeAudio(audioPath, apiKey, videoPath)
    } finally {
      fs.rm(audioPath, { force: true }, () => {})
    }
  })
}
