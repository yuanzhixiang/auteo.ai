import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import { replaceAllText, setUtteranceText } from '../../shared/transcript'
import type { ProjectSummary, TranscribePhase, Transcript, Utterance } from '../../shared/types'
import DropZone from './components/DropZone'
import MediaList from './components/MediaList'
import SettingsPage from './components/SettingsPage'
import Sidebar from './components/Sidebar'
import SubtitleList from './components/SubtitleList'
import SubtitleToolbar from './components/SubtitleToolbar'
import VideoPlayer from './components/VideoPlayer'
import type { View } from './components/Sidebar'

type DetailState =
  | { kind: 'empty' }
  | { kind: 'working'; videoPath: string; phase: TranscribePhase }
  | { kind: 'ready'; transcript: Transcript; mediaUrl: string }
  | { kind: 'error'; videoPath: string; message: string; apiKeyProblem: boolean }

function describePhase(phase: TranscribePhase): string {
  return phase === 'extracting' ? 'Extracting audio…' : 'Transcribing…'
}

function fileNameOf(videoPath: string): string {
  return videoPath.split('/').pop() ?? videoPath
}

function findActiveUtterance(utterances: Utterance[], timeMs: number): string | null {
  const active = utterances.find((utterance) => timeMs >= utterance.start && timeMs < utterance.end)
  return active ? active.id : null
}

function stripIpcErrorPrefix(message: string): string {
  return message.replace(/^Error invoking remote method '[^']+': Error: /, '')
}

const buttonClass =
  'cursor-pointer rounded-md border border-black/25 px-3 py-1.5 text-sm dark:border-white/25'

export default function App(): JSX.Element {
  const [view, setView] = useState<View>('media')
  const [detail, setDetail] = useState<DetailState>({ kind: 'empty' })
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [activeUtteranceId, setActiveUtteranceId] = useState<string | null>(null)
  const [undoSnapshot, setUndoSnapshot] = useState<Transcript | null>(null)
  const [findOpen, setFindOpen] = useState(false)
  const [findText, setFindText] = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [message, setMessage] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    return window.auteo.onTranscribeProgress((progress) => {
      setDetail((current) =>
        current.kind === 'working' ? { ...current, phase: progress.phase } : current
      )
    })
  }, [])

  const refreshProjects = useCallback(async () => {
    const summaries = await window.auteo.listProjects()
    setProjects(summaries)
    return summaries
  }, [])

  useEffect(() => {
    if (view === 'media') void refreshProjects()
  }, [view, refreshProjects])

  const resetEditingState = (): void => {
    setUndoSnapshot(null)
    setFindOpen(false)
    setFindText('')
    setReplaceText('')
    setMessage('')
  }

  // Keeps selectedProjectId so the list still highlights the project just viewed.
  const backToList = (): void => {
    setDetail({ kind: 'empty' })
    setActiveUtteranceId(null)
    resetEditingState()
    setView('media')
  }

  const transcribe = async (videoPath: string, force = false): Promise<void> => {
    setDetail({ kind: 'working', videoPath, phase: 'extracting' })
    setActiveUtteranceId(null)
    resetEditingState()
    try {
      const transcript = await window.auteo.transcribeVideo(videoPath, force)
      const mediaUrl = await window.auteo.registerMedia(videoPath)
      const summaries = await refreshProjects()
      setSelectedProjectId(
        summaries.find((summary) => summary.videoPath === transcript.sourcePath)?.id ?? null
      )
      setDetail({ kind: 'ready', transcript, mediaUrl })
      setView('media')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setDetail({
        kind: 'error',
        videoPath,
        message: stripIpcErrorPrefix(errorMessage),
        apiKeyProblem: errorMessage.includes('API_KEY_')
      })
    }
  }

  const openProject = async (id: string): Promise<void> => {
    setSelectedProjectId(id)
    setActiveUtteranceId(null)
    resetEditingState()
    try {
      const result = await window.auteo.openProject(id)
      setDetail({ kind: 'ready', transcript: result.transcript, mediaUrl: result.mediaUrl })
      if (result.stale) setMessage('Video file has changed — consider Re-transcribe.')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setSelectedProjectId(null)
      setDetail({ kind: 'empty' })
      setMessage(stripIpcErrorPrefix(errorMessage))
      await refreshProjects()
    }
  }

  const deleteProject = async (id: string): Promise<void> => {
    await window.auteo.deleteProject(id)
    if (id === selectedProjectId) {
      setSelectedProjectId(null)
      backToList()
    }
    await refreshProjects()
  }

  const seekTo = (utterance: Utterance): void => {
    const video = videoRef.current
    if (!video) return
    video.currentTime = utterance.start / 1000
    void video.play()
  }

  const applyTranscript = (previous: Transcript, next: Transcript): void => {
    setUndoSnapshot(previous)
    setDetail((current) => (current.kind === 'ready' ? { ...current, transcript: next } : current))
    void window.auteo.saveProject(next)
  }

  const handleEditSave = (id: string, text: string): void => {
    if (detail.kind !== 'ready') return
    setMessage('')
    applyTranscript(detail.transcript, setUtteranceText(detail.transcript, id, text))
  }

  const handleReplaceAll = (): void => {
    if (detail.kind !== 'ready') return
    const { transcript, count } = replaceAllText(detail.transcript, findText, replaceText)
    if (count === 0) {
      setMessage('No matches.')
      return
    }
    setMessage(`Replaced ${count} occurrence${count === 1 ? '' : 's'}.`)
    applyTranscript(detail.transcript, transcript)
  }

  const handleUndo = (): void => {
    if (detail.kind !== 'ready' || undoSnapshot === null) return
    const restored = undoSnapshot
    setUndoSnapshot(null)
    setMessage('Undone.')
    setDetail((current) =>
      current.kind === 'ready' ? { ...current, transcript: restored } : current
    )
    void window.auteo.saveProject(restored)
  }

  const exportSrt = async (transcript: Transcript): Promise<void> => {
    setMessage('')
    try {
      const result = await window.auteo.exportSrt(transcript)
      if (result.savedPath) setMessage(`Saved to ${result.savedPath}`)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Export failed.')
    }
  }

  const renderWorking = (videoPath: string, phase: TranscribePhase): JSX.Element => (
    <div className="m-auto flex flex-col items-center gap-2 p-4">
      <p className="font-mono text-xs break-all opacity-80">{videoPath}</p>
      <p>{describePhase(phase)}</p>
    </div>
  )

  const renderError = (
    videoPath: string,
    errorMessage: string,
    apiKeyProblem: boolean
  ): JSX.Element => (
    <div className="m-auto flex flex-col items-center gap-2 p-4">
      <p className="max-w-2xl text-center text-red-500">{errorMessage}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {apiKeyProblem && (
          <button className={buttonClass} onClick={() => setView('settings')}>
            Open Settings
          </button>
        )}
        <button className={buttonClass} onClick={() => void transcribe(videoPath)}>
          Retry
        </button>
        <button className={buttonClass} onClick={backToList}>
          Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar view={view} onSelect={setView} />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        {view === 'settings' ? (
          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            <SettingsPage />
          </div>
        ) : view === 'import' ? (
          detail.kind === 'working' ? (
            renderWorking(detail.videoPath, detail.phase)
          ) : detail.kind === 'error' ? (
            renderError(detail.videoPath, detail.message, detail.apiKeyProblem)
          ) : (
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <DropZone onSelect={(videoPath) => void transcribe(videoPath)} />
              {message !== '' && <p className="mt-2 mb-0 text-xs text-red-500">{message}</p>}
            </div>
          )
        ) : detail.kind === 'working' ? (
          renderWorking(detail.videoPath, detail.phase)
        ) : detail.kind === 'error' ? (
          renderError(detail.videoPath, detail.message, detail.apiKeyProblem)
        ) : detail.kind === 'ready' ? (
          <>
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-border px-2">
              <button
                className="flex h-8 shrink-0 cursor-pointer items-center gap-1 rounded-md px-2 text-xs transition-colors hover:bg-muted"
                onClick={backToList}
              >
                <ArrowLeft size={16} />
                Back
              </button>
              <span className="min-w-0 truncate text-xs text-muted-foreground">
                {fileNameOf(detail.transcript.sourcePath)}
              </span>
            </div>
            <div className="flex min-h-0 flex-1">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                <VideoPlayer
                  ref={videoRef}
                  src={detail.mediaUrl}
                  onTimeUpdate={(timeMs) =>
                    setActiveUtteranceId(
                      findActiveUtterance(detail.transcript.utterances, timeMs)
                    )
                  }
                />
              </div>
              <SubtitleList
                utterances={detail.transcript.utterances}
                activeId={activeUtteranceId}
                onSelect={seekTo}
                onEditSave={handleEditSave}
                toolbar={
                  <SubtitleToolbar
                    utteranceCount={detail.transcript.utterances.length}
                    audioDurationMs={detail.transcript.audioDurationMs}
                    canUndo={undoSnapshot !== null}
                    findOpen={findOpen}
                    findText={findText}
                    replaceText={replaceText}
                    message={message}
                    onUndo={handleUndo}
                    onExportSrt={() => void exportSrt(detail.transcript)}
                    onRetranscribe={() => void transcribe(detail.transcript.sourcePath, true)}
                    onToggleFind={() => setFindOpen((open) => !open)}
                    onFindTextChange={setFindText}
                    onReplaceTextChange={setReplaceText}
                    onReplaceAll={handleReplaceAll}
                  />
                }
              />
            </div>
          </>
        ) : (
          <MediaList
            projects={projects}
            selectedId={selectedProjectId}
            onOpen={(id) => void openProject(id)}
            onDelete={(id) => void deleteProject(id)}
          />
        )}
      </main>
    </div>
  )
}
