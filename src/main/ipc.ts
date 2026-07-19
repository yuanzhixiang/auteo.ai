import { BrowserWindow, dialog, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { toSrt } from '../shared/srt'
import type { ExportSrtResult, TranscribeProgress, Transcript } from '../shared/types'
import { transcribeAudio } from './asr'
import { extractAudio } from './ffmpeg'
import { registerMediaPath } from './media'
import * as settings from './settings'

/** Single registration point for every ipcMain handler. */
export function registerIpc(): void {
  ipcMain.handle('settings:get-status', () => settings.getStatus())
  ipcMain.handle('settings:set-api-key', (_event, key: string) => {
    settings.setApiKey(key)
  })

  ipcMain.handle('media:register', (_event, videoPath: string) => registerMediaPath(videoPath))

  ipcMain.handle(
    'export:srt',
    async (event, transcript: Transcript): Promise<ExportSrtResult> => {
      const window = BrowserWindow.fromWebContents(event.sender)
      const defaultName = `${path.parse(transcript.sourcePath).name}.srt`
      const options = {
        defaultPath: defaultName,
        filters: [{ name: 'SubRip subtitles', extensions: ['srt'] }]
      }
      const result = window
        ? await dialog.showSaveDialog(window, options)
        : await dialog.showSaveDialog(options)
      if (result.canceled || !result.filePath) return {}
      fs.writeFileSync(result.filePath, toSrt(transcript.utterances), 'utf8')
      return { savedPath: result.filePath }
    }
  )

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
