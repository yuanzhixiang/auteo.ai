export interface SettingsStatus {
  hasApiKey: boolean
  /** Last 4 characters of the configured key, for display only. */
  apiKeyTail: string
}

/** All times are in milliseconds, matching the ASR response. */
export interface Word {
  word: string
  start: number
  end: number
  /**
   * Marked by LLM post-processing in a later milestone; the ASR confidence
   * field is unusable (always 0), so this is always false for now.
   */
  suspect: boolean
}

export interface Utterance {
  id: string
  start: number
  end: number
  /** Punctuated sentence text as returned by the ASR. */
  text: string
  speakerId?: string
  words: Word[]
}

export interface Transcript {
  sourcePath: string
  audioDurationMs: number
  utterances: Utterance[]
}

export type TranscribePhase = 'extracting' | 'transcribing'

export interface TranscribeProgress {
  phase: TranscribePhase
}

export interface ProjectSummary {
  id: string
  videoPath: string
  fileName: string
  updatedAt: number
  utteranceCount: number
  audioDurationMs: number
  /** False when the source video no longer exists on disk. */
  fileExists: boolean
}

export interface OpenProjectResult {
  transcript: Transcript
  mediaUrl: string
  /** True when the video file changed since the transcript was saved. */
  stale: boolean
}

/**
 * API exposed to the renderer through the preload bridge.
 * The plaintext API key never crosses this boundary.
 */
export interface AuteoApi {
  getSettingsStatus(): Promise<SettingsStatus>
  setApiKey(key: string): Promise<void>
  /** Resolve a dropped File to its filesystem path (webUtils.getPathForFile). */
  getPathForFile(file: File): string
  /** Transcribe a video; reuses the saved project unless force is true. */
  transcribeVideo(videoPath: string, force?: boolean): Promise<Transcript>
  /** Subscribe to transcription progress. Returns an unsubscribe function. */
  onTranscribeProgress(callback: (progress: TranscribeProgress) => void): () => void
  /** Register a local video for playback; returns an auteo-media:// URL. */
  registerMedia(videoPath: string): Promise<string>
  /** Export the transcript as SRT via a save dialog. Empty result if cancelled. */
  exportSrt(transcript: Transcript): Promise<ExportSrtResult>
  listProjects(): Promise<ProjectSummary[]>
  openProject(id: string): Promise<OpenProjectResult>
  /** Persist the current transcript (called after every edit mutation). */
  saveProject(transcript: Transcript): Promise<void>
  deleteProject(id: string): Promise<void>
}

export interface ExportSrtResult {
  savedPath?: string
}
